from django.db import models
from apps.reviews.models import Review


class SentimentLabel(models.TextChoices):
    """Метки тональности — стандартная 3-классная схема."""
    POSITIVE = "positive", "Позитив"
    NEUTRAL = "neutral", "Нейтрал"
    NEGATIVE = "negative", "Негатив"


class SentimentResult(models.Model):
    """Результат сентимент-анализа одного отзыва."""
    review = models.OneToOneField(
        Review, on_delete=models.CASCADE, related_name="sentiment_result"
    )
    label = models.CharField(max_length=10, choices=SentimentLabel.choices)
    score = models.FloatField(help_text="Уверенность модели 0..1")
    model_name = models.CharField(max_length=200, help_text="Какая модель проставила метку")
    analyzed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Результат сентимента"
        verbose_name_plural = "Результаты сентимента"
        indexes = [
            models.Index(fields=["label"]),
        ]

    def __str__(self):
        return f"{self.review_id}: {self.label} ({self.score:.2f})"


class Aspect(models.Model):
    """Аспект продукта (цена, качество, доставка) — для ABSA."""
    name = models.CharField(max_length=80, unique=True)
    keywords = models.JSONField(
        default=list,
        help_text="Ключевые слова на uz/ru — триггеры для аспекта",
    )

    class Meta:
        verbose_name = "Аспект"
        verbose_name_plural = "Аспекты"

    def __str__(self):
        return self.name


class AspectMention(models.Model):
    """Упоминание аспекта в конкретном отзыве + его тональность."""
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name="aspect_mentions")
    aspect = models.ForeignKey(Aspect, on_delete=models.CASCADE, related_name="mentions")
    label = models.CharField(max_length=10, choices=SentimentLabel.choices)
    score = models.FloatField()
    snippet = models.TextField(help_text="Фрагмент отзыва, который зацепил аспект", blank=True)

    class Meta:
        unique_together = [("review", "aspect")]
        indexes = [
            models.Index(fields=["aspect", "label"]),
        ]
