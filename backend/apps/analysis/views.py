from dataclasses import asdict

from django.db.models import Count, Avg, Q
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.products.models import Product
from apps.reviews.models import Review, Language
from .models import SentimentResult, AspectMention
from .demand import compute_demand_table, compute_demand_for_product


@api_view(["GET"])
def product_sentiment_summary(request, product_id: int):
    """
    Сводка по одному товару:
    - распределение тональностей
    - средняя оценка
    - топ-аспекты с тональностью
    - выдержки «за что хвалят» / «за что ругают»
    - последние отзывы с метками
    """
    product = (
        Product.objects.select_related("category").filter(pk=product_id).first()
    )
    if not product:
        return Response({"detail": "Product not found"}, status=404)

    reviews_qs = Review.objects.filter(product=product)
    total = reviews_qs.count()

    sentiment_dist = list(
        SentimentResult.objects
        .filter(review__product=product)
        .values("label")
        .annotate(count=Count("id"))
    )

    aspect_stats = list(
        AspectMention.objects
        .filter(review__product=product)
        .values("aspect__name", "label")
        .annotate(count=Count("id"))
    )

    # «За что хвалят» — топ-3 позитивные упоминания по score
    praise = list(
        AspectMention.objects
        .filter(review__product=product, label="positive")
        .order_by("-score")
        .values("aspect__name", "score", "snippet")[:3]
    )

    # «За что ругают» — топ-3 негативные
    complaints = list(
        AspectMention.objects
        .filter(review__product=product, label="negative")
        .order_by("-score")
        .values("aspect__name", "score", "snippet")[:3]
    )

    # Последние 8 отзывов с sentiment
    latest = []
    for r in (
        reviews_qs.select_related("sentiment_result")
        .order_by("-posted_at", "-scraped_at")[:8]
    ):
        sr = getattr(r, "sentiment_result", None)
        latest.append({
            "id": r.id,
            "rating": r.rating,
            "language": r.language,
            "author": r.author,
            "text": r.text,
            "posted_at": r.posted_at,
            "sentiment_label": sr.label if sr else None,
            "sentiment_score": round(sr.score, 2) if sr else None,
        })

    return Response({
        "product": {
            "id": product.id,
            "name": product.name,
            "source": product.source,
            "category": product.category.name if product.category_id else None,
            "rating_avg": product.rating_avg,
            "url": product.url,
        },
        "reviews_total": total,
        "sentiment_distribution": sentiment_dist,
        "aspects": aspect_stats,
        "praise": [
            {"aspect": p["aspect__name"], "score": round(p["score"], 2), "snippet": p["snippet"]}
            for p in praise
        ],
        "complaints": [
            {"aspect": c["aspect__name"], "score": round(c["score"], 2), "snippet": c["snippet"]}
            for c in complaints
        ],
        "latest_reviews": latest,
    })


@api_view(["GET"])
def overall_demand_index(request):
    """
    Demand Index — composite-метрика спроса на товар:
        demand = popularity × satisfaction × aspect_penalty (см. demand.py)

    Query params:
      ?bottom=1   → отдать «анти-топ» (низкий спрос)
      ?limit=20   → ограничить вывод
    """
    rows = compute_demand_table()
    if not rows:
        return Response([])

    bottom = request.query_params.get("bottom") in ("1", "true", "yes")
    limit = int(request.query_params.get("limit", 0)) or len(rows)

    if bottom:
        # Меняем порядок и берём только товары где есть проблема
        rows = sorted(rows, key=lambda r: r.demand_score)[:limit]
    else:
        rows = rows[:limit]

    return Response([asdict(r) for r in rows])


@api_view(["GET"])
def product_demand_score(request, product_id: int):
    """Demand Score одного товара — для карточки product_detail."""
    product = Product.objects.filter(pk=product_id).first()
    if not product:
        return Response({"detail": "Product not found"}, status=404)
    row = compute_demand_for_product(product)
    if not row:
        return Response({"detail": "Нет данных sentiment-анализа"}, status=404)
    return Response(asdict(row))


@api_view(["GET"])
def demand_by_category(request):
    """
    Demand Score, агрегированный по категории товара.

    Ответ: [{ category, products, avg_demand_score, avg_nss, total_reviews }, ...]
    Полезно для бизнес-выводов: какие категории растут, какие проблемные.
    """
    rows = compute_demand_table()
    by_cat: dict[str, dict] = {}
    for r in rows:
        cat = r.category or "(без категории)"
        b = by_cat.setdefault(cat, {
            "category": cat,
            "products": 0,
            "demand_sum": 0.0,
            "nss_sum": 0.0,
            "total_reviews": 0,
        })
        b["products"] += 1
        b["demand_sum"] += r.demand_score
        b["nss_sum"] += r.nss
        b["total_reviews"] += r.reviews_analyzed

    out = []
    for b in by_cat.values():
        if b["products"] < 1:
            continue
        out.append({
            "category": b["category"],
            "products": b["products"],
            "total_reviews": b["total_reviews"],
            "avg_demand_score": round(b["demand_sum"] / b["products"], 1),
            "avg_nss": round(b["nss_sum"] / b["products"], 3),
        })
    out.sort(key=lambda x: x["avg_demand_score"], reverse=True)
    return Response(out)


@api_view(["GET"])
def model_quality_by_language(request):
    """
    Качество baseline-модели по языкам:
    согласованность метки модели и rating звезды.

    Соглашение:
      - 4-5★ ⟷ positive
      - 3★ ⟷ neutral
      - 1-2★ ⟷ negative

    Для главы «Ограничения» в дипломе: видно как модель резко проседает на uz.
    """
    rows = []
    qs = (
        SentimentResult.objects
        .select_related("review")
        .filter(review__rating__isnull=False)
    )
    by_lang: dict[str, dict[str, int]] = {}
    for sr in qs:
        lang = sr.review.language
        bucket = by_lang.setdefault(lang, {"total": 0, "agree": 0,
                                           "pos": 0, "neu": 0, "neg": 0})
        r = sr.review.rating
        bucket["total"] += 1
        bucket[{"positive": "pos", "neutral": "neu", "negative": "neg"}[sr.label]] += 1
        rating_class = (
            "positive" if r >= 4 else
            "negative" if r <= 2 else
            "neutral"
        )
        if sr.label == rating_class:
            bucket["agree"] += 1

    label_for_lang = dict(Language.choices)
    for lang, b in by_lang.items():
        total = b["total"]
        if not total:
            continue
        rows.append({
            "language": lang,
            "language_label": label_for_lang.get(lang, lang),
            "total": total,
            "agreement": round(b["agree"] / total, 4),
            "agreement_pct": round(b["agree"] / total * 100, 1),
            "positive": b["pos"],
            "neutral": b["neu"],
            "negative": b["neg"],
        })
    rows.sort(key=lambda x: x["total"], reverse=True)
    return Response(rows)
