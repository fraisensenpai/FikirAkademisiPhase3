import React, { useState, useRef, useEffect } from 'react';
import { Book, Note, BookQuestion, QuizOption } from '../types';
import { detectChapterTitle } from '../lib/textSplitter';
import { fetchQuestionsForBook, saveQuestionAnswer } from '../lib/dataService';
import { useToast } from './Toast';
import { CheckCircle2, XCircle } from 'lucide-react';
import {
  ArrowLeft,
  Sliders,
  Bookmark,
  BookmarkCheck,
  List,
  Edit3,
  X,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Type,
  Sun,
  Moon,
  Coffee,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Send,
} from 'lucide-react';

interface BookReaderProps {
  book: Book;
  userId: string;
  onBack: () => void;
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  onDeleteNote: (id: string) => void;
  /** Sayfa değişiminde çağrılır; additionalSeconds varsa okuma süresine eklenir */
  onSaveProgress: (bookId: string, page: number, additionalSeconds?: number) => void;
  /** Sayfa değiştirmeden biriken aktif okuma süresini (sn) DB'ye yazar */
  onFlushReadingTime: (bookId: string, seconds: number) => void;
}

/** İleri sayfaya geçmek için aynı sayfada minimum kalınması gereken süre */
const MIN_PAGE_SECONDS = 4;
/** Biriken süreyi DB'ye yazma aralığı (saniye) */
const FLUSH_INTERVAL_SECONDS = 20;

