"""
Заполняет Category для уже собранных товаров через REST /api/v2/product/{id}.

    python manage.py refresh_categories
"""
import asyncio
import sys
from pathlib import Path

from asgiref.sync import sync_to_async
from django.core.management.base import BaseCommand
from django.utils.text import slugify

sys.path.insert(0, str(Path(__file__).resolve().parents[5]))

from scraper.uzum import UzumClient  # noqa: E402

from apps.products.models import Product, Source, Category


class Command(BaseCommand):
    help = "Подтягивает названия категорий из uzum REST для всех товаров без category"

    def add_arguments(self, parser):
        parser.add_argument("--all", action="store_true",
                            help="Обновить ВСЕ товары, не только без category")

    def handle(self, *args, **opts):
        asyncio.run(self._run(opts["all"]))

    async def _run(self, refresh_all: bool):
        qs = Product.objects.filter(source=Source.UZUM)
        if not refresh_all:
            qs = qs.filter(category__isnull=True)
        targets = await sync_to_async(list)(qs)
        self.stdout.write(f"К обработке: {len(targets)} товаров")

        async with UzumClient(rate_delay=0.4) as client:
            updated = 0
            for i, product in enumerate(targets, 1):
                data = await client.fetch_product_raw(int(product.external_id))
                if not data:
                    continue
                cat_title = (data.get("category") or {}).get("title")
                if not cat_title:
                    continue
                await sync_to_async(_set_category)(product, cat_title)
                updated += 1
                if i % 20 == 0:
                    self.stdout.write(f"  [{i}/{len(targets)}] обновлено: {updated}")

        self.stdout.write(self.style.SUCCESS(f"Готово. Обновлено: {updated}"))


def _set_category(product: Product, cat_title: str):
    slug = slugify(cat_title, allow_unicode=False) or f"cat-{abs(hash(cat_title)) % 10**6}"
    category, _ = Category.objects.get_or_create(
        name=cat_title,
        defaults={"slug": slug[:140]},
    )
    if product.category_id != category.id:
        product.category = category
        product.save(update_fields=["category", "updated_at"])
