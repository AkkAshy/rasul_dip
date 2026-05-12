---
title: JUWMAQLAW
section: 4
pages: 4-5
---

# JUWMAQLAW

Usı bitiruv malaka jumısında «Klient pikirlerine tiykarlanıp sentimental analiz argalı ónim talabın anıglaw» tema'sı boyınsha tolıq web-platforma jaratıldı. Jumıstıń maqseti — Uzum.uz onlayn-marketpleysinen klient pikirlerin avtomatik jıynaw, olardı sentimental analiz hám aspekt-tiykarındaǵı analiz arqalı qayta islew, hám bunıń tiykarında composite Demand Score esaplaytuǵın platforma jaratıw — tutıq ámeliy ámelge asırıldı.

**Birinshi bapta**, klient pikirleri tiykarındaǵı sentimental analiz hám tovar talabın bahalaw máselelerinıń teoriyalıq tiykarları úyrenildı. Sentimental analiz tarawınıń tariyxı, klassikalıq usılları (lexicon-based, classical machine learning, deep learning, Transformer-tiykarındaǵı) hám zamanagóy multilingual modelleri (mBERT, XLM-RoBERTa, UzBERT) bayanlandi. Marketpleyslerde tovar talabın bahalawda klassikalıq star rating'tıń kemshilikleri (klient pikirlerinde 18-22% «sentiment-rating gap» bar) hám sentiment-tiykarındaǵı kompozit kórsetkishlerdiń (NSS, CSI, composite Demand Score) ámeliy úles korabei tasdıqlandi. Aspect-Based Sentiment Analysis (ABSA) usılınıń klassikalıq strategiyaları sıpatlandı. Ózbekstan elektron sawda bazarınıń salıstırmalı taldawı kelirildi: Uzum Market, Asaxiy, Texnomart, OLX hám basqa platformalardıń pozitsiyaları, klient pikirleri korpusınıń tilllik xarakteristikası (60% rus, 36% ózbek, qalǵanları), ózbek tilindegi pozitiv hám negativ markerlardıń ámeliy ámelge asırıwı.

**Ekinshi bapta**, platformanı islep shıǵıwda qollanılǵan zamanagóy texnologiyalar hám qurallar bayanlandi. Backend bólegi Django REST Framework hám PostgreSQL tiykarında qurıldı: 4 áhmiyetli Django app (products, reviews, analysis, scraper), 6 maǵlıwmatlar bazası kestesi, 9 RESTful API endpoint, async ORM hám sync_to_async integratsiyası. Frontend bólegi Next.js 16 (App Router), TypeScript, Tailwind CSS v4 hám Recharts kompozit kórinisinde ámeliy ámelge asırıldı: 4 sahifa (lendinǵ, dashboard, tovarlar, tovar detali), 7 reusable React komponentı, server hám client components arasındaǵı parıq, async fetch'ler. Maǵlıwmat jıynaw hám NLP'tıń ámeliy ámelge asırıwı: httpx (REST), Playwright (browser automation, GraphQL Feedbacks query, JWT-tiykarındaǵı autorizatsiya), HuggingFace Transformers (`tabularisai/multilingual-sentiment-analysis` modeli), batch inference, sentence-level processing.

**Úshinshi bapta**, platformanıń tikkeley ámeliy ámelge asırıwı tolıq sıpatlandı. Maǵlıwmatlar bazasınıń ER-strukturasi (Category → Product → Review → SentimentResult/AspectMention → Aspect baylanısları) bayanlandi. Eki rejmde jumıs qılatuǵın parser ámeliy ámelge asırıldı: REST mode (httpx, top-feedback) hám Browser mode (Playwright + GraphQL, tólıq pikirler), retry-on-429 mexanizmı menen. Sentence-level ABSA usılı keyword-based extraction tárepinen ámeliy ámelge asırıldı: 4 aspekt (Yetkazıb berıw, Baha, Sapa, Qadoq), 80+ keyword-tamır rus hám ózbek tillerinde. Composite Demand Score formulası ámeliy ámelge asırıldı:

```
Demand = popularity × satisfaction × aspect_penalty × 100
```

Hár komponentı sızıqlı ámeliy biznes-mánisine iye: popularity logaritmik shkalada normallashtırılǵan, satisfaction CSI tiykarında esaplanǵan (neytral pikirler 0.5 vesh menen), aspect_penalty bottleneck-tiykarındaǵı 15%'ǵa shekem poprawka. Klassikalıq jaqtan ≥50 — joqarı talab, 25-50 — orta, <25 — tómen.

**Sınaq nátiyjeleri** kelesi áhmiyetli faktorlar tasdıqlandı:

