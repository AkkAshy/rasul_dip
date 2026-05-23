# Talab indeksi — Uzum Market

> **Tema:** Klient pikirleri tiykarında ónim talabın anıqlaw, sentimental analiz arqalı.

**Talab indeksi** — Uzum Market sıyaqlı marketpleysde tovarǵa bolǵan talabnı tikkeley sansha emes, al **klient pikirleri arqalı** ólshew platforması. Tek satıw sanı emes, klientlardıń ne aytatuǵını, ne ushın maqtaytuǵın yamasa shaǵımlanatuǵını — bul tovardıń haqıyqıy bazar potencialın kórsetedi.

## Másele

Marketpleysde mıńlaǵan tovar bar, hár birinde — onlaǵan, júzlegen pikir. Vendor yamasa analitikke jeke-jeke oqıp sıpat shıǵarıw múmkin emes. Pikirler ru, uz hám kaa tillerinde aralasıp ketken, ózbek tili ushın tayar NLP-modeller bárinen jaqsı isleymeydi.

## Sheshim

Sistema klient pikirlerin tolıq avtomatlasdırılǵan jaǵdayda dóretedi: uzum.uz dan pikirler tortıladı (REST API hám headless brauzer arqalı), olardıń tónliki sentimental-analiz modeli menen anıqlanadı, sonnan keyin hár pikirde tórt biznes-aspekt — **jetkeriw, baha, sapa, qadoq** — bólek-bólek tekserilip, hár qaysısı boyınsha jaqsı/jaman tónlik beriledi. Aqırında bul barlıq signallar **bir kompozit Demand Score (0–100)** ishine jıynaladı:

> populyarlıq × klient qanaatlanıwshılıǵı × aspekt poprawkası × 100

Bul ball arqalı tovardı bir qaranıs penen júdá joqarı / orta / tómen talabqa jiklew múmkin, hám tar boyın qaysı aspekte ekenin (mısalı, «baha jaqsı, jetkeriw oǵırı») dárhal kóriw múmkin.

## Kim ushın

- **Vendorǵa** — qaysı tovardı kúsheytiw, qaysı aspekti tabıw kerek
- **Marketpleys analitigine** — kategoriya kesiminde qaysı segment ósip atır
- **Klientke** — tovardı tek juldız emes, klient haqıyqıy tájiriybesi tiykarında bahalaw múmkin

## Quralları haqqında qısqasha

Backend — Python + Django, NLP boliminde HuggingFace transformerler. Frontend — Next.js, dashboardta interaktiv vizualizaciya. Maǵlıwmat PostgreSQL'de. Sistema **realniy prodda jaylasqan**: API serverde, dashboard bulttı platformada, hár CI/CD push avtomatlı tárizde shıǵarıladı.

## Diplom ushın tiykarǵı ashılıs

Multilingual baseline-modeldıń sapası til boyınsha keskin pariqlanadı: **rus** tilinde klient juldız reytingı menen **58.8%** uyǵın boladı, **ózbek** tilinde bolsa **18.4%** ǵana — model `zoʼr`, `ajoyib`, `tavsiya qilaman` siyaqlı pozitiv markerlardı tanıymaydı. Bul rakam ózbek hám karakalpak tilleri ushın **fine-tune zarurlıǵın empiriyalıq tárizde dáliyledi** — sebebi diplom jumısınıń biznes-tiykarı hám «alǵa shıǵıs» bóliminiń bas másalesi.

## Prod

| | URL |
|---|---|
| API | https://ml.saribek.uz |
| Frontend | https://rasul-dip.vercel.app |

---

# Sentiment Analysis & Demand Index — маркетплейс Uzum (dev docs)

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
