---
title: 1.1. Sentimental analiz — tariyx, usıllar hám zamanagóy modeller
chapter: 1
section: 1
pages: 8-9
---

# I BAP. SENTIMENTAL ANALIZ HÁM ÓNIM TALABÍ — TEORIYALÍQ TIYKARLAR

## 1.1. Sentimental analiz: tariyx, usıllar hám zamanagóy modeller

Sentimental analiz (sentiment analysis) — tábiyǵıy til bayanı (Natural Language Processing — NLP) tarawınıń bir baǵdarı bolıp, tekst kórinisindegi maǵlıwmattıń jasırın hıslemán mánisin avtomatik anıqlawǵa baǵdarlanǵan. Bul taraw házirgi waqıtta NLP'tıń eń aktiv rawajlanıp atırǵan baǵdarlardıń biri bolıp, ámeliy biznes, sociologiya, marketing hám hákımiyat qararları boyınsha taldaw sıyaqlı kóplegen tarawlarda qollanıladı. Sentimental analizdiń tiykarǵı vazifası — hár qıylı tekstti (klient pikiri, social tarmaqtaǵı jaylanǵan, news article hám basqalar) klasslarǵa bóleklep, oǵan jasırın hıslemán metasin beriw.

Tariyxıyaq jaqtan, sentimental analiz baǵdarı 1990-jıllardıń áxırında payda boldı, biraq ámeliy izertlewlerdiń tıǵız basqı 2000-jıllardıń bası bolıp tabıladı. Bul baǵdardıń «atası» retinde universitetler hám korporativ izertlew laboratoriyalardıń jumıslerı sanaladı. Esaplanǵanına kóre, eń áhmiyetli xalıqarawlıq jumıs — Bo Pang hám Lillian Lee tárepinen 2002-jılda jaylanǵan «Thumbs up? Sentiment Classification using Machine Learning Techniques» maqalası. Bul jumısda kino sıny tekstleri (movie reviews) tiykarında, klassikalıq machine learning algoritmleri — Naive Bayes, Maximum Entropy, Support Vector Machines (SVM) — paydalandırıp, klassifikatsiya qılın atap qatlanǵan accuracy 80% dárejesine erisildi.

Bul jumıstan keyin sentimental analiz tarawında qarjılı izertlewler ósti. Pang hám Lee 2008-jılda «Opinion Mining and Sentiment Analysis» degen monografiya jaylep, bul tarawdı óz aldına ilim ortasındaǵı baǵdar etip rásmiyleshtirdı. Solay etip, sentimental analiz tarawı ózinıń áhmiyetli teoriyalıq bázasına ie boldı.

**Sentimental analizdiń klassikatsiyası**. Sentimental analiz birneshe shámirde bóleklenedi:

*Polaritetli klassifikatsiya (polarity classification)* — eń klassikalıq jumis, tekstti «pozitiv» yamasa «negativ» klasslarına bólekti turadı. 3-klasslı sxema bul jumistı «pozitiv / neytral / negativ» kórinisinde keńeyteni. Bizdı qızıqtırıp atırǵan klient pikiri tarawında 3-klasslı sxema eń kóp qollanıladı, sebebi klient pikirleriniń úshten birinen kópı neytral xarakteri.

*Hıslemán intensivligini bahalaw (sentiment intensity)* — «1'den 5'ke shekem» yamasa «0..1 shamasında» rangda hıslemán dárejesin bahalaw. Bul jumıs klassikalıq baha kórsetkishі (star rating) menen sáykes keledi.

*Aspect-Based Sentiment Analysis (ABSA)* — eń zamanagóy baǵdar. Tekst pikirinde tek tutıq hıslemán emes, balki konkret aspekt'ler boyınsha hıslemán anıqlanadı. Mısalı, restoran sıny tekstınde «taǵam júdá tátti edi, biraq xızmet usız» — bul ABSA: aspekt «taǵam» = pozitiv, aspekt «xızmet» = negativ. ABSA tarawı esasıyat SemEval-2014 Task 4 jumısı menen rásmiyleshtirildi.

*Emotion Detection* — pikirde konkret emotsiya'nı (qaynalanıw, qorqıw, taajjup) anıqlawı. Bul polaritetli klassifikatsiyanıń keyingi basqıshı, biraq ámeliy ámelge asırıwı qıyın.

