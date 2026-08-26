import React from 'react';
import { UserRole, Screen, Book } from '../types';
import { BookOpen, Clock, LogOut, Flame, ChevronRight, Trophy, Target, Sparkles, Library, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileViewProps {
  userRole: UserRole;
  setCurrentScreen: (screen: Screen) => void;
  books: Book[];
  onSelectBook?: (book: Book) => void;
  onNavigateToLibrary?: () => void;
}

/** Okunan sayfaya göre okuyucu seviyesi */
const getReaderLevel = (pagesRead: number): { name: string; next: number | null; icon: string; color: string } => {
  if (pagesRead >= 1000) return { name: 'Edebiyat Kahramanı', next: null, icon: '🏆', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  if (pagesRead >= 500) return { name: 'Kitap Kurdu', next: 1000, icon: '🦉', color: 'text-purple-700 bg-purple-50 border-purple-200' };
  if (pagesRead >= 250) return { name: 'Sayfa Avcısı', next: 500, icon: '⚡', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
  if (pagesRead >= 50) return { name: 'Meraklı Okur', next: 250, icon: '🌱', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  return { name: 'Yeni Başlayan', next: 50, icon: '🐣', color: 'text-slate-700 bg-slate-100 border-slate-200' };
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  userRole,
  setCurrentScreen,
  books,
  onSelectBook,
  onNavigateToLibrary,
}) => {
  const { signOut, userName } = useAuth();

  const finishedBooks = books.filter((b) => (b.progressPercent || 0) >= 100);
  const activeBooks = books
    .filter((b) => (b.progressPercent || 0) > 0 && (b.progressPercent || 0) < 100)
    .sort((a, b) => (b.progressPercent || 0) - (a.progressPercent || 0));

  const totalPagesRead = books.reduce((sum, b) => sum + (b.currentPage || 0), 0);
  // Tahmini okuma süresi: sayfa başına ~1.5 dakika
  const minutesRead = Math.round(totalPagesRead * 1.5);
  const hoursLabel =
    minutesRead >= 60
      ? `${Math.floor(minutesRead / 60)} sa ${minutesRead % 60} dk`
      : `${minutesRead} dk`;

  const level = getReaderLevel(totalPagesRead);
  const levelProgress = level.next
    ? Math.min(100, Math.round((totalPagesRead / level.next) * 100))
    : 100;

  // Teşvik mesajı
  const motivation =
    activeBooks.length > 0 && activeBooks[0].progressPercent !== undefined
      ? activeBooks[0].progressPercent >= 70
        ? `🎉 "${activeBooks[0].title}" kitabına çok yaklaştın! Bitirmeye ${Math.max(1, (activeBooks[0].totalPages || 0) - (activeBooks[0].currentPage || 0))} sayfa kaldı.`
        : `"${activeBooks[0].title}" ile yolun %${activeBooks[0].progressPercent}'indesin. Devam et!`
      : finishedBooks.length > 0
      ? '👏 Harika gidiyorsun! Yeni bir kitapla serüvene devam et.'
      : '📖 İlk kitabını aç ve okuma yolculuğuna başla!';

  const handleSignOut = async () => {
    await signOut();
    setCurrentScreen('login');
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in duration-300">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#e6e8ea] shadow-xs text-center relative overflow-hidden">
        <div className="w-20 h-20 rounded-full mx-auto bg-[#091426] text-white flex items-center justify-center font-bold text-2xl border-4 border-emerald-500/30 shadow-sm mb-3">
          {(userName || 'K').charAt(0).toUpperCase()}
        </div>

        <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#091426]">
          {userName || 'Kullanıcı'}
        </h2>
        <p className="text-xs font-semibold text-emerald-700 mt-0.5">
          M. Emin Saraç Anadolu İmam Hatip Lisesi
        </p>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          {userRole === 'student' ? 'Öğrenci' : userRole === 'developer' ? 'Geliştirici' : 'Öğretmen'}
        </p>

        {/* Okuyucu Seviyesi Rozeti */}
        {userRole === 'student' && (
          <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-xs ${level.color}`}>
            <span className="text-base">{level.icon}</span>
            <span>{level.name}</span>
            {level.next && (
              <span className="font-medium opacity-70">
                • Sonraki seviye için {Math.max(0, level.next - totalPagesRead)} sayfa
              </span>
            )}
          </div>
        )}
        {userRole === 'student' && (
          <div className="mt-3 max-w-xs mx-auto">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-[#006c49] h-full rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Seviye ilerlemen</p>
          </div>
        )}
      </div>

      {/* Teşvik Mesajı */}
      {userRole === 'student' && (
        <div className="bg-gradient-to-r from-[#091426] to-[#1e293b] text-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#6cf8bb] shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed font-medium">{motivation}</p>
        </div>
      )}

      {/* Reading Statistics */}
      <div className="grid grid-cols-2 gap-2.5 text-center">
        <div className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs">
          <TrendingUp className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
          <span className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#091426] block">
            {totalPagesRead}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Sayfa Okundu
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs">
          <Clock className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <span className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#091426] block">
            {hoursLabel}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Okuma Süresi
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs">
          <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <span className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#091426] block">
            {finishedBooks.length}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Bitirilen Kitap
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs">
          <Flame className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <span className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#091426] block">
            {activeBooks.length}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Devam Eden Kitap
          </span>
        </div>
      </div>

      {/* Devam Eden Kitaplar - tek tıkla kaldığın yerden devam */}
      {userRole === 'student' && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#091426] flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-600" />
              Kaldığın Yerden Devam Et
            </h3>
            {onNavigateToLibrary && (
              <button
                onClick={onNavigateToLibrary}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
              >
                Kütüphane <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {activeBooks.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-dashed border-slate-300 text-center">
              <Library className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                Henüz bir kitaba başlamadın.
              </p>
              {onNavigateToLibrary && (
                <button
                  onClick={onNavigateToLibrary}
                  className="mt-3 px-4 py-1.5 bg-[#091426] text-white text-[11px] font-bold rounded-lg hover:bg-[#1e293b]"
                >
                  Kütüphaneye Git
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeBooks.slice(0, 4).map((book) => (
                <div
                  key={book.id}
                  onClick={() => onSelectBook?.(book)}
                  className="bg-white rounded-2xl p-3 border border-[#e6e8ea] shadow-xs hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer flex items-center gap-3 group"
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
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-xs text-[#091426] truncate group-hover:text-emerald-700 transition-colors">
                        {book.title}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500 shrink-0">
                        Syf {book.currentPage}/{book.totalPages}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${Math.max(book.progressPercent || 0, 3)}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">%{book.progressPercent} tamamlandı</p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Sign Out */}
      <div className="bg-white rounded-2xl p-2 border border-[#e6e8ea] shadow-xs divide-y divide-slate-100 text-xs font-semibold text-slate-700">
        <button
          onClick={handleSignOut}
          className="w-full p-3 flex items-center justify-between text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            <span>Çıkış Yap</span>
          </div>
        </button>
      </div>
    </div>
  );
};
