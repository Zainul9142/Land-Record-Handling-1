import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />
  };

  const bgBorder = {
    success: 'bg-slate-900/95 border-emerald-500/50 text-white shadow-emerald-950/30',
    error: 'bg-slate-900/95 border-rose-500/50 text-white shadow-rose-950/30',
    info: 'bg-slate-900/95 border-sky-500/50 text-white shadow-sky-950/30'
  };

  return (
    <div
      className={`pointer-events-auto p-3.5 rounded-2xl border backdrop-blur-md shadow-2xl flex items-start justify-between space-x-3 transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 ${bgBorder[toast.type]}`}
    >
      <div className="flex items-start space-x-2.5">
        {icons[toast.type]}
        <div className="space-y-0.5 text-xs">
          <div className="font-bold text-white leading-snug">{toast.title}</div>
          {toast.description && (
            <div className="text-slate-300 text-[11px] leading-relaxed">{toast.description}</div>
          )}
        </div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-slate-800"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
