---
title: 3.2. Aspekt-tiykarındaǵı analiz (ABSA) hám Demand Score formulası
chapter: 3
section: 2
pages: 8-9
---

## 3.2. Aspekt-tiykarındaǵı analiz (ABSA) hám Demand Score formulası

Bul bólekte bizdıń platformanıń eki orta komponentı — Aspect-Based Sentiment Analysis (ABSA) hám composite Demand Score'tıń ámeliy ámelge asırıwın tolıq sıpatlaymız. Bul eki komponent klassikalıq sentiment-analizdı tovardıń konkret aspekt'leri boyınsha bahalaw imkaniyatına aylantıradı, hám tovardıń tutıq talabın bahalaytuǵın kompozit kórsetkishke jıynaydı.

**ABSA-tıń ámeliy strategiyasi**. Klassikalıq ABSA usılları (Pontiki et al., SemEval 2014/2015/2016) eki etaptan turadı: Aspect Term Extraction (ATE) hám Aspect Sentiment Classification (ASC). Bizdıń platformada bul eki etap birlestirilgen: keyword-based extraction + sentence-level sentiment.

Bul keńeyt usıl deep learning ABSA'ǵa qaraǵanda az aniqraq (~70-80% F1 vs 85-90%), biraq eki úlken artıqmashılıqqa iye: birinshiden, training datası kerek emes (SemEval'tıń test datalary ózbek tilinde joq); ekinshiden, interpretatibel — qaysı keyword'tan qaysı aspekt anıqlanǵanı kórinedi.

**Aspekt'lerdi tańlaw**. Bizdıń platformada 4 aspekt: Yetkazıb berıw (logistika), Baha (ekonomika), Sapa (tovar parametrleri), Qadoq (upakovka). Brandwatch'tıń 2023-jıl raportına kóre, e-commerce sektorındaǵı klient pikirlerinin 78% bul tórt aspekt'ten birewine tegisli. 4 aspekt — interpretatibel hám kompakt; kóplegen aspekt qosılǵanda dashboard'tıń vizualizatsiyası qıyın bolıp ketedi.

Hár aspekt ushın keyword-tamır'lardıń tólıq dizimi bizdıń platformanıń `aspects_seed.py` faylında bayanlanǵan:

```python
ASPECTS_SEED = {
    "Yetkazıb berıw": [
        # rus
        "достав", "привез", "привёз", "курьер", "опазд", "опозд",
        "быстро при", "пришл", "посылк", "отправ", "ждал",
        # ózbek (latınca)
        "yetkaz", "kelish", "kuryer", "kechikt", "tez ", "olindi",
        # ózbek (kirilcha)
        "етказ", "келиш", "курьер", "кечикт",
    ],
    "Baha": [
        # rus
        "цен", "дорог", "дёшев", "дешев", "стоит", "стоимост",
        "за свои деньг", "недорог", "по карману",
        # ózbek
        "narx", "qimmat", "arzon", "puli",
        # ózbek (kirilcha)
        "нарх", "қиммат", "арзон",
    ],
    "Sapa": [
        # rus
        "качеств", "хорош", "отличн", "плох", "брак", "сломан",
        "разваливает", "крепк", "прочн", "надежн", "соответств", "хлам",
        # ózbek
        "sifat", "yaxshi", "yomon", "ajoyib", "zo'r", "zoʻr", "zor",
        "buz", "sin",
        # ózbek (kirilcha)
        "сифат", "яхши", "ёмон", "зўр", "ажойиб",
    ],
    "Qadoq": [
        # rus
        "упаков", "коробк", "пакет", "обёртк", "обертк", "пленк",
        "плёнк", "целл", "помят",
        # ózbek
        "qadoq", "qutich", "paket", "ʻrov",
        # ózbek (kirilcha)
        "қадоқ", "қутич", "пакет",
    ],
}
```

