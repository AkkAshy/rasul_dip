"""
Парсер Uzum. Два режима:

1. Один товар:
       python manage.py scrape_uzum 100

2. Bulk-сбор top-отзывов по диапазону ID:
       python manage.py scrape_uzum --bulk --from 1 --to 5000 --min-reviews 10
"""
import asyncio
import sys
from pathlib import Path

from asgiref.sync import sync_to_async
from django.core.management.base import BaseCommand, CommandError

# scraper/ лежит рядом с backend/, добавим корень репо в sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[5]))

from scraper.uzum import UzumClient  # noqa: E402
from scraper.common.types import ProductData, ReviewData  # noqa: E402

from apps.products.models import Product, Source
from apps.reviews.models import Review


class Command(BaseCommand):
    help = "Парсит товары + top-отзывы с Uzum Market"

    def add_arguments(self, parser):
        parser.add_argument("product_id", nargs="?", type=int, help="ID одного товара")
        parser.add_argument("--bulk", action="store_true", help="Режим массового сбора")
        parser.add_argument("--from", dest="start_id", type=int, default=1)
        parser.add_argument("--to", dest="end_id", type=int, default=1000)
        parser.add_argument("--min-reviews", type=int, default=5,
                            help="Минимум отзывов у товара чтобы его учитывать")

    def handle(self, *args, **opts):
        if opts["bulk"]:
            asyncio.run(self._bulk(opts["start_id"], opts["end_id"], opts["min_reviews"]))
            return
        if not opts["product_id"]:
            raise CommandError("Укажи product_id или используй --bulk")
        asyncio.run(self._single(opts["product_id"]))

    # ---------- single ----------

    async def _single(self, pid: int):
        async with UzumClient() as client:
            product_data = await client.fetch_product(pid)
            if not product_data:
                self.stdout.write(self.style.ERROR(f"Товар {pid} не найден"))
                return

            product = await sync_to_async(self._save_product)(product_data)
            self.stdout.write(self.style.SUCCESS(
                f"Товар: {product.name} (rating={product.rating_avg}, отзывов={product.reviews_count})"
            ))

            saved = 0
            async for review_data in client.iter_product_reviews(pid):
                if await sync_to_async(self._save_review)(product, review_data):
                    saved += 1
            self.stdout.write(self.style.SUCCESS(f"Сохранено отзывов: {saved}"))

    # ---------- bulk ----------

    async def _bulk(self, start: int, end: int, min_reviews: int):
        self.stdout.write(
            f"Bulk-сбор: ID {start}..{end}, min_reviews={min_reviews}\n"
            "Cmd+C можно прерывать — прогресс сохраняется по ходу."
        )
        async with UzumClient() as client:
            products_count = 0
            reviews_count = 0
            async for product_data, review_data in client.iter_top_feedbacks(
                start, end, min_reviews=min_reviews
            ):
                product = await sync_to_async(self._save_product)(product_data)
                if await sync_to_async(self._save_review)(product, review_data):
                    reviews_count += 1
                products_count += 1

                if products_count % 25 == 0:
                    self.stdout.write(
                        f"  [{products_count}] последний: {product.name[:60]}"
                    )

            self.stdout.write(self.style.SUCCESS(
                f"Готово: товаров {products_count}, отзывов {reviews_count}"
            ))

    # ---------- helpers ----------

    def _save_product(self, data: ProductData) -> Product:
        product, _ = Product.objects.update_or_create(
            source=Source.UZUM,
            external_id=data.external_id,
            defaults={
                "name": data.name,
                "url": data.url,
                "price": data.price,
                "rating_avg": data.rating_avg,
                "reviews_count": data.reviews_count,
            },
        )
        return product

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
