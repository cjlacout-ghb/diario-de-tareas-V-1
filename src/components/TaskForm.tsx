import React, { useState } from 'react';
import { Plus, Link as LinkIcon, Globe } from 'lucide-react';
import { normalizeUrl } from '../utils/url';

interface TaskFormProps {
  onAdd: (text: string, url: string) => void;
  title?: string;
  placeholderText?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({ 
  onAdd, 
  title = "Nueva actividad",
  placeholderText = "Actividad (ej. Revisar expedientes)..." 
}) => {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const formattedUrl = url.trim() ? normalizeUrl(url) : '';
    onAdd(trimmedText, formattedUrl);

    setText('');
    setUrl('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </h2>
        <span className="text-xs text-slate-400">Presioná Enter para agregar</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* Campo Actividad (obligatorio) */}
        <div className="sm:col-span-7">
          <label htmlFor="actividad-input" className="sr-only">
            Actividad
          </label>
          <input
            id="actividad-input"
            type="text"
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholderText}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 transition"
          />
        </div>

        {/* Campo Enlace (opcional) */}
        <div className="sm:col-span-5 relative">
          <label htmlFor="enlace-input" className="sr-only">
            Enlace (opcional)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <LinkIcon className="w-3.5 h-3.5" />
            </span>
            <input
              id="enlace-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enlace (Drive, intranet...)"
              className="w-full pl-8.5 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 transition"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <a
          href="https://dcartografiayde.github.io/IDE-PARANA/obras_privadas/"
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir IDE Paraná (Obras Privadas)"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 shadow-2xs transition cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
        >
          <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>IDE Paraná</span>
        </a>

        <button
          type="submit"
          disabled={!text.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Agregar</span>
        </button>
      </div>
    </form>
  );
};
