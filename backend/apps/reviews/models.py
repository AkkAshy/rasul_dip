from django.db import models
from apps.products.models import Product


class Language(models.TextChoices):
    """Языки отзывов в Узбекистане."""
    UZBEK_LATIN = "uz", "Oʻzbekcha (lotin)"
    UZBEK_CYRILLIC = "uz_cyr", "Ўзбекча (кирилл)"
    RUSSIAN = "ru", "Русский"
    KARAKALPAK = "kaa", "Qaraqalpaqsha"
    UNKNOWN = "unk", "Unknown"


class Review(models.Model):
    """Отзыв клиента, собранный с маркетплейса."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    external_id = models.CharField(max_length=120, help_text="ID отзыва на источнике")
    author = models.CharField(max_length=200, blank=True)
    rating = models.PositiveSmallIntegerField(null=True, blank=True, help_text="1–5 звёзд")
    text = models.TextField()
    language = models.CharField(max_length=10, choices=Language.choices, default=Language.UNKNOWN)
    posted_at = models.DateTimeField(null=True, blank=True)

    # Метаданные парсинга
    raw_data = models.JSONField(default=dict, blank=True)
    scraped_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        unique_together = [("product", "external_id")]
        indexes = [
            models.Index(fields=["product", "posted_at"]),
            models.Index(fields=["language"]),
        ]
        ordering = ["-posted_at"]

    def __str__(self):
        return f"{self.author or 'anon'}: {self.text[:50]}..."
