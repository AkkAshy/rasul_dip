"""
Playwright-клиент для Uzum.

Используем для **полного списка отзывов** товара. Публичный REST отдаёт только
1 топ-отзыв; GraphQL `graphql.uzum.uz` требует JWT, который браузер получает
автоматически при загрузке uzum.uz.

Стратегия:
1. Запустить headless chromium
2. Открыть `uzum.uz/uz/product/{id}` (или любую страницу) — фронт получит JWT
3. Из контекста страницы делать `fetch(POST graphql)` через `page.evaluate()`
4. Браузер сам подставит Authorization, x-iid, cookies — нам не надо парсить токены

Ограничения:
- Если включится Yandex SmartCaptcha — надо разок решить вручную.
  При `headless=False` пользователь сам решит, cookies сохранятся в storage_state.
- ~3 секунды на загрузку первой страницы; затем GraphQL-запросы по ~0.5 сек.
"""
from __future__ import annotations
import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import AsyncIterator

from playwright.async_api import async_playwright, BrowserContext, Page

from scraper.common.types import ReviewData
from scraper.common.lang import detect_language

logger = logging.getLogger(__name__)


# Полная GraphQL-query — снята с DevTools реального фронта (uzum_recon.py)
FEEDBACKS_QUERY = """
query Feedbacks($productPageId: Int!, $filters: [FeedbackFilterType!], $page: Int!, $size: Int!, $sort: FeedbackSortType!) {
  productPage(id: $productPageId) {
    feedbacks(filters: $filters, page: $page, size: $size, sort: $sort) {
      anonymous
      cons
      content
      customerName
      dateCreated
      datePublished
      id
      pros
      rating
      reply { content dateCreated id }
      sku { id fullPrice sellPrice }
    }
  }
}
""".strip()


class UzumBrowserClient:
    """
    Контекстный менеджер: с .reviews(product_id) перебирает все отзывы товара.

        async with UzumBrowserClient() as client:
            async for review in client.iter_reviews(product_id=100, max_pages=10, page_size=30):
                ...
    """

    def __init__(
        self,
        headless: bool = True,
        storage_state_path: str | None = None,
        warmup_url: str = "https://uzum.uz/uz/product/100",
    ):
        self.headless = headless
        self.storage_state_path = storage_state_path
        self.warmup_url = warmup_url
        self._pw = None
        self._browser = None
        self._ctx: BrowserContext | None = None
        self._page: Page | None = None

    async def __aenter__(self):
        self._pw = await async_playwright().start()
        self._browser = await self._pw.chromium.launch(headless=self.headless)
        ctx_kwargs = {
            "user_agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            ),
            "locale": "ru-RU",
            "viewport": {"width": 1280, "height": 900},
        }
        if self.storage_state_path:
            try:
                ctx_kwargs["storage_state"] = self.storage_state_path
            except Exception:
                pass
        self._ctx = await self._browser.new_context(**ctx_kwargs)
        self._page = await self._ctx.new_page()

        # «Прогреваем» — открываем uzum.uz чтобы фронт инициализировал JWT/Apollo
        logger.info("Прогрев: %s", self.warmup_url)
        await self._page.goto(self.warmup_url, wait_until="domcontentloaded", timeout=30000)
        # Дать time on get access_token cookie + Apollo init
        await self._page.wait_for_timeout(4000)

        # Достаём access_token (anonymous JWT) из cookie
        cookies = await self._ctx.cookies()
        token = next((c["value"] for c in cookies if c["name"] == "access_token"), None)
        if not token:
            logger.warning("Не нашли access_token в cookies — GraphQL вернёт 401")
        self._access_token = token
        return self

    async def __aexit__(self, *exc):
        if self._ctx and self.storage_state_path:
            try:
                await self._ctx.storage_state(path=self.storage_state_path)
            except Exception:
                pass
        if self._browser:
            await self._browser.close()
        if self._pw:
            await self._pw.stop()

    # ---------- API ----------

    async def fetch_feedbacks_page(
        self,
        product_id: int,
        page: int = 0,
        size: int = 30,
        sort: str = "RELEVANCE",  # RELEVANCE | NEWEST | OLDEST | RATING_ASC | RATING_DESC
    ) -> list[dict]:
        """
        Один батч отзывов через GraphQL.
        Используем APIRequestContext (а не fetch внутри страницы) — Nuxt
        оверрайдит window.fetch и блочит наши запросы. APIRequestContext
        шлёт «голый» HTTP но с теми же cookies, что в браузере.
        """
        assert self._ctx is not None
        headers = {
            "content-type": "application/json",
            "accept": "*/*",
            "origin": "https://uzum.uz",
            "referer": "https://uzum.uz/",
            "x-iid": "browser-client",
        }
        if self._access_token:
            headers["authorization"] = f"Bearer {self._access_token}"

        body = {
            "operationName": "Feedbacks",
            "query": FEEDBACKS_QUERY,
            "variables": {
                "productPageId": int(product_id),
                "page": page,
                "size": size,
                "sort": sort,
                "filters": [],
            },
        }
        # data=str → отправится как тело без преобразования. dict в playwright
        # шлёт как form-urlencoded — нам это не подходит для GraphQL.
        # Retry на 429 — Yandex CDN перед uzum рейт-лимитит.
        max_retries = 4
        for attempt in range(max_retries):
            resp = await self._ctx.request.post(
                "https://graphql.uzum.uz/",
                headers=headers,
                data=json.dumps(body),
            )
            if resp.status == 429:
                wait = 12 * (attempt + 1)
                logger.warning("429 на product=%s page=%s — жду %ds", product_id, page, wait)
                await asyncio.sleep(wait)
                continue
            break
        if not resp.ok:
            err_body = await resp.text()
            logger.warning(
                "GraphQL %s page=%s: HTTP %s body=%s",
                product_id, page, resp.status, err_body[:200]
            )
            return []
        result = await resp.json()
        try:
            return result["data"]["productPage"]["feedbacks"] or []
        except (KeyError, TypeError) as e:
            logger.warning("GraphQL parse %s page=%s: %s | %s", product_id, page, e, result)
            return []

    async def iter_reviews(
        self,
        product_id: int,
        max_pages: int = 20,
        page_size: int = 30,
        rate_delay: float = 0.4,
    ) -> AsyncIterator[ReviewData]:
        """Поток ReviewData по всем страницам отзывов товара."""
        for page in range(max_pages):
            items = await self.fetch_feedbacks_page(product_id, page=page, size=page_size)
            if not items:
                return
            for fb in items:
                rd = _to_review(fb)
                if rd:
                    yield rd
            if len(items) < page_size:
                return  # последняя страница
            await asyncio.sleep(rate_delay)


# ---------- helpers ----------

def _to_review(fb: dict) -> ReviewData | None:
    text = (fb.get("content") or "").strip()
    if not text:
        return None
    fb_id = fb.get("id")
    if fb_id is None:
        return None
    return ReviewData(
        external_id=str(fb_id),
        text=text,
        author=fb.get("customerName") or "",
        rating=fb.get("rating"),
        posted_at=_parse_dt(fb.get("datePublished") or fb.get("dateCreated")),
        language=detect_language(text),
        raw=fb,
    )


def _parse_dt(v) -> datetime | None:
    if not v:
        return None
    try:
        if isinstance(v, (int, float)):
            return datetime.fromtimestamp(v / 1000 if v > 10**12 else v, tz=timezone.utc)
        return datetime.fromisoformat(str(v).replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return None
