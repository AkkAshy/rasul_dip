"""
Парсер Uzum Market через публичный REST API.

Что выяснилось при разведке (см. docs/uzum-api-research.md):
- `api.uzum.uz/api/v2/product/{id}` отдаёт карточку + `topFeedback` (1 отзыв)
- GraphQL `graphql.uzum.uz` требует авторизацию (x-ext-authz-check-result: denied)
- Отдельного публичного REST для списка всех отзывов нет
- Сам uzum.uz прячется за Yandex SmartCaptcha

Стратегия:
- `fetch_product(id)` — карточка + topFeedback
- `iter_top_feedbacks(start, end)` — массовый сбор top-отзывов по диапазону ID
  (1 отзыв × N товаров — хороший разнообразный датасет для сентимент-анализа)
- Для полного списка отзывов используется Playwright (см. browser_client.py)
"""
from __future__ import annotations
import asyncio
import logging
from datetime import datetime, timezone
from typing import AsyncIterator

import httpx

from scraper.common.types import ProductData, ReviewData
from scraper.common.lang import detect_language

logger = logging.getLogger(__name__)

UZUM_API_BASE = "https://api.uzum.uz/api"
DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
    "Accept-Language": "ru,uz;q=0.9,en;q=0.8",
    "Origin": "https://uzum.uz",
    "Referer": "https://uzum.uz/",
}


class UzumClient:
    def __init__(self, timeout: float = 20.0, rate_delay: float = 0.5):
        self._client = httpx.AsyncClient(
            base_url=UZUM_API_BASE,
            headers=DEFAULT_HEADERS,
            timeout=timeout,
            follow_redirects=True,
        )
        self._rate_delay = rate_delay

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        await self._client.aclose()

    # ---------- Публичный API ----------

    async def fetch_product_raw(self, product_id: int | str) -> dict | None:
        """Сырой JSON ответа /api/v2/product/{id} → payload.data."""
        try:
            r = await self._client.get(f"/v2/product/{product_id}")
        except httpx.HTTPError as e:
            logger.warning("Uzum HTTP error for product %s: %s", product_id, e)
            return None
        if r.status_code == 404:
            return None
        if r.status_code != 200:
            logger.warning("Uzum unexpected status %s for product %s", r.status_code, product_id)
            return None
        try:
            payload = _safe_json(r.text)
        except ValueError as e:
            logger.warning("Uzum JSON parse error for %s: %s", product_id, e)
            return None
        return (payload.get("payload") or {}).get("data")

    async def fetch_product(self, product_id: int | str) -> ProductData | None:
        """Карточка товара в нашем формате."""
        data = await self.fetch_product_raw(product_id)
        if not data:
            return None
        return _to_product_data(data)

    async def iter_product_reviews(
        self, product_id: int | str
    ) -> AsyncIterator[ReviewData]:
        """
        Отдаёт top-отзыв (если есть) — это единственное, что доступно через REST.
        Для полного списка нужен browser_client.py (Playwright).
        """
        data = await self.fetch_product_raw(product_id)
        if not data:
            return
        review = _extract_top_feedback(data)
        if review:
            yield review

    async def iter_top_feedbacks(
        self,
        start_id: int,
        end_id: int,
        min_reviews: int = 5,
    ) -> AsyncIterator[tuple[ProductData, ReviewData]]:
        """
        Bulk-сбор: пробегаем по диапазону product_id, для каждого живого товара
        с reviewsAmount >= min_reviews отдаём (product, top_review).

        Используется для построения датасета: «1 топ-отзыв × N товаров».
        Это даёт разнообразный набор реальных текстов для обучения/оценки.
        """
        for pid in range(start_id, end_id + 1):
            data = await self.fetch_product_raw(pid)
            await asyncio.sleep(self._rate_delay)

            if not data:
                continue
            if (data.get("reviewsAmount") or 0) < min_reviews:
                continue

            product = _to_product_data(data)
            review = _extract_top_feedback(data)
            if not review:
                continue
            yield product, review


# ---------- Парсинг ответа в наши dataclass'ы ----------

def _to_product_data(data: dict) -> ProductData:
    title = data.get("localizableTitle", {}).get("ru") or data.get("title") or "n/a"
    sku_list = data.get("skuList") or []
    price = None
    if sku_list:
        # fullPrice в тийинах? нет, в ответе видно 405000 = 405 тыс. сум — целые суммы
        price = _safe_float(sku_list[0].get("fullPrice"))

    category = data.get("category") or {}
    category_title = category.get("title")

    return ProductData(
        source="uzum",
        external_id=str(data["id"]),
        name=title,
        url=f"https://uzum.uz/uz/product/{data['id']}",
        price=price,
        rating_avg=_safe_float(data.get("rating")),
        reviews_count=int(data.get("reviewsAmount") or 0),
        category=category_title,
    )


def _extract_top_feedback(data: dict) -> ReviewData | None:
    """
    Реальная структура topFeedback:
      { id, reviewId, productId, date (ms), customer (имя-строкой), rating,
        content, pros, cons, photos, characteristics, reply, ... }
    """
    fb = data.get("topFeedback")
    if not fb:
        return None
    text = (fb.get("content") or "").strip()
    if not text:
        return None

    fb_id = fb.get("id") or fb.get("reviewId") or f"top-{data.get('id')}"
    customer = fb.get("customer")
    author = customer if isinstance(customer, str) else ""

    return ReviewData(
        external_id=str(fb_id),
        text=text,
        author=author,
        rating=fb.get("rating"),
        posted_at=_parse_dt(fb.get("date")),
        language=detect_language(text),
        raw=fb,
    )


# ---------- helpers ----------

def _safe_float(v) -> float | None:
    try:
        return float(v) if v is not None else None
    except (TypeError, ValueError):
        return None


def _parse_dt(v) -> datetime | None:
    if not v:
        return None
    try:
        if isinstance(v, (int, float)):
            return datetime.fromtimestamp(v / 1000 if v > 10**12 else v, tz=timezone.utc)
        return datetime.fromisoformat(str(v).replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return None


def _safe_json(raw: str) -> dict:
    """Uzum иногда отдаёт JSON с control-символами в descriptions — чистим."""
    import json
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        cleaned = "".join(c for c in raw if c >= " " or c in "\n\r\t")
        return json.loads(cleaned)
