import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-[#111111]/95 border-[#10b981]/40 text-[#f5f5f5]'
                : isError
                ? 'bg-[#111111]/95 border-rose-500/40 text-[#f5f5f5]'
                : 'bg-[#111111]/95 border-[#1f1f1f] text-[#f5f5f5]'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#10b981]" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-[#9ca3af]" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold tracking-tight text-[#f5f5f5]">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-[#9ca3af] mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#9ca3af] hover:text-[#f5f5f5] p-1 -mr-1 transition-colors rounded-lg focus:outline-none focus:ring-1 focus:ring-[#10b981]"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
