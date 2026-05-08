"""
Заполняет таблицу Aspect стартовым набором (4 аспекта с keyword'ами).

    python manage.py seed_aspects
"""
from django.core.management.base import BaseCommand

from apps.analysis.models import Aspect
from apps.analysis.aspects_seed import ASPECTS_SEED


class Command(BaseCommand):
    help = "Загружает базовые аспекты в БД (idempotent)"

    def handle(self, *args, **opts):
        for name, keywords in ASPECTS_SEED.items():
            aspect, created = Aspect.objects.update_or_create(
                name=name,
                defaults={"keywords": keywords},
            )
            verb = "создан" if created else "обновлён"
            self.stdout.write(f"  {verb}: {aspect.name} ({len(keywords)} ключевых слов)")
        self.stdout.write(self.style.SUCCESS("Готово"))