**Tarawda usıllardıń rawajlanıw etapları**. Sentimental analizdıń tariyxıyaq jaqtan rawajlanıwını shártı túrde úsh basqıshqa bólegen múmkin:

*Birinshi basqısh — leksikon-tiykarındaǵı (lexicon-based) usıllar (1990-2010)*. Bul usıllarda alǵashınan «pozitiv sózler» hám «negativ sózler» dizimi (sentiment lexicon) jasaladı. Tekstte bul sózlerdıń kórsetiwi sanlanadı, hám esaplanǵan balansqa kóre tekstke tutıq hıslemán beriledi. Mısalına SentiWordNet — WordNet leksikalıq bázasıdan keltiriliip, hár sózge úsh shama (positivity, negativity, objectivity) berılǵan. Basqa belgili leksikon — VADER (Valence Aware Dictionary and sEntiment Reasoner), bul ásirese sociallı tarmaq tekstleri (Twitter) ushın optimallashtırıldı, emoji'lar hám qıyqalı qosımsha morfologiyanı esapqa aladı. Leksikon-tiykarındaǵı usıllardıń artıqmashılıǵı — interpretatibellik (qaysı sózdiń qansha úles bergeni anıq), kemshiligi — kontekstti túsinmeydi, sarkasm hám idiomalarǵa shídamayedı.

*Ekinshi basqısh — klassikalıq machine learning (2000-2015)*. Bul usıllarda tekst features'lı kórsetkishler (Bag of Words, TF-IDF, n-gram) qollanılıp, tárbiyalewde Naive Bayes, Logistic Regression, SVM klassifikatorları paydalandırıladı. Tárbiyalew ushın qollanılan dataset — IMDB Movie Reviews, Amazon Product Reviews, Stanford Sentiment Treebank. Bul usıllar leksikon-tiykarındaǵılarǵa qaraǵanda bárqarar nátiyje beredı, biraq olar da kontekstti tolıq túsinmeyzi.

*Úshinshi basqısh — Deep Learning (2015-házirge shekem)*. Recurrent Neural Networks (RNN), Long Short-Term Memory (LSTM) hám Convolutional Neural Networks (CNN) tekstlerdı vektorlıq predstavleniyalarǵa (word embeddings — word2vec, GloVe) ózgertip, kontekstní hesa alıp pikirler. Bul usıllar accuracy 90%-tan kóp dárejede beredi.

*Tórtinshi basqısh — Transformer'ler hám preprodtelgen modeller (2018-házirge)*. Attention mechanism tiykarındaǵı Transformer arxitekturasınıń (Vaswani et al., 2017) payda bolıwı menen NLP tarawı tubinen ózgerdi. 2018-jılda Google tárepinen jaylanǵan BERT (Bidirectional Encoder Representations from Transformers) ámeli sentimental analizdiń sapasın 95%+ shamasına shıǵardı.

**Zamanagóy sentiment-modeller**. Házirgi waqıtta sentimental analiz ámeliy ámelge asırıwda qollanılatuǵın eń áhmiyetli modeller — Transformer arxitekturasındaǵı preprodtelgen til modelleri (Pre-trained Language Models, PLM):

*BERT (Devlin et al., 2018)* — eń klassikalıq Transformer-modeli. Bidirectional encoder, 12 layer, 110M parameter. Tárbiyalengeni Books Corpus (800M sóz) hám English Wikipedia (2.5B sóz) tiykarında. Sentimental analiz ámeliy ámelge asırıwda BERT bol pre-trained baseline retinde belgili.

*RoBERTa (Liu et al., 2019)* — Facebook AI Research tárepinen jaylanǵan, BERT'tıń optimallashtırılǵan versiyası. Tárbiyalew procedurası ózgertilgen (next sentence prediction alınıp tashlandı, batch size úlken etilgen), accuracy 1-2% jaqsırtilǵan.

*XLM-RoBERTa (Conneau et al., 2020)* — multilingual versiyası, 100 tilden artıq tilde tárbiyalengen, sonıń ishinde rus tili hám ózbek tili. Bizdı qızıqtırıp atırǵan tarawda — Ózbekstan klient pikirleriniń ekitilli korpusında — XLM-RoBERTa tiykarındaǵı modeller eń isiniwli baseline.

