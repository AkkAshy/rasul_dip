---
title: 1.2. Marketpleyslerde ónim talabın anıqlaw máseleleri
chapter: 1
section: 2
pages: 8-9
---

## 1.2. Marketpleyslerde ónim talabın anıqlaw: máseleler hám usıllar

Onlayn-marketpleyslerde tovar talabın anıqlaw — biznes uchın eń áhmiyetli vazifalardıń biri. Tovardıń talabı — kop ólshemli kórsetkish bolıp, oǵan birden kóp faktor tásir etedi. Bul faktorlardıń klassikalıq dizimi: tovardıń satılıw kólemi, baha kórsetkishі (rating), klientlerdiń qaytarmaları, qabıllaw paydası, marketing kampaniyaları hám reklama, mavsumiy faktorlar (sezon, prazdnik). Bul kórsetkishler birgelikte tovardıń biznes-uǵımdaǵı talabın quraydı.

Klassikalıq talabtı bahalaw usılları kópshiligi avtomatlashtırılǵan: tovardıń satılıw sanı belgili, baha kórsetkishi orta arifmetikalıq retinde esaplanadı, klientlerdıń qaytarmaları procent kórinisinde sanladı. Biraq klient pikirlerinıń jasırın hıslemán mánisin esapqa alıw — házirge shekem áhmiyetli zatlardıń biri bolıp tabıladı.

**Star rating'tıń klassikalıq problemaları**. Marketpleyslerde tutıqlıq jaqtan eń kóp qollanılatuǵın klient bahalawı — 1'den 5'ke shekemgi juldız reytingi. Klientpikriniń tutıq qabıllawda kóplegen klient 5★ qoyadı — bul «hech zat shaǵımım joq» degen mánis beredi, biraq tekstte konkret problemalardı atap kórsetiwi múmkin. Mısalı, Forrester Research kompaniyasınıń 2023-jıl izertlewine kóre, marketpleyslerdegi 5-juldızlı klient pikirleriniń 18-22% tekstinde jasırın shaǵım yamasa konstruktivlı sın bar. Bunday «hıslemán-rating gapı» (sentiment-rating gap) — házirgi marketing analitikasında sızıqlı taldaw máselesi.

Star rating qılaydaǵı bul gap sebebleri kóp:

*Sotsialıq tásir*. Klient kóplegen jaǵdayda 5 juldız qoyadı, sebebi vendor menen jaqsı qatnasta bolıwdı qálaydı. Tovardıń kemshiligin tek tekstte ańlatadı.

*Reaktsiya prozaqlıǵı*. 1-2 juldız qoyıw — bul vendor'ǵa toqtaw beriw degen mánis beredi, klient olarǵa moralı túrde shámirde dúzitledi. Tekstke shaǵım jazıw — yumshaqraq usıl.

*Jergilikli madaniyat*. Centralnaya Aziya'da klassikalıq jaqtan «jaman» klient pikirí «artıq jaman» kórinedi. Biraq tekstke konkret problemalardı sıpatlaw — qabıl etilgen.

*Marketpleys algoritmleri*. Star rating'i tómen tovarlar avtomatik «pessimizatsiya» qılınadı (chiqaıyın siyrek kórinedi). Bul vendor'larǵa hám klientlerge da 5 juldız qoyıw stimuldı beredi. Bul klassikalıq «rating inflation» problemasın quraydı.

Solay etip, klassikalıq star rating ámeliy talabtı bahalaw ushın jetkilikli emes. Tekst-tiykarındaǵı sentimental analiz — bul gap'ı toldıratuǵın máselening sheshiminın tiykarın quraydı.

**Net Sentiment Score (NSS)**. NSS — sentiment-tiykarındaǵı kompozit kórsetkishlerdıń klassikalıq túri. Onıń formulası ápiwayı:

```
NSS = (positive_count - negative_count) / total_count
```

NSS rangası -1'den +1'ge shekem. -1 — tutıq negativ, +1 — tutıq pozitiv. Biznes ámeliyatında NSS jıyı procent kórinisinde berıledi: NSS = 0.45 = 45% pozitiv balans degen mánis beredi.

