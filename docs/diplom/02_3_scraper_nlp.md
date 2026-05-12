---
title: 2.3. Maǵlıwmat jıynaw hám NLP — Playwright, GraphQL, Transformers
chapter: 2
section: 3
pages: 8-9
---

## 2.3. Maǵlıwmat jıynaw hám NLP: Playwright, GraphQL hám HuggingFace Transformers

Bizdıń platformanıń orta noqatlarınıń biri — Uzum.uz marketpleysinen klient pikirlerin avtomatik jıynaw hám olardı sentimental analiz qılıw. Bul process tek bir kitapxana yamasa ámeliyat menen sheshilmaytuǵın, balki bir neshe áhmiyetli komponent'tıń kompleksinde turadı: web-scrap'ling kitapxanaları (httpx, Playwright), GraphQL kliyentі (Uzum.uz'tıń Feedbacks endpoint'i ushın), NLP kitapxanası (HuggingFace Transformers) hám deep learning freymvorki (PyTorch). Bul bólekte hár komponent ámeliy ózgesheliklerí menen tolıq sıpatlanadı.

**Web-scrap'ling tarawında klassikalıq texnologiyalar**. Web-scrap'ling — onlayn manbalardan strukturalı maǵlıwmat jıynaw processi. Klassikalıq jaqtan eki tarawǵa bólenedi:

*HTTP-tiykarındaǵı scrap'ling*. Kliyent tikkeley HTTP soraw jiberedi server'ge, qaytarılǵan HTML yamasa JSON'tı parse qıladı. Bul usıl jeńil, az resurs talap qıladı. Mısalı, Python'tıń `requests` yamasa `httpx` kitapxanaları. Biraq bul usıl JavaScript-rendering qılatuǵın sahifalarda jumıs qılmaydı (Single Page Applications, dinamik kontent). Bizdıń jaǵdayımızda Uzum.uz REST endpoint'leri (api.uzum.uz/api/v2/...) tek dáslepki tovar maǵlıwmatın qaytaradı, biraq klient pikirleri tólıq tek GraphQL arqalı jıynalıp atır, oǵan qosımsha JWT autorizatsiyası kerek.

*Browser-tiykarındaǵı scrap'ling*. Headless brauzerni (chrome yamasa firefox) avtomatik dirizhabıv, ámeliy páge'larnı sebepli ásirinde yuklap, soń DOM'dan kerek maǵlıwmatlardı izlep alıw. Mısalı, Selenium, Playwright, Puppeteer. Bul usıl resurs talap qıladı (CPU, RAM, disk), biraq dinamik sahifalarda jumıs qıladı. Biz Yandex SmartCaptcha'nı aylanıp ótiw ushın bul usıldı qollap atırmız.

**httpx kitapxanası**. httpx — Python ushın zamanagóy HTTP kliyent kitapxanası, klassikalıq `requests`'qa alternativtilik. Artıqmashılıqları: async/await first-class (asyncio integratsiya), HTTP/2 qollap-quwatlawı, requests-kompatibel API, streaming responses, type hints. Bizdiń platformada Uzum.uz REST endpoint'leri menen jumıs qılıw ushın qollanıladı:

```python
import httpx

UZUM_API_BASE = "https://api.uzum.uz/api"

class UzumClient:
    def __init__(self, timeout: float = 20.0):
        self._client = httpx.AsyncClient(
            base_url=UZUM_API_BASE,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...",
                "Accept": "application/json",
                "Origin": "https://uzum.uz",
                "Referer": "https://uzum.uz/",
            },
            timeout=timeout,
        )
```

`AsyncClient` async kontekst menjager retinde qollanıladı. Múlksiyatlar (headers, base_url) bir márte anıqlanadı.

**Playwright avtomatlawı**. Playwright — Microsoft tárepinen 2020-jıldı jaylanǵan brauzer avtomatlaw kitapxanası, Selenium hám Puppeteer alternativasi. Artıqmashılıqları: cross-browser (Chromium, Firefox, WebKit), auto-wait, network interception, multiple contexts, tracing.

Bizdıń strategiya: 1) Headless Chromium baslaw; 2) Uzum.uz sahifaǵa kelıw (warm-up); 3) brauzerge avtomatik JWT-token cookies ózi qoyıladı; 4) token'tı cookie'tan oqıw; 5) APIRequestContext arqalı GraphQL'ge tikkeley HTTP soraw jiberiw, JWT header menen. Browser fetch'i Nuxt'tıń monkey-patched fetch'i arqalı blok bolıp atır, sonıń ushın APIRequestContext qollanıladı.

**GraphQL protokolı**. GraphQL — Facebook tárepinen 2012-jıldı islep shıǵılǵan API protokolı. REST'tan parıqlanıp atır: bir endpoint, strogo schema, klient ózi qaysı maǵlıwmatlardı kerek ekenıne anıqlaydı. Uzum.uz'tıń GraphQL endpoint'i — `https://graphql.uzum.uz/`, Apollo tiykarında, JWT autorizatsiyası talap qılınadı.

