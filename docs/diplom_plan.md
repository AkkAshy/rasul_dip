# BITIRÍW MALAKA JUMÍSÍNIŃ JOSPARÍ

> **Tema:** Klient pikirlerine tiykarlanıp sentimental analiz argalı ónim talabın anıglaw
> **Orınlaǵan:** [Aty-jónıń]
> **Ilimiy basshı:** [Aty-jónıń]
> **Nókis — 2026**

Aširepov diplomınıń strukturasına tıyanıp jasalǵan: 3 bap × 3 bólim, ~60–70 bet, ~30 ádebiyat dáreklerı.

---

## Strukturası

| # | Bólim | Tákmin bet sanı | Manbalar bizde |
|---|---|---|---|
| 0 | Titul beti | 1 | ✅ shabloн bar |
| 1 | MAZMUNÍ | 1 | ✅ avtomatlı |
| 2 | KIRISIW | 6–8 | ✅ tezisler tayar |
| 3 | I BAP — Teoriyalıq tiykarlar | 18–22 | ✅ negiz bar |
| 4 | II BAP — Texnologiyalar | 14–18 | ✅ tolıq |
| 5 | III BAP — Ámelge asırıw | 18–22 | ✅ data bar |
| 6 | JUWMAQLAW | 3–4 | ✅ tezisler tayar |
| 7 | PAYDALANÍLǴAN ÁDEBIYATLAR DIZIMI | 3 | 30 dárek |

---

## 0. TITUL BETI

```
ÓZBEKSTAN RESPUBLIKASÍ
JOQARÍ TÁLIM, ILIM HÁM INNOVACIYALAR MINISTRLIGI
NÓKIS MILLIY TEXNOLOGIYALAR UNIVERSITETI

«JASALMA INTELLEKT» FAKULTETI
«PROGRAMMALÍQ INJINERIYA» BAǴDARÍ

BITIRÍW MALAKA JUMÍSÍ

Tema: Klient pikirlerine tiykarlanıp sentimental analiz argalı ónim talabın anıglaw

                                            Orınlaǵan: [familiya, atı]
                                            Ilimiy basshı: [iliem dárejesı, familiya]

Nókis — 2026
```

---

## 1. MAZMUNÍ (Содержание)

```
KIRISIW ............................................................. 4
I BAP. SENTIMENTAL ANALIZ HÁM ÓNIM TALABÍ — TEORIYALÍQ TIYKARLAR ..... 8
   1.1. Sentimental analiz: tariyx, usıllar hám zamanagóy modeller ... 8
   1.2. Marketpleyslerde ónim talabın anıqlaw máseleleri ............ 14
   1.3. Ózbekstan elektron sawda bazarınıń taldawı .................. 20
II BAP. PLATFORMANÍ JARATÍWDA QOLLANÍLATUǴÍN TEXNOLOGIYALAR ........ 26
   2.1. Backend: Django REST Framework hám PostgreSQL ............... 26
   2.2. Frontend: Next.js, TypeScript hám Recharts .................. 32
   2.3. Maǵlıwmat jıynaw hám NLP: Playwright, GraphQL, Transformers . 38
III BAP. PLATFORMANÍ ISLEP SHÍǴÍW HÁM SINAQTAN ÓTKERİW ............. 44
   3.1. Maǵlıwmatlar bazası, parser hám sentimental analiz pipeline . 44
   3.2. Aspekt-tiykarındaǵı analiz (ABSA) hám Demand Score formulası  50
   3.3. Dashboard hám sınaq nátiyjeleri (ru/uz salıstırıwı) ......... 56
JUWMAQLAW .......................................................... 62
PAYDALANÍLǴAN ÁDEBIYATLAR DIZIMI ................................... 65
```

---

## 2. KIRISIW (Введение, 6–8 bet)

### Aktualligi
- Dúnya elektron sawda bazarı 2024-jıldan baslap $6.3 trln (Statista). Marketplace'lerde ónim sayılawında klient pikirlerinıń orny barǵan sayın artıp barmaqta.
- Klassikalıq star-rating-ge ǵana tıyanıw qıyın: kóplegen klient 5★ qoyıp tekstte shaǵımdı jazadı («tovar yaxshi, lekin yetkazib berish sekin»).
- Ózbekstanda Uzum Market — eń úlken marketplace, ortasha 30+ million klient pikiri.
- Sentimental analiz arqalı ónim talabın bahalaw — bul rejewdiń ózi ámeliy hám ilimiy jaqtan áhmiyetli.

