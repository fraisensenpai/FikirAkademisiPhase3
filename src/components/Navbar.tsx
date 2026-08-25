import React, { useState } from 'react';
import { Screen, UserRole } from '../types';
import { Bell, ArrowLeftRight, Check, Sparkles, BookOpen, GraduationCap } from 'lucide-react';

interface NavbarProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  setCurrentScreen,
  userRole,
  setUserRole,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const notifications = [
    {
      id: '1',
      title: 'Yeni Ödev Eklendi',
      desc: '1984 kitabı için ödev teslimine 3 gün kaldı.',
      time: '10 dk önce',
      unread: true,
    },
    {
      id: '2',
      title: 'Tebrikler! Rozet Kazandın',
      desc: '"Hızlı Okur" rozeti profiline eklendi.',
      time: '2 saat önce',
      unread: false,
    },
    {
      id: '3',
      title: 'Öğretmeninden Mesaj',
      desc: 'Ahmet Hoca: "Devlet kitabı 3. bölüm notların çok başarılı."',
      time: 'Dün',
      unread: false,
    },
  ];

  // If we are in reader mode, the reader has its own dedicated header bar
  if (currentScreen === 'reader') {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e0e3e5] px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left: User Avatar & Role Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="relative group focus:outline-none flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
            title="Kullanıcı / Rol Değiştir"
          >
            {userRole === 'student' ? (
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Öğrenci Profil"
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/80 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#091426] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
              </div>
            )}
            <div className="text-left hidden sm:block">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {userRole === 'student' ? 'Sınıfınız • Öğrenci' : 'Akademik Danışman'}
              </span>
              <span className="block text-sm font-bold text-[#091426] leading-tight">
                {userRole === 'student' ? 'Öğrenci' : 'Öğretmen'}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Brand Title */}
        <div className="text-center">
          <button
            onClick={() => setCurrentScreen(userRole === 'student' ? 'dashboard' : 'teacher')}
            className="focus:outline-none group"
          >
            <h1 className="font-['Plus_Jakarta_Sans'] text-xl sm:text-2xl font-bold text-[#091426] tracking-tight group-hover:text-emerald-700 transition-colors flex items-center gap-1.5 justify-center">
              <span>{userRole === 'student' ? 'Fikir Akademisi' : 'Öğretmen Paneli'}</span>
            </h1>
          </button>
        </div>

        {/* Right: Actions & Role Switcher */}
        <div className="flex items-center gap-2 relative">
          {/* Quick Switch Button between Student & Teacher & Auth */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
              title="Görünüm Değiştir (Öğrenci / Öğretmen / Giriş)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">
                {userRole === 'student' ? 'Öğrenci Modu' : 'Öğretmen Modu'}
              </span>
            </button>

            {/* Role / Navigation Dropdown */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Görünüm Değiştir</p>
                </div>
                <div className="py-1 space-y-1">
                  <button
                    onClick={() => {
                      setUserRole('student');
                      setCurrentScreen('dashboard');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      userRole === 'student' && currentScreen === 'dashboard'
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>Öğrenci Ana Sayfası</span>
                    </div>
                    {userRole === 'student' && currentScreen === 'dashboard' && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => {
                      setUserRole('student');
                      setCurrentScreen('library');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentScreen === 'library'
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-lg">local_library</span>
                      <span>Kütüphane & Ödevler</span>
                    </div>
                    {currentScreen === 'library' && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => {
                      setUserRole('teacher');
                      setCurrentScreen('teacher');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      userRole === 'teacher'
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span>Öğretmen Paneli</span>
                    </div>
                    {userRole === 'teacher' && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <div className="border-t border-slate-100 my-1 pt-1">
                    <p className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kayıt & Giriş Ekranları</p>
                    <button
                      onClick={() => {
                        setCurrentScreen('login');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
                    >
                      Giriş Yap (Login)
                    </button>
                    <button
                      onClick={() => {
                        setCurrentScreen('student-register');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
                    >
                      Öğrenci Kayıt (Student Register)
                    </button>
                    <button
                      onClick={() => {
                        setCurrentScreen('teacher-register');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
                    >
                      Öğretmen Kayıt (Teacher Register)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-[#091426] hover:bg-slate-100 rounded-full transition-colors relative"
              title="Bildirimler"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Bildirimler
                  </h4>
                  <span className="text-[11px] text-emerald-600 font-semibold cursor-pointer hover:underline">Tümünü Oku</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {notifications.map((item) => (
                    <div key={item.id} className="py-2.5 px-1 text-left hover:bg-slate-50 rounded-lg transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#091426]">{item.title}</span>
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