Klient pikirleri ushın `Feedbacks` query:

```graphql
query Feedbacks($productPageId: Int!, $filters: [FeedbackFilterType!],
                $page: Int!, $size: Int!, $sort: FeedbackSortType!) {
  productPage(id: $productPageId) {
    feedbacks(filters: $filters, page: $page, size: $size, sort: $sort) {
      id
      content
      rating
      customerName
      dateCreated
      datePublished
      pros
      cons
      anonymous
      reply { content dateCreated id }
    }
  }
}
```

Bul query bir tovar boyınsha (`productPageId`) ózgeshe sańa-tárepten (sort) hám sahifa boyınsha (page, size) klient pikirlerin qaytaradı. Filter'lar (`filters`) qosımsha shártlar (mısalı, tek 5-juldızlı pikirler).

**Yandex SmartCaptcha**. Yandex SmartCaptcha — Yandex Cloud xızmeti, machine-learning tiykarındaǵı bot anıqlaytuǵın sistema. Reklama tarawında yuqarı kórinedi: «Soʻrovlarni robot emas, siz yuborganingizni tasdiqlang».

SmartCaptcha klient'tıń xulqını taldap atır: mouse movement, keyboard pattern, mouse click intervalları, headers, IP address. Eger boylau bot'tan kelgenı kórinedi, kapcha kórsetiledi.

Bizdıń jumısta klassikalıq `httpx` arqalı tikkeley Uzum.uz sahifasına kelıw kapchaǵa olib keladi. Biraq `api.uzum.uz` API endpoint'i kapcha'siz ámeliy ámelge asırıladı. Solay etip, eki strategiya:

1. *Tovar metadata jıynaw* — tikkeley httpx arqalı api.uzum.uz/api/v2/product/{id} endpoint'i qollanıladı.

2. *Klient pikirlerin tólıq jıynaw* — Playwright arqalı, JWT cookies'tan alınıp, GraphQL Feedbacks endpoint'ine tikkeley HTTP soraw jiberiledi.

**HuggingFace ekosistemı**. HuggingFace — 2016-jıldı jaylanǵan AI kompaniyası, Transformers kitapxanası, Datasets, Hub xızmetleri menen. Hub'da 500 mıńdan asraq model bar. Bizdıń platformada qollanılatuǵın model — `tabularisai/multilingual-sentiment-analysis`, XLM-RoBERTa-base tiykarında, 22 tilde fine-tuned. Parametrler ~278M, ~1.1 GB.