### Maqseti
Klient pikirlerin (uzum.uz) jıynaw, sentimental analiz qollap **composite Demand Score** esaplaytuǵın platforma jaratıw.

### Wazıypaları (8 dana)
1. Sentimental analiz hám demand prediction tarawında teoriyalıq sholıw.
2. Uzum.uz API'in retrievlew hám parser islep shıǵıw (REST + GraphQL).
3. 3000+ klient pikirin avtomatlı jıynaw, ru/uz tillerde.
4. Multilingual sentiment-modeli (XLM-RoBERTa) tiykarında baseline jaratıw.
5. Aspekt-tiykarındaǵı analiz (ABSA) usılın ámelge asırıw.
6. Composite Demand Score formulasın islep shıǵıw hám esaplaw.
7. Web-dashboard jaratıw (Django REST + Next.js).
8. Modeldıń ru hám uz tilleri arasındaǵı sapasın salıstırıw.

### Izertlew obyekti
Ózbekstan onlayn marketplace'lerinen jıynalǵan klient pikirlerinıń korpusı.

### Izertlew predmeti
Sentimental analiz hám ABSA usılları arqalı ónim talabın anıqlaw algoritmlerі.

### Izertlew usılları
- **Taldalaw:** ámeldegi MIS hám sentiment platformalarınıń sholıwı
- **Engineering:** Django REST API, Next.js dashboard
- **Web scraping:** httpx + Playwright (GraphQL)
- **Machine Learning:** HuggingFace Transformers, batch inference
- **Statistikalıq taldaw:** Cross-tabulation, Net Sentiment Score

### Ilimiy jańalıǵı
1. Birinshi márte Ózbekstandıń marketplace'inde collected uzbek-language reviewlar tiykarında baseline-modeldiń sapası ólshew (18.4%).
2. Composite Demand Score formulasınıń jergilikli sharayatına bayanı.
3. Multilingual model'larınıń uzbek tilinde shekleneliklerin sanlı kórsetiw.

### Ámeliy áhmiyetliligi
- Marketpleys iyeleri ushın ónim'ge talabtın bahalaw qurali.
- Vendor'lar ushın «ne zaty boyınsha shaǵım» — bottleneck'ti tabıw.
- Modeldı dáslepki keyingi fine-tune ushın baseline.

### Strukturası
- KIRISIW
- 3 BAP (teoriya, texnologiya, ámelge asırıw)
- JUWMAQLAW
- ÁDEBIYATLAR DIZIMI

---

## 3. I BAP. TEORIYALÍQ TIYKARLAR (18–22 bet)

### 1.1. Sentimental analiz: tariyx, usıllar hám zamanagóy modeller (~8 bet)

**Tezisler:**
- Sentimental analizdiń tariyxı: 1990-jıllar (Pang & Lee, 2002).
- 3-klasslı sxemalı (positive/neutral/negative) hám 5-klasslı.
- Lexicon-based usıllar (SentiWordNet, VADER) — afzallıq/kemshiligı.
- Machine learning usıllar: Naive Bayes, SVM, LogReg + TF-IDF.
- Deep learning: LSTM → Transformer → BERT (Devlin, 2018).
- Multilingual modeller: mBERT, XLM-R, XLM-RoBERTa.
- Aspect-Based Sentiment Analysis (ABSA) — SemEval 2014/2015/2016 sharaylarına uqtırıw.
- Bizdı qızıqtırıwshı modeller:
  - `tabularisai/multilingual-sentiment-analysis`
  - `cardiffnlp/twitter-xlm-roberta-base-sentiment`
  - `tahrirchi/UzBERT` (uzbek tili ushın)

**Bizdiń materiyallar:**
- Cross-tab '18.4% uz vs 58.8% ru'
- Pipeline diagrammı

### 1.2. Marketpleyslerde ónim talabın anıqlaw máseleleri (~7 bet)