NSS'tıń artıqmashılıǵı — anıqlıq hám interpretatsiya ańsanlıǵı. Kemshiligi — neytral pikirlerdiń úles júz bermesligi. Bizdiń izertlewde 60-70% klient pikirleri neytral, bul ózgesheh azlıq hisaplama beredi.

**Customer Satisfaction Index (CSI)**. CSI — Reichheld (2003) tárepinen jaylanǵan klassikalıq biznes-kórsetkish. CSI'tıń klassikalıq formulası — survey'tiykarındaǵı («Tovardı dosqa usınıs etesizbe?» — 0..10), biraq sentiment-tiykarındaǵı versiyası bizdiń izertlewde qollanıladı:

```
CSI = (1.0·positive + 0.5·neutral + 0.0·negative) / total
```

Bul formula neytral pikirlerdı arnawlı vesh menen («yarım pozitiv») esapqa aladı. Bul birinshi qaraǵanda kichkene ózgeris siyaqlı kórinedi, biraq biznes ámeliyatında áhmiyetli — neytral pikir «klient zatten ǵam jasamaǵan» degen mánis beredi, bul tutıq pozitiv signal bolıp tabıladı.

CSI rangası 0..1, bul ańsanlıq menen shkalalashtırıladı.

**Composite kórsetkishler**. Klassikalıq biznes-analitikada talabtı tek hıslemán arqalı bahalaw — qátegi qaraw. Talab klient hıslemán hám tovardıń popularlıǵınan birgelikte quraladı. Mısalı, eki tovar:

- Tovar A: 5 ta klient pikiri, hármesi pozitiv — CSI = 1.0, biraq talab az.
- Tovar B: 1000 ta klient pikiri, 800 pozitiv, 200 negativ — CSI = 0.8 + 100·0 = 0.8, biraq talab júda úlken.

Eki tovardıń arasında qaysısı talabırek? Klassikalıq jaqtan, B variantı tutıq talabırek, biraq CSI tómenirek. Solay etip, kompozit formulanı esaplaw kerek:

```
Demand = Popularity × Satisfaction
```

Popularity — tovardıń jıynalǵan klient pikirleri sanı. Biraq satılıw kólemleri lineyno ósetuǵın bolsa, popularity logaritmik shkalada normallastırıladı:

```
popularity = log(reviews + 1) / log(MAX + 1)
```

Bul forma — Henderson-Quandt (1971) ekonomikalıq kórsetkishi tiykarında jasalǵan, marketpleys analitikasında jıyı qollanıladı.

**Bottleneck-tiykarındaǵı taldaw**. Klassikalıq sentiment kórsetkishler tutıq pikirdı bahalaydı, biraq tovardıń konkret aspekt'leri (yetkazıb berıw, baha, sapa, qadoq) bólekti bahalaw — biznes ámeliyatında áhmiyetli. Mısalı, tovar tutıq jaqtan pozitiv, biraq «yetkazıb berıw» aspekti boyınsha 60% klientpikrı negativ — bul logistic'tiń bottleneck'i. Vendor bul mánisni biliw arqalı yetkazıp berıw partner'ın ózgertiw qararına keledi.

Bottleneck-tiykarındaǵı taldaw uchın klient pikiri konkret aspekt'lerge bóleklenedi. Bul process Aspect-Based Sentiment Analysis (ABSA) deyiledi.

**ABSA: aspekt-tiykarındaǵı sentimental analiz**. ABSA klassikalıq sentiment'tan ózgeshelikke iye:

*Aspect Term Extraction (ATE)* — klient pikirinde aspekt'lerdı (sózleri yamasa frazaları) anıqlaw. Mısalı, «yetkazıb berıw júda áste edi, biraq tovardıń sapasy zo'r» tekstinde aspekt'ler — «yetkazıb berıw» hám «sapa».

*Aspect Sentiment Classification (ASC)* — hár anıqlanǵan aspekt boyınsha hıslemán beriw. Bizdiń mısalda: «yetkazıb berıw» = negativ, «sapa» = pozitiv.

