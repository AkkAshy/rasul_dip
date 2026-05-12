---
title: 3.1. Maǵlıwmatlar bazası, parser hám sentiment pipeline
chapter: 3
section: 1
pages: 8-9
---

# III BAP. PLATFORMANÍ ISLEP SHÍǴÍW HÁM SINAQTAN ÓTKERİW

## 3.1. Maǵlıwmatlar bazası, parser hám sentimental analiz pipeline

Bul bólekte biz platformanıń ámeliy ámelge asırıwınıń birinshi etapın — maǵlıwmatlar bazası strukturasın, klient pikirlerin avtomatik jıynaw protsessın hám sentimental analiz pipeline'ın tolıq sıpatlaymız. Bul etap bizdıń platformanıń «kelisi» — barlıq keyingi analitika hám wizualizatsiya bul jerdegi maǵlıwmatlar tiykarında qurıladı.

**Maǵlıwmatlar bazası strukturası**. Bizdıń platformanıń maǵlıwmatlar bazası PostgreSQL 16 tiykarında qurılǵan. Schema 6 áhmiyetli kestesinen turadı: products_category, products_product, reviews_review, analysis_sentimentresult, analysis_aspect hám analysis_aspectmention. Bul keseteler arasındaǵı baylanıs ER-diagrammasında kórsetiledi (1-súwret).

`1-súwret. Maǵlıwmatlar bazasınıń ER-diagrammasi`

```
┌────────────────┐         ┌────────────────────┐
│ Category       │         │ Product            │
│────────────────│         │────────────────────│
│ id (PK)        │◄───────│ category_id (FK)    │
│ name           │         │ id (PK)             │
│ slug           │         │ name                │
└────────────────┘         │ source              │
                           │ external_id         │
                           │ url                 │
                           │ price               │
                           │ rating_avg          │
                           │ reviews_count       │
                           └─────────┬──────────┘
                                     │ 1
                                     │
                                     │ N
                           ┌─────────▼──────────┐
                           │ Review              │
                           │────────────────────│
                           │ id (PK)             │◄─────┐
                           │ product_id (FK)     │      │
                           │ external_id         │      │ 1
                           │ author              │      │
                           │ rating              │      │
                           │ text                │      │
                           │ language            │      │
                           │ raw_data (JSON)     │      │
                           └─────────────────────┘      │
                                     │ 1                │
                                     │                  │
                       ┌─────────────┴──────┐           │
                       │ 1                  │ N         │
              ┌────────▼─────────┐  ┌──────▼──────────┐ │
              │ SentimentResult   │  │ AspectMention   │ │
              │──────────────────│  │─────────────────│ │
              │ id (PK)           │  │ id (PK)         │ │
              │ review_id (1:1)   │  │ review_id (FK)  │─┘
              │ label             │  │ aspect_id (FK)  │
              │ score             │  │ label           │
              │ model_name        │  │ score           │
              └───────────────────┘  │ snippet         │
                                     └────────┬────────┘
                                              │ N
                                              │
                                              │ 1
                                     ┌────────▼────────┐
                                     │ Aspect          │
                                     │─────────────────│
                                     │ id (PK)         │
                                     │ name            │
                                     │ keywords (JSON) │
                                     └─────────────────┘
```

Bul strukturada bir tovar (Product) kóplegen klient pikirine (Review) iye boladı (1-N baylanıs). Hár klient pikiri ortaq sentimental analiz nátiyjesi (SentimentResult) hám kópshilik aspekt-nátiyjelerge (AspectMention) iye boladı. Aspekt'lerdiń ózleri keyword-listine iye, bul JSON-formatında saqlanadı.