1. *Maǵlıwmatlar jıynalw bárqarar*. Bizdıń ámeliy korpus 190 tovar, 38 kategoriya, 3500'den asraq klient pikirden turadı. Tilllik distribuciya 51% rus, 43% ózbek (latınca), qalǵanları az úlesli.

2. *Modeldıń sapası til boyınsha úlken parıq kórsetedi*. Klassikalıq metrikası — modeldıń sentiment metkasi hám klient star rating arasındaǵı uyǵınlıq:
- Rus tilindegi pikirler ushın: **58.8%** (orta-jaqsı)
- Ózbek tili (latınca) ushın: **18.4%** (júda tómen)
- Ózbek tili (kirilcha) ushın: **10.2%** (atap qatlanǵan tómen)

Bul kórsetkishler ámeliy biznes-paydalanıw uchun ulken áhmiyetke iye: multilingual sentiment-modellerdı tutıq paydalanıw qıyın ózbek til kontekstinde. Bul faktor — bizdıń jumıstıń orta noqatlarınıń biri, hám ámeliy biznes ushın fine-tune zarurlıǵın tasdıqlaytuǵın daleli.

3. *ABSA ámeliy ámelge asırıwı*. Bizdıń korpustaǵı klient pikirleri arasında 1829 aspekt-mention tabıldı. Eń kóp ushırasıp atırǵan aspekt — Sapa (1478 mention), keyin Yetkazıb berıw (168), Baha (133), Qadoq (50). 121 tovardıń 56'sı «Sapa» bottleneck'ge iye, 18'i — «Yetkazıb berıw», 12'si — «Baha», 4'i — «Qadoq».

4. *Demand Score validatsiyası*. Bizdıń kompozit Demand Score'tı satılıw'qa proksi sıpatında ordersAmount'qa salıstırılǵanda — Spearman korrelyaciyası **0.62** (orta-strong). Klassikalıq star rating'qa korrelyaciya tek 0.31 — bul Demand Score'tıń klassikalıq metrikalardan ózge ámeliy paydalı kórsetkish ekenıne tasdıq beredı.

5. *Performance kórsetkishler*. Tutıq pipeline (parser → maǵlıwmatlar bazası → sentiment ML → ABSA → dashboard) 1 saat içinde 1000 yangi tovar/4000 yangi pikir ushın ámeliy ámelge asıriladı. Dashboard sahifaları 1-2 sekundta yuklap atır, API endpoint'leri ortasha 50-500 ms javap beredı. Bul ámeliy biznes-paydalanıwı uchun jeterli kórsetkishler.

**Jumıstıń ilimiy jańalıǵı** keleshek-aktual eki noqatda kórinedi:

Birinshiden, multilingual sentiment-modellerdıń ózbek tilindegi sapası birinshi márte sanlı bahalandı. Klassikalıq akademiyalıq izertlewlerde bunday ámeliy ámelge asırıw kórsetkishi joq edi. Bizdıń kórsetkishler — 18.4% (latınca) hám 10.2% (kirilcha) — ámeliy biznes ushın hám akademiyalıq izertlewler ushın áhmiyetli ma'lumat beredı.

Ekinshiden, jergilikli marketpleys (Uzum.uz) sharayatına sáykes kelgen composite Demand Score formulası islep shıǵıldı. Klassikalıq formulalardı (Brandwatch, Sprinklr) jergilikli sharayata moslastırıw boyınsha akademiyalıq izertlewler kópaytmagan, biraq bizdıń ámeliy ámelge asırıw bul boshıqtı toldıradı.

**Jumıstıń ámeliy áhmiyetliligi** birneshe aspektlerde kórinedi:

— *Marketpleys iyeleri* ushın yangi qural: Demand Score arqalı tovar talabın aniqraqsanlı bahalaw imkaniyatı. Klassikalıq KPI'lar (satılıw, rating) sentiment-tiykarındaǵı kompozit metrikası menen toldırıladı.

— *Vendor'lar* ushın: óz tovarınıń bottleneck'i hám klient shaǵımlarına tikkeley dárek. Klassikalıq jaqtan vendor klient pikirlerin qol arqalı oqıydı, bunday taldaw uzaq waqıt talap qıladı. Bizdıń platforma bul jumıstı 30 sekunda jasaydı.

— *Klientler* ushın: tovardıń klassikalıq star rating'tan ózge — sentiment-tiykarındaǵı detallı bahalawı.

— *Akademiyalıq izertlewler* ushın: jıynalǵan ózbek tilindegi sentiment korpus (1568 pikir) keleshek izertlewlerde — fine-tune ushın tárbiyalew korpusi sıpatında — qollanılıwı múmkin.

**Texnik jumıstıń juwmaqlaması**. Bizdıń platformanıń texnik kórsetkishleri:

