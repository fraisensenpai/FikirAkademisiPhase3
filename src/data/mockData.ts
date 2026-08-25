import { Book, Badge, StudentProgress, Note, Assignment } from '../types';

export const initialBooks: Book[] = [
  {
    id: 'arch-happiness',
    title: 'The Architecture of Happiness',
    author: 'Alain de Botton',
    category: 'Felsefe',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    totalPages: 320,
    currentPage: 45,
    progressPercent: 14,
    description: 'Binaların, mekanların ve mimarinin insan psikolojisi ve mutluluğu üzerindeki derin etkilerini inceleyen felsefi bir başyapıt.',
    chapterTitle: 'Chapter 3: The Importance of Shelter',
    chapterSubtitle: 'Mekanın Ruhu ve İçsel Dinginlik',
    illustrationUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBglVOMgleMIld2tH1hCRCkr9UxXdyTy5gmcLxF6ovwbU0JhmQH-gH2XPjkCrRo8mClnDIQybdL_6R6xdVIGQ0EO2COIcF7ECN90oEqvHmBmiDTSexRDiNgVp-gVxjYZs7w_riwWH8GV1dzVXS9Bm6uXz92a33kqMxEJjKs6__02Zi4CVgWZc1O9v8w5KbYsD5g5vd2AreXbqLuWX_4teVtgYUvs94cWYl4HKXrg7Gxyfyt2Ba_1vdMRQ',
    quote: '"We need our rooms to align us to desirable versions of ourselves and to keep alive the important, evanescent sides of us."',
    content: [
      "It is an enduring human trait to seek spaces that reflect our aspirations. The buildings we inhabit are not merely physical shelters; they are psychological armatures. When we consider the spaces that make us feel most 'at home', we are often identifying environments that resonate with our inner ideals of order, calm, or stimulation.",
      "Consider the difference between a cramped, poorly lit corridor and a sweeping, sunlit atrium. The former may induce anxiety, while the latter can inspire a sense of possibility. This is not subjective fancy; it is a profound interaction between our nervous system and our physical environment. The architecture we choose to surround ourselves with is, in essence, a declaration of the psychological state we wish to inhabit.",
      "Therefore, the pursuit of beauty in our surroundings is not a trivial luxury but a crucial component of our well-being. It is a quest to align our physical world with our most cherished internal values. When a room feels 'right', it is often because it manages to articulate a complex emotional state that we struggle to express in words.",
      "To design a home, then, is to design a psychological landscape. It requires an honesty about our vulnerabilities and an understanding of the specific visual cues that bring us comfort or focus. A minimalist environment might soothe a chaotic mind, while a richly textured, vibrant space might energize a melancholic spirit.",
      "The ultimate goal of architecture is not just to provide shelter from the elements, but to offer a sanctuary for the self."
    ],
    isAssigned: false,
    tags: ['Mimarlık', 'Felsefe', 'Psikoloji']
  },
  {
    id: '1984',
    title: '1984',
    author: 'George Orwell',
    category: 'Klasikler',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80',
    totalPages: 352,
    currentPage: 228,
    progressPercent: 65,
    description: 'Totaliter rejimlerin gözetleme toplumunu ve düşünce özgürlüğünün bastırılmasını anlatan kült distopya.',
    chapterTitle: 'Kısım 1: Bölüm 1 - Büyük Birader Seni İzliyor',
    chapterSubtitle: 'Nisan ayı soğuk ve berrak bir gündü...',
    illustrationUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    quote: '"Geçmişi kontrol eden geleceği kontrol eder; bugünü kontrol eden geçmişi kontrol eder."',
    content: [
      "Hava açık ve soğuk bir nisan günüydü; saatler on üçü vuruyordu. Winston Smith, dondurucu rüzgardan kaçmak için çenesini göğsüne gömmüş, Zafer Konutları'nın cam kapısından içeri hızla süzüldü; gerçi içeriye toz bulutunun girmesini engelleyecek kadar hızlı davranamamıştı.",
      "Giriş holü haşlanmış lahana ve eski paspas kokuyordu. Koridorun dip tarafında, duvara raptiyelenmiş renkli bir afiş asılıydı. Afiş, kocaman bir insan yüzünü gösteriyordu; genişliği bir metreyi aşan bu yüz, siyah bıyıklı, sert çizgili, kırk beş yaşlarında bir adamın yüzüydü.",
      "Winston merdivenlere yöneldi. Asansörü denemenin faydası yoktu; en iyi zamanlarda bile nadiren çalışırdı ve şu sıralar Nefret Haftası hazırlıkları yüzünden gündüz saatlerinde elektrik kısıntısına gidiliyordu.",
      "Daireye girdiğinde, madeni bir ses bir dizi rakamı tekdüze bir tonla okumaktaydı. Ses, tele-ekran adı verilen dikdörtgen metal levhadan geliyordu. Tele-ekran hem ses hem görüntü alıp verebiliyordu.",
      "Winston tele-ekrana arkasını döndü. Tele-ekranın kapsama alanından çıkmak mümkün değildi ama yüz ifadenizi gizlemek mümkündü."
    ],
    isAssigned: true,
    dueDate: '15 Kasım',
    statusBadge: 'Devam Ediyor',
    tags: ['Distopya', 'Politik', 'Klasik']
  },
  {
    id: 'sapiens',
    title: 'Sapiens: Hayvanlardan Tanrılara',
    author: 'Yuval Noah Harari',
    category: 'Tarih',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    totalPages: 512,
    currentPage: 0,
    progressPercent: 0,
    description: 'İnsan türünün ortaya çıkışından bilişsel devrime, tarımdan yapay zekaya uzanan insanlık tarihi.',
    chapterTitle: 'Bölüm 1: Önemsiz Bir Hayvan',
    chapterSubtitle: 'Bilişsel Devrimin Şafağında İnsan',
    illustrationUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop&q=80',
    quote: '"Bilişsel Devrim, tarihin biyolojiden bağımsızlığını ilan ettiği noktadır."',
    content: [
      "Yaklaşık 13.5 milyar yıl önce Büyük Patlama adı verilen bir olayla madde, enerji, zaman ve uzay ortaya çıktı. Evrenimizin bu temel özelliklerinin hikayesine fizik denir.",
      "Ortaya çıkışlarından yaklaşık 300 bin yıl sonra madde ve enerji, atom adı verilen karmaşık yapılarda bir araya geldi ve bunlar da zamanla molekülleri oluşturdu. Atomların, moleküllerin ve bunların etkileşimlerinin hikayesine kimya denir.",
      "Yaklaşık 3.8 milyar yıl önce, Dünya adı verilen gezegende bazı moleküller bir araya gelerek organizma adı verilen olağanüstü karmaşık yapılar oluşturdular. Organizmaların hikayesine biyoloji denir.",
      "Yaklaşık 70 bin yıl önce Homo sapiens türüne mensup organizmalar kültür adı verilen daha da karmaşık yapılar kurmaya başladı. Bu insan kültürlerinin gelişim hikayesine ise tarih denir.",
      "Sapiens'in dünyayı fethetmesini sağlayan asıl yetenek, kurgusal gerçeklikler (ortak mitler, para, dinler, yasalar) yaratabilmesi ve bunlara milyonlarca bireyin aynı anda inanabilmesidir."
    ],
    isAssigned: true,
    dueDate: '22 Kasım',
    statusBadge: 'Yeni',
    tags: ['Tarih', 'Antropoloji', 'Bilim']
  },
  {
    id: 'donusum',
    title: 'Dönüşüm',
    author: 'Franz Kafka',
    category: 'Klasikler',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
    totalPages: 160,
    currentPage: 64,
    progressPercent: 40,
    description: 'Gregor Samsa bir sabah huzursuz düşlerden uyandığında, kendini yatağında devasa bir böceğe dönüşmüş olarak bulur.',
    chapterTitle: '1. Bölüm: Gregor Samsa\'nın Uyanışı',
    chapterSubtitle: 'Yabancılaşma ve Modern İnsan Bunalımı',
    illustrationUrl: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=800&auto=format&fit=crop&q=80',
    quote: '"Gregor Samsa bir sabah bunaltıcı düşlerden uyandığında, kendini yatağında dev bir böceğe dönüşmüş buldu."',
    content: [
      "Gregor Samsa bir sabah bunaltıcı düşlerden uyandığında, kendini yatağında dev bir böceğe dönüşmüş buldu. Zırh gibi sertleşmiş sırtının üstünde yatıyordu ve başını biraz kaldırdığında, yay biçiminde sertleşmiş kahverengi boğumlarla bölünmüş kubbeli karnını gördü.",
      "Gözü masanın üzerinde duran çalar saate kaydı. Saat altıyı buçuk geçiyordu ve yelkovan sessizce ama acımasızca ilerliyordu. 'Tanrım,' diye düşündü, 'ne kadar yorucu bir meslek seçmişim! Gün geçmiyor ki yollarda olmayayım.'",
      "Kumaş numuneleriyle dolu bavulunu hazırlaması ve sabah yedi trenine yetişmesi gerekiyordu. Ama şu anda sırt üstü yatıyordu ve vücudunu kontrol etmekte zorlanıyordu.",
      "Kapı hafifçe vuruldu. 'Gregor,' dedi annesi, 'saat yediye çeyrek var, gitmeyecek miydin?' Gregor sesini duyduğunda dehşete düştü; kendi sesi acınası, hırıltılı bir vızıltıya dönüşmüştü.",
      "İçindeki yabancılaşma sadece bedenine değil, ailesine ve onu yalnızca bir geçim kaynağı olarak gören sisteme karşı da hızla derinleşiyordu."
    ],
    isAssigned: false,
    tags: ['Edebiyat', 'Varoluşçuluk', 'Alman Edebiyatı']
  },
  {
    id: 'korluk',
    title: 'Körlük',
    author: 'José Saramago',
    category: 'Klasikler',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd7?w=600&auto=format&fit=crop&q=80',
    totalPages: 336,
    currentPage: 110,
    progressPercent: 32,
    description: 'Bilinmeyen bir nedenle tüm kentin aniden beyaz bir körlüğe yakalanmasıyla başlayan toplumsal ahlak ve vicdan sınavı.',
    chapterTitle: 'Bölüm 1: Beyaz Süt Denizi',
    chapterSubtitle: 'Trafik Işığında Başlayan Sessizlik',
    illustrationUrl: 'https://images.unsplash.com/photo-1507842229451-79b1be046a22?w=800&auto=format&fit=crop&q=80',
    quote: '"Aslında körlük, görmezden gelmeyi seçtiğimiz şeylerin toplamıdır."',
    content: [
      "Trafik ışığı kırmızıdan yeşile döndü. Ancak öndeki araba hareket etmedi. Arkadaki sürücüler sabırsızlıkla kornalarına bastılar. Arabanın içindeki adam aniden direksiyona kapandı ve 'Göremiyorum! Hiçbir şey göremiyorum!' diye bağırdı.",
      "Gözleri açıktı ama karanlık değildi gördüğü; tam tersine, yoğun, süt beyazı bir sisin içinde kaybolmuş gibiydi.",
      "Bu beklenmedik salgın, dokunduğu her insana hızla bulaşıyor, şehri birkaç gün içinde çaresizlik ve panik dalgasına sürüklüyordu.",
      "Hükümet, enfekte olanları eski bir akıl hastanesinde karantinaya almaya karar verdi. Ancak körler koğuşunda hayatta kalmanın tek kuralı vicdanın korunmasıydı.",
      "Doktorun karısı ise sırrını koruyordu: O, aralarındaki tek gören kişiydi ve insanlığın çöküşüne tanıklık ediyordu."
    ],
    isAssigned: false,
    tags: ['Nobel Ödüllü', 'Distopya', 'Toplum']
  },
  {
    id: 'devlet',
    title: 'Devlet',
    author: 'Platon',
    category: 'Felsefe',
    coverUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    totalPages: 480,
    currentPage: 96,
    progressPercent: 20,
    description: 'Adalet, ideal devlet düzeni, erdem ve mağara alegorisi üzerine Sokrates ve arkadaşlarının ölümsüz diyaloğu.',
    chapterTitle: 'Kitap VII: Mağara Alegorisi',
    chapterSubtitle: 'Işık, Gölge ve Hakikat Arayışı',
    illustrationUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&auto=format&fit=crop&q=80',
    quote: '"İnsanlar mağarada zincirlenmiş mahkûmlar gibidir; tek gördükleri duvara vuran gölgelerdir."',
    content: [
      "— Şimdi sana insan doğasının eğitimle aydınlanmış ve aydınlanmamış durumunu bir benzetmeyle anlatayım. Yeraltında bir mağara düşün; girişi boydan boya ışığa açılmış olsun.",
      "— İnsanlar çocukluklarından beri orada yaşamakta; bacaklarından ve boyunlarından zincirlenmişler, öyle ki ne yerlerinden kıpırdayabiliyor ne de arkalarına bakabiliyorlar, yalnızca önlerindeki duvara bakabiliyorlar.",
      "— Arkalarında, yüksekçe bir yerde bir ateş yanıyor. Ateşle mahkûmlar arasında bir yol var; yol boyunca alçak bir duvar örülmüş, kuklacıların seyircilerin önüne koydukları bölme gibi.",
      "— Bu duvarın arkasından insanlar ellerinde taştan, tahtadan yapılmış türlü türlü eşyalar, insan ve hayvan heykelleri taşıyarak geçiyorlar.",
      "— Mahkûmlar gerçekliği sadece bu gölgelerden ibaret sanırlar. Biri serbest kalıp güneşe çıktığında ilk başta gözleri kamaşır ama zamanla hakikatin kendisini görür."
    ],
    isAssigned: false,
    tags: ['Antik Yunan', 'Felsefe', 'Politika']
  },
  {
    id: 'insan-neyle-yasar',
    title: 'İnsan Neyle Yaşar?',
    author: 'Leo Tolstoy',
    category: 'Klasikler',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80',
    totalPages: 120,
    currentPage: 82,
    progressPercent: 68,
    description: 'Tolstoy’un sevgi, şefkat, fedakarlık ve insanın özündeki iyilik üzerine yazdığı zamansız ahlaki hikayeler.',
    chapterTitle: '1. Hikaye: Simon ve Mihail',
    chapterSubtitle: 'Tanrı Sevgidir ve Sevginin Olduğu Yerde Yaşar',
    illustrationUrl: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=800&auto=format&fit=crop&q=80',
    quote: '"İnsanlar kendilerine duydukları özenle değil, birbirlerine duydukları sevgiyle yaşarlar."',
    content: [
      "Simon adında fakir bir kunduracı, karısı ve çocuklarıyla bir köylünün evinde kirada oturuyordu. Simon’un ne toprağı vardı ne evi; tek geçim kaynağı kunduracılıktı.",
      "Kış gelmişti ve Simon’un kalın bir kürkü yoktu. Karısıyla ortak kullandıkları tek bir kürk vardı o da artık lime lime olmuştu. Köylülerden alacaklarını toplayıp yeni bir kürk diktirmek için kasabaya gitti.",
      "Fakat borçluların neredeyse hiçbiri para ödeyemedi. Simon eli boş, donmuş vaziyette köye dönerken yol kenarındaki tapınak duvarının dibinde çıplak ve titreyen bir genç adam gördü.",
      "Önce korktu ve yanından geçip gitmek istedi. Fakat sonra vicdanı sızladı; sırtındaki eski ceketi çıkarıp o gence giydirdi ve evine davet etti.",
      "Bu genç adam, Tanrı tarafından cezalandırılmış ve yeryüzüne üç büyük hakikati öğrenmek üzere gönderilmiş bir melekti: İnsanda ne var? İnsana ne verilmemiştir? Ve insan neyle yaşar?"
    ],
    isAssigned: false,
    tags: ['Ahlak Felsefesi', 'Rus Edebiyatı', 'Klasik']
  },
  {
    id: 'letranger',
    title: "L'Étranger (Yabancı)",
    author: 'Albert Camus',
    category: 'Klasikler',
    coverUrl: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=80',
    totalPages: 180,
    currentPage: 36,
    progressPercent: 20,
    description: 'Toplumsal normlara uymayı reddeden Meursault’nun yabancılaşmasını anlatan absürdizm başyapıtı.',
    chapterTitle: 'Bölüm 1: Bugün Annem Öldü',
    chapterSubtitle: 'Cezayir Güneşi Altında Kayıtsızlık',
    illustrationUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    quote: '"Bugün annem öldü. Belki de dündü, tam hatırlamıyorum."',
    content: [
      "Bugün annem öldü. Belki de dündü, bilmiyorum. İhtiyarlar yurdundan bir telgraf aldım: 'Anneniz vefat etti. Cenaze yarın. Derin saygılar.' Bundan bir şey anlaşılmıyor. Belki de dündü.",
      "İhtiyarlar yurdu Marengo'daydı, Cezayir'den seksen kilometre kadar uzakta. Saat ikideki otobüse binecek, öğleden sonra varacaktım. Böylece geceyi başında bekleyerek geçirebilecek ve yarın akşam dönebilecektim.",
      "Müdürün odasına girdiğimde bana çok iyi davrandı. 'Annenizi burada daha iyi ağırladığımızı düşünüyorduk,' dedi. Ben de 'Evet, efendim' dedim.",
      "Cenaze töreni sırasında hava çok sıcaktı. Güneş gökyüzünde parıldıyor ve kumları yakıyordu. İnsanların benden beklediği gözyaşlarını dökemedim çünkü rol yapmayı bilmiyordum."
    ],
    isAssigned: false,
    tags: ['Varoluşçuluk', 'Fransız Edebiyatı']
  },
  {
    id: 'neuron-networks',
    title: 'Nöron Ağları ve Bilişsel Bilim',
    author: 'Doç. Dr. Elif Kaya',
    category: 'Bilim',
    coverUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop&q=80',
    totalPages: 290,
    currentPage: 72,
    progressPercent: 25,
    description: 'İnsan beyninin sinirsel mimarisi ile modern yapay sinir ağları arasındaki biyolojik ve algoritmik köprü.',
    chapterTitle: 'Bölüm 2: Sinaptik Plastisite ve Öğrenme',
    chapterSubtitle: 'Hebb Kuralı ve Derin Öğrenme Katmanları',
    illustrationUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80',
    quote: '"Birlikte ateşlenen nöronlar, birbirine bağlanır."',
    content: [
      "İnsan beyni yaklaşık 86 milyar nörondan ve bu nöronlar arasındaki 100 trilyondan fazla sinaptik bağlantıdan oluşur.",
      "Donald Hebb'in 1949'da ortaya koyduğu biyolojik öğrenme ilkesi, modern yapay zekanın geriye yayılım (backpropagation) algoritmalarına ilham kaynağı olmuştur.",
      "Beynimiz yeni bir kavram öğrendiğinde elektriksel ve kimyasal sinapsların iletkenliği değişir. Bu durum sinir ağlarında ağırlık (weight) optimizasyonuna karşılık gelir.",
      "Görsel korteksin katmanlı yapısı, evrişimli sinir ağlarının (CNN) piksellerden kenarlara, kenarlardan nesnelere doğru hiyerarşik özellik çıkarım mekanizmasının doğrudan temelidir."
    ],
    isAssigned: false,
    tags: ['Yapay Zeka', 'Sinirbilim', 'Bilişsel Bilim']
  }
];