**Modellerdiń tolıq sıpatlamasi**. *Category* — tovar kategoriyaları, uzum.uz'tan tikkeley `category.title` alınadı (38 kategoriya: «Sovorodalar», «Dezodorantlar», h.b.). *Product* — tovar haqqında tutıq maǵlıwmat, unique_together (source, external_id). *Review* — klient pikiri, JSONField raw_data uzum'tan tutıq juwap saqlaydı. *SentimentResult* — sentiment-analiz nátiyjesi (label, score, model_name). *Aspect* — 4 aspekt, keywords JSON-list. *AspectMention* — pikirde aspekt'tıń kórsetiwí (label, score, snippet).

**Indekslar**: `products_product.source + external_id` unique; `reviews_review.product_id + posted_at`; `reviews_review.language`; `analysis_aspectmention.aspect_id + label`. Maǵlıwmatlar bazasınıń kólemi: 190 tovar, 3500+ pikir, 1800+ aspekt-mention, disk ~80 MB.

**Parser arxitekturası**. Bizdıń platformanıń parser bólegi eki rejmde jumıs qıladı:

*REST mode (httpx-tiykarındaǵı)*. Bul rejimde tek `api.uzum.uz/api/v2/product/{id}` endpoint'i qollanıladı. Bul endpoint klassikalıq jaqtan tovar metadataın qaytaradı: nomi, kategoriya, narxı, rating, klientpikirlerinıń sanı, *birinshi (top) klient pikiri*. Bul tek bir pikir, biraq «top'» — eń popular yamasa eń eski.

