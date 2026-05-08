"""
Простая эвристика языка — узбекский (lat/cyr) / русский / каракалпакский / unknown.
Без сторонних либ, чтобы парсер был лёгким. Точную классификацию делаем на этапе ML.
"""
import re

UZ_LATIN_MARKERS = re.compile(r"[oʻgʻOʻGʻ]|(?:\bbu\b|\bjuda\b|\bkerak\b|\byaxshi\b)", re.I)
UZ_CYR_MARKERS = re.compile(r"[ўғқҳ]", re.I)
RU_MARKERS = re.compile(r"[а-яё]", re.I)
KAA_MARKERS = re.compile(r"\b(qaraqalpaq|menen|jaqsı|ushın)\b", re.I)


def detect_language(text: str) -> str:
    if not text:
        return "unk"
    if KAA_MARKERS.search(text):
        return "kaa"
    if UZ_CYR_MARKERS.search(text):
        return "uz_cyr"
    if UZ_LATIN_MARKERS.search(text):
        return "uz"
    if RU_MARKERS.search(text):
        return "ru"
    # latin без узбекских маркеров — скорее uzbek, чем английский
    if re.search(r"[a-z]", text, re.I):
        return "uz"
    return "unk"
