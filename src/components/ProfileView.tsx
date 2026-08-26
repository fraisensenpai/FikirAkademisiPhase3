import React from 'react';
import { UserRole, Screen, Book } from '../types';
import { BookOpen, Clock, LogOut, Flame } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileViewProps {
  userRole: UserRole;
  setCurrentScreen: (screen: Screen) => void;
  books: Book[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userRole,
  setCurrentScreen,
  books,
}) => {
  const { signOut, userName } = useAuth();

  const finishedCount = books.filter((b) => (b.progressPercent || 0) >= 100).length;
  const totalPagesRead = books.reduce((sum, b) => sum + (b.currentPage || 0), 0);
  // Okuma serisi: son okunan güne göre basit tahmin (progress olan kitap sayısı)
  const activeBooks = books.filter((b) => (b.progressPercent || 0) > 0).length;

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
      </div>

      {/* Reading Statistics */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="bg-white rounded-2xl p-3.5 border border-[#e6e8ea] shadow-xs">
          <BookOpen className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <span className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-[#091426] block">
            {finishedCount}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Bitirilen</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-[#e6e8ea] shadow-xs">
          <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
          <span className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-[#091426] block">
            {Math.max(1, Math.round(totalPagesRead / 40))} Saat
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Okuma</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-[#e6e8ea] shadow-xs">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <span className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-[#091426] block">
            {totalPagesRead}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Sayfa</span>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs space-y-2">
        <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#091426] flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          Kütüphanem
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {books.length} kitap erişimin var, {activeBooks} tanesine başladın.{' '}
          {activeBooks > 0 && 'Okumaya devam et!'}
        </p>
      </div>

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