REST mode artıqmashılıqları: tezligi (sahifa qılınmaytuǵın, tikkeley API), tutıq joq (Yandex SmartCaptcha kapcha api.uzum.uz'da emes), 0.5-1.0 sekund'qa tovar.

REST mode kemshiligi: tek bir pikir hár tovardan, qalǵanları joq.

*Browser mode (Playwright-tiykarındaǵı)*. Bul rejimde tólıq Chromium brauzeri ishine kirip, GraphQL endpoint'i menen jumıs qılınadı. Bul rejim tólıq klient pikirlerin tikkeley tórte aladı.

Browser mode artıqmashılıqları: tólıq pikirler, JWT auto-tórtiw, ámeliy ámelge asırıw aniqlıǵı (real klient sıyaqlı).

Browser mode kemshiligi: bir parametr — sekin (5-10 sekund'qa tovar), kóp resurs talap (Chromium ekzempliyarına 200+ MB RAM), Yandex tárepinden rate-limit (HTTP 429).

**Parser jumıs strategiyası**. Eki etap kompleks qollanadı: *REST* — tovar metadata + top-feedback (0.5 sek tovar, 1000 tovar 8-10 minut); *Browser* — top-100 tovardıń tólıq pikirleri (5-10 sek tovar, 40-50 minut). Bul balans: tovar bázasi tutıq, top tovarlar boyınsha tólıq pikir.

**Code listing — UzumClient (httpx-tiykarındaǵı)**:

```python
class UzumClient:
    def __init__(self, timeout: float = 20.0, rate_delay: float = 0.5):
        self._client = httpx.AsyncClient(
            base_url=UZUM_API_BASE,
            headers=DEFAULT_HEADERS,
            timeout=timeout,
        )
        self._rate_delay = rate_delay

    async def fetch_product_raw(self, product_id: int) -> dict | None:
        try:
            r = await self._client.get(f"/v2/product/{product_id}")
            if r.status_code == 404:
                return None
            payload = _safe_json(r.text)
            return payload.get("payload", {}).get("data")
        except httpx.HTTPError:
            return None

    async def iter_top_feedbacks(self, start: int, end: int, min_reviews: int = 5):
        for pid in range(start, end + 1):
            data = await self.fetch_product_raw(pid)
            await asyncio.sleep(self._rate_delay)
            if not data or (data.get("reviewsAmount") or 0) < min_reviews:
                continue
            product = _to_product_data(data)
            review = _extract_top_feedback(data)
            if review:
                yield product, review
```

**Code listing — UzumBrowserClient (Playwright-tiykarındaǵı)**:

```python
class UzumBrowserClient:
    async def __aenter__(self):
        self._pw = await async_playwright().start()
        self._browser = await self._pw.chromium.launch(headless=True)
        self._ctx = await self._browser.new_context(
            user_agent=USER_AGENT, locale="ru-RU",
        )
        self._page = await self._ctx.new_page()
        # Warm-up — JWT cookie alıw
        await self._page.goto("https://uzum.uz/uz/product/100",
                              wait_until="domcontentloaded", timeout=30000)
        await self._page.wait_for_timeout(4000)
        cookies = await self._ctx.cookies()
        self._access_token = next(
            (c["value"] for c in cookies if c["name"] == "access_token"), None
        )
        return self

    async def fetch_feedbacks_page(self, product_id: int, page: int = 0, size: int = 30):
        headers = {
            "content-type": "application/json",
            "authorization": f"Bearer {self._access_token}",
            "origin": "https://uzum.uz",
        }
        body = {
            "operationName": "Feedbacks",
            "query": FEEDBACKS_QUERY,
            "variables": {
                "productPageId": int(product_id),
                "page": page, "size": size,
                "sort": "RELEVANCE", "filters": [],
            },
        }
        # Retry on 429 (Yandex CDN rate-limit)
        for attempt in range(4):
            resp = await self._ctx.request.post(
                "https://graphql.uzum.uz/", headers=headers, data=json.dumps(body),
            )
            if resp.status == 429:
                await asyncio.sleep(12 * (attempt + 1))
                continue
            break
        result = await resp.json()
        return result["data"]["productPage"]["feedbacks"] or []
```

**Til detect-iniń ámeliy ámelge asırıwı**. Bizdıń platformada til avtomatik anıqlanǵan paytda hár klient pikiri saqlanǵanǵa belgilenadı. Bunıń ámeliy ámelge asırıwı:

```python
def detect_language(text: str) -> str:
    if not text:
        return "unk"
    if KAA_MARKERS.search(text):  # qaraqalpaq markerlari (jaqsı, ushın)
        return "kaa"
    if UZ_CYR_MARKERS.search(text):  # ў, ғ, қ, ҳ
        return "uz_cyr"
    if UZ_LATIN_MARKERS.search(text):  # oʻ, gʻ, juda, kerak, yaxshi
        return "uz"
    if RU_MARKERS.search(text):  # rus áliflari
        return "ru"
    if re.search(r"[a-z]", text, re.I):
        return "uz"  # latınca markerlersiz — kópshılıq ózbek
    return "unk"
```

Bizdıń jıynalǵan korpustaǵı til distribuciyası (3-keste):

`3-keste. Klient pikirleri til boyınsha distribuciyası`

| Til | Pikir sanı | Úles |
|---|---|---|
| Rus tili | 1807 | 51.4% |
| Ózbek tili (latınca) | 1519 | 43.2% |
| Belgisiz (emoji-only) | 140 | 4.0% |
| Ózbek tili (kirilcha) | 49 | 1.4% |
| Qaraqalpaq tili | 1 | <0.1% |

**Sentiment pipeline'tıń ámeliy ámelge asırıwı**. Sentimental analiz processi tórt etaptan turadı:

1. *Maǵlıwmat tayarlaw*. SentimentResult'i bolmaǵan klient pikirlerin alıw.

2. *Batch'larǵa bólekleriw*. Hár batch — 32 pikir. CPU uchun optimallashtırılǵan.

3. *Inference*. Hár batch HuggingFace pipeline arqalı işlanadı.

4. *Postprocessing hám saqlaw*. Modeldıń metkaları normallastırıladı (POSITIVE → positive), nátiyje SentimentResult sıpatında saqlanadı.

Code listing:

```python
class Command(BaseCommand):
    def handle(self, *args, **opts):
        qs = Review.objects.filter(sentiment_result__isnull=True)
        if opts["product"]:
            qs = qs.filter(product_id=opts["product"])
        reviews = list(qs)

        analyzer = SentimentAnalyzer.get()
        batch = opts["batch"]  # 32
        created = 0
        for i in range(0, len(reviews), batch):
            chunk = reviews[i : i + batch]
            preds = analyzer.predict_batch([r.text for r in chunk])
            results = [
                SentimentResult(
                    review=r, label=p.label, score=p.score,
                    model_name=analyzer.model_name,
                )
                for r, p in zip(chunk, preds)
            ]
            SentimentResult.objects.bulk_create(results, ignore_conflicts=True)
            created += len(results)
            self.stdout.write(f"  Worked {created}/{len(reviews)}")
```

**Use Case'ler**. *UC1 — Toplı pikirlerin tórte aliw*: administrator `python manage.py scrape_uzum --bulk --from 1 --to 1000` ámelge asıradı; sistema httpx arqalı api.uzum.uz'ǵa kelıp, hár tovardıń top-feedback'ın tórtedi. Nátiyje: 190 tovar, 190 pikir, 8 minut. *UC2 — Tólıq pikirler*: `scrape_uzum_full --top 100 --max-reviews 100`; sistema Playwright baslaytuǵın, JWT-cookies'tı aladı, GraphQL Feedbacks query'di ámelge asıradı, 429'qa duch kelgende 12-48 sekund kútedi. Nátiyje: 4000+ pikir, 25 minut. *UC3 — Sentiment*: `run_sentiment`; HuggingFace'tan model tortıladı (1.1 GB), batch 32 pikir ámelge asırıladı. Nátiyje: 4081 pikir, 5 minut.

**Tıń jaylanǵanlıqlar**. Pipeline ámeliy ámelge asırıwında bir neshe másele bar: *JSON parse'i* — Uzum.uz'tıń ózi-anıqsiz JSON beredi (HTML-tag'lar, control-characters), `_safe_json()` funkciya bul olardı óshiredi. *Async hám ORM* — Django ORM synchronous, biraq parser async; sheshim `asgiref.sync.sync_to_async` arqalı. *Dasl qılıw* — `update_or_create` ozekli, Postgres `INSERT ... ON CONFLICT UPDATE`. *Til detect-iniń sapası* — aralash pikirler («narxı arzon, спасибо!») regex-tiykarındaǵı sistemaǵa qıyın.

**Pipeline performance**. Tórt etap'tıń performance kórsetkishlerі (4-keste):

`4-keste. Pipeline performance`

| Etap | Komanda | 1000 obyekt | Resurs |
|---|---|---|---|
| REST scraping | scrape_uzum --bulk | ~10 minut | CPU 1 core, RAM 100 MB |
| Browser scraping | scrape_uzum_full | ~50 minut | CPU 1 core, RAM 1 GB (Chromium) |
| Sentiment inference | run_sentiment --batch 32 | ~3 minut | CPU 4 cores, RAM 3 GB (model) |
| ABSA inference | run_absa | ~5 minut | CPU 4 cores, RAM 3 GB |

Solay etip, klient pikirlerinen Demand Score-ge shekemgi pipeline'tıń tólıq cycle'i 1000 yangi tovar/4000 yangi pikir ushın yaqın 70 minut'qa shekem ámelge asıriladı. Bul tarawda biznes-ámeliy ámelge asırıw uchun jaqsı kórsetkish.

Solay etip, bizdiń platformanıń maǵlıwmatlar pipeline'i — kompleks, biraq bárqarar arxitektura. Maǵlıwmatlar bazası strukturası 6 áhmiyetli kestesinen turadı, parser eki rejmde jumıs qıladı (REST hám Browser), sentimental analiz HuggingFace Transformers kompozit kórinisinde ámeliy ámelge asırıladı. Keyingi bólekte biz aspekt-tiykarındaǵı analiz hám Demand Score formulasınıń ámeliy ámelge asırıwına ótemiz, qaysı bizdıń platformanıń orta noqatlarınıń biri bolıp tabıladı.