Hár aspekt ushın 16-26 keyword-tamır. Tamır'lar tólıq sózler emes — morfologiyalıq variatsiyaların ózi tutıp turadı (mısalı, «достав» tamırı «доставка», «доставкой», «доставлено» — barlıq formalardı tabıladı).

**Sentence splitting hám aspect detection**. Klient pikiri sentence'ce bóleklenedi tıyantanglat sıpatlama bóleklemshi arqalı (`.,!?;`, qatar bólegi). Hár sentence-da hár aspekt ushın keyword-search jasalanadı — eger keyword tabılǵan bolsa, bul candidate (sentence, aspect, keyword) saqlanadı. Eger bir aspekt birden kóp sentence'da kórsetilsa, eń kóp score'i bar sentence saylanadı.

**Sentence-level sentiment**. Tabılǵan sentence'lar batch retinde sentiment-modeline jiberiledi. Bul tútıq pikir ózgesheligi: pikir tutıq tári negativ bolıwı múmkin (mısalı, «yamon tovar»), biraq ishidegi sentence-da konkret aspekt boyınsha pozitiv kórsetkish bolıwı múmkin («tovar yaxshi keldi, faqat narxı qımmat»):

```python
def analyze_review_aspects(text, aspects_keywords, analyzer):
    sentences = split_sentences(text)
    candidates = []
    for sent in sentences:
        for aspect_name, keywords in aspects_keywords.items():
            kw = find_aspect_in_sentence(sent, keywords)
            if kw:
                candidates.append((sent, aspect_name, kw))

    if not candidates:
        return []

    sents_to_score = [c[0] for c in candidates]
    preds = analyzer.predict_batch(sents_to_score)

    best_per_aspect = {}
    for (sent, aspect, kw), pred in zip(candidates, preds):
        hit = AspectHit(aspect_name=aspect, sentence=sent,
                        label=pred.label, score=pred.score)
        existing = best_per_aspect.get(aspect)
        if existing is None or pred.score > existing.score:
            best_per_aspect[aspect] = hit

    return list(best_per_aspect.values())
```

`best_per_aspect` strategiyası: bir pikirde bir aspekt eń bárqarar tabıladı. Eger bir aspekt birden kóp sentence-da bolsa — eń tıyqarlanǵan (eń úlken score) saylanadı.

**ABSA performance hám nátiyjeleri**. Bizdıń korpusta (3500+ pikir):

`5-keste. ABSA aspekt-mention statistikası`

| Aspekt | + (positiv) | ≈ (neytral) | − (negativ) | Tutıq |
|---|---|---|---|---|
| Sapa | 593 | 587 | 298 | 1478 |
| Yetkazıb berıw | 87 | 56 | 25 | 168 |
| Baha | 35 | 67 | 31 | 133 |
| Qadoq | 34 | 12 | 4 | 50 |
| **Tutıq** | **749** | **722** | **358** | **1829** |

Solay etip, 3500+ pikir arasında 1829 aspekt-mention tabıldı. Bul yaqın hár ekinshi pikirinde kem dárejede aspekt'lerden birewi belgilenedi. Bul kórsetkish ABSA strategiyamızdıń saqaytuǵın bolıp atırǵanın tasdıqlaydı.

**Sapa aspekt'ı eń kóp**. Sapa — eń kóp ushırasıp atırǵan aspekt (1478 mention). Sebebi: «zo'r», «yaxshi», «yomon», «sifati» — bizdıń tamır'lar diziminde 26 keyword bar (eń kóp). Klient hıslemánin bahalaw birinshi gezekte sapa boyınsha jasaladı. Yetkazıb berıw (168), Baha (133), Qadoq (50) klient pikirinde siyrek aytıladı.

**Demand Score formulası**. Bizdıń platformanıń orta noqatlarınıń biri — composite Demand Score formulasi. Klassikalıq satılıw sanı yamasa rating'ǵa qaraǵanda bul kórsetkish kompleksligi tovar talabın anıqlaydı.

**Formula**:

```
Demand = popularity × satisfaction × aspect_penalty × 100
```

