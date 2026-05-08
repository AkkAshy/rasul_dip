"""
Aspect-Based Sentiment Analysis (ABSA).

Подход: lexicon-based detection + sentence-level sentiment.

1. Текст отзыва бьём на предложения (по знакам препинания и переносам).
2. Для каждого аспекта проверяем: есть ли в предложении хотя бы один из его keyword-корней?
3. Если есть — это «упоминание». Прогоняем именно это предложение через
   sentiment-модель (не весь отзыв) — так локально оцениваем как клиент относится
   к этому конкретному аспекту.
4. Сохраняем AspectMention с label, score и snippet.

Ограничения:
- Это baseline. Точная ABSA требует extractor'а (например, T5-base, fine-tuned)
  и aspect-aware sentiment модель.
- На очень коротких отзывах (1-2 слова) сегментация не работает — берём всё.
"""
from __future__ import annotations
import re
from dataclasses import dataclass

from .services import SentimentAnalyzer

# Разделители предложений: точка/!/?/; + переносы строк
_SENT_SPLIT_RE = re.compile(r"(?<=[\.\!\?])[\s\n]+|[\n;]+|(?<=\,)\s(?=[А-ЯA-ZʼʻЎҒҚҲ])")


def split_sentences(text: str) -> list[str]:
    """Грубое разбиение на предложения. На uz/ru работает приемлемо."""
    if not text:
        return []
    parts = [p.strip() for p in _SENT_SPLIT_RE.split(text) if p and p.strip()]
    return parts or [text]


def find_aspect_in_sentence(sentence: str, keywords: list[str]) -> str | None:
    """Возвращает первый matched keyword в нижнем регистре, иначе None."""
    s = sentence.lower()
    for kw in keywords:
        if kw.lower() in s:
            return kw
    return None


@dataclass
class AspectHit:
    aspect_name: str
    matched_keyword: str
    sentence: str
    label: str
    score: float


def analyze_review_aspects(
    text: str,
    aspects_keywords: dict[str, list[str]],
    analyzer: SentimentAnalyzer,
) -> list[AspectHit]:
    """
    Прогоняет ABSA по одному отзыву.

    Возвращает список AspectHit. На один аспект — максимум одно упоминание
    (если в тексте несколько предложений упоминают аспект, берётся самое сильное
    по score).
    """
    if not text:
        return []

    sentences = split_sentences(text)
    # Соберём список (sentence, aspect, kw) — все совпадения
    candidates: list[tuple[str, str, str]] = []
    for sent in sentences:
        for aspect_name, keywords in aspects_keywords.items():
            kw = find_aspect_in_sentence(sent, keywords)
            if kw:
                candidates.append((sent, aspect_name, kw))

    if not candidates:
        return []

    # Батчем прогоняем sentiment на всех matched-предложениях
    sents_to_score = [c[0] for c in candidates]
    preds = analyzer.predict_batch(sents_to_score)

    # Группируем: для каждого аспекта — наиболее уверенный hit
    best_per_aspect: dict[str, AspectHit] = {}
    for (sent, aspect, kw), pred in zip(candidates, preds):
        hit = AspectHit(
            aspect_name=aspect,
            matched_keyword=kw,
            sentence=sent,
            label=pred.label,
            score=pred.score,
        )
        existing = best_per_aspect.get(aspect)
        if existing is None or pred.score > existing.score:
            best_per_aspect[aspect] = hit

    return list(best_per_aspect.values())
