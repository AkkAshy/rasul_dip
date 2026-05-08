"""
Прогон Aspect-Based Sentiment Analysis по отзывам.

    python manage.py run_absa                      # все отзывы
    python manage.py run_absa --product 12         # только конкретный товар
    python manage.py run_absa --reanalyze          # перезатереть существующие AspectMention
"""
from django.core.management.base import BaseCommand

from apps.reviews.models import Review
from apps.analysis.models import Aspect, AspectMention
from apps.analysis.services import SentimentAnalyzer
from apps.analysis.absa import analyze_review_aspects


class Command(BaseCommand):
    help = "Извлекает упоминания аспектов из отзывов и проставляет им тональность"

    def add_arguments(self, parser):
        parser.add_argument("--product", type=int, default=None)
        parser.add_argument("--reanalyze", action="store_true",
                            help="Удалить существующие AspectMention перед прогоном")

    def handle(self, *args, **opts):
        # 1. Подгружаем аспекты из БД
        aspects = list(Aspect.objects.all())
        if not aspects:
            self.stdout.write(self.style.ERROR(
                "В БД нет аспектов. Запусти: python manage.py seed_aspects"
            ))
            return

        aspects_by_name = {a.name: a for a in aspects}
        keywords_map = {a.name: a.keywords for a in aspects}
        self.stdout.write(
            f"Загружено аспектов: {', '.join(aspects_by_name.keys())}"
        )

        # 2. Выбираем отзывы
        qs = Review.objects.all()
        if opts["product"]:
            qs = qs.filter(product_id=opts["product"])
        reviews = list(qs)
        self.stdout.write(f"Обрабатываю {len(reviews)} отзывов...")

        if opts["reanalyze"]:
            review_ids = [r.id for r in reviews]
            deleted, _ = AspectMention.objects.filter(review_id__in=review_ids).delete()
            self.stdout.write(f"  очищено старых упоминаний: {deleted}")

        # 3. Прогоняем
        analyzer = SentimentAnalyzer.get()
        total_mentions = 0
        for i, review in enumerate(reviews, 1):
            hits = analyze_review_aspects(review.text, keywords_map, analyzer)
            for hit in hits:
                aspect = aspects_by_name[hit.aspect_name]
                AspectMention.objects.update_or_create(
                    review=review,
                    aspect=aspect,
                    defaults={
                        "label": hit.label,
                        "score": hit.score,
                        "snippet": hit.sentence[:500],
                    },
                )
                total_mentions += 1

            if i % 50 == 0:
                self.stdout.write(f"  обработано {i}/{len(reviews)}")

        self.stdout.write(self.style.SUCCESS(
            f"Готово. Создано/обновлено упоминаний: {total_mentions}"
        ))