Hár komponentı bólek-bólek qaraylaıq:

*1. Popularity (popularnost)*. Tovardıń jıynalǵan klient pikirleriniń sanı. Logaritmik shkalada normallashtırıladı:

```
popularity = log10(reviews_analyzed + 1) / log10(POPULARITY_CEILING + 1)
```

`POPULARITY_CEILING = 100` — 100 yamasa kóp pikir bar tovarlar — popularity = 1.0. Bul shkala ámeliy biznes-tarawında: 100+ pikir bar tovar — popular, az pikirli — emes.

Logaritm — sebebi sotuw kólemleri lineyno emes. 10 pikirden 100 pikirinen ósıw — kop kishirek atılım, biraq 1 pikirden 10 pikirinen ósıw — úlken atılım. Logaritm bul ózgeshelikti tutıp atır:

| Reviews | popularity |
|---|---|
| 1 | 0.150 |
| 5 | 0.388 |
| 10 | 0.520 |
| 50 | 0.851 |
| 100 | 1.000 |

*2. Satisfaction*. Klient hıslemán tutıq kórsetkishi. Net Sentiment Score (NSS) yerine Customer Satisfaction Index (CSI) qollanıladı:

```
satisfaction = (1.0·pos + 0.5·neu + 0.0·neg) / total
```

NSS klassikalıq `(pos - neg) / total` neytral pikirlerdı esapqa olmaytuǵın. Biraq bizdıń tarawda neytral 60-65% (model bias on uzbek). CSI artıqmashılıǵı: neytral kishi pozitiv signal, 0..1 shkala interpretatibel, ózbek til shekleneliklerin sızıqlı olib tashlaydı.

*3. Aspect penalty (aspekt poprawkası)*. Eger bir aspekt boyınsha kóp negativ kórsetkish bolsa — Demand Score kemireyledi:

```
aspect_penalty = 1 - 0.15 · max(neg_share by aspect)
```