- 4 Django app (products, reviews, analysis, scraper)
- 6 maǵlıwmatlar bazası kestesi
- 9 REST API endpoint
- 4 frontend sahifa, 7 React komponent
- 8 management command (parser, sentiment, ABSA, kategoriya)
- 3500+ klient pikir
- 1829 aspekt-mention
- 30+ paydalanılǵan ádebiyat dárek

**Keleshek izertlew baǵdarları**. Bizdıń jumıstıń ámeliy ámelge asırıwında bir neshe áhmiyetli boshıqlar tabıldı, ulardı keleshektegi izertlewlerdı tarawı belgilew múmkin:

1. *Modeldı fine-tune qılıw*. Eń aktual másele — modeldıń ózbek tilindegi sapasın artırıw. Bizdıń korpustaǵı 1568 ózbek pikiri qol arqalı razmetka qılıp (~500 yangi pikir), XLM-RoBERTa-base modeli fine-tune qılıw múmkin. Bul jumıstıń keleshektegi etapı.

2. *ABSA usılın aktivnatırıw*. Klassikalıq keyword-based extraction'tan embedding-based usılına ótiw. Sentence-transformers (mısalı, `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`) arqalı aspekt'lerdı semantikalıq similarity bo'yıncha tabıw — bul sinonimler hám orfografiyalıq qátegi sózler boyınsha aniqlıqtı arttıradı.

3. *Cross-marketpleys parser'leri*. Bizdıń platforma kelmegen Asaxiy, Texnomart, OLX hám Wildberries Uzbekistan boyınsha kompleks salıstırma'lar berıwi múmkin. Bul vendor'lar uchun cross-marketpleys analitikası beredı.

4. *Real-time monitoring*. Klient pikirleri bizdıń platformaǵa tutıq qılıp pull rejimde keladi (manual scrape). Real-time monitoring uchun WebSocket yamasa Server-Sent Events arqalı klient pikirlerin ámeliy paytda kórsetiw múmkin.

5. *Mobile applikatsiya*. Klassikalıq jaqtan vendor'lar mobile arqalı óz tovarın baqılaytuǵın bolıwı múmkin. React Native arqalı mobile app jaratıw — keleshektegi baǵdar.

6. *Bahonalandirilgan recommendation system*. Klient pikirleri tiykarındaǵı tovardıń recommendation system. «Bul tovardı klassikalıq satıp olganlar bul tovardı da yaratti» degen klassikalıq usıl yerine, sentiment-tiykarındaǵı «Bunday klientlerge bul tovar yoqadi» dep ámeliy ámelge asırılıwı múmkin.

7. *Ózbek til ushın spe-cialized NLP qurallar*. UzBERT fine-tune, ózbek til ushın named entity recognition (NER), grammatical analysis. Bul birden kóp izertlew baǵdarın óziniń ishine alǵan.

8. *VPS deployment hám demonstration*. Bizdıń platforma local development tárepinde tegisledi, biraq production VPS'qa deploy qılıw — final etap. Docker Compose tegisli, demo URL beriliwi múmkin.

**Juwmaq juwmaq**. Klient pikirleri tiykarındaǵı sentimental analiz arqalı tovar talabın bahalaw — házirgi waqıttıń aktual másele. Klassikalıq star rating'tıń sheklemleri sentiment-tiykarındaǵı kompozit kórsetkishler menen toldırıladı, ABSA usılı bottleneck'tı tabıw imkaniyatın beredı, composite Demand Score formulası tovardıń tutıq talabın bir kórsetkishke birlestiredı. Multilingual sentiment-modellerdıń ózbek tilindegi shekleneliklerdı sanlı kórsetiw — bizdıń jumıstıń orta noqatlarınıń biri. Jaratılǵan platforma — Django REST + Next.js + Playwright + HuggingFace texnologiyalardıń kompleksinde — ámeliy biznes-shártlerine sáykes ekenligi tasdıqlandı, hám klassikalıq jaqtan jergilikli marketpleys-analitikasi tarawında orın boshıqlardı toldıradı. Bul jumıs ámeliy biznes ushın paydalı qural tarqatadı, akademiyalıq izertlewler ushın yangi maǵlıwmat berdı, hám keleshektegi izertlew baǵdarlarına aniq jol kórsetedi.

Bul jumıstıń orınlanıwı paytında men özbekstan IT-tarawında zamanagóy texnologiyalardıń ámeliy ámelge asırıwı boyınsha jaqsı tájiriybe topladım. Django, Next.js, HuggingFace Transformers, Playwright sıyaqlı zamanagóy qurallar menen jumıs qılıw — meniń keleshektegi kásiplik rawajlanıwımda áhmiyetli rolь oynaytuǵın bolıp tabıladı.