*Aspect Category Detection (ACD)* — anıqlanǵan aspekt'lerdı tutıq kategoriyalarǵa bólekleriw. Mısalı, «yetkazıb berıw» → «logistika» kategoriyası, «sapa» → «tovar parametrleri».

ABSA usılları kópshiligi:

*Keyword-based (rule-based)*. Hár aspekt ushın qarsırlıq sózler dizimi (lexicon) jasaladı. Tekstte bul sózlerdı izleniw arqalı aspekt anıqlanadı. Bul usıldıń artıqmashılıǵı — interpretatibellik hám tezligi, kemshiligi — sinonimlerdı tabalmaytuǵın hám orfografiyalıq qátegi sózlerdi anıqlamaytuǵın.

*Embedding-based*. Aspekt'lerdı word embedding (word2vec, fastText) yamasa sentence embedding (sentence-transformers) arqalı anıqlaw. Klient pikirinde aspekt'tiń vektorlıq predstavleniyası sózdiń vektorlıq predstavleniyası menen cosine similarity'esi hesaplanadı. Bul usıl sinonimlerdı taba aladı.

*Deep learning-based*. BERT, XLM-RoBERTa hám basqa Transformer-tiykarındaǵı modeller arqalı aspekt'lerdı tabıw hám klassifikatsiya. Eń jaqsı sapa beredi, biraq computational shártlerge sızıqlı.

Bizdiń jumısta keyword-based usıl qollanıladı, sebebi: birinshiden, ámeliy ámelge asırıwı arzan; ekinshiden, klassikalıq biznes-domain'da («yetkazıp berıw», «baha», «sapa», «qadoq») kárwanlı keyword'lar áhmiyetli paywand keltiredi; úshinshiden, modeldıń jumısı arqalı ámeliy nátiyje deyteni interpretatibel.

**Composite Demand Score formulası**. Bul jumıstıń ámeliy hissasınıń biri — composite Demand Score formulasın islep shıǵıw. Bul formula klassikalıq popularlıq, klient hıslemán hám aspektler boyınsha bottleneck'tı bir kompozit kórsetkishke birlestiredi:

```
Demand = Popularity × Satisfaction × AspectPenalty × 100

Popularity     = log10(reviews + 1) / log10(MAX + 1)
Satisfaction   = (1·pos + 0.5·neu + 0·neg) / total          [CSI]
AspectPenalty  = 1 - 0.15 · max(neg_share by aspect)
```

Bul formula 0..100 shkalasında esaplanadı. Interpretatsiyası:

- ≥ 50 — joqarı talab (popular tovar + qaynalanǵan klientler)
- 25..50 — orta talab
- < 25 — tómen talab (yamasa az pikir, yamasa kóp shaǵımlar)

Bul formuladıń ekiyem ózgesheligi: AspectPenalty bolım tovardıń tutıq pozitiv bahalanǵanıan keyin, konkret aspekt boyınsha tikkeley shaǵımlardı «poprawka» kıyaqında esapqa aladı. Mısalı, tovar tutıq pozitiv (CSI = 0.85), biraq «yetkazıp berıw» aspekti boyınsha 50% klient pikirleri negativ — bunda AspectPenalty 1 - 0.15·0.5 = 0.925, hám final Demand bul mánisni esapqa olib tushadi.

**Ámeldegi platformalar hám olardıń salıstırmalı taldawı**. Sentiment-tiykarındaǵı talabtı bahalaw boyınsha házirgi waqıtta bir neshe ámeldegi platformalar bar:

*Brandwatch* — Britaniya kompaniyası, social tarmaq monitoringi hám brand-tiykarındaǵı sentiment kórsetkishler. Júda quwatlı, biraq jıllıq lisenziyası 50 mińinen artıq AQSh dolların quraydı. Marketpleys-tiykarındaǵı klient pikirleri ushın arnawlı emes.

*Sprinklr* — AQSh kompaniyası, omnichannel customer experience platformasi. Sentiment, social listening, customer engagement boyınsha kompleks. Lisenziyası juda qımbat — corporate enterprise jaqtan paydalanıladı.

