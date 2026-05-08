"""
Сводный отчёт по результатам сентимент-анализа.

    python manage.py sentiment_report
    python manage.py sentiment_report --samples 5
"""
from collections import defaultdict

from django.core.management.base import BaseCommand
from django.db.models import Count

from apps.reviews.models import Review
from apps.analysis.models import SentimentResult


class Command(BaseCommand):
    help = "Печатает сводку по разметке сентимента"

    def add_arguments(self, parser):
        parser.add_argument("--samples", type=int, default=3,
                            help="Сколько примеров на каждую метку показать")

    def handle(self, *args, **opts):
        total = Review.objects.count()
        analyzed = SentimentResult.objects.count()

        self.stdout.write(self.style.SUCCESS(
            f"\n=== Сводка ===\n"
            f"Всего отзывов:    {total}\n"
            f"Проанализировано: {analyzed}\n"
            f"Не размечено:     {total - analyzed}\n"
        ))

        # Распределение меток
        self.stdout.write("=== Распределение тональности ===")
        dist = (
            SentimentResult.objects
            .values("label")
            .annotate(c=Count("id"))
            .order_by("-c")
        )
        for row in dist:
            pct = row["c"] / analyzed * 100 if analyzed else 0
            self.stdout.write(f"  {row['label']:10s} {row['c']:4d}  ({pct:5.1f}%)")

        # Кросс-таблица: модельная метка vs звезда rating
        self.stdout.write("\n=== Метка модели × звёзды отзыва ===")
        cross = defaultdict(lambda: defaultdict(int))
        qs = SentimentResult.objects.select_related("review").all()
        for sr in qs:
            cross[sr.label][sr.review.rating or 0] += 1
        ratings = sorted({r for d in cross.values() for r in d})
        header = f"  {'label':10s}" + "".join(f"{r}★".rjust(7) for r in ratings) + "  total"
        self.stdout.write(header)
        for label in ("positive", "neutral", "negative"):
            if label not in cross:
                continue
            row_parts = [f"  {label:10s}"]
            for r in ratings:
                row_parts.append(str(cross[label].get(r, 0)).rjust(7))
            row_parts.append(str(sum(cross[label].values())).rjust(7))
            self.stdout.write("".join(row_parts))

        # Согласованность модель ↔ звёзды
        agree = 0
        disagree = 0
        for sr in qs:
            r = sr.review.rating or 0
            if sr.label == "positive" and r >= 4:
                agree += 1
            elif sr.label == "negative" and r <= 2:
                agree += 1
            elif sr.label == "neutral" and r == 3:
                agree += 1
            else:
                disagree += 1
        if analyzed:
            self.stdout.write(self.style.SUCCESS(
                f"\nСогласованность с звёздами: {agree}/{agree+disagree} "
                f"({agree/(agree+disagree)*100:.1f}%)"
            ))

        # Примеры
        n = opts["samples"]
        self.stdout.write(f"\n=== Примеры (по {n} на метку) ===")
        for label in ("positive", "neutral", "negative"):
            self.stdout.write(f"\n  --- {label} ---")
            samples = (
                SentimentResult.objects
                .filter(label=label)
                .select_related("review")
                .order_by("?")[:n]
            )
            for sr in samples:
                r = sr.review
                self.stdout.write(
                    f"  [{r.language}] [{r.rating}★] score={sr.score:.2f}  "
                    f"{r.text[:120].replace(chr(10), ' ')}"
                )
