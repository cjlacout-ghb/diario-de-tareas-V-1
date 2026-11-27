import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface WeeklyOverdueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyOverdueModal: React.FC<WeeklyOverdueModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="weekly-overdue-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/80 shadow-2xl p-5 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Recordatorio semanal
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar recordatorio semanal"
            title="Cerrar aviso"
            className="w-10 h-10 -mt-1 -mr-1 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-3">
          <h2
            id="weekly-overdue-title"
            className="text-base font-bold text-slate-900 dark:text-white leading-snug"
          >
            Imprimir detalle de expedientes atrasados (SIE). Ordenar por días de atraso.
          </h2>
        </div>
      </div>
    </div>
  );
};