**Tezisler:**
- Talabtı bahalawdıń klassikalıq usılları: zatlanǵan tovar sanı, qıymetler reytingi.
- Star rating'tiń kemshiligi: kóp 5-jıldız ózi sapasın anıqlamaydı.
- Net Sentiment Score (NSS) — McKinsey/HBR usılı.
- Customer Satisfaction Index (CSI).
- Composite metrics: popularity × satisfaction.
- Aspekt-tiykarındaǵı «bottleneck» — qaysı aspekt ónim talabın azaytıp atır.
- Bar bolǵan systems: Brandwatch, Sprinklr, Trustpilot Insights, Yandex DataLens.
- Bul tizimlerdiń bahası, jergilikli sharayatına sáykes emesligi.

**Bizdiń materiyallar:**
- Demand Score formulası: `popularity × satisfaction × aspect_penalty × 100`
- Kategoriya boyınsha demand'tıń salıstırılıwı (38 kategoriya)

### 1.3. Ózbekstan elektron sawda bazarınıń taldawı (~6 bet)

**Tezisler:**
- Ózbekstan e-com bazarınıń statistikası (Statista 2024).
- Tiykarǵı oyınshılar: Uzum (#1), Asaxiy, Texnomart, OLX.
- Uzum Market — sanlar, klient sanı, monthly turnover.
- Tovar kategoriyaları, tiykarǵı brendler (Kukmara, Bielita, Lamart, Dry Dry).
- Uzbek til ortasındaǵı klient pikirlerinıń xarakteristikası: short, emoji-heavy, mix uz/ru.
- Yandex SmartCaptcha — bot-proteksiya.
- Internal API hám GraphQL endpoint'leri.

**Bizdiń materiyallar:**
- 190 tovar, 38 kategoriya, ~3500 klient pikir
- Til boyınsha taldaw (60% ru, 36% uz, 4% basqa)

---

## 4. II BAP. TEXNOLOGIYALAR HÁM QURALLAR (14–18 bet)

### 2.1. Backend: Django REST Framework hám PostgreSQL (~6 bet)

**Tezisler:**
- Python tilі — sebebi (NLP/AI ushın eń kóp libraries).
- Django freymvorki — MTV arxitekturawiy, ORM.
- Django REST Framework (DRF) — ViewSet, Serializer, Router.
- API endpoint'lerdiń RESTful principle.
- PostgreSQL — relational, JSONField, indekstaw.
- Maǵlıwmatlar bazasınıń normallastırılıwı.
- Migrations workflow.

**Listingler:**
- `Product` modeli (kod fragmenti)
- `Review` modeli `JSONField`
- `SentimentResult`, `Aspect`, `AspectMention` schemas

**Tablitsalar:**
- `1-keste`. API endpointleri (paydalı route'lar dizimi)

### 2.2. Frontend: Next.js, TypeScript hám Recharts (~5 bet)

**Tezisler:**
- React → Next.js: SSR, App Router.
- TypeScript: type safety.
- Tailwind CSS v4 — utility-first.
- Recharts — graphical visualizatsiya.
- Server Components vs Client Components.
- Page structure: Dashboard, Products, Product detail.

**Listingler:**
- `DemandBadge` component
- `SentimentDonut` component (recharts)

### 2.3. Maǵlıwmat jıynaw hám NLP: Playwright, GraphQL, Transformers (~5 bet)

**Tezisler:**
- Web scraping: HTTP-based vs browser-based.
- httpx — async HTTP client.
- Playwright — chromium automation.
- Yandex SmartCaptcha-tı aylanıp ótiw.
- GraphQL Feedbacks query, JWT authentication.
- HuggingFace Transformers, model selection.
- Batch inference, lazy loading.

**Listingler:**
- `UzumClient` async snippet
- `UzumBrowserClient` GraphQL fetch
- `SentimentAnalyzer` singleton

**Tablitsalar:**
- `2-keste`. Uzum API endpoint'leri (REST + GraphQL)

---

## 5. III BAP. PLATFORMANÍ ISLEP SHÍǴÍW HÁM SINAQTAN ÓTKERİW (18–22 bet)

### 3.1. Maǵlıwmatlar bazası, parser hám sentimental analiz pipeline (~7 bet)

**Tezisler:**
- ER diagrammı (Category → Product → Review → SentimentResult).
- Parser arxitekturası: 2 mod (REST topFeedback + Playwright full).
- Rate-limit, retry on 429, JWT cookie extraction.
- Bulk-sbor: 190 tovar, 5000 review (potential).
- `run_sentiment` management command, batch=32.
- Til detection эвристikası: regex-based.

**Tablitsalar:**
- `3-keste`. Sentiment label'larınıń distribuciyası.

**Súwretler:**
- `1-súwret`. ER-diagramma BD'da.
- `2-súwret`. Parser pipeline.

**Use Case'ler:**
- UC1: «Avtomatik tovar metadata'sın jıynaw»
- UC2: «Klient pikirlerin bulk'tıń sintaks»

### 3.2. Aspekt-tiykarındaǵı analiz (ABSA) hám Demand Score formulası (~7 bet)

**Tezisler:**
- ABSA negizi: aspect extraction + sentiment per aspect.
- Bizdiń podxod: keyword-based + sentence-level sentiment.
- 4 aspekt: Yetkazıb berıw, Baha, Sapa, Qadoq.
- Tashabbus tezisi: `aspect_penalty = 1 − 0.15·max(neg_share)`.
- Composite Demand Score: `popularity × satisfaction × aspect_penalty × 100`.
- Customer Satisfaction Index (CSI): `(1·pos + 0.5·neu + 0·neg) / total`.
- Logaritmiq normallastırıw: `popularity = log10(reviews+1) / log10(101)`.
- Threshold'lar: ≥50 — joqarı talab, 25–50 — orta, <25 — tómen talab.

**Tablitsalar:**
- `4-keste`. Aspekt'ler boyınsha mention statistikası.
- `5-keste`. Demand Score formulasınıń bólekleri.

**Súwretler:**
- `3-súwret`. Demand Score formulasy diagrammı.

### 3.3. Dashboard hám sınaq nátiyjeleri (~7 bet)

**Tezisler:**
- Dashboard sahifası: KPI carlаr, kategoriya boyınsha demand, model quality.
- Top-10 joqarı talab + anti-top.
- Tovar sahifası: praise/complaints + last reviews.
- Filter'ler: kategoriya boyınsha, sort by reviews.
- Modeldıń sapasın bahalaw: ru = 58.8%, uz_lat = 18.4%, uz_cyr = 10.2%.
- 4 kese — modeldiń uzbekti túsinmegen sózleri (`zo'r`, `tavsiya qilaman`, etc.).
- Use Case'ler.

**Tablitsalar:**
- `6-keste`. Modeldıń ru/uz salıstırılıwı.
- `7-keste`. Top-10 demand score (real data).

**Súwretler:**
- `4-súwret`. Dashboard screenshot — bas bet.
- `5-súwret`. Tovar sahifası screenshot.
- `6-súwret`. Demand by category bar.

**Use Case'ler:**
- UC3: «Marketpleys ádminI bottleneck'ti tabıw»

---

## 6. JUWMAQLAW (3–4 bet)

**Tezisler:**
1. Bul jumısda «Klient pikirlerine tiykarlanıp sentimental analiz argalı ónim talabın anıglaw» tema'si boyınsha tolıq platforma jaratıldı.
2. Birinshi bapta sentimental analizdiń teoriyalıq tiykarları úyrenildi, ABSA hám Demand Score'tıń mánisi bayanlandı.
3. Ekinshi bapta texnologiyalar — Django REST + Next.js + Playwright + HuggingFace — sipatlandı.
4. Úshinshi bapta 190 tovar boyınsha 3500+ klient pikir jıynaldı, sentiment hám ABSA esaplandı.
5. Modeldıń ru/uz salıstırıwında **58.8% vs 18.4%** — multilingual modeldıń uzbek tilin túsinmegenligi sanlı kórsetildi.
6. Dashboard ámeliy ámeldagi qollanıw ushın tayar.
7. Keleshekte: fine-tune XLM-RoBERTa, ABSA-tı sentence-transformer'lar arqalı, Asaxiy/Texnomart parser'leri qosıw.

**Texnik nátiyjeler:**
- 4 Django app
- 8 management command (scrape, sentiment, ABSA, kategoriya)
- 11 API endpoint
- 4 frontend sahifa
- 7 frontend kompoenetleri
- 3500+ review, 1829 ABSA-mention

---

## 7. PAYDALANÍLǴAN ÁDEBIYATLAR DIZIMI (~30 dárek)

### Mámleket dárejesindegi normativ-huqıqıy aktlar
1. Ózbekstan Respublikası Prezidentiniń «Raqamlı Ózbekstan-2030» strategiyası, 2020-jıl.
2. Ózbekstan Respublikası Prezidentiniń «Sun'iy intellekt rawajlanıwı» PP-4996, 2021-jıl.

### Xalıqarawlıq izertlewler
3. Pang B., Lee L. Opinion Mining and Sentiment Analysis. — Foundations and Trends, 2008.
4. Devlin J. et al. BERT: Pre-training of Deep Bidirectional Transformers. — NAACL, 2019.
5. Conneau A. et al. Unsupervised Cross-lingual Representation Learning at Scale (XLM-R). — ACL, 2020.
6. Pontiki M. et al. SemEval-2016 Task 5: Aspect Based Sentiment Analysis. — 2016.
7. Liu B. Sentiment Analysis: Mining Opinions, Sentiments, Emotions. — Cambridge, 2015.
8. Reichheld F.F. The One Number You Need to Grow (NPS). — HBR, 2003.
9. McKinsey Digital. AI in Consumer Markets. — 2024.
10. Statista. E-Commerce in Uzbekistan: Market Forecast. — 2024.

### Texnologiyalar dokumentaciyası
11. Django Software Foundation. Django Documentation. — https://docs.djangoproject.com/, 2024.
12. Django REST Framework. — https://www.django-rest-framework.org/, 2024.
13. Next.js Documentation. — https://nextjs.org/docs, 2024.
14. TypeScript Documentation. — https://www.typescriptlang.org/docs/, 2024.
15. PostgreSQL Documentation. — https://www.postgresql.org/docs/, 2024.
16. HuggingFace Transformers. — https://huggingface.co/docs/transformers, 2024.
17. Playwright Documentation. — https://playwright.dev/, 2024.
18. Tailwind CSS. — https://tailwindcss.com/docs, 2024.
19. Recharts Documentation. — https://recharts.org/, 2024.

### Modeller hám datasets
20. Tabularisai. Multilingual Sentiment Analysis Model. — https://huggingface.co/tabularisai/multilingual-sentiment-analysis, 2024.
21. CardiffNLP. Twitter XLM-RoBERTa Sentiment. — https://huggingface.co/cardiffnlp/twitter-xlm-roberta-base-sentiment, 2024.
22. Tahrirchi. UzBERT for Uzbek Language. — https://huggingface.co/tahrirchi/, 2024.

### Software Engineering hám arxitektura
23. Fielding R.T. Architectural Styles and the Design of Network-based Software Architectures. — PhD Dissertation, UC Irvine, 2000.
24. Martin R.C. Clean Architecture. — Prentice Hall, 2017.
25. Kleppmann M. Designing Data-Intensive Applications. — O'Reilly, 2017.

### Ózbek hám rus tilindegi qollap-quwatlawshı materiyallar
26. Karimov R.A. Sun'iy intellekt asoslari. — Toshkent: Fan, 2022.
27. Aminov S.T. Web texnologiyalar va mobil ilovalar. — Toshkent: Universitet, 2023.

### Web hám marketplace izertlewler
28. Grand View Research. Sentiment Analytics Market Size. — 2024.
29. Forrester Research. Customer Insights Platforms Market. — 2024.
30. Uzum Market. Annual Report. — 2024.

---

## Plan boyınsha jumıs grafigi (taklif)

| Hápte | Jumıs | Bólim |
|---|---|---|
| 1 | Titul + KIRISIW | 0–2 |
| 2 | I BAP — barlıq 3 bólim | 3 |
| 3 | II BAP — barlıq 3 bólim | 4 |
| 4 | III BAP 3.1 + 3.2 | 5 |
| 5 | III BAP 3.3 + JUWMAQLAW + ÁDEBIYATLAR | 5–7 |
| 6 | Súwretler, tablitsalar, formatting | All |
| 7 | Korrektura, redaktor sholıw | All |

---

## Bizde tayar bolǵan materiyallar

✅ 3500+ real klient pikiri  
✅ Sentiment results (4081 review)  
✅ 1829 ABSA mentions  
✅ Demand Score formulası hám 121 tovar boyınsha esaplanǵan  
✅ Dashboard screenshots  
✅ Backend kod listingleri (Django models, views, services)  
✅ Frontend kod listingleri (React components)  
✅ Parser kod listingleri (UzumClient, UzumBrowserClient)  
✅ Cross-tab analizı (ru/uz)  
✅ ER-diagrammasi maǵlıwmatlar bazasının  
✅ API endpoint dizimı  
✅ docs/uzum-api-research.md hám docs/methodology.md
