---
title: 2.1. Backend — Django REST Framework hám PostgreSQL
chapter: 2
section: 1
pages: 8-9
---

# II BAP. PLATFORMANÍ JARATÍWDA QOLLANÍLATUǴÍN TEXNOLOGIYALAR

## 2.1. Backend: Django REST Framework hám PostgreSQL

Platformanıń backend bólegi — bul barlıq biznes-logikani, maǵlıwmatlar bazasın hám API endpoint'lerin óziniń ishine alǵan oraylıq komponent. Bizdıń jumısda backend bólegi Python programmalastırıw tilіnde, Django freymvorki hám Django REST Framework (DRF) kitapxanası tiykarında jaratılǵan. Maǵlıwmatlardı saqlaw ushın PostgreSQL relyaciyalıq maǵlıwmatlar bazası qollanıladı. Bul bólekte texnologiyalardı tańlaw sebepleri, Django arxitekturawiy úlgisi, REST API jaratıw principleri hám maǵlıwmatlar bazası strukturasın bayanlaymız.

**Texnologiyanı tańlawdaǵı kriteriyalar**. Backend tańlawda áhmiyetli faktorlar: machine learning kitapxanaları menen integratsiya (HuggingFace tikkeley Python ushın), bárqarar freymvork (Django — eń bárqarar, eń úlken jámáyat), REST API qollap-quwatlawı (DRF), maǵlıwmatlar bazası ORM, asinxron jumıs qollap-quwatlawı (Django 5 — async views, async ORM). Solay etip, *Django + DRF* sheshimi eń ámeliy.

**Python programmalastırıw tili**. Python — TIOBE Index 2024 boyınsha dúnyada №1 til. Artıqmashılıqları: aydın sintaksis, úlken kitapxana ekosistemı (PyPI'da 500 mıńdan asraq paket), machine learning standardı (NumPy, scikit-learn, PyTorch, HuggingFace), aktiv jámáyat. Toshkent IT-Park'taǵı 200+ kompaniyanıń 60% Python tilı menen islesedi.

**Django freymvorki**. Django — Python tilindegi ashıq kodlı web-freymvork, 2003-jılda jaylanǵan. Instagram, Pinterest, Mozilla, NASA sıyaqlı kompaniyalar Django'ni production'ta qollanadı. Django MTV (Model-Template-View) arxitekturawiy úlgisinde isleydi: Model (maǵlıwmatlar bazası strukturası, ORM arqalı), View (biznes-logika, HTTP-soraw qabıllaydı), Template (HTML kórinisinde). Bizdıń platformada Template qollanılmaydı — backend tek REST API beredi.

**Django'tıń klassikalıq komponentleri**: URL routing (pattern'lar arqalı marshrut), authentication (User model, DRF token), Admin panel (avtomatik CRUD interfeysi), Middleware (autorizatsiya, logging, CORS), Signals (event-tiykarındaǵı kommunikatsiya).

**Django REST Framework (DRF)**. DRF — Django'da REST API jaratıw ushın eń popular kitapxana, 2011-jılda Tom Christie tárepinen jaylanǵan. Áhmiyetli komponentleri: Serializers (JSON/dict ózgertiw, validatsiya), ViewSets (CRUD avtomatlashtırıw — ModelViewSet bir model ushın tutıq REST API beredı), Routers (URL pattern'larnı avtomatik), Permissions (IsAuthenticated, IsAdminUser), Filters (DjangoFilterBackend, SearchFilter, OrderingFilter), Pagination.

**REST principles** (Fielding, 2000): Client-Server, Statelessness, Cacheable, Uniform interface (GET/POST/PUT/DELETE), Layered system.

**Bizdiń platformanıń backend struktura**. Django jumıstıń arxitekturawiy úlgisi `apps/` papkasında jaylanǵan. Hár app — bir biznes-domain'ǵa qaratılǵan modulь:

— `apps/products/` — tovar hám kategoriyalar. Models: Category, Product. Endpoints: GET /api/products/, GET /api/products/categories/, GET /api/products/{id}/.

— `apps/reviews/` — klient pikirleri. Models: Review (Product menen baylanılǵan, language hám rating menen). JSONField raw_data — jıynalǵan haqıyqıy maǵlıwmatdı saqlaw ushın.

