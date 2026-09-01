import React, { useState, useEffect } from 'react';
import { Book, BookTransferRequest } from '../types';
import {
  createTransferRequest,
  fetchMyTransferRequest,
  fetchAllTransferRequests,
} from '../lib/dataService';
import { useToast } from './Toast';
import { ArrowLeft, ArrowRightLeft, CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';

interface BookTransferRequestScreenProps {
  books: Book[];
  userId: string;
  onBack: () => void;
}

export const BookTransferRequestScreen: React.FC<BookTransferRequestScreenProps> = ({
  books,
  userId,
  onBack,
}) => {
  const { showToast } = useToast();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [myRequests, setMyRequests] = useState<BookTransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Sayfa seçim modu
  const [selectionMode, setSelectionMode] = useState<'tap' | 'range'>('tap');
  const [rangeStart, setRangeStart] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Tüm kitaplar için mevcut talepleri çek
      const requests: BookTransferRequest[] = [];
      for (const book of books) {
        const req = await fetchMyTransferRequest(userId, book.id);
        if (req) requests.push(req);
      }
      setMyRequests(requests);
      setLoading(false);
    };
    load();
  }, [userId, books]);

  const totalPages = selectedBook?.totalPages || 0;

  const togglePage = (page: number) => {
    if (selectionMode === 'tap') {
      setSelectedPages((prev) => {
        const next = new Set(prev);
        if (next.has(page)) next.delete(page);
        else next.add(page);
        return next;
      });
    } else {
      // Range mode
      if (rangeStart === null) {
        setRangeStart(page);
        setSelectedPages(new Set([page]));
      } else {
        const min = Math.min(rangeStart, page);
        const max = Math.max(rangeStart, page);
        const range = new Set<number>();
        for (let i = min; i <= max; i++) range.add(i);
        setSelectedPages(range);
        setRangeStart(null);
      }
    }
  };

  const selectAll = () => {
    if (totalPages > 0) {
      setSelectedPages(new Set(Array.from({ length: totalPages }, (_, i) => i + 1)));
    }
  };

  const selectNone = () => {
    setSelectedPages(new Set());
    setRangeStart(null);
  };

  const handleSubmit = async () => {
    if (!selectedBook || selectedPages.size === 0) {
      showToast('Lütfen en az bir sayfa seçin.', 'error');
      return;
    }

    setSubmitting(true);
    const ok = await createTransferRequest(userId, selectedBook.id, Array.from(selectedPages).sort((a, b) => a - b));
    if (ok) {
      showToast('Aktarım talebin gönderildi! 📤', 'success');
      setSelectedBook(null);
      setSelectedPages(new Set());
      // Refresh
      const requests: BookTransferRequest[] = [];
      for (const book of books) {
        const req = await fetchMyTransferRequest(userId, book.id);
        if (req) requests.push(req);
      }
      setMyRequests(requests);
    } else {
      showToast('Talep gönderilemedi.', 'error');
    }
    setSubmitting(false);
  };

  // Book grid with page selector
  if (selectedBook) {
    const req = myRequests.find((r) => r.bookId === selectedBook.id);

    return (
      <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in duration-300">
        <button
          onClick={() => { setSelectedBook(null); setSelectedPages(new Set()); setRangeStart(null); }}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#091426]"
        >
          <ArrowLeft className="w-4 h-4" /> Kitaplara Dön
        </button>

        <div className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs">
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#091426]">{selectedBook.title}</h3>
          <p className="text-[11px] text-slate-500">{selectedBook.author} • {totalPages} sayfa</p>
        </div>

        {/* Existing request status */}
        {req && (
          <div className={`rounded-xl p-3 text-xs font-bold ${
            req.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {req.status === 'pending' && <><Clock className="w-4 h-4 inline mr-1" /> Talebiniz bekliyor ({req.readPages.length} sayfa)</>}
            {req.status === 'approved' && <><CheckCircle2 className="w-4 h-4 inline mr-1" /> Onaylandı ({req.readPages.length} sayfa)</>}
            {req.status === 'rejected' && <><XCircle className="w-4 h-4 inline mr-1" /> Reddedildi</>}
          </div>
        )}

        {/* Selection mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => { setSelectionMode('tap'); setRangeStart(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
              selectionMode === 'tap' ? 'bg-[#091426] text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Tek Seçim
          </button>
          <button
            onClick={() => { setSelectionMode('range'); setRangeStart(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
              selectionMode === 'range' ? 'bg-[#091426] text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Aralık Seçimi
          </button>
        </div>

        {selectionMode === 'range' && (
          <p className="text-[11px] text-slate-400 text-center">
            {rangeStart === null ? 'Başlangıç sayısına tıklayın' : `${rangeStart}. sayfadan itibaren bitiş noktasına tıklayın`}
          </p>
        )}

        {/* Quick actions */}
        <div className="flex gap-2">
          <button onClick={selectAll} className="flex-1 py-1.5 text-[11px] font-bold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50">
            Tümünü Seç
          </button>
          <button onClick={selectNone} className="flex-1 py-1.5 text-[11px] font-bold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50">
            Seçimi Kaldır
          </button>
        </div>

        {/* Page grid */}
        <div className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600">Sayfalar</span>
            <span className="text-[11px] text-slate-400">{selectedPages.size} / {totalPages} seçili</span>
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => togglePage(page)}
                className={`aspect-square rounded-lg text-[10px] font-bold transition-all ${
                  selectedPages.has(page)
                    ? 'bg-[#006c49] text-white scale-105 shadow-sm'
                    : rangeStart === page
                    ? 'bg-amber-200 text-amber-800 ring-2 ring-amber-400'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={selectedPages.size === 0 || submitting || (req?.status === 'pending')}
          className="w-full py-3 bg-[#006c49] hover:bg-[#005236] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ArrowRightLeft className="w-4 h-4" />
          {submitting ? 'Gönderiliyor...' : `Talep Gönder (${selectedPages.size} sayfa)`}
        </button>
      </div>
    );
  }

  // Book list view
  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#091426]">Kitap Aktarımı</h2>
          <p className="text-[11px] text-slate-400">Dışarıda okuduğun kitapları aktar</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-sm text-slate-400 py-8">Yükleniyor...</p>
      ) : (
        <div className="space-y-3">
          {books.map((book) => {
            const req = myRequests.find((r) => r.bookId === book.id);
            return (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className="w-full text-left bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#091426] truncate">{book.title}</h4>
                    <p className="text-[11px] text-slate-500">{book.author} • {book.totalPages} sayfa</p>
                    {book.progressPercent !== undefined && book.progressPercent > 0 && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-0.5">%{book.progressPercent} tamamlandı</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {req && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'pending' ? 'bg-amber-50 text-amber-700'
                        : req.status === 'approved' ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                      }`}>
                        {req.status === 'pending' ? 'Bekliyor' : req.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
