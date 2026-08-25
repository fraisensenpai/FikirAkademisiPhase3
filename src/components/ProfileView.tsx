import React from 'react';
import { UserRole, Screen, Badge } from '../types';
import {
  Award,
  BookOpen,
  Clock,
  Settings,
  LogOut,
  GraduationCap,
  Shield,
  ArrowRight,
  Flame,
  CheckCircle,
} from 'lucide-react';

interface ProfileViewProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  setCurrentScreen: (screen: Screen) => void;
  badges: Badge[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userRole,
  setUserRole,
  setCurrentScreen,
  badges,
}) => {
  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in duration-300">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#e6e8ea] shadow-xs text-center relative overflow-hidden">
        <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-4 border-emerald-500/30 shadow-sm mb-3">
          {userRole === 'student' ? (
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              alt="Defne Yılmaz"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#091426] text-white flex items-center justify-center font-bold text-2xl">
              AS
            </div>
          )}
        </div>

        <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#091426]">
          {userRole === 'student' ? 'Defne Yılmaz' : 'Ahmet Soylu'}
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          {userRole === 'student' ? '10-A Sınıfı • Okul No: 1084' : 'Türk Dili ve Edebiyatı Danışmanı'}
        </p>

        {/* Quick Role Toggle */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
          <button
            onClick={() => {
              const newRole = userRole === 'student' ? 'teacher' : 'student';
              setUserRole(newRole);
              setCurrentScreen(newRole === 'student' ? 'dashboard' : 'teacher');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-emerald-700" />
            <span>{userRole === 'student' ? 'Öğretmen Moduna Geç' : 'Öğrenci Moduna Geç'}</span>
          </button>
        </div>
      </div>

      {/* Reading Statistics */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="bg-white rounded-2xl p-3.5 border border-[#e6e8ea] shadow-xs">
          <BookOpen className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <span className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-[#091426] block">
            8 Kitap
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Bitirilen</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-[#e6e8ea] shadow-xs">
          <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
          <span className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-[#091426] block">
            42 Saat
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Okuma</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-[#e6e8ea] shadow-xs">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <span className="text-lg font-bold font-['Plus_Jakarta_Sans'] text-[#091426] block">
            14 Gün
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Seri</span>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#091426] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            Rozetlerim ({badges.length})
          </h3>
          <span className="text-xs text-slate-400">Tümü Aktif</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {badges.map((b) => (
            <div key={b.id} className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#006c49] text-white flex items-center justify-center mb-1 shadow-xs">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {b.icon}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-700 block truncate">{b.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Options / Screen Switcher */}
      <div className="bg-white rounded-2xl p-2 border border-[#e6e8ea] shadow-xs divide-y divide-slate-100 text-xs font-semibold text-slate-700">
        <button
          onClick={() => setCurrentScreen('student-register')}
          className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors"
        >
          <span>Öğrenci Kayıt Formunu Göster</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setCurrentScreen('teacher-register')}
          className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors"
        >
          <span>Öğretmen Kayıt Formunu Göster</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setCurrentScreen('login')}
          className="w-full p-3 flex items-center justify-between text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            <span>Çıkış Yap / Giriş Ekranı</span>
          </div>
          <ArrowRight className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
};
