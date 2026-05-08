"""
Прогон сентимент-анализа по всем отзывам без результата.

Использование:
    python manage.py run_sentiment
    python manage.py run_sentiment --product 12 --batch 32
"""
from django.core.management.base import BaseCommand

from apps.reviews.models import Review
from apps.analysis.models import SentimentResult
from apps.analysis.services import SentimentAnalyzer


class Command(BaseCommand):
    help = "Анализирует тональность отзывов без существующего результата"

    def add_arguments(self, parser):
        parser.add_argument("--product", type=int, default=None, help="ID товара (опционально)")
        parser.add_argument("--batch", type=int, default=16, help="Размер батча")
        parser.add_argument("--limit", type=int, default=None, help="Лимит отзывов")

    def handle(self, *args, **opts):
        qs = Review.objects.filter(sentiment_result__isnull=True)
        if opts["product"]:
            qs = qs.filter(product_id=opts["product"])
        if opts["limit"]:
            qs = qs[: opts["limit"]]

        reviews = list(qs)
        if not reviews:
            self.stdout.write(self.style.WARNING("Нет отзывов для анализа"))
            return

        self.stdout.write(f"Анализирую {len(reviews)} отзывов...")
        analyzer = SentimentAnalyzer.get()

        batch = opts["batch"]
        created = 0
        for i in range(0, len(reviews), batch):
            chunk = reviews[i : i + batch]
            preds = analyzer.predict_batch([r.text for r in chunk])
            results = [
                SentimentResult(
                    review=r,
                    label=p.label,
                    score=p.score,
                    model_name=analyzer.model_name,
                )
                for r, p in zip(chunk, preds)
            ]
            SentimentResult.objects.bulk_create(results, ignore_conflicts=True)
            created += len(results)
            self.stdout.write(f"  обработано {created}/{len(reviews)}")

        self.stdout.write(self.style.SUCCESS(f"Готово: {created} результатов"))
