from django.db import models


class Source(models.TextChoices):
    """Источник отзывов — маркетплейсы Узбекистана."""
    UZUM = "uzum", "Uzum Market"
    ASAXIY = "asaxiy", "Asaxiy"
    TEXNOMART = "texnomart", "Texnomart"
    OTHER = "other", "Другое"


class Category(models.Model):
    """Категория товара (электроника, одежда, бытовая техника...)."""
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"

    def __str__(self):
        return self.name


class Product(models.Model):
    """Товар, по которому собираем отзывы."""
    name = models.CharField(max_length=255)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="products"
    )
    source = models.CharField(max_length=20, choices=Source.choices)
    external_id = models.CharField(max_length=100, help_text="ID товара на маркетплейсе")
    url = models.URLField(max_length=500)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    rating_avg = models.FloatField(null=True, blank=True, help_text="Средняя оценка маркетплейса")
    reviews_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
        unique_together = [("source", "external_id")]
        indexes = [
            models.Index(fields=["source", "external_id"]),
        ]

    def __str__(self):
        return f"[{self.source}] {self.name}"
