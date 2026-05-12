---
title: 3.3. Dashboard hám sınaq nátiyjeleri (ru/uz salıstırıwı)
chapter: 3
section: 3
pages: 8-9
---

## 3.3. Dashboard hám sınaq nátiyjeleri

Bul bólekte bizdıń platformanıń paydalanıwshılıq interfeysi — interaktiv web-dashboardı tolıq sıpatlanadı, hám platforma ámeliy sınaqtan ótkerılıp baqılanǵan ámeliy nátiyjeler keltiriledi. Sınaq nátiyjeleri rus hám ózbek tilleri arasındaǵı modeldıń sapasın salıstırıp ańlatadı, hám bizdıń platformanıń ámeliy biznes-shártlerine sáykes ekenligin tasdıqlaydı.

**Dashboard'tıń arxitekturawiy**. Bizdıń platforma tórt sahifaǵa iye: `/` (landing), `/dashboard`, `/products`, `/products/{id}`. Hár sahifa Server Components arqalı amelge asırılıp atır (Next.js 16 App Router).

**Dashboard sahifası**. Eń áhmiyetli sahifa, tórt bólekten turadı:

*1. KPI kartochkası*: sentiment esaplanǵan tovar sanı (121), orta Demand Score (32.6), joqarı talab (≥50, 21 ta), tómen talab (<25, 40 ta).

*2. Kategoriya boyınsha demand*. Horizontal bar diagrammasi, hár kategoriya orta Demand Score'qa proporcional. Top-12 kategoriya kórsetiledi.

`3-súwret. Kategoriya boyınsha Demand Score`

| Kategoriya | Tovar | Pikir | Avg Demand |
|---|---|---|---|
| Sovorodalar | 20 | 1126 | 48.4 |
| Naborlar (oshxana qurallar) | 5 | 243 | 46.7 |
| Dezodorantlar (oyak ushın) | 3 | 189 | 45.6 |
| Ho'l salfetkalar | 2 | 32 | 43.6 |
| Qazandar, jarovniyalar | 5 | 286 | 42.9 |
| Kastryul, kovshlar | 13 | 658 | 42.8 |
| Qollar ushın kremler | 3 | 40 | 40.3 |
| Erlar ushın dezodorantlar | 1 | 20 | 39.9 |

*3. Modeldıń sapası til boyınsha*. Tablitsa, qaysı bizdıń jumıstıń orta noqatlarınıń biri:

`6-keste. Modeldıń sapası til boyınsha`

| Til | Pikir sanı | Sapa (uyǵınlıq) | + pos | ≈ neu | − neg |
|---|---|---|---|---|---|
| Rus tili | 1807 | **58.8%** 🟡 | 1012 | 455 | 340 |
| Ózbek tili (latınca) | 1519 | **18.4%** 🔴 | 235 | 935 | 349 |
| Belgisiz (emoji) | 140 | 0.7% | 0 | 140 | 0 |
| Ózbek tili (kirilcha) | 49 | **10.2%** 🔴 | 3 | 31 | 15 |
| Qaraqalpaq | 1 | 0% | 0 | 0 | 1 |

«Sapa» ústıdaǵı — modeldıń metkasi hám rating star arasındaǵı uyǵınlıq:
— 4-5★ → positive
— 3★ → neutral
— 1-2★ → negative

Eger model 4★ pikirin «positive» dep belgilesa — uyǵınlıq. Aksinshe — gap.

Solay etip, rus tilinde modeldıń jaqsı jumıs qılatuǵın bolsa (58.8% accuracy), ózbek tilinde — yang gap úlken: 4 ese tómen.

*4. Top-10 hám anti-top*. Eki tablitsa: top-10 joqarı talab hám tómen talab tovarlardiń 10'ı. Hár qatorda — tovar atı, Demand Score, NSS, Popularity, Pikir sanı, bottleneck aspekt (anti-topta gana).

Real maǵlıwmatlar (top-3 joqarı talab):

| # | Tovar | Demand | NSS | Pikir |
|---|---|---|---|---|
| 1 | Sovoroda Kukmara Trendy Style | 65.7 | 0.50 | 78 |
| 2 | Sovoroda blinnaya AP «Mystery» | 62.5 | 0.45 | 77 |
| 3 | Kastryul Sofia | 56.8 | 0.52 | 42 |

Anti-top (3 tómen talab):

| # | Tovar | Demand | NSS | Bottleneck |
|---|---|---|---|---|
| 1 | Shampun «Sila Prirody» Bielita | 11.8 | -0.85 | Sapa |
| 2 | Maska Bielita Magiya Marokko | 12.4 | -0.70 | Sapa |
| 3 | Kremovaya pasta Teymurova | 13.5 | -0.42 | Sapa |

**Tovarlar sahifası**. URL `/products` — filtrleri menen listing: search (atı boyınsha), category (38 kategoriya dropdown), sort (pikir sanı/rating/sańa). Hár tovar — kart kórinisinde. URL parametr'lar arqalı filtrler: `/products?category=5&ordering=-reviews_count`.

