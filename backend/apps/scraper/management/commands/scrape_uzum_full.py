"""
Сбор ПОЛНОГО списка отзывов с Uzum через Playwright (browser_client).

Использование:

    # Брать топ-N товаров (по reviews_count из БД) и качать их отзывы:
    python manage.py scrape_uzum_full --top 30 --max-reviews 200

    # Качать отзывы конкретного товара:
    python manage.py scrape_uzum_full --product-external 60 --max-reviews 500

    # Прервать сбор когда соберётся ~5000 новых отзывов:
    python manage.py scrape_uzum_full --top 50 --max-reviews 200 --stop-after 5000
"""
import asyncio
import sys
from pathlib import Path

from asgiref.sync import sync_to_async
from django.core.management.base import BaseCommand

sys.path.insert(0, str(Path(__file__).resolve().parents[5]))

from scraper.uzum import UzumClient  # noqa: E402
from scraper.uzum.browser_client import UzumBrowserClient  # noqa: E402
from scraper.common.types import ProductData, ReviewData  # noqa: E402

from apps.products.models import Product, Source, Category
from apps.reviews.models import Review
from django.utils.text import slugify


class Command(BaseCommand):
    help = "Полный сбор отзывов с Uzum через Playwright (GraphQL Feedbacks)"

    def add_arguments(self, parser):
        parser.add_argument("--product-external", type=str, default=None,
                            help="Внешний uzum id одного товара")
        parser.add_argument("--top", type=int, default=None,
                            help="Взять топ-N товаров по reviews_count из БД")
        parser.add_argument("--max-reviews", type=int, default=200,
                            help="Лимит отзывов на товар (page_size×max_pages)")
        parser.add_argument("--page-size", type=int, default=30)
        parser.add_argument("--between", type=float, default=4.0,
                            help="Пауза между товарами, сек (anti rate-limit)")
        parser.add_argument("--rate-delay", type=float, default=1.0,
                            help="Пауза между страницами одного товара, сек")
        parser.add_argument("--stop-after", type=int, default=None,
                            help="Остановиться когда соберём столько новых отзывов")
        parser.add_argument("--refresh-categories", action="store_true",
                            help="Перетянуть категории через REST для всех целевых товаров")

    def handle(self, *args, **opts):
        asyncio.run(self._run(opts))

    async def _run(self, opts):
        targets: list[Product] = []
        if opts["product_external"]:
            qs = await sync_to_async(list)(
                Product.objects.filter(
                    source=Source.UZUM, external_id=str(opts["product_external"])
                )
            )
            targets = qs
        elif opts["top"]:
            qs = await sync_to_async(list)(
                Product.objects.filter(source=Source.UZUM)
                .order_by("-reviews_count")[: opts["top"]]
            )
            targets = qs
        else:
            self.stdout.write(self.style.ERROR(
                "Укажи --product-external <id> или --top <N>"
            ))
            return

        if not targets:
            self.stdout.write(self.style.WARNING("Нет товаров под сбор"))
            return

        self.stdout.write(f"Цели: {len(targets)} товаров")

        if opts["refresh_categories"]:
            await self._refresh_categories(targets)

        max_pages = max(1, opts["max_reviews"] // opts["page_size"])
        total_new = 0
        async with UzumBrowserClient(headless=True) as client:
            for i, product in enumerate(targets, 1):
                pid = int(product.external_id)
                self.stdout.write(
                    f"\n[{i}/{len(targets)}] product_id={pid} "
                    f"reviews_count={product.reviews_count} | {product.name[:60]}"
                )
                got = 0
                async for rd in client.iter_reviews(
                    pid,
                    max_pages=max_pages,
                    page_size=opts["page_size"],
                    rate_delay=opts["rate_delay"],
                ):
                    new = await sync_to_async(self._save_review)(product, rd)
                    if new:
                        total_new += 1
                    got += 1
                self.stdout.write(f"  собрано в этом товаре: {got}")
                self.stdout.write(f"  всего новых отзывов в БД: {total_new}")

                if opts["stop_after"] and total_new >= opts["stop_after"]:
                    self.stdout.write(self.style.SUCCESS(
                        f"Достигли --stop-after={opts['stop_after']}, останавливаюсь"
                    ))
                    break

                # Anti-rate-limit пауза между товарами
                if i < len(targets):
                    await asyncio.sleep(opts["between"])

        self.stdout.write(self.style.SUCCESS(
            f"\nГотово. Новых отзывов в БД: {total_new}"
        ))

    async def _refresh_categories(self, products: list[Product]):
        """Тянем `category` через REST /api/v2/product/{id} и сохраняем."""
        self.stdout.write("Обновляю категории через REST API...")
        async with UzumClient(rate_delay=0.4) as client:
            updated = 0
            for product in products:
                data = await client.fetch_product_raw(int(product.external_id))
                if not data:
                    continue
                cat_title = (data.get("category") or {}).get("title")
                if not cat_title:
                    continue
                await sync_to_async(self._set_category)(product, cat_title)
                updated += 1
            self.stdout.write(self.style.SUCCESS(f"  обновлено категорий: {updated}"))

    def _set_category(self, product: Product, cat_title: str):
        slug = slugify(cat_title, allow_unicode=False) or f"cat-{abs(hash(cat_title)) % 10**6}"
        category, _ = Category.objects.get_or_create(
            name=cat_title,
            defaults={"slug": slug[:140]},
        )
        if product.category_id != category.id:
            product.category = category
            product.save(update_fields=["category", "updated_at"])

    def _save_review(self, product: Product, data: ReviewData) -> bool:
        _, created = Review.objects.update_or_create(
            product=product,
            external_id=data.external_id,
            defaults={
                "text": data.text,
                "author": data.author,
                "rating": data.rating,
                "language": data.language,
                "posted_at": data.posted_at,
                "raw_data": data.raw,
            },
        )
        return created