*DistilBERT, ALBERT, ELECTRA* — BERT'tıń kishireytilgen yamasa optimallashtırılǵan versiyaları. Olar prozaq paydalanıwda (CPU-da inference, mobile devices) qollanıladı.

*GPT-tiykarındaǵı modeller (GPT-2, GPT-3, GPT-4)* — OpenAI tárepinen jaylanǵan generativtilik modeller, biraq olar sentimental analiz ushın óz aldına optimallashtırılmaǵan, kóbinese few-shot prompting arqalı qollanıladı.

**Multilingual sentimental analiz hám túsiniw**. Bizdiń jumıstıń orayda túpkili máselelerinen biri — multilingual sentiment-modellerdıń ózbek hám rus tilleri arasındaǵı sapasın baha. Multilingual modellerdıń tiykarǵı túsinigi — model birden kóp tilde maǵlıwmatlardı qosqan hám barlıq til ushın bir embedding-keńlikti túzgen. Bul arqalı bir tilde tárbiyalengen klassifikator basqa tilde de jumıs qılaytuǵın bolıwı zarur.

Biraq ámeliy ámelge asırıwda multilingual modellerdıń sapası tilden tilge keskin parıqlanadı. Eń kóp tárbiyalew maǵlıwmatları bar tiller — ingliz tili (eń kóp), keyin rus, hispan, frantsuz, kítay tilleri — bul tillerde model jaqsı islaydı. Az tárbiyalewli tiller (low-resource languages) — sonıń ishinde ózbek tili, qaraqalpaq tili — modeldıń sapası ayqın tómen.

Ózbek tilindegi sentimental analiz ushın bir neshe arnawlı modeller jaylanǵan. Ulardıń ishinde belgili — `tahrirchi/UzBERT` — bul tek ózbek tili boyınsha tárbiyalengen BERT, biraq onıń sapası klient pikirleri korpusında úyrenilmegen. Basqa multilingual modeller — `cardiffnlp/twitter-xlm-roberta-base-sentiment` (CardiffNLP, 2022) Twitter tekstlerinde tárbiyalengen, biraq formal pikirlerde sapası ózgesheh.

Bizdiń jumıstıń bólegi retinde, baseline-modeli sıpatında `tabularisai/multilingual-sentiment-analysis` saylandı. Bul model XLM-RoBERTa tiykarında jasalǵan, 22 tilde tárbiyalengen, sonıń ishinde rus tili hám ózbek tili dáwirde. Ámeliy esaplawlardıń kórsetiwine kóre, bul model rus tilinde jaqsı, biraq ózbek tilindegi sapası 4 ese tómen — bul jaǵdayda baseline-modeldıń ámeliy biznes qararlarda qollanıwı qıyın.

**Sentimental analizdıń ámeliy ámelge asırıwında shártler**. Sentimental analiz tek model qollawı emes, balki tutıq tórtegi pipeline'tan turadı. Bul pipeline klassikalıq túrinde tómendegi etaplerge bólenedi:

1. *Maǵlıwmat jıynaw (Data Collection)* — klient pikirlerin avtomatik yamasa qol arqalı sira haqlarınan jıynaw. Marketpleyslerden jıynawda — REST API, GraphQL endpoints, web scraping (BeautifulSoup, Scrapy, Playwright).

2. *Maǵlıwmatlardı tegislew (Data Preprocessing)* — tekst tegisleniwi (cleaning), HTML tag'lardı óshiriw, kishirek harfke aylantırıw (lowercasing), nooǵan dúrik bóleklerdı óshiriw, til anıqlaw (language detection).

3. *Tokenization* — tekstti subword bóleklerge bólekleriw. BERT tiykarındaǵı modeller WordPiece, RoBERTa — Byte-Pair Encoding (BPE) qollanadı.

4. *Inference* — pre-trained sentiment-modeli arqalı klassifikatsiya. Bul jumis batch'lar arqalı (16-32 pikir bir vaqıtta) optimallashtırıladı.

5. *Postprocessing* — natija normallastırıw, tutıq pikirler arasındaǵı korrelyaciya hám statistikalıq taldaw.

