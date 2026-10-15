import React from 'react';
import { X, HelpCircle, Laptop, RotateCcw, Download, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h3 id="help-modal-title" className="text-base font-semibold text-slate-900 dark:text-white">
              Guía de uso & Ayuda
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar ventana de ayuda"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {/* Sección 1: Pestañas y reinicios */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-emerald-600" />
              Pestañas y reinicios automáticos
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              • <strong>Tareas diarias</strong>: Cada nuevo día que abras la app (o enciendas la PC), las tareas aparecerán automáticamente destildadas para comenzar la jornada.<br />
              • <strong>Estadísticas mensuales</strong>: Dedicada a informes de Power BI y trámites del mes. Al completar 3/3, la pestaña se muestra tachada (strikethrough) indicando el ciclo cumplido; la primera vez que la app detecta un nuevo mes calendario, se destilda automáticamente y el tachado desaparece.<br />
              Tus actividades, enlaces y orden personalizado <strong>nunca se borran</strong>.
            </p>
          </div>

          {/* Sección 2 */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-sky-600" />
              Abrir automáticamente al encender la PC (Windows)
            </h4>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li>
                Instalá la app desde Chrome o Edge usando el botón <strong>"Instalar app"</strong> o el menú del navegador para generar el acceso directo en el escritorio.
              </li>
              <li>
                Presioná las teclas <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded text-[10px]">Windows + R</kbd> en tu teclado.
              </li>
              <li>
                Escribí exactamente <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px] text-sky-600 dark:text-sky-400">shell:startup</code> y presioná <strong>Aceptar</strong>.
              </li>
              <li>
                Se abrirá la carpeta de "Inicio" de Windows. <strong>Copiá y pegá allí el acceso directo</strong> de "Tareas de Oficina".
              </li>
              <li>
                ¡Listo! A partir de ese momento, cada vez que enciendas tu PC, la app se abrirá automáticamente en primer plano con las tareas listas para tildar.
              </li>
            </ol>
          </div>

          {/* Sección 3 */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-600" />
              Copia de seguridad (Exportar / Importar)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Podés hacer clic en <strong>"Exportar"</strong> en cualquier momento para descargar un archivo <code className="font-mono text-[11px]">.json</code> con tus actividades y enlaces. Podés llevarlo a otra computadora de la municipalidad e <strong>"Importar"</strong> para sincronizar.
            </p>
          </div>

          {/* Sección 4 */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Enlaces rápidos
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Podés pegar cualquier enlace de Google Drive, expediente digital, intranet o portal web. Si no escribís <code className="font-mono text-[11px]">https://</code>, la app lo agrega automáticamente. Al hacer clic en <strong>"Abrir"</strong> se abrirá en una pestaña nueva y la actividad se marcará automáticamente como realizada.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-slate-900 dark:bg-slate-100 py-2.5 text-sm font-semibold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
