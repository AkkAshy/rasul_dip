# ML — sentiment analysis

Эта папка для **исследования и обучения моделей**. Прод-инференс живёт в `backend/apps/analysis/services.py`.

## План работы для диплома

1. **Baseline** — взять готовую multilingual-модель (zero-shot):
   - `tabularisai/multilingual-sentiment-analysis` — 22 языка вкл. uz/ru
   - `cardiffnlp/twitter-xlm-roberta-base-sentiment` — sentiment 100+ языков
2. **Замер качества** — собрать ~500 размеченных вручную отзывов, посчитать accuracy/F1
3. **Fine-tune** — дообучить `xlm-roberta-base` на узбекских отзывах (если baseline слабый)
4. **ABSA** — выделить аспекты (цена, качество, доставка) через keyword-matching → потом дообучить отдельную модель

## Файлы
- `notebooks/01_baseline.ipynb` — пробуем готовые модели
- `notebooks/02_label_data.ipynb` — разметка собранных отзывов
- `notebooks/03_finetune.ipynb` — дообучение
- `training/` — скрипты обучения
- `models/` — сохранённые чекпоинты (в gitignore)

## Источники данных
- Отзывы из БД (после парсинга uzum/asaxiy)
- Готовые датасеты: [tahrirchi-uz/uz-sentiment](https://huggingface.co/datasets) (если найдётся)