**Transformers kitapxanası** (versiya 4.46) klassikalıq komponentleri: AutoModel/AutoTokenizer (Hub'tan automatic yuklaydı), Pipeline (yuqarı dárejedegi API — bir qatar kod menen tutıq kompleks), PreTrainedModel (custom), Trainer (fine-tune). Bizdıń platformada `pipeline` API qollanıladı:

```python
from transformers import pipeline

class SentimentAnalyzer:
    _instance = None

    def __init__(self, model_name: str = "tabularisai/multilingual-sentiment-analysis"):
        self.pipe = pipeline(
            "sentiment-analysis",
            model=model_name,
            device=-1,  # CPU
            truncation=True,
            max_length=512,
        )

    @classmethod
    def get(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def predict_batch(self, texts: list[str]) -> list[SentimentPrediction]:
        results = self.pipe(texts)
        return [SentimentPrediction(label=r["label"], score=r["score"]) for r in results]
```

`Singleton` qatlamı ámeliy ámelge asırıwı sebebi: model 1.1 GB, RAM'da 2-3 GB jaylaytuǵın. Hár soraw'da yangidan jüklep ketiw — qıyın hám aqılsız.

**PyTorch deep learning freymvorki**. PyTorch — Meta tárepinen 2016-jıldı islep shıǵılǵan deep learning kitapxanası. Bizdıń platformada tikkeley qollanılmaydı, biraq HuggingFace Transformers'tıń ostıdaǵı kitapxana retinde qollap-quwatlanadı.

**Sentence-level processing**. NLP'da pikir sóylem bóleklerine bóleklenedi. Bizdıń platformada sentence splitting:

```python
import re

_SENT_SPLIT_RE = re.compile(r"(?<=[\.\!\?])[\s\n]+|[\n;]+")

def split_sentences(text: str) -> list[str]:
    if not text:
        return []
    parts = [p.strip() for p in _SENT_SPLIT_RE.split(text) if p and p.strip()]
    return parts or [text]
```

Hár sentence'i óz aldına model arqalı bahalanadı. Bul aktivlik ámeliy ámelge asırıw paytında batch operatsiyalar ushın paydalı.

**Til detect-i**. Klient pikirleri tilini avtomatik anıqlaw — bizdıń jaǵdayda regex-tiykarındaǵı custom sheshim qollanıladı (qısqa hám tez). Ózbek tilindegi qattıq belgilenedi (latınca: `oʻ`, `gʻ`; kirilcha: `ў`, `ғ`, `қ`, `ҳ`). Alternativalar — `langdetect` (probabilistic n-gram, 55 til) yamasa Facebook fastText (176 til, sapasi joqarı, model 125 MB) — bizdıń jaǵdayda kerek emes:

```python
import re

UZ_LATIN_MARKERS = re.compile(r"[oʻgʻOʻGʻ]|(?:\bbu\b|\bjuda\b|\byaxshi\b)", re.I)
UZ_CYR_MARKERS = re.compile(r"[ўғқҳ]", re.I)
RU_MARKERS = re.compile(r"[а-яё]", re.I)


def detect_language(text: str) -> str:
    if not text:
        return "unk"
    if UZ_CYR_MARKERS.search(text):
        return "uz_cyr"
    if UZ_LATIN_MARKERS.search(text):
        return "uz"
    if RU_MARKERS.search(text):
        return "ru"
    if re.search(r"[a-z]", text, re.I):
        return "uz"  # latınca, biraq markerlersiz — kópdağy ózbek
    return "unk"
```

Bul ápiwayı evrensiy regex'lar bizdıń jaǵdayımızda 95%+ jaqsı sapa beredi.

**Rate limiting hám retry**. Server avtomatik túrde HTTP 429 qaytaradı eger soraw kóp bolsa. Bizdıń platformada exponential backoff: birinshi 429'da 12 sek kútiw, ekinshide 24, úshinshide 36. Sonıń menen birge «vejlivlik» pauzaları: hár tovar arasında 4 sek, hár sahifa arasında 1 sek — bot anıqlawǵa kórsetiwni keskeshtiriw.

**Batch inference**. Sentiment-modeli batch'larda processing qıladı. CPU'da batch_size=32 — eń óshim, GPU'da 64-128. Bizdıń platformada CPU-only inference: ~30-50 review/sekund, 4000 review pipeline ~2-3 minut.

**Sentence-level ABSA**. Aspekt-tiykarındaǵı analiz Transformers batch inference'i menen ámelge asırıladı. Hár review sentence'larǵa bóleklenip, hár sentence ushın aspekt'lerі izlenedi:

```python
def analyze_review_aspects(text: str, aspects_keywords: dict, analyzer) -> list:
    sentences = split_sentences(text)
    candidates = []
    for sent in sentences:
        for aspect_name, keywords in aspects_keywords.items():
            kw = find_aspect_in_sentence(sent, keywords)
            if kw:
                candidates.append((sent, aspect_name, kw))
    if not candidates:
        return []
    sents = [c[0] for c in candidates]
    preds = analyzer.predict_batch(sents)
    # ... maximum score per aspect
```

**Texnologiyalar diziminí**. Tórtinshi ózgeshelik — bizdıń platformada paydalanılatuǵın texnologiyalar diziminі (`2-keste`):

| Komponent | Texnologiya | Versiya | Maqseti |
|---|---|---|---|
| Backend | Python | 3.12 | Til |
| Backend | Django | 5.1 | Web freymvork |
| Backend | DRF | 3.15 | REST API |
| Backend | PostgreSQL | 16 | Maǵlıwmatlar bazası |
| Frontend | Next.js | 16 | Web freymvork |
| Frontend | TypeScript | 5.9 | Til |
| Frontend | Tailwind | 4 | Stillar |
| Frontend | Recharts | 3 | Grafiklar |
| Parser | httpx | 0.28 | Async HTTP |
| Parser | Playwright | 1.49 | Browser automation |
| ML | HuggingFace Transformers | 4.46 | NLP modeller |
| ML | PyTorch | 2.5 | Deep learning |
| ML | sentencepiece | 0.2 | Tokenization |

**Hujjet hám test**. Hár komponent ushın klassikalıq jaqtan dáslepki test'ler bar. Parser ushın smoke-test, model ushın baseline accuracy'tıń óshlemi, ABSA ushın keyword-tiykarındaǵı teñistiriw. CI/CD piplene'da har commit'qa avtomatik test'ler ámeliy ámelge asırıladı.

Solay etip, klient pikirlerin avtomatik jıynaw hám sentimental analiz qılıw — bizdıń platformanıń orta noqatlarınıń biri. httpx + Playwright kombinatsiyası anti-bot proteksiyani aylanıp ótwedı, GraphQL Feedbacks query — klient pikirlerini tólıq ámeliy túrde tortıp atır, HuggingFace Transformers — multilingual sentiment analiz qılatuǵın model'i menen jumıs qılatıp atır. Bul kompleks zamanagóy NLP'tıń ámeliy ámelge asırıw stilinda jaqsı kórsetkish bolıp tabıladı. Keyingi bapta biz bul texnologiyalar tiykarında ámelge asırılǵan ámeliy nátiyjelerge ótemiz: maǵlıwmatlar bazası, parser, ABSA, Demand Score hám dashboardı tolıq sıpatlamız.
