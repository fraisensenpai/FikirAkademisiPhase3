import React, { useState, useMemo } from 'react';
import { Book } from '../types';
import { Search, Clock, BookOpen, ClipboardList, CheckCircle2 } from 'lucide-react';

interface LibraryViewProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ books, onSelectBook }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');

  const categories = ['Tümü', 'Klasikler', 'Bilim', 'Tarih', 'Felsefe'];

  // Active homework assignments
  const assignedBooks = useMemo(() => {
    return books.filter((b) => b.isAssigned);
  }, [books]);

  // General library books filtered by category and search
  const filteredLibraryBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'Tümü' || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, selectedCategory]);

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-6 animate-in fade-in duration-300">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Kitap veya yazar ara..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-[#e6e8ea] rounded-2xl text-sm font-medium text-[#091426] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#091426] focus:border-transparent shadow-2xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Temizle
          </button>
        )}
      </div>

      {/* Aktif Ödevler Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-emerald-700" />
          <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#091426]">
            Aktif Ödevler
          </h2>
        </div>

        <div className="space-y-3">
          {assignedBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="bg-white rounded-2xl p-3.5 border border-[#e6e8ea] shadow-xs hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group flex gap-3.5 items-center"
            >
              {/* Book Cover Thumbnail */}
              <div className="w-18 h-24 shrink-0 rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-50 flex items-center justify-center p-1 relative">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Info & Progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#091426] leading-tight group-hover:text-emerald-700 transition-colors truncate">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {book.author}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                      book.statusBadge === 'Devam Ediyor'
                        ? 'bg-[#6cf8bb] text-[#005236]'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {book.statusBadge || 'Ödev'}
                  </span>
                </div>

                {/* Due date */}
                <div className="flex items-center gap-1 text-xs text-red-600 font-semibold mt-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Son Teslim: {book.dueDate}</span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>İlerleme</span>
                    <span>%{book.progressPercent}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        book.progressPercent > 0 ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.max(book.progressPercent, 0)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Genel Kütüphane Section */}
      <section className="space-y-3.5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-slate-700" />
          <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#091426]">
            Genel Kütüphane
          </h2>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#091426] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {filteredLibraryBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col group"
            >
              {/* Cover Art Area */}
              <div className="h-48 bg-slate-100/70 p-3.5 flex items-center justify-center border-b border-slate-100 relative overflow-hidden">
                <div className="w-28 h-40 rounded-lg overflow-hidden shadow-md border border-slate-200 bg-white group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {book.isAssigned && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-bold rounded-full shadow-xs">
                    Ödev
                  </span>
                )}
              </div>

              {/* Book Info */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#091426] leading-tight group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    {book.author}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{book.category}</span>
                  <span className="font-semibold text-emerald-700 group-hover:underline">
                    Oku →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLibraryBooks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Aramanızla eşleşen kitap bulunamadı.</p>
            <p className="text-xs text-slate-400 mt-1">Farklı bir arama terimi veya kategori seçmeyi deneyin.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Tümü');
              }}
              className="mt-3 px-4 py-1.5 bg-[#091426] text-white text-xs font-semibold rounded-lg"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
