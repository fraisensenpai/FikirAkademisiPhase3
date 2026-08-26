import React from 'react';
import { Screen, UserRole } from '../types';
import { GraduationCap } from 'lucide-react';

interface NavbarProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  userRole: UserRole;
  userName: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  setCurrentScreen,
  userRole,
  userName,
}) => {
  // Reader modunda kendi başlığı var
  if (currentScreen === 'reader') {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e0e3e5] px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left: User Avatar & Role Indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentScreen('profile')}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
          >
            {userRole === 'student' ? (
              <div className="w-10 h-10 rounded-full bg-[#091426] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {(userName || 'Ö').charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#091426] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
              </div>
            )}
            <div className="text-left hidden sm:block">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {userRole === 'student' ? 'Öğrenci' : 'Öğretmen'}
              </span>
              <span className="block text-sm font-bold text-[#091426] leading-tight">
                {userName || 'Kullanıcı'}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Brand Title */}
        <div className="text-center">
          <h1 className="font-['Plus_Jakarta_Sans'] text-xl sm:text-2xl font-bold text-[#091426] tracking-tight">
            {userRole === 'student' ? 'Fikir Akademisi' : 'Öğretmen Paneli'}
          </h1>
        </div>

        {/* Right: Role Badge */}
        <div className="flex items-center">
          <span
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${
              userRole === 'teacher'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {userRole === 'teacher' ? 'Öğretmen' : 'Öğrenci'}
          </span>
        </div>
      </div>
    </header>
  );
};