export const mockBadges: Badge[] = [
  {
    id: 'b1',
    title: 'İlk Kitap',
    icon: 'auto_stories',
    bgColor: 'bg-secondary',
    textColor: 'text-white',
    earnedDate: '12 Eki',
    description: 'İlk kitabını başarıyla tamamladın.'
  },
  {
    id: 'b2',
    title: 'Hızlı Okur',
    icon: 'speed',
    bgColor: 'bg-[#006c49]',
    textColor: 'text-white',
    earnedDate: '18 Eki',
    description: 'Haftada 200 sayfa barajını aştın.'
  },
  {
    id: 'b3',
    title: 'Filozof',
    icon: 'psychology',
    bgColor: 'bg-[#1e293b]',
    textColor: 'text-white',
    earnedDate: '29 Eki',
    description: 'Felsefe kategorisinde 3 kitap bitirdin.'
  },
  {
    id: 'b4',
    title: 'Gece Kuşu',
    icon: 'bedtime',
    bgColor: 'bg-[#35260c]',
    textColor: 'text-[#fadfb8]',
    earnedDate: '04 Kas',
    description: 'Gece saatlerinde kesintisiz 45 dakika okuma yaptın.'
  }
];

export const mockInitialNotes: Note[] = [
  {
    id: 'n1',
    bookId: 'arch-happiness',
    page: 45,
    highlightedText: 'offer a sanctuary for the self.',
    userNote: 'Bölümün ana tezi. Fiziksel mekanların doğrudan psikolojik refah ve dinginlikle olan güçlü bağını ifade ediyor.',
    createdAt: 'Bugün, 14:22'
  },
  {
    id: 'n2',
    bookId: 'arch-happiness',
    page: 45,
    highlightedText: 'The buildings we inhabit are not merely physical shelters; they are psychological armatures.',
    userNote: 'Mimarlık dersi sunumu için harika bir referans alıntısı.',
    createdAt: 'Dün, 18:40'
  },
  {
    id: 'n3',
    bookId: '1984',
    page: 12,
    highlightedText: 'Geçmişi kontrol eden geleceği kontrol eder.',
    userNote: 'Hakikat Bakanlığı ve dilin manipülasyonu kavramını açıklıyor.',
    createdAt: '3 gün önce'
  }
];

