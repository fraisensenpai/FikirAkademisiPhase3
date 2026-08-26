import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  msg: string;
}

interface ToastContextType {
  showToast: (msg: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const showToast = useCallback((msg: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-3), { id, type, msg }]);
    window.setTimeout(() => dismiss(id), 4500);
  }, []);

  const styles: Record<ToastType, string> = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-white border-slate-200 text-slate-800',
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />,
    error: <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />,
    info: <Info className="w-4 h-4 shrink-0 text-slate-500" />,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 left-4 sm:left-auto z-[100] flex flex-col items-end gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto w-full sm:w-96 rounded-xl border shadow-lg p-3.5 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 ${styles[t.type]}`}
          >
            <span className="mt-0.5">{icons[t.type]}</span>
            <p className="flex-1 leading-relaxed">{t.msg}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Bildirimi kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
