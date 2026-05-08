"""
Быстрая проверка: загружаем модель и прогоняем тестовые отзывы на uz/ru.

Запуск:
    cd backend && source ../.venv/bin/activate
    python ../ml/smoke_test.py
"""
from transformers import pipeline

MODEL = "tabularisai/multilingual-sentiment-analysis"

EXAMPLES = [
    ("ru", "Отличный товар, доставили быстро, всем рекомендую!"),
    ("ru", "Полное разочарование, качество ужасное, верните деньги"),
    ("uz", "Mahsulot juda yaxshi, tez yetkazib berildi, rahmat!"),
    ("uz", "Sifati yomon, pulim qaytarib bering"),
    ("uz_cyr", "Маҳсулот зўр, тавсия қиламан"),
]


def main():
    print(f"Загружаю {MODEL}...")
    pipe = pipeline("sentiment-analysis", model=MODEL, device=-1, truncation=True)

    print("\nРезультаты:\n" + "-" * 60)
    for lang, text in EXAMPLES:
        result = pipe(text)[0]
        print(f"[{lang}] {text}")
        print(f"    → {result['label']:<12} {result['score']:.3f}\n")


if __name__ == "__main__":
    main()