6. *Vizualizatsiya hám interpretatsiya* — natijalardı dashboard, grafikler hám raport kórinisinde kórsetip beriw.

**Sentimental analizdıń ámeliy paydaları**. Sentimental analiz tek akademiyalıq qızıqlı emes — onıń ámeliy ámelge asırıwları kópshiligi:

*E-commerce*. Marketpleys hám online sotuw platformalarda sentiment-tiykarındaǵı kórsetkishler tovardıń popularlıǵın hám reklama strategiyasın anıqlawda paydalanılıp atır. Mısalı, Amazon kompaniyası óz reviewlerini avtomatik tagleydi.

*Brand monitoring*. Brandwatch, Sprinklr, Mention sıyaqlı kompaniyalar social tarmaqtaǵı brand atına tegisli pikirlerdı sentiment-tiykarında monitorinǵ qıladı. Bul kompaniyalar PR krizislerine tez reaktsiyaǵa imkan beredi.

*Customer Support*. Klient qollap-quwatlaw chat'larında klient hıslemánin avtomatik anıqlawı arqalı eń áhmiyetli zayavkalar prioritetlendiriledi.

*Financial markets*. Akciya bahalarınıń ózgerisi news article'lardaǵı sentiment-tiykarında shamalanadi (sentiment-driven trading).

*Politics & Public Policy*. Hákımiyat qararlarınıń public hıslemánin baha — election forecasting, policy assessment.

**Sentimental analizdiń kemshilikleri hám máseleleri**. Texnologiyanıń juqarı dárejedegi rawajlanıwına qaramastan, sentimental analiz tarawında bir neshe ámeliy másele bar:

*Sarkasm hám ironiya*. Tekstte «júdá ajayıb tovar, baytalın hech narsa», bunda klient ironiya qollap atır — biraq model bul tekstti pozitiv etip qabıllaydı. Sarkasm avtomatik anıqlaw — házirgi NLP'da sheshiwsiz másele.

*Kontekst*. «Telefonım sınıq» — bul shaǵım, biraq «Telefonım sınıq emes — tovar zo'r» — bul maqtaw. Modeldıń kontekstní tolıq túsinwi qıyın.

*Ózbek hám rus til aralashtırıw*. Ózbekstandıń klient pikirlerinde kóp jaǵdayda eki til aralasıp qollanıladı: «tovar yaxshi, dostavka долго». Multilingual modeller bul aralash kontekstní toymaytuǵın.

*Az resurs (low-resource languages)*. Ózbek hám qaraqalpaq tilleri ushın taza tárbiyalew korpusı júda az. Bul jaǵdayda multilingual modeller eski qollanılıp atırǵan, biraq olardıń sapası tólek emes.

*Domain shift*. Tárbiyalew korpusı sotsial tarmaqlardan, ámeliy ámelge asırıw — marketpleys klient pikirleri. Bul ekewinde til styli ózgesheh — modeldıń sapası bul «domain shift» problemasınan azaymaqta.

Solay etip, sentimental analiz tarawı zamanagóy NLP'tıń bárqarar baǵdarlardıń biri bolıp tabıladı. XLM-RoBERTa hám basqa Transformer-tiykarındaǵı multilingual modeller jaqsı baseline'lar beredi, biraq ózbek tili sıyaqlı az resurslı tiller ushın olardıń ámeliy sapası ózgesheh. Bul faktor bizdıń jumıstıń tiykarǵı orta noqatlarınıń biri bolıp tabıladı: biz ámeldegi multilingual baseline-modeldıń sapası ózbek tilindegi klient pikirlerinde sanlı bahalandık, hám buni jumıstıń úshinshi bapında tolıq sıpatlamız.

Sentimental analiz dáslepki etaplerden zamanagóy Transformer-modellerge shekem ózgesheh evolyutsionaldıq jol arqalı ótkende. Bul evolyutsiya kelesi quralları menen birge ámeliy biznes-qararlarda qollanılıp atır, ásirese e-commerce, marketing hám sociologiyada. Sondan keyin biz keyingi bólekte tovar talabın anıqlaw máselelerin hám sentiment-tiykarındaǵı kompozit kórsetkishlerdiń bul tarawda qollanıwın taldaymız.