— `apps/analysis/` — sentiment hám aspekt-analizdiń kompozit moduli. Models: SentimentResult (review tárep ForeignKey), Aspect (kategoriya hám keyword'lar dizimi), AspectMention (review hám aspect arasındaǵı kópshilik-baylanıs). Sondaı-aq sentiment hám demand servislari (services.py, demand.py).

— `apps/scraper/` — parser management komandalar. Hesh model joq, tek `python manage.py scrape_uzum_full` sıyaqlı komandalar.

**Maǵlıwmatlar bazası: PostgreSQL**. PostgreSQL — eń popular ashıq kodlı relyaciyalıq DB, ACID compliance, JSONField (jsonb tipi indekstaw qollap-quwatlaydı), full-text search (to_tsvector), B-tree/GIN/GIST indekslar. Bizdıń jaǵdayda jsonb áhmiyetli — uzum API tutıq juwabı `raw_data` field'inde saqlanadı.

Bizdıń maǵlıwmatlar bazasınıń kestelerdıń klassikalıq diziminі:

— **products_category** (id, name, slug)
— **products_product** (id, name, source, external_id, url, price, rating_avg, reviews_count, category_id, created_at, updated_at)
— **reviews_review** (id, product_id, external_id, author, rating, text, language, posted_at, raw_data, scraped_at)
— **analysis_sentimentresult** (id, review_id [OneToOne], label, score, model_name, analyzed_at)
— **analysis_aspect** (id, name, keywords [JSONField])
— **analysis_aspectmention** (id, review_id, aspect_id, label, score, snippet)

ER-diagrammasi nátiyjesinde, klient pikiri (Review) — oraylıq kestesi, oǵan products_product (kim haqqında pikir), analysis_sentimentresult (modeldıń metkasi) hám analysis_aspectmention (aspekt-tiykarındaǵı eń áhmiyetli pikir bólekleri) baylanıladı.

**Migrations**. Django migrations — schema versiyalaw mexanizmi. Hár ózgeris ushın `python manage.py makemigrations` komanda Python file (migrations/0001_initial.py sıyaqlı) jaratadı. Bul file'lar git'ka commit etiledi. `python manage.py migrate` komandası bul file'lardı PostgreSQL kestesine ámeliy qılıp atır.

**Indekslaw**. Maǵlıwmatlar bazasında perfomance ushın indekslar áhmiyetli. Bizdıń platformada qollanılatuǵın indekslar:

— `products_product(source, external_id)` — unique. Hár tovar (uzum, asaxiy) ózgeshe.
— `reviews_review(product_id, posted_at)` — review'lar product boyınsha hám sańa boyınsha keńeyteni filterlanadı.
— `reviews_review(language)` — til boyınsha agregatsiya.
— `analysis_aspectmention(aspect_id, label)` — aspekt boyınsha statistika.

**Code listing — Product modeli**:

```python
class Source(models.TextChoices):
    UZUM = "uzum", "Uzum Market"
    ASAXIY = "asaxiy", "Asaxiy"
    TEXNOMART = "texnomart", "Texnomart"


class Product(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True
    )
    source = models.CharField(max_length=20, choices=Source.choices)
    external_id = models.CharField(max_length=100)
    url = models.URLField(max_length=500)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    rating_avg = models.FloatField(null=True, blank=True)
    reviews_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [("source", "external_id")]
        indexes = [models.Index(fields=["source", "external_id"])]
```

**Code listing — Review modeli**:

```python
class Language(models.TextChoices):
    UZBEK_LATIN = "uz", "Oʻzbekcha (lotin)"
    UZBEK_CYRILLIC = "uz_cyr", "Ўзбекча (кирилл)"
    RUSSIAN = "ru", "Русский"
    KARAKALPAK = "kaa", "Qaraqalpaqsha"
    UNKNOWN = "unk", "Unknown"


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    external_id = models.CharField(max_length=120)
    author = models.CharField(max_length=200, blank=True)
    rating = models.PositiveSmallIntegerField(null=True, blank=True)
    text = models.TextField()
    language = models.CharField(max_length=10, choices=Language.choices)
    posted_at = models.DateTimeField(null=True, blank=True)
    raw_data = models.JSONField(default=dict, blank=True)
    scraped_at = models.DateTimeField(auto_now_add=True)
```

**API endpoint'lerdıń diziminí**:

`1-keste. Tiykarǵı API endpointler`

| Endpoint | Usıl | Sıpatlawı |
|---|---|---|
| /api/products/ | GET | Tovarlar dizimi (filter, search, ordering qollap-quwatlanadı) |
| /api/products/categories/ | GET | Tovar kategoriyaları |
| /api/products/{id}/ | GET | Bir tovar haqqında detallar |
| /api/reviews/?product={id} | GET | Bir tovardıń klient pikirleri |
| /api/analysis/demand-index/ | GET | Demand Score boyınsha tovarlar tartibi |
| /api/analysis/demand-by-category/ | GET | Demand Score kategoriya boyınsha agregatsiya |
| /api/analysis/products/{id}/summary/ | GET | Tovardıń tólıq sentiment hám aspekt sıpatlamasi |
| /api/analysis/products/{id}/demand/ | GET | Tovardıń Demand Score'i |
| /api/analysis/model-quality/ | GET | Modeldıń ru/uz tilleri arasındaǵı sapası |

**Async qollap-quwatlawı**. Django 5 — async views/ORM. Bizdıń platformada parser httpx async client qollanadı. Async kód synchronous Django ORM menen integratsiya `asgiref.sync.sync_to_async` arqalı.

**Maǵlıwmatlar bazası optimallashtırıwı**. «N+1 problem» — `select_related` (Forward ForeignKey), `prefetch_related` (reverse FK), `only/defer` (selective field loading).

**Test hám CI/CD**. pytest + pytest-django; unit, integration, end-to-end test'ler. GitHub Actions arqalı CI/CD: hár commit'qa Django check, migrate, test'ler.

Solay etip, Django + DRF + PostgreSQL — bizdıń platformaǵa stabilь, jeńil rawajlanadıǵan tiykar beredi. Keyingi bólekte frontend bóleksinı sıpatlaymız.
