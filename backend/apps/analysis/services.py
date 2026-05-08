"""
Сервис сентимент-анализа.
Изолирован от Django views/models — чтобы можно было звать из CLI/Celery/тестов.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Iterable

from django.conf import settings


@dataclass(frozen=True)
class SentimentPrediction:
    label: str   # positive | neutral | negative
    score: float # уверенность 0..1


# Маппинг меток моделей → наш единый вид
_LABEL_NORMALIZER = {
    "POSITIVE": "positive",
    "POS": "positive",
    "Very Positive": "positive",
    "Positive": "positive",
    "NEUTRAL": "neutral",
    "NEU": "neutral",
    "Neutral": "neutral",
    "NEGATIVE": "negative",
    "NEG": "negative",
    "Very Negative": "negative",
    "Negative": "negative",
}


def _normalize_label(raw: str) -> str:
    return _LABEL_NORMALIZER.get(raw, raw.lower())


class SentimentAnalyzer:
    """
    Ленивая обёртка над HuggingFace pipeline.
    Загружает модель один раз при первом вызове — экономим память на старте.
    """

    _instance: "SentimentAnalyzer | None" = None

    def __init__(self, model_name: str | None = None, device: str = "cpu"):
        from transformers import pipeline  # noqa: импорт тяжёлый, делаем ленивым

        self.model_name = model_name or settings.SENTIMENT_MODEL
        self.device = device or settings.MODEL_DEVICE
        self.pipe = pipeline(
            "sentiment-analysis",
            model=self.model_name,
            device=-1 if self.device == "cpu" else 0,
            truncation=True,
            max_length=512,
        )

    @classmethod
    def get(cls) -> "SentimentAnalyzer":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def predict(self, text: str) -> SentimentPrediction:
        result = self.pipe(text)[0]
        return SentimentPrediction(
            label=_normalize_label(result["label"]),
            score=float(result["score"]),
        )

    def predict_batch(self, texts: Iterable[str]) -> list[SentimentPrediction]:
        results = self.pipe(list(texts))
        return [
            SentimentPrediction(label=_normalize_label(r["label"]), score=float(r["score"]))
            for r in results
        ]