export const BookReader: React.FC<BookReaderProps> = ({
  book,
  userId,
  onBack,
  notes,
  onAddNote,
  onDeleteNote,
  onSaveProgress,
  onFlushReadingTime,
}) => {
  const [currentPage, setCurrentPage] = useState(() => {
    if (book.currentPage && book.currentPage > 0) return Math.min(book.currentPage, book.totalPages || book.currentPage);
    return 1;
  });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [showNotesSidebar, setShowNotesSidebar] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Reader Preferences
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'jakarta'>('sans');
  const [themeMode, setThemeMode] = useState<'light' | 'sepia' | 'dark'>('light');

  // New note state
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedHighlightText, setSelectedHighlightText] = useState('');
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);

  // AI assistant state
  const [aiQuery, setAiQuery] = useState('');
  const [aiChatLog, setAiChatLog] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: `Merhaba! "${book.title}" kitabını okurken anlamadığın kavramları açıklayabilir, bölümü özetleyebilir veya okuma anlama soruları sorabilirim. Nasıl yardımcı olabilirim?`,
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const bookNotes = notes.filter((n) => n.bookId === book.id);
  const progressPercent = Math.min(100, Math.round((currentPage / (book.totalPages || 320)) * 100));

  // Her içerik elemanı bir sayfanın tam metnidir
  const pages = book.content || [];
  const totalPages = Math.max(pages.length, book.totalPages || 0);
  const pageText = pages[currentPage - 1] || '';

  // --- Hile denetimi: aktif okuma süresi takibi + hızlı sayfa çevirme engeli ---
  const { showToast } = useToast();
  const secondsRef = useRef(0);
  const lastFlipAtRef = useRef(Date.now());
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;

  // --- Soru noktaları ---
  const [questions, setQuestions] = useState<BookQuestion[]>([]);
  const [quiz, setQuiz] = useState<{ items: BookQuestion[]; index: number; targetPage: number } | null>(null);
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchQuestionsForBook(book.id, userId).then((qs) => {
      if (mounted) setQuestions(qs);
    });
    return () => {
      mounted = false;
    };
  }, [book.id, userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Sekme arka plandayken/görünür değilken süre işlemez ("açık bırakma" hilesine karşı)
      if (document.visibilityState === 'visible') {
        secondsRef.current += 1;
        if (secondsRef.current >= FLUSH_INTERVAL_SECONDS) {
          const s = secondsRef.current;
          secondsRef.current = 0;
          onFlushReadingTime(book.id, s);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      // Okuyucudan çıkarken kalan süreyi kaydet
      if (secondsRef.current > 0) {
        onFlushReadingTime(book.id, secondsRef.current);
        secondsRef.current = 0;
      }
    };
  }, [book.id]);

  const flushPendingSeconds = () => {
    if (secondsRef.current > 0) {
      const s = secondsRef.current;
      secondsRef.current = 0;
      onSaveProgress(book.id, currentPageRef.current, s);
    }
  };

  /** Gerçek sayfa geçişi */
  const performAdvance = (page: number) => {
    lastFlipAtRef.current = Date.now();
    flushPendingSeconds();
    const clamped = Math.max(1, Math.min(page, totalPages || page));
    setCurrentPage(clamped);
    onSaveProgress(book.id, clamped);
  };

  const handlePageChange = (page: number) => {
    const elapsed = (Date.now() - lastFlipAtRef.current) / 1000;

    // İleri sayfaya çok hızlı geçiş engellenir (okumadan tarama hilesi)
    if (page > currentPageRef.current && elapsed < MIN_PAGE_SECONDS) {
      showToast('Sayfaları çok hızlı çeviriyorsun! Biraz okuyup öyle geç 🧐', 'error');
      return;
    }

    // Soru kapısı: bu sayfayı bitirmiş olunan cevaplanmamış soru var mı?
    if (page > currentPageRef.current) {
      const pendingQs = questions.filter(
        (q) => q.page === currentPageRef.current && !q.mySelected
      );
      if (pendingQs.length > 0) {
        setSelectedOption(null);
        setQuiz({ items: pendingQs, index: 0, targetPage: page });
        return;
      }
    }

    performAdvance(page);
  };

  const handleQuizAnswer = async (opt: QuizOption) => {
    if (!quiz || selectedOption) return;
    setSelectedOption(opt);

    const q = quiz.items[quiz.index];
    const isCorrect = opt === q.correctOption;

    // Lokal olarak işaretle (tekrar sormasın)
    setQuestions((prev) =>
      prev.map((x) => (x.id === q.id ? { ...x, mySelected: opt } : x))
    );

    await saveQuestionAnswer(q.id, userId, opt, isCorrect);

    showToast(isCorrect ? 'Doğru cevap! 🎉' : 'Yanlış cevap 😔 Doğrusunu görebilirsin.', isCorrect ? 'success' : 'error');
  };

  const finishQuiz = () => {
    const target = quiz?.targetPage ?? currentPage + 1;
    setQuiz(null);
    setSelectedOption(null);
    performAdvance(target);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    onAddNote({
      bookId: book.id,
      page: currentPage,
      highlightedText: selectedHighlightText || 'Bölüm Notu (Sayfa ' + currentPage + ')',
      userNote: newNoteText.trim(),
    });

    setNewNoteText('');
    setSelectedHighlightText('');
  };

  const handleAiAction = (promptType: 'summary' | 'concept' | 'quiz') => {
    setIsAiLoading(true);
    let userMsg = '';
    let responseMsg = '';

    if (promptType === 'summary') {
      userMsg = 'Bu bölümün ana fikrini ve en önemli mesajını özetler misin?';
      responseMsg = `📌 **${book.title} - Bölüm Özeti:**\nBu bölümde mekanların ve mimarinin yalnızca fiziksel bir korunak değil, aynı zamanda insan psikolojisinin bir uzantısı olduğu vurgulanıyor. İyi tasarlanmış, aydınlık ve ferah mekanlar zihinsel dinginliğimizi artırırken; insanın kendi iç dünyasını yansıtan alanlarda daha huzurlu hissettiği savunuluyor.`;
    } else if (promptType === 'concept') {
      userMsg = '"Psikolojik Zırh (Psychological Armature)" kavramı ne anlama geliyor?';
      responseMsg = `💡 **Kavram Analizi:**\nMetindeki "psychological armature" ifadesi, yaşadığımız mekanların duygusal durumumuzu destekleyen, kırılganlıklarımızı koruyan ve ideal benliğimizi ayakta tutan içsel bir iskelet görevi gördüğünü açıklar. Evimiz sadece soğuktan korumaz, ruhumuzu da dengeler.`;
    } else if (promptType === 'quiz') {
      userMsg = 'Bölümü ne kadar anladığımı test etmek için bana 1 soru sor.';
      responseMsg = `❓ **Anlama Sorusu:**\nYazara göre karanlık/dar bir koridor ile güneş alan bir avlu arasındaki fark insan zihninde hangi temel duyguları tetikler? (Cevabını buraya yazabilirsin!)`;
    }

    setAiChatLog((prev) => [...prev, { role: 'user', text: userMsg }]);

    setTimeout(() => {
      setAiChatLog((prev) => [...prev, { role: 'ai', text: responseMsg }]);
      setIsAiLoading(false);
    }, 600);
  };

  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const userText = aiQuery;
    setAiChatLog((prev) => [...prev, { role: 'user', text: userText }]);
    setAiQuery('');
    setIsAiLoading(true);

    setTimeout(() => {
      setAiChatLog((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `"${userText}" sorunuz için metindeki bağlam oldukça önemlidir. Yazar, mekan seçiminin bireyin zihinsel sağlığı üzerindeki doğrudan etkisini savunur.`,
        },
      ]);
      setIsAiLoading(false);
    }, 700);
  };

  // Dynamic Theme Styling
  const getThemeClasses = () => {
    if (themeMode === 'sepia') {
      return {
        bg: 'bg-[#fbf0d9]',
        text: 'text-[#433422]',
        card: 'bg-[#f4e8c1]/60 border-[#e3d3a4]',
        header: 'bg-[#f7ebd0] border-[#decfa0]',
      };
    }
    if (themeMode === 'dark') {
      return {
        bg: 'bg-[#121820]',
        text: 'text-[#e2e8f0]',
        card: 'bg-[#1e293b] border-[#334155]',
        header: 'bg-[#0f172a] border-[#1e293b]',
      };
    }
    return {
      bg: 'bg-[#f7f9fb]',
      text: 'text-[#191c1e]',
      card: 'bg-white border-[#e0e3e5]',
      header: 'bg-white border-[#e0e3e5]',
    };
  };

  const themeStyle = getThemeClasses();

  return (
    <div className={`min-h-screen flex flex-col ${themeStyle.bg} ${themeStyle.text} antialiased transition-colors duration-200 selection:bg-[#6cf8bb] selection:text-[#002113]`}>
      {/* Top Reader Navigation Bar */}
      <header className={`sticky top-0 z-40 w-full h-16 flex justify-between items-center px-4 sm:px-8 border-b ${themeStyle.header} shadow-2xs transition-all`}>
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-600 hover:text-[#091426] transition-colors p-2 rounded-full hover:bg-black/5 focus:outline-none"
          title="Kütüphaneye Dön"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
            Kitaplık
          </span>
        </button>

        {/* Book Title & Progress */}
        <div className="flex flex-col items-center text-center px-2">
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-sm sm:text-base text-[#091426] truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {book.title}
          </h1>
          <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
            <span>Sayfa {currentPage} / {totalPages}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-emerald-700 font-bold">%{progressPercent} Okundu</span>
          </p>
        </div>

        {/* Reader Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Settings Tune Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full transition-colors ${
              showSettings ? 'bg-slate-200 text-[#091426]' : 'text-slate-600 hover:bg-black/5'
            }`}
            title="Görünüm Ayarları"
          >
            <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-600 hover:bg-black/5'
            }`}
            title={isBookmarked ? 'Yer İmi Eklendi' : 'Yer İmi Ekle'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-500" />
            ) : (
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Table of Contents Button */}
          <button
            onClick={() => setShowToc(!showToc)}
            className="p-2 text-slate-600 hover:bg-black/5 rounded-full transition-colors hidden sm:block"
            title="İçindekiler"
          >
            <List className="w-5 h-5" />
          </button>

          {/* Notes Toggle Button */}
          <button
            onClick={() => setShowNotesSidebar(!showNotesSidebar)}
            className={`p-2 rounded-full transition-colors relative ${
              showNotesSidebar ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-black/5'
            }`}
            title="Notlar & Vurgular"
          >
            <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
            {bookNotes.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
            )}
          </button>
        </div>
      </header>

      {/* Reader Settings Floating Popup */}
      {showSettings && (
        <div className="absolute top-16 right-4 sm:right-12 z-50 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Okuma Tercihleri
            </span>
            <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Yazı Boyutu</label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-center">
              {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`py-1.5 rounded-lg transition-all ${
                    fontSize === size ? 'bg-white shadow-xs text-[#091426]' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {size === 'sm' ? 'Küçük' : size === 'md' ? 'Orta' : size === 'lg' ? 'Büyük' : 'Çok Büyük'}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Yazı Tipi</label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
              <button
                onClick={() => setFontFamily('sans')}
                className={`py-1.5 px-2 border rounded-xl font-['Inter'] ${
                  fontFamily === 'sans' ? 'border-[#091426] bg-slate-50 font-bold' : 'border-slate-200'
                }`}
              >
                Inter
              </button>
              <button
                onClick={() => setFontFamily('jakarta')}
                className={`py-1.5 px-2 border rounded-xl font-['Plus_Jakarta_Sans'] ${
                  fontFamily === 'jakarta' ? 'border-[#091426] bg-slate-50 font-bold' : 'border-slate-200'
                }`}
              >
                Jakarta
              </button>
              <button
                onClick={() => setFontFamily('serif')}
                className={`py-1.5 px-2 border rounded-xl font-['Lora'] ${
                  fontFamily === 'serif' ? 'border-[#091426] bg-slate-50 font-bold' : 'border-slate-200'
                }`}
              >
                Serif
              </button>
            </div>
          </div>

          {/* Themes */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Tema</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setThemeMode('light')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border ${
                  themeMode === 'light' ? 'border-emerald-600 bg-slate-50 text-[#091426]' : 'border-slate-200 text-slate-600'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Açık
              </button>
              <button
                onClick={() => setThemeMode('sepia')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border bg-[#fbf0d9] text-[#433422] ${
                  themeMode === 'sepia' ? 'border-amber-700 font-bold ring-1 ring-amber-700' : 'border-[#e3d3a4]'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" /> Sepya
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border bg-[#0f172a] text-white ${
                  themeMode === 'dark' ? 'border-emerald-400 font-bold ring-1 ring-emerald-400' : 'border-slate-700'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Koyu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table of Contents Modal */}
      {showToc && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#091426]">
                İçindekiler ({book.title})
              </h3>
              <button onClick={() => setShowToc(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {pages.length > 0 ? (
                pages.map((pageContent, idx) => {
                  const pageNum = idx + 1;
                  const chapterTitle = detectChapterTitle(pageContent);
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        handlePageChange(pageNum);
                        setShowToc(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm transition-colors ${
                        currentPage === pageNum
                          ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="line-clamp-1">
                        {chapterTitle ? `${chapterTitle} — Sayfa ${pageNum}` : `Sayfa ${pageNum}`}
                      </span>
                      <span className="text-xs text-slate-400">syf. {pageNum}</span>
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 p-3">Bu kitap için içindekiler bulunmuyor.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Reader Canvas + Notes Sidebar Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Document Scroll Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden flex justify-center pb-24 px-4 sm:px-6">
          <article
            className={`max-w-[720px] w-full px-5 sm:px-10 py-8 ${themeStyle.card} shadow-sm mx-auto my-6 sm:my-8 rounded-2xl min-h-[750px] relative transition-all`}
          >
            {/* Chapter Header */}
            <div className="mb-8">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-1">
                {book.category} • {book.author}
              </span>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-[#091426] tracking-tight">
                {book.chapterTitle || book.title}
              </h2>
              {book.chapterSubtitle && (
                <p className="text-sm font-medium text-slate-500 mt-1">
                  {book.chapterSubtitle}
                </p>
              )}
            </div>

            {/* Page Text Content */}
            <div
              className={`leading-relaxed space-y-5 ${
                fontFamily === 'serif'
                  ? "font-['Lora',serif]"
                  : fontFamily === 'jakarta'
                  ? "font-['Plus_Jakarta_Sans']"
                  : "font-['Inter']"
              } ${
                fontSize === 'sm'
                  ? 'text-sm leading-6'
                  : fontSize === 'md'
                  ? 'text-base leading-7'
                  : fontSize === 'lg'
                  ? 'text-lg leading-8'
                  : 'text-xl leading-9'
              }`}
            >
              {pageText ? (
                <>
                  {/* İlk sayfada kitap tanıtımı ve alıntı */}
                  {currentPage === 1 && (
                    <>
                      {book.description && (
                        <p className="text-slate-600 italic bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                          {book.description}
                        </p>
                      )}
                      {book.illustrationUrl && (
                        <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
                          <img
                            src={book.illustrationUrl}
                            alt={`${book.title} kapak görseli`}
                            className="w-full h-64 sm:h-80 object-cover"
                          />
                        </div>
                      )}
                      {book.quote && (
                        <blockquote className="border-l-4 border-[#091426] pl-4 sm:pl-6 my-6 italic text-slate-700 font-medium text-base sm:text-lg bg-slate-50/70 p-4 rounded-r-xl">
                          {book.quote}
                        </blockquote>
                      )}
                    </>
                  )}

                  {/* Sayfanın asıl metni (paragraflara bölünmüş) */}
                  {pageText.split(/\n{2,}/).map((para, i) => (
                    <p key={i} className={i === 0 && currentPage > 1 ? 'indent-8' : ''}>
                      {para}
                    </p>
                  ))}
                </>
              ) : (
                <p className="text-slate-400">Bu sayfa boş veya içerik yüklenmedi.</p>
              )}
            </div>

            {/* End of chapter divider & Page switcher */}
            <div className="mt-12 pt-6 border-t border-slate-200/80 flex items-center justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Önceki Sayfa
              </button>

              <span className="text-xs font-semibold text-slate-400">
                Sayfa {currentPage}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-[#091426] text-white hover:bg-[#1e293b] transition-colors"
              >
                Sonraki Sayfa <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        </main>

        {/* Right Sidebar for Notes & Highlights */}
        {showNotesSidebar && (
          <aside className="w-80 sm:w-96 bg-white border-l border-slate-200 flex flex-col z-30 shadow-lg animate-in slide-in-from-right duration-300">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#091426] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                Notlar & Vurgular ({bookNotes.length})
              </h3>
              <button
                onClick={() => setShowNotesSidebar(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {bookNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl hover:shadow-xs transition-shadow group relative"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Sayfa {note.page}
                    </span>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity"
                      title="Notu Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-[#091426] mb-1.5 border-l-2 border-emerald-500 pl-2 italic">
                    "{note.highlightedText}"
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {note.userNote}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-2 block">{note.createdAt}</span>
                </div>
              ))}

              {/* Add Note Box */}
              <form onSubmit={handleSaveNote} className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Sayfa {currentPage} İçin Not Ekle
                </label>
                {selectedHighlightText && (
                  <div className="text-[11px] bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-emerald-800">
                    <span className="font-bold">Seçilen Alıntı:</span> "{selectedHighlightText}"
                  </div>
                )}
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Bu sayfa veya kavramla ilgili kendi akademik notunu yaz..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#091426] focus:outline-none resize-none transition-shadow"
                  rows={3}
                ></textarea>
                <div className="flex justify-end gap-2">
                  {selectedHighlightText && (
                    <button
                      type="button"
                      onClick={() => setSelectedHighlightText('')}
                      className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                    >
                      İptal
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-[#091426] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1e293b] transition-colors"
                  >
                    Notu Kaydet
                  </button>
                </div>
              </form>
            </div>
          </aside>
        )}
      </div>

      {/* Quiz Modal (soru kapısı) */}
      {quiz && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#091426]">
                    Soru Noktası
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sayfa {quiz.items[quiz.index].page} • Soru {quiz.index + 1}/{quiz.items.length}
                  </p>
                </div>
              </div>
            </div>

            {(() => {
              const q = quiz.items[quiz.index];
              const answered = selectedOption !== null;
              return (
                <>
                  <p className="text-sm font-semibold text-[#091426] leading-relaxed">{q.question}</p>

                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const isSelected = selectedOption === opt.key;
                      const isCorrectOpt = opt.key === q.correctOption;
                      let cls = 'border-slate-200 hover:border-[#091426] hover:bg-slate-50';
                      if (answered && isCorrectOpt) cls = 'border-emerald-400 bg-emerald-50';
                      else if (answered && isSelected) cls = 'border-red-300 bg-red-50';
                      else if (answered) cls = 'border-slate-200 opacity-50';

                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleQuizAnswer(opt.key)}
                          disabled={answered}
                          className={`w-full flex items-center justify-between gap-2 p-3 border rounded-xl text-left text-xs font-medium transition-all disabled:cursor-default ${cls}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {opt.key}
                            </span>
                            {opt.text}
                          </span>
                          {answered && isCorrectOpt && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {answered && isSelected && !isCorrectOpt && (
                            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {answered && (
                    <button
                      onClick={() => {
                        if (quiz.index + 1 < quiz.items.length) {
                          setSelectedOption(null);
                          setQuiz({ ...quiz, index: quiz.index + 1 });
                        } else {
                          finishQuiz();
                        }
                      }}
                      className="w-full py-2.5 bg-[#091426] hover:bg-[#1e293b] text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      {quiz.index + 1 < quiz.items.length ? 'Sonraki Soru' : 'Okumaya Devam Et →'}
                    </button>
                  )}

                  {!answered && (
                    <p className="text-[11px] text-slate-400 text-center">
                      Cevabını seç — doğru/yanlış anında görülür ve öğretmenine kaydedilir.
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Floating Action Button: AI Assistant (Bottom Right) */}
      <button
        onClick={() => setShowAiModal(true)}
        aria-label="Yapay Zeka Okuma Asistanı"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#006c49] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#005236] hover:scale-105 active:scale-95 transition-all z-40 group"
        title="Yapay Zeka Okuma Asistanı"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* AI Assistant Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-slate-800 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#091426]">
                    Fikir AI • Okuma Asistanı
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {book.title} {book.chapterTitle ? `• ${book.chapterTitle}` : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => handleAiAction('summary')}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold rounded-full whitespace-nowrap transition-colors"
              >
                📄 Bölümü Özetle
              </button>
              <button
                onClick={() => handleAiAction('concept')}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 text-xs font-semibold rounded-full whitespace-nowrap transition-colors"
              >
                💡 Kavramı Açıkla
              </button>
              <button
                onClick={() => handleAiAction('quiz')}
                className="px-3 py-1.5 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-semibold rounded-full whitespace-nowrap transition-colors"
              >
                ❓ Beni Sına (Quiz)
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl min-h-[220px]">
              {aiChatLog.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#091426] text-white rounded-br-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Fikir AI analiz ediyor...
                  </div>
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendAiMessage} className="flex gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Kitapla veya kavramlarla ilgili soru sor..."
                className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#006c49] text-white p-2.5 rounded-xl hover:bg-[#005236] transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Sticky Progress Bar */}
      <footer className="fixed bottom-0 left-0 w-full h-1.5 bg-[#e0e3e5] z-30">
        <div
          className="h-full bg-[#006c49] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </footer>
    </div>
  );
};
