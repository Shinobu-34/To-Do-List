import { X } from 'lucide-react';
import type { ToastData } from '../types';

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl
        bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
        shadow-2xl shadow-black/20 min-w-[280px] max-w-md
        ${toast.exiting ? 'animate-toast-out' : 'animate-toast-in'}
      `}
      role="alert"
      aria-live="polite"
    >
      <p className="flex-1 text-sm font-medium truncate">{toast.message}</p>

      {toast.action && (
        <button
          onClick={() => {
            toast.action!.onClick();
            onDismiss(toast.id);
          }}
          className="text-sm font-bold text-brand-400 dark:text-brand-600
                     hover:text-brand-300 dark:hover:text-brand-700 transition-colors shrink-0"
        >
          {toast.action.label}
        </button>
      )}

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
