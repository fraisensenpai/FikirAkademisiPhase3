import React from 'react';
import { Book, Badge } from '../types';
import { Flame, Award, BookOpen, Clock, ChevronRight, Sparkles } from 'lucide-react';

interface StudentDashboardProps {
  onSelectBook: (book: Book) => void;
  books: Book[];
  badges: Badge[];
  onNavigateToLibrary: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onSelectBook,
  books,
  badges,
  onNavigateToLibrary,
}) => {
  const continueBook = books.find((b) => b.id === 'insan-neyle-yasar') || books[0];
  const currentlyReading = books.filter((b) => b.id === 'donusum' || b.id === 'sapiens' || b.id === '1984');
  
  if (!continueBook) {
    return (
      <div className="max-w-md mx-auto px-4 pt-10 text-center">
        <div className="bg-white rounded-2xl p-8 border border-[#e6e8ea] shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#091426] mb-2">Henüz kitap bulunamadı</h2>
          <p className="text-slate-500 text-sm mb-6">Kütüphaneye giderek yeni kitaplar keşfedebilirsin.</p>
          <button 
            onClick={onNavigateToLibrary}
            className="bg-emerald-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-emerald-700 transition-colors"
          >
            Kütüphaneye Git
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-6">
      {/* Top 2 Stat Cards: Streak & Level */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-orange-200 transition-all">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-2">
            <Flame className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
          </div>
          <span className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#091426]">
            14 Gün
          </span>
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mt-0.5">
            SERİ
          </span>
        </div>

        {/* Level Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-emerald-200 transition-all">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
            <Award className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#091426]">
            Seviye 5
          </span>
          <span className="text-[11px] font-medium text-slate-500 mt-0.5">
            Kitapkurdu
          </span>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>
      </div>

      {/* Devam Et Section */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#091426]">
            Devam Et
          </h2>
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Son Okunan
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex gap-4 items-start">
            {/* Book Thumbnail */}
            <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100 relative group cursor-pointer"
                 onClick={() => onSelectBook(continueBook)}>
              <img
                src={continueBook?.coverUrl || ''}
                alt={continueBook?.title || 'Kitap'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/10"></div>
            </div>

            {/* Book Info */}
            <div className="flex-1 flex flex-col justify-between h-28">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#091426] leading-tight line-clamp-1">
                  {continueBook.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {continueBook.author}
                </p>
              </div>

              <div className="space-y-1.5 mt-auto">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">%{continueBook.progressPercent} Okundu</span>
                  <span className="text-slate-400 text-[11px]">{continueBook.currentPage}/{continueBook.totalPages} syf</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${continueBook.progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onSelectBook(continueBook)}
            className="w-full mt-3.5 bg-[#091426] hover:bg-[#1e293b] active:scale-[0.99] text-white py-2.5 px-4 rounded-xl font-['Plus_Jakarta_Sans'] font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Okumaya Dön</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Kazanılan Rozetler Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#091426]">
            Kazanılan Rozetler
          </h2>
          <span className="text-xs text-slate-400 font-medium">4 / 12 Kazanıldı</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center group cursor-pointer"
              title={badge.description}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${
                  badge.id === 'b1'
                    ? 'bg-[#006c49] text-white'
                    : badge.id === 'b2'
                    ? 'bg-[#006c49] text-white'
                    : badge.id === 'b3'
                    ? 'bg-[#e0e3e5] text-[#45474c]'
                    : 'bg-[#f2f4f6] text-[#75777d]'
                }`}
              >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {badge.icon}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-700 mt-2 line-clamp-1">
                {badge.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Şu An Okunanlar Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#091426]">
            Şu An Okunanlar
          </h2>
          <button
            onClick={onNavigateToLibrary}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
          >
            Tümünü Gör <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {currentlyReading.map((book) => (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="bg-white rounded-2xl border border-[#e6e8ea] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
            >
              {/* Cover Preview Area */}
              <div className="h-44 bg-slate-50 relative p-3 flex items-center justify-center border-b border-slate-100">
                <div className="w-24 h-36 rounded-md overflow-hidden shadow-md border border-slate-200 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={book?.coverUrl || ''}
                    alt={book?.title || 'Kitap'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Title & Author & Progress */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#091426] line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {book.author}
                  </p>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${Math.max(book.progressPercent, 5)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
