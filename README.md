# Sentiment Analysis & Demand Index — маркетплейс Uzum

> **Тема:** Определение спроса на продукт с помощью сентиментального анализа,
> основанного на мнениях клиента
>
> Дипломный проект: собираем отзывы с **uzum.uz**, прогоняем через NLP-модель,
> рассчитываем composite **Demand Score** = популярность × удовлетворённость ×
> поправка по аспектам, строим дашборд.

## Что внутри

- **Парсер uzum.uz** — два режима:
  - `httpx` через REST `api.uzum.uz/api/v2/product/{id}` — карточка + 1 топ-отзыв
  - `Playwright` через GraphQL `Feedbacks` — полный список отзывов
- **Sentiment baseline** — `tabularisai/multilingual-sentiment-analysis`
- **ABSA** (Aspect-Based) — keyword-based extraction для 4 аспектов:
  доставка, цена, качество, упаковка (на ru/uz_lat/uz_cyr)
- **Demand Score** — formula: `popularity × satisfaction × aspect_penalty × 100`
- **Дашборд** — спрос по товарам/категориям, качество модели по языкам,
  «за что хвалят / ругают», лента отзывов

## Стек

- **Backend:** Django 5 + DRF + PostgreSQL
- **NLP:** HuggingFace Transformers + torch
- **Парсер:** httpx + Playwright (chromium)
- **Frontend:** Next.js 16 + Tailwind v4 + Recharts
- **Инфра:** Docker Compose (Postgres + Redis)

## Структура

```
rasul_dip/
├── backend/            # Django REST API
│   ├── apps/
│   │   ├── products/   # Category, Product
│   │   ├── reviews/    # Review с метаданными языка/рейтинга
│   │   ├── analysis/   # Sentiment, Aspect, AspectMention
│   │   │   ├── services.py   # ленивый HuggingFace pipeline
│   │   │   ├── absa.py       # sentence-level ABSA
│   │   │   ├── demand.py     # формула Demand Score
│   │   │   └── views.py      # DRF endpoints
│   │   └── scraper/    # management-команды парсинга
│   └── config/
├── scraper/            # переиспользуемые клиенты
│   ├── common/         # типы + детект языка
│   └── uzum/
│       ├── client.py          # httpx REST (топ-отзыв)
│       └── browser_client.py  # Playwright (GraphQL Feedbacks)
├── frontend/           # Next.js дашборд
├── ml/                 # ноутбуки / smoke-test
├── docs/
│   ├── uzum-api-research.md   # как устроен API uzum
│   └── methodology.md         # черновик главы 2 диплома
└── docker-compose.yml
```

## Быстрый старт

### 1. Поднять БД и Redis

```bash
docker compose up -d
# Postgres: localhost:5433, Redis: localhost:6380 — порты намеренно сдвинуты,
# чтобы не конфликтовать со стандартными 5432/6379.
```

### 2. Backend

```bash
python3.12 -m venv .venv
source .venv/bin/activate

# Минимум для разработки без ML (~50MB):
pip install -r backend/requirements-minimal.txt

# Полный стек (с torch/transformers + playwright, ~2-3 ГБ):
pip install -r backend/requirements.txt
playwright install chromium

cd backend
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser   # опционально
python manage.py runserver 8001    # 8000 на macOS часто занят, 8001 безопаснее
```

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://127.0.0.1:8001/api
pnpm install
pnpm dev                           # http://localhost:3001 (3000 часто занят)
```

## Рабочий цикл

```bash
# === СБОР ДАННЫХ ===

# 1a. Bulk-сбор top-feedback'ов через REST (быстро, ~190 товаров):
python backend/manage.py scrape_uzum --bulk --from 1 --to 5000 --min-reviews 5

# 1b. Полный сбор отзывов через GraphQL/Playwright:
python backend/manage.py scrape_uzum_full \
    --top 100 --max-reviews 100 --page-size 30 \
    --between 4.0 --rate-delay 1.0 --stop-after 5000

# 1c. Подтянуть категории:
python backend/manage.py refresh_categories

# === ML PIPELINE ===

# 2. Прогнать sentiment-анализ:
python backend/manage.py run_sentiment --batch 32

# 3. Загрузить аспекты + прогнать ABSA:
python backend/manage.py seed_aspects
python backend/manage.py run_absa --reanalyze

# === ОТЧЁТ ===

python backend/manage.py sentiment_report --samples 4
```

## API эндпоинты

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/products/` | Список товаров с фильтрами `?source=&category=&search=&ordering=` |
| GET | `/api/products/categories/` | Категории |
| GET | `/api/reviews/?product=1` | Отзывы конкретного товара |
| GET | `/api/analysis/demand-index/?limit=10&bottom=1` | Demand-таблица (топ или анти-топ) |
| GET | `/api/analysis/demand-by-category/` | Спрос, агрегированный по категории |
| GET | `/api/analysis/products/{id}/summary/` | Карточка: distribution + аспекты + цитаты + последние отзывы |
| GET | `/api/analysis/products/{id}/demand/` | Demand Score одного товара |
| GET | `/api/analysis/model-quality/` | Согласованность модель ↔ rating по языкам |

## Документация

- [docs/uzum-api-research.md](docs/uzum-api-research.md) — как устроен API uzum,
  что доступно/закрыто, captcha
- [docs/methodology.md](docs/methodology.md) — методология диплома (глава 2)

## Главное наблюдение проекта

На русском датасете baseline-модель даёт **58.8%** согласованности с rating.
На узбекском — **18.4%**. Готовая multilingual-модель не понимает узбекские
позитивные маркеры (`zo'r`, `tavsiya qilaman`, `ajoyib`) — это и есть бизнес-
обоснование fine-tune'а как продолжения работы.

## Roadmap

- [x] Парсер двух типов (httpx + Playwright)
- [x] Sentiment baseline + замер качества по языкам
- [x] ABSA с 4 аспектами
- [x] Composite Demand Score
- [x] Дашборд с фильтрами и аналитикой по категориям
- [ ] Fine-tune XLM-RoBERTa на узбекском
- [ ] ABSA через embedding-similarity вместо keywords
- [ ] Парсер Asaxiy / Texnomart (cross-marketplace)
- [ ] Деплой на VPS

## Лицензия

Учебный проект.
