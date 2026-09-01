import React from 'react';
import { Screen, UserRole } from '../types';
import { LayoutGrid, BookDown, BarChart2, User, FileQuestion, ArrowRightLeft } from 'lucide-react';

interface BottomNavProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  userRole: UserRole;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  setCurrentScreen,
  userRole,
}) => {
  // Hide bottom nav in reader mode or standalone auth screens if needed, but show in main views
  if (currentScreen === 'reader') {
    return null;
  }

  const navItems = userRole === 'student' ? [
    {
      id: 'dashboard',
      label: 'Ana Sayfa',
      icon: LayoutGrid,
    },
    {
      id: 'library',
      label: 'Kütüphane',
      icon: BookDown,
    },
    {
      id: 'quiz-solve',
      label: 'Quizler',
      icon: FileQuestion,
    },
    {
      id: 'transfer-request',
      label: 'Aktarım',
      icon: ArrowRightLeft,
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
    },
  ] : [
    {
      id: userRole === 'teacher' ? 'teacher' : 'manage',
      label: userRole === 'teacher' ? 'Panelim' : 'Kitaplar',
      icon: userRole === 'developer' ? BookDown : LayoutGrid,
    },
    {
      id: 'library',
      label: 'Kütüphane',
      icon: BookDown,
    },
    {
      id: 'social',
      label: 'Sosyal',
      icon: BarChart2,
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e6e8ea] py-2 px-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentScreen === item.id ||
            (item.id === 'dashboard' && currentScreen === 'dashboard') ||
            (item.id === 'teacher' && currentScreen === 'teacher');

          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id as Screen)}
              id={`nav-${item.id}`}
              className={`flex flex-col items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'px-5 py-1.5 rounded-full bg-[#6cf8bb] text-[#002113] font-semibold scale-105 shadow-xs'
                  : 'px-3 py-1.5 text-slate-500 hover:text-[#091426]'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'stroke-[2.2px]' : 'stroke-[1.7px]'
                }`}
              />
              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