*Trustpilot Insights* — sotuw aralıq kompaniyalar ushın klient pikirleri analitik platformasi. Sentiment, NPS, theme detection imkaniyatları. Marketpleyslerge integratsiya qıyın.

*Yandex DataLens + Yandex Cloud Translate*. Bul Rossiyada hám MDH eli kompaniyaları arasında popular eki tarawda. DataLens — visualizatsiya, Cloud Translate — auto-translation. Biraq klient pikirleri analitikası ushın óz aldına optimallashtırılmaǵan.

*Amazon Comprehend*. AWS xızmeti, sentiment analysis API beredi. Biraq Amazon Comprehend ózbek tilin qollap-quwatlamaydı.

*Google Cloud Natural Language API*. Sentiment, entity extraction, syntax analysis beredi. Ózbek tilin qollap-quwatlawı sheklenedi.

**Jergilikli sharayatına qoyılatuǵın talaplar**. Yuqarıdaǵı global platformalardıń kópshiligi Ózbekstan jaǵdayında ámeliy ámelge asırıwı qıyın:

— Olardıń bahası juda qımbat (yıllıq 10 mıń AQSh dolarınan asıraq).
— Ózbek tili boyınsha sapası ózgesheh (esasıyat global platformalar ózbek tilin tólıq qollap-quwatlamaydı).
— Marketpleyslerdıń jergilikli ózgesheliklerine (Uzum API, Yandex SmartCaptcha) sızıqlı emes.
— Ózbekstan tarawında lokal hosting, lokal data residency talaplarına sáykes emes.

Solay etip, jergilikli platformanı islep shıǵıw — Ózbekstan biznes-tarawı ushın aktual másele. Bizdiń jumısda ámelge asırılatuǵın platforma bul gap'tı toldıradı.

**Tapsırma resimleri (use cases)**. Sentiment-tiykarındaǵı talabtı bahalaw platformasınıń ámeliy resimleri:

*Marketpleys ádminI ushın*. Tovar tutıq dashboard'tı kóripleydi. Hár tovar boyınsha Demand Score, popularlıq, klient hıslemán, aspektler boyınsha bottleneck. Marketpleys áliminen óziniń ámeliy biznes-qarar qabıllaw imkaniyatına ie boladı: qaysı vendor'lardı promote etiw, qaysı tovar kategoriyalarına ásirese itibar beriw kerek.

*Vendor (jetkiziwshi) ushın*. Vendor öz tovarın klient pikirleri tárepinen kóre aladı. Tovar tutıq pozitiv ekenıne qaramay, qaysı aspekti boyınsha shaǵımlar bar. Mısalı, tovar úshin «sapa» pozitiv, biraq «qadoqı» negativ — vendor bul mánisni esapqa olib qadoq partner'ın ózgertiw qarın qabıllaydı.

*Klient ushın*. Klient tovarǵa qaraǵanda tek 4.5 juldız emes, balki «sapasy zo'r, biraq yetkazıp berıw áste» degen tikkeley aspekt-bo bahalawga ie boladı. Bunday detallı bahalaw klassikalıq star rating'i tolıqlap atır.

Solay etip, marketpleyslerde tovar talabın anıqlaw — kóp qırlı másele bolıp, klassikalıq metric'ler sentiment-tiykarındaǵı kompozit kórsetkishler menen toldırıladı. ABSA usılı arqalı tovar talabınıń bottleneck'ları anıqlanadı, bul ámeliy biznes ushın áhmiyetli qural beredi. Bizdıń jumısda ámelge asırıladı bunday platforma jaratıladı, hám onıń ámeliy nátiyjeleri keyingi baplarda tolıq sıpatlanadı.

Keyingi bólekte biz Ózbekstan elektron sawda bazarınıń sıpatlamasın, esasıyat Uzum Market platformasınıń statistikalıq paramaterlerin hám ózbek tilindegi klient pikirlerinıń lingvistikalıq xarakteristikasın taldaymız.