export const mockStudents: StudentProgress[] = [
  {
    id: 's1',
    name: 'Ayşe',
    surname: 'Yılmaz',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    classGrade: '10-A',
    schoolNumber: '1042',
    progressPercent: 100,
    status: 'Tamamladı',
    pagesRead: 352,
    lastActive: '10 dk önce'
  },
  {
    id: 's2',
    name: 'Burak',
    surname: 'Kaya',
    avatarUrl: '',
    classGrade: '10-A',
    schoolNumber: '1088',
    progressPercent: 65,
    status: 'Devam Ediyor',
    pagesRead: 228,
    lastActive: '1 saat önce'
  },
  {
    id: 's3',
    name: 'Caner',
    surname: 'Çelik',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    classGrade: '10-A',
    schoolNumber: '1105',
    progressPercent: 0,
    status: 'Başlamadı',
    pagesRead: 0,
    lastActive: '2 gün önce'
  },
  {
    id: 's4',
    name: 'Zeynep',
    surname: 'Demir',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    classGrade: '10-A',
    schoolNumber: '1134',
    progressPercent: 85,
    status: 'Devam Ediyor',
    pagesRead: 298,
    lastActive: '25 dk önce'
  },
  {
    id: 's5',
    name: 'Mert',
    surname: 'Öztürk',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    classGrade: '10-A',
    schoolNumber: '1240',
    progressPercent: 100,
    status: 'Tamamladı',
    pagesRead: 352,
    lastActive: '3 saat önce'
  }
];

export const mockAssignments: Assignment[] = [
  {
    id: 'asg-1',
    bookId: '1984',
    bookTitle: '1984',
    bookAuthor: 'George Orwell',
    targetClass: '10-A',
    dueDate: '15 Kasım',
    assignedDate: '1 Kasım',
    totalStudents: 32,
    completedStudents: 18,
    avgProgress: 68
  },
  {
    id: 'asg-2',
    bookId: 'sapiens',
    bookTitle: 'Sapiens',
    bookAuthor: 'Yuval Noah Harari',
    targetClass: '10-A',
    dueDate: '22 Kasım',
    assignedDate: '8 Kasım',
    totalStudents: 32,
    completedStudents: 4,
    avgProgress: 24
  }
];