**Tovar detali sahifası** (`/products/{id}`). Eń batafsil sahifa. Yuqarıda — tovar metadata (atı, kategoriya, star rating, link uzum.uz'qa). Soń **Demand Score badge** — kompozit kartochka: bayraq (Joqarı/Orta/Tómen talab), Demand Score úlken cifr, tórt kishirek kórsetkish (NSS, Popularity, Aspect Penalty, Bottleneck). Mısal: Pulemkasi Bielita 250 ml — Demand 24.5, «Tómen talab», NSS 0.00, Popularity 0.54, Penalty ×0.91, Bottleneck «Sapa». **Sentiment Donut** Recharts arqalı (pos/neu/neg). **Aspekt'ler** — progress bar'lar hár aspekt ushın. **«Ne uchun maqtaydı / Ne uchun shaǵımladı»** — top-3 pozitiv/negativ aspekt-mention'lar blockquote ishinde klient snippet'leri menen. Mısal: «Sapa [0.97]: Tovar zo'r, pul behikrkesir»; «Yetkazıb berıw [0.87]: Yetkazıb berıw kechikti, idishlar sındı keldi». **Eń so'nggi pikirler** — lenta kórinisinde: til badge, star rating, sentiment label, klient atı, sańa, tekst.

**Use Cases**. *UC6 — Vendor shaǵımlardı kórtek*: vendor `/products/170` sahifasına keladi, Demand 24.5 hám bottleneck «Sapa» kórinedi; «Ne uchun shaǵımladı» bóleginde top-3 negativ snippet'ler kórsetiledi. Vendor 30 sekunda klientlerdıń tikkeley shaǵımların oqıydı. *UC7 — Ózbek til sheklenelikleri*: administrator dashboard'tıń sapası tablitsasıń kórip, rus 58.8% vs ózbek 18.4% kórsetilgenıne kóre, fine-tune ózbek korpusında zarurlıǵı tasdıqlanadı.

**Sınaq nátiyjeleri — performance metric'ler**. Bizdıń platformanıń ámeliy performance kórsetkishlerі:

`7-keste. Platforma performance`

| Komponent | Operatsiya | Vaqıt |
|---|---|---|
| Backend API | GET /api/products/ (190 tovar) | 45 ms |
| Backend API | GET /api/analysis/demand-index/ | 580 ms |
| Backend API | GET /api/analysis/products/{id}/summary/ | 78 ms |
| Backend API | GET /api/analysis/model-quality/ | 320 ms |
| Frontend | Dashboard sahifası first load | 1.2 sek |
| Frontend | Tovar detali sahifası first load | 0.8 sek |
| Parser | scrape_uzum (httpx) — 1000 tovar | 8 minut |
| Parser | scrape_uzum_full (Playwright) — 50 tovar × 100 pikir | 25 minut |
| ML | run_sentiment — 4081 pikir | 5 minut |
| ML | run_absa --reanalyze — 3516 pikir | 8 minut |

Bu kórsetkishler ámeliy biznes ushın jaqsı: dashboard tutıq 1-2 sekundta yuklanıp atır, parser orta jaqtan 30-60 minut'qa orta dárejedegi maǵlıwmatlardı tutıq jıynaytuǵın.

**Sınaq nátiyjeleri — model sapası**. Klassikalıq jaqtan modeldıń sapası uchun bir neshe kórsetkish:

*Tutıq accuracy (sapa-rating uyǵınlıǵı)*. Yuqarıda 6-keste'da kórsetildi: rus tili 58.8%, ózbek tili 18.4%.

*Confusion matrix*. 5★ pikirler model nima dep belgileytuǵını:

| Til | 5★ → positive | 5★ → neutral | 5★ → negative |
|---|---|---|---|
| Rus tili | 64% | 21% | 16% |
| Ózbek tili (latınca) | 14% | 65% | 21% |

Tılı: ózbek tilinde 5★ pikirleriniń 65% «neutral» dep belgilengen. Yáni model túsinmegen — pikir tutıq pozitiv yamasa neytral. Bul jaqtaǵı «neutralization bias» — multilingual modellerdıń klassikalıq problemasi.

*Modeldıń tilden tilge óziniń-anıqlawı*. Bizdıń korpustaǵı pikirlerdiń úlken kópshiligi (3500+) modeldıń ózi qaytaratuǵın metkalardı tárep'ke saqladıq. Hár metkanıń statistikası:

| Metka | Sanı | Úles |
|---|---|---|
| Neutral | 1561 | 44.4% |
| Positive | 1250 | 35.6% |
| Negative | 705 | 20.1% |

Ózbek tilindegi korpustıń ózi gana (1568 pikir) qaratılǵanda — neytral metkasınıń úlesí 64.7%. Bul ózbek tilindegi modeldıń bias'i — pikirleriniń kópshiligin neytral dep belgileydi.

**Háqıyqıy mısallar — model qátegilerі**. «tavsiya qilaman, effekti zor bilindi» — 5★ pikir, tutıq pozitiv, model qoyǵanı **negative** ❌. «judayam zoʻr sifatiga gap yuq» — 5★, pozitiv, model **negative** ❌. «mahsulot juda yaxshi» — 5★, model **neutral** ❌. «super» — 5★, model **positive** ✅. Sebep — model pozitiv ózbek sózlerin (`zo'r`, `tavsiya qilaman`, `juda yaxshi`) túsinmegen, tek inglizche `super` tárbiyalew korpusında bar.

**Modeldıń ámeliy biznes-paydalanıwı uchın ima'nat**. `tabularisai/multilingual-sentiment-analysis` modeli ózbek tili boyınsha ámeliy biznes paydalanıwı ushın jeterli sapa bermaytuǵın. Sheshim — fine-tune (~500 yamuq pikir korpusında) yamasa basqa model (`tahrirchi/UzBERT`) yamasa hybrid podxod. Bizdiń jumıs bul boshıqtı sanlı tasdıqladı.

**Demand Score'tıń validatsiyası**. Bizdıń kompozit Demand Score formulası tovardıń ámeliy talab kórsetkishi sıpatında qollanılǵan paytda — onıń validnostı qanday tasdıqlanadı? Klassikalıq jaqtan sotuw kólemleri menen Demand Score arasındaǵı korrelyaciya tasdıqlaydı.

Biraq bizdıń jumısda satılıw kólemi maǵlıwmatları joq (uzum.uz API'sı bunday maǵlıwmatlardı bermaydı). Sonıń ushın biz `ordersAmount` field'ı arqalı kishirek kórsetkish qollanamiz: Uzum.uz'tıń ózi-belgileytuǵın «zayavqa qabıllanǵan sanı». Bul satılıw emes, biraq satılıw'ka jaqın.

Bizdıń korpustaǵı 121 tovar boyınsha esaplaw:

— Demand Score hám orders sanı arasındaǵı Spearman korrelyaciyası: **0.62** (medium-strong).
— Demand Score hám pikirler sanı arasındaǵı korrelyaciya: **0.78** (strong, popularity faktorınan).
— Demand Score hám klassikalıq star rating arasındaǵı korrelyaciya: **0.31** (weak).

Bul kórsetkishler tasdıqlaytuǵın faktorlar:

— Demand Score satılıw'qa orta-strong korrelyaciya: tovardıń ámeliy talabın bahalawda paydalı.
— Demand Score klassikalıq star rating'tan ózge — tovardıń tutıq sanasın bermaydı, balki klient hıslemán'tan turadı.
— Demand Score popularity'qa kúshli korrelyaciya: bul faktordıń atalmıshı ámeliy ámelge asırıladı (sebebi popularity formulada óz aldına bólek).

**Texnik ózgesheliklerdiń ámeliy ámelge asırıwı**. Bizdıń platformada bir neshe ózgeshelik: PostgreSQL connection pooling (`CONN_MAX_AGE`), Next.js cache (yamasa `cache: "no-store"`), DRF throttling (anonim 100 req/min), Sentry error tracking, GitHub Actions CI/CD, Docker Compose deployment (Gunicorn + Nginx). VPS talaplar — minimum 2 GB RAM, 1 CPU core, 20 GB disk. Tutıq cycle (parser → BD → ML → dashboard) 1 saat içinde 1000 tovar/4000 pikir ushın ámeliy ámelge asıriladı.

**Ámeliy biznes mánisi hám tasdıqlawı**. Bizdıń platformanı ámeliy biznes-shártlerine sınap qaragan paytında, klassikalıq biznes-paydalanıw senariyları:

— *Marketpleys áliminen*. Top-10 anti-top dashboardı arqalı eń problemali tovarlardı tabıladı, vendor menen jumıs qılınadı.

— *Vendor*. Kategoryası boyınsha demand kórsetkishi tárepinen ámeliy taldaw qılınadı: bottleneck qaysı aspekt boyınsha — vendor'ǵa aniq «harakat punkti» beriledi.

— *Klient*. Tovardıń klassikalıq star rating'i 4.9 bolsa da, demand 25 bolıwı múmkin — bul klient'ke «pochemu» degen sorawga juwap beredı («yetkazıb berıw áste», «sapa kishi»).

Solay etip, bizdiń platforma ámeliy biznes-shártlerine sáykes ekenligi tasdıqlandı. Dashboard interaktiv, performance jaqtan jaqsı, sınaq nátiyjeleri ámeliy paydalanıw imkaniyatın beredı.

Bizdıń jumıstıń úshinshi bapı bul jerde tugaydı. Keyingi bólek Juwmaqlaw bolıp tabıladı, qaysında tutıq nátiyjeler hám keleshektegi izertlew baǵdarları belgilenedi.
