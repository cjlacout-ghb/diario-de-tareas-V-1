import React, { useState } from 'react';
import { Download, Monitor, Info, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // Si ya se está ejecutando como app instalada (modo standalone), no mostramos el botón
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Instalar en el escritorio de la PC para acceso directo"
        aria-label="Instalar aplicación en la PC o celular"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800 transition shadow-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Instalar app</span>
      </button>

      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <h3 id="install-modal-title" className="text-base font-semibold text-slate-900 dark:text-white">
                  Instalar en el Escritorio (Windows)
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                aria-label="Cerrar ventana"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {isIOS ? (
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">Para iPhone / iPad:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-xs">
                    <li>Tocá el botón <strong>Compartir</strong> en la barra de Safari.</li>
                    <li>Seleccioná <strong>"Agregar a pantalla de inicio"</strong>.</li>
                  </ol>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                    En Google Chrome o Microsoft Edge en tu PC:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 text-xs">
                    <li>
                      Hacé clic en el ícono de instalación <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-300 dark:border-slate-700">⊕</span> ubicado a la derecha en la barra de direcciones del navegador.
                    </li>
                    <li>
                      O hacé clic en el menú del navegador (tres puntos ⋮) → <strong>"Instalar Tareas de Oficina"</strong> o <strong>"Aplicaciones" &gt; "Instalar este sitio como aplicación"</strong>.
                    </li>
                    <li>
                      Aparecerá un acceso directo directo en el escritorio de Windows con el ícono de la app.
                    </li>
                  </ol>
                </div>
              )}

              <div className="mt-4 p-3 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 text-xs text-sky-800 dark:text-sky-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" />
                <span>
                  Al instalarla se abrirá en su propia ventana sin barra de direcciones, rápida y lista para usar cada día.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-sky-600 py-2.5 text-sm font-medium text-white hover:bg-sky-700 transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