Hár aspekt ushın `neg_share` esaplanadı (negativ aspekt-mention'larnıń úlesí). Eger bir aspekt boyınsha 50%+ negativ — bul tovardıń serioznı bottleneck'i.

Mısal:

— Tovardıń aspekt-mention'ları:
  - Sapa: 8 pos, 2 neg → 20% negativ
  - Yetkazıb berıw: 1 pos, 4 neg → 80% negativ
  - Baha: 2 pos, 0 neg → 0% negativ

— `max(neg_share) = 0.80` (yetkazıb berıw).
— `aspect_penalty = 1 - 0.15 · min(1.0, 0.80 · 1.5) = 1 - 0.15 · 1.0 = 0.85`.

15% poprawka — eń úlken jaq. Bul rinkalı sıpatlama: Demand Score tovardıń jaqsı bahasız emes pomignet, biraq áhmiyetli azaytatuǵın bottleneck-faktor.

*4. Bottleneck aspekt*. Hár tovar ushın aspect_penalty esaplaw paytında — eń kóp negativ úles bar aspekt saqlanıp turadı (bottleneck). Dashboard'da bul aspekt klientlerge tikkeley kórsetiledi.

Pavlik hisaplawımız boyınsha, bizdıń korpustaǵı eń kóp ushırasıp atırǵan bottleneck-aspekt'ler:

— Sapa — 56 tovardıń bottleneck'i.
— Yetkazıb berıw — 18 tovardıń bottleneck'i.
— Baha — 12 tovardıń bottleneck'i.
— Qadoq — 4 tovardıń bottleneck'i.

**Demand Score'tıń interpretatsiyası**. Bizdıń platformada klassifikatsiya:

— ≥ 50 — joqarı talab (popular hám klientler qoldı-qoldı)
— 25..50 — orta talab
— < 25 — tómen talab (yamasa az pikir, yamasa kóp shaǵımlar)

Bizdıń korpustaǵı 121 tovar (sentiment esaplanǵan) boyınsha distribuciya:

`6-keste. Demand Score distribuciyası`

| Diapazon | Tovar sanı | Úles |
|---|---|---|
| ≥ 50 (joqarı talab) | 21 | 17.4% |
| 25..50 (orta talab) | 60 | 49.6% |
| < 25 (tómen talab) | 40 | 33.0% |

Korpustaǵı orta Demand Score — 32.6.

**Code listing — Demand Score esaplaw**:

```python
def compute_demand_for_product(product: Product) -> DemandRow | None:
    sr_qs = SentimentResult.objects.filter(review__product=product)
    pos = sr_qs.filter(label="positive").count()
    neu = sr_qs.filter(label="neutral").count()
    neg = sr_qs.filter(label="negative").count()
    total = pos + neu + neg
    if total == 0:
        return None

    nss = (pos - neg) / total
    csi = (1.0 * pos + 0.5 * neu + 0.0 * neg) / total
    satisfaction = csi
    popularity = math.log10(total + 1) / math.log10(POPULARITY_CEILING + 1)
    popularity = min(popularity, 1.0)

    penalty, bottleneck = _aspect_penalty(product)
    demand_raw = popularity * satisfaction * penalty
    demand_score = round(demand_raw * 100, 1)

    return DemandRow(
        product_id=product.id, name=product.name,
        nss=round(nss, 3), popularity=round(popularity, 3),
        aspect_penalty=round(penalty, 3),
        demand_score=demand_score,
        bottleneck_aspect=bottleneck,
        ...
    )
```

**Use Case'ler**. *UC4 — Vendor bottleneck analizı*: vendor dashboardta óz tovarın saylaydı, sistema bottleneck'i kórsetedi (mısalı «Sapa»), vendor «Ne uchun shaǵımladı» bóleginde konkret pikir snippet'lerin oqıydı («tovar sındı», «sifati past») hám tovarın ózgertiw qararına keledi. *UC5 — Marketpleys áliminen kategoriya rinkalı taldawı*: áliminen «Kategoriya boyınsha demand» bólegin oqıydı, hár kategoriya ushın orta Demand Score'i kórinedi; eger kategoriya tomen demand'qa iye bolsa, áliminen bul kategoriyaǵa qosımsha taldaw baǵdarlaydı.

**ABSA-tıń sheklemleri**. Keyword-based usıl bir neshe shekleengen jerlerge iye: sinonimlerdı tabılmaytuǵın («postavka» tamır diziminde joq); orfografiyalıq qátegi sózler («etkazip» yerine «yetkazib»); sarkasm hám ironiya («tovarımız zo'r — kim ham yomon tovar sotadi»); aspekt overlap (bir sentence'da eki aspekt). Bul sheklemler keleshektegi izertlewlerdiń tarawı: deep learning ABSA model'lerin fine-tune ózbek tilі korpusında.

**Salıstırmalı taldaw bottleneck'tıń**. Bizdıń analitikamızdıń paydalı kórsetkishi — tovardıń tutıq sentiment hám aspekt-tiykarındaǵı bottleneck arasındaǵı parıq. Real korpustan mısallar: *Pulemkasi Bielita ramashkovaya* — Demand Score 24.5 (tómen), bottleneck Sapa; *Kukmara Trendy Style sovorodası* — Demand 55.3 (joqarı), bottleneck Yetkazıb berıw; *Bielita Sila Prirody shampuni* — Demand 11.8 (júda tómen), klient star rating 4.9 qoyǵan, biraq tekstte shaǵım bar. Vendor bul jasırın signal'tı tutıp, «Pochemu klient atap shaǵımladı?» degen sorawǵa juwap aladı.

Solay etip, ABSA hám Demand Score — bizdıń platformanıń orta noqatlarınıń biri. Composite Demand Score formulası klient hıslemán hám tovardıń popularlıǵın bir kórsetkishke birlestiredı. Keyingi bólekte biz dashboardı hám sınaq nátiyjelerin tolıq sıpatlaymız.
