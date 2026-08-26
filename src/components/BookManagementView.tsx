import React, { useRef, useState } from 'react';
import { Book } from '../types';
import { Upload, FileText, Trash2, BookPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { createBookFromText, deleteBook } from '../lib/dataService';
import { splitTextIntoPages } from '../lib/textSplitter';

interface BookManagementViewProps {
  books: Book[];
  onBookAdded: () => void;
  onSelectBook: (book: Book) => void;
}

const CATEGORIES = ['Klasikler', 'Bilim', 'Tarih', 'Felsefe', 'Psikoloji', 'Edebiyat'];

export const BookManagementView: React.FC<BookManagementViewProps> = ({
  books,
  onBookAdded,
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [fileName, setFileName] = useState('');

  // Durum
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canlı sayfa önizlemesi
  const previewPages = textContent.trim() ? splitTextIntoPages(textContent) : [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.txt')) {
      setFeedback({ type: 'err', msg: 'Lütfen .txt uzantılı bir dosya seçin.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const content = (reader.result as string) || '';
      setTextContent(content);
      setFileName(file.name);
      setFeedback(null);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim() || !author.trim() || !textContent.trim()) {
      setFeedback({ type: 'err', msg: 'Başlık, yazar ve metin içeriği zorunludur.' });
      return;
    }

    if (previewPages.length === 0) {
      setFeedback({ type: 'err', msg: 'Metin boş görünüyor, sayfaya bölünemedi.' });
      return;
    }

    setSaving(true);
    const result = await createBookFromText({
      title: title.trim(),
      author: author.trim(),
      category,
      description: description.trim(),
      coverUrl: coverUrl.trim() || undefined,
      textContent,
    });
    setSaving(false);

    if (result.success) {
      setFeedback({
        type: 'ok',
        msg: `"${title}" yüklendi! ${result.pageCount} sayfaya bölündü.`,
      });
      setTitle('');
      setAuthor('');
      setDescription('');
      setCoverUrl('');
      setTextContent('');
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      onBookAdded();
    } else {
      setFeedback({ type: 'err', msg: 'Kitap kaydedilemedi. Tekrar deneyin.' });
    }
  };

  const handleDeleteBook = async (book: Book) => {
    if (!confirm(`"${book.title}" kitabını ve tüm okuma ilerlemelerini silmek istediğine emin misin?`)) return;
    const ok = await deleteBook(book.id);
    if (ok) {
      setFeedback({ type: 'ok', msg: `"${book.title}" silindi.` });
      onBookAdded();
    } else {
      setFeedback({ type: 'err', msg: 'Kitap silinemedi.' });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#091426] text-white rounded-3xl p-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Code2Icon />
          </div>
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-lg font-bold">Kitap Yönetimi</h1>
            <p className="text-[11px] text-slate-300">TXT yükle → otomatik sayfalara bölünsün</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
          Kütüphanede şu an <strong className="text-[#6cf8bb]">{books.length} kitap</strong> var.
          Yüklediğin metin ~1.600 karakterlik sayfalara otomatik bölünür; öğrenciler sayfa sayfa
          okur, öğretmenler hangi sayfada kaldıklarını görür.
        </p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`rounded-2xl p-3.5 border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {feedback.msg}
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-[#e6e8ea] shadow-xs space-y-4">
        <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#091426] flex items-center gap-2">
          <BookPlus className="w-5 h-5 text-emerald-600" />
          Yeni Kitap Yükle
        </h2>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Kitap Adı *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: İnsan Neyle Yaşar?"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#091426] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Yazar *</label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Lev Tolstoy"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#091426] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Kitabın kısa tanıtımı..."
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#091426] focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Kapak Görseli URL (opsiyonel)
          </label>
          <input
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://..."
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#091426] focus:outline-none"
          />
        </div>

        {/* TXT Upload */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Kitap Metni (.txt) *</label>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
              fileName ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            <FileText className={`w-8 h-8 mx-auto mb-2 ${fileName ? 'text-emerald-600' : 'text-slate-300'}`} />
            {fileName ? (
              <>
                <p className="text-xs font-bold text-emerald-800">{fileName}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {textContent.length.toLocaleString('tr-TR')} karakter •{' '}
                  <strong>{previewPages.length} sayfa</strong> olarak bölünecek
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> TXT Dosyası Seç
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ya da aşağıya metni yapıştırabilirsin
                </p>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div>
          <textarea
            value={textContent}
            onChange={(e) => {
              setTextContent(e.target.value);
              setFileName('');
            }}
            rows={6}
            placeholder="...veya kitap metnini buraya yapıştır."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none resize-y font-mono leading-relaxed"
          />
          {previewPages.length > 0 && (
            <p className="text-[11px] text-emerald-700 font-bold mt-1.5">
              📄 Önizleme: {previewPages.length} sayfa oluşturuldu (ilk sayfa{' '}
              {previewPages[0].length} karakter)
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-[#006c49] hover:bg-[#005236] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <BookPlus className="w-4 h-4" />
          {saving ? 'Yükleniyor...' : 'Kitabı Yayınla'}
        </button>
      </form>

      {/* Existing Books */}
      <section className="space-y-2.5">
        <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#091426] px-1">
          Yayındaki Kitaplar ({books.length})
        </h2>

        {books.length === 0 && (
          <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
            <BookPlus className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">
              Henüz kitap yok. Yukarıdaki formdan ilk kitabı yükle.
            </p>
          </div>
        )}

        {books.map((book) => (
          <div
            key={book.id}
            className="bg-white rounded-2xl p-3.5 border border-[#e6e8ea] shadow-xs flex items-center gap-3"
          >
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-10 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-10 h-14 rounded-lg bg-[#091426] text-white flex items-center justify-center font-bold shrink-0">
                {book.title.charAt(0)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xs text-[#091426] truncate">
                {book.title}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                {book.author} • {book.category} • {book.totalPages} sayfa
              </p>
            </div>

            <button
              onClick={() => handleDeleteBook(book)}
              className="p-2 text-slate-300 hover:text-red-600 transition-colors shrink-0"
              title="Kitabı Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </section>
    </div>
  );
};

// Küçük ikon yardımı (import listesini sade tutmak için)
const Code2Icon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6cf8bb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
