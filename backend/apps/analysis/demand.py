"""
Расчёт Demand Score — индекса спроса на товар на основе клиентских отзывов.

Формула (composite):
    demand = popularity × satisfaction × aspect_penalty

где:
    popularity     = log10(reviews_analyzed + 1) / log10(MAX + 1)   — 0..1
    satisfaction   = CSI = (1.0·pos + 0.5·neu + 0.0·neg) / total    — Customer Satisfaction
                     Index (0..1). Используем взвешенную схему: нейтрал засчитывается
                     наполовину — «отзыв оставлен, человек что-то рассказал, но
                     явно не жалуется». Это смягчает bias модели на uz, где
                     многие позитивные отзывы попадают в neutral.
    aspect_penalty = 1 − 0.15 × (макс. доля жалоб по аспекту, при ≥3 упоминаниях)

Финальный demand_score публикуется в шкале 0..100.

Интерпретация (откалибровано на собранном корпусе):
    >= 50  — высокий спрос (популярный товар + удовлетворённые клиенты)
    25..50 — средний спрос
    <  25  — низкий спрос (мало отзывов или много жалоб)
"""
from __future__ import annotations
import math
from dataclasses import dataclass
from typing import Iterable

from django.db.models import Count, Q

from apps.products.models import Product
from apps.reviews.models import Review
from apps.analysis.models import SentimentResult, AspectMention


# Чтобы log-нормализация была стабильной, фиксируем верхнюю планку.
# 100 reviews_analyzed → popularity ≈ 1.0 (для нашего корпуса нормальный потолок)
POPULARITY_CEILING = 100

# Пороги для категоризации demand_score
HIGH_DEMAND_THRESHOLD = 50.0
LOW_DEMAND_THRESHOLD = 25.0


@dataclass
class DemandRow:
    product_id: int
    name: str
    source: str
    category: str | None
    rating_avg: float | None
    reviews_count: int           # из uzum
    reviews_analyzed: int        # сколько прогнано через sentiment

    positive: int
    neutral: int
    negative: int

    nss: float                   # Net Sentiment Score, [-1..1]
    popularity: float            # 0..1
    aspect_penalty: float        # 0..1 (1 = нет штрафа)
    demand_score: float          # 0..100

    bottleneck_aspect: str | None  # «слабое звено» по жалобам


def _penalty_from_buckets(
    buckets: list[tuple[str, int, int]]
) -> tuple[float, str | None]:
    """
    По агрегированным аспект-бакетам [(name, good, bad), ...] считает штраф.

    Семантика 1:1 со старой реализацией:
      - нет упоминаний  → (1.0, None)
      - худший аспект — с макс. долей негатива среди тех, где ≥3 упоминания
      - penalty = 1 − 0.15 × min(1, worst_neg_share × 1.5)  (макс −15%)
    """
    if not buckets:
        return 1.0, None

    worst_aspect = None
    worst_neg_share = 0.0
    for name, good, bad in buckets:
        total = good + bad
        if total < 3:  # слишком мало — игнор
            continue
        neg_share = bad / total
        if neg_share > worst_neg_share:
            worst_neg_share = neg_share
            worst_aspect = name

    penalty = 1.0 - 0.15 * min(1.0, worst_neg_share * 1.5)
    return penalty, worst_aspect


def _sentiment_counts(product_ids: list[int] | None) -> dict[int, tuple[int, int, int]]:
    """{product_id: (pos, neu, neg)} одним агрегирующим запросом (вместо N×3 .count())."""
    qs = SentimentResult.objects.all()
    if product_ids is not None:
        qs = qs.filter(review__product_id__in=product_ids)
    rows = qs.values("review__product_id").annotate(
        pos=Count("id", filter=Q(label="positive")),
        neu=Count("id", filter=Q(label="neutral")),
        neg=Count("id", filter=Q(label="negative")),
    )
    return {
        r["review__product_id"]: (r["pos"], r["neu"], r["neg"]) for r in rows
    }


def _aspect_buckets(
    product_ids: list[int] | None,
) -> dict[int, list[tuple[str, int, int]]]:
    """{product_id: [(aspect_name, good, bad), ...]} одним запросом (вместо N запросов)."""
    qs = AspectMention.objects.all()
    if product_ids is not None:
        qs = qs.filter(review__product_id__in=product_ids)
    rows = (
        qs.values("review__product_id", "aspect__name")
        .annotate(
            bad=Count("id", filter=Q(label="negative")),
            good=Count("id", filter=~Q(label="negative")),
        )
        .order_by("review__product_id", "aspect__name")
    )
    out: dict[int, list[tuple[str, int, int]]] = {}
    for r in rows:
        out.setdefault(r["review__product_id"], []).append(
            (r["aspect__name"], r["good"], r["bad"])
        )
    return out


def _build_row(
    product: Product,
    counts: tuple[int, int, int],
    buckets: list[tuple[str, int, int]],
) -> DemandRow | None:
    """Чистая сборка строки из уже посчитанных агрегатов. Формула не меняется."""
    pos, neu, neg = counts
    total = pos + neu + neg
    if total == 0:
        return None

    nss = (pos - neg) / total                       # [-1..1] для отчёта
    # Customer Satisfaction Index — взвешенная сумма
    csi = (1.0 * pos + 0.5 * neu + 0.0 * neg) / total
    satisfaction = csi                                # уже [0..1]
    popularity = math.log10(total + 1) / math.log10(POPULARITY_CEILING + 1)
    popularity = min(popularity, 1.0)

    penalty, bottleneck = _penalty_from_buckets(buckets)
    demand_raw = popularity * satisfaction * penalty
    demand_score = round(demand_raw * 100, 1)

    return DemandRow(
        product_id=product.id,
        name=product.name,
        source=product.source,
        category=getattr(product.category, "name", None) if product.category_id else None,
        rating_avg=product.rating_avg,
        reviews_count=product.reviews_count,
        reviews_analyzed=total,
        positive=pos,
        neutral=neu,
        negative=neg,
        nss=round(nss, 3),
        popularity=round(popularity, 3),
        aspect_penalty=round(penalty, 3),
        demand_score=demand_score,
        bottleneck_aspect=bottleneck,
    )


def compute_demand_for_product(product: Product) -> DemandRow | None:
    """Полный расчёт строки спроса для одного товара (2 агрегата вместо ~5 запросов)."""
    counts = _sentiment_counts([product.id]).get(product.id)
    if counts is None:
        return None
    buckets = _aspect_buckets([product.id]).get(product.id, [])
    return _build_row(product, counts, buckets)


def compute_demand_table(products: Iterable[Product] | None = None) -> list[DemandRow]:
    """
    Demand-таблица за 3 запроса (товары + 2 агрегата) вместо N+1.

    Раньше: на каждый из ~190 товаров ~5 запросов (3×count + аспекты +
    подгрузка категории) → ~950 запросов, ~15 c. Стало — O(N) в памяти.
    """
    if products is not None:
        plist = list(products)
    else:
        plist = list(Product.objects.select_related("category").all())

    ids = [p.id for p in plist]
    sentiment = _sentiment_counts(ids)
    aspects = _aspect_buckets(ids)

    rows = []
    for p in plist:
        counts = sentiment.get(p.id)
        if counts is None:
            continue
        row = _build_row(p, counts, aspects.get(p.id, []))
        if row:
            rows.append(row)
    rows.sort(key=lambda r: r.demand_score, reverse=True)
    return rows
