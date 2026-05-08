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


def _aspect_penalty(product: Product) -> tuple[float, str | None]:
    """
    Если у товара много негативных упоминаний по аспекту — штраф.
    Возвращаем коэффициент 0..1 и название аспекта-узкого-горлышка.

    Пример: если из 10 упоминаний «Доставка» → 6 негативных, это серьёзный сигнал.
    """
    mentions = AspectMention.objects.filter(review__product=product)
    if not mentions.exists():
        return 1.0, None

    by_aspect: dict[str, list[int]] = {}
    for m in mentions.select_related("aspect"):
        bucket = by_aspect.setdefault(m.aspect.name, [0, 0])  # [pos+neu, neg]
        if m.label == "negative":
            bucket[1] += 1
        else:
            bucket[0] += 1

    worst_aspect = None
    worst_neg_share = 0.0
    for name, (good, bad) in by_aspect.items():
        total = good + bad
        if total < 3:  # слишком мало — игнор
            continue
        neg_share = bad / total
        if neg_share > worst_neg_share:
            worst_neg_share = neg_share
            worst_aspect = name

    # Чем больше доля негатива — тем сильнее штраф (макс −15%)
    penalty = 1.0 - 0.15 * min(1.0, worst_neg_share * 1.5)
    return penalty, worst_aspect


def compute_demand_for_product(product: Product) -> DemandRow | None:
    """Полный расчёт строки спроса для одного товара."""
    sr_qs = SentimentResult.objects.filter(review__product=product)
    pos = sr_qs.filter(label="positive").count()
    neu = sr_qs.filter(label="neutral").count()
    neg = sr_qs.filter(label="negative").count()
    total = pos + neu + neg
    if total == 0:
        return None

    nss = (pos - neg) / total                       # [-1..1] для отчёта
    # Customer Satisfaction Index — взвешенная сумма
    csi = (1.0 * pos + 0.5 * neu + 0.0 * neg) / total
    satisfaction = csi                                # уже [0..1]
    popularity = math.log10(total + 1) / math.log10(POPULARITY_CEILING + 1)
    popularity = min(popularity, 1.0)

    penalty, bottleneck = _aspect_penalty(product)
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


def compute_demand_table(products: Iterable[Product] | None = None) -> list[DemandRow]:
    """Вычисляет Demand-таблицу. Без БД-кэша — простая реализация для дипломного проекта."""
    qs = products if products is not None else Product.objects.all()
    rows = []
    for p in qs:
        row = compute_demand_for_product(p)
        if row:
            rows.append(row)
    rows.sort(key=lambda r: r.demand_score, reverse=True)
    return rows
