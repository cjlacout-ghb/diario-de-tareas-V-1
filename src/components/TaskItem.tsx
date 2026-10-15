import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  CheckSquare, 
  Square,
  X,
  Link as LinkIcon
} from 'lucide-react';
import { Task } from '../types';
import { normalizeUrl } from '../utils/url';

interface TaskItemProps {
  task: Task;
  index: number;
  totalTasks: number;
  onToggle: (id: string) => void;
  onUpdate: (id: string, newText: string, newUrl: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  index,
  totalTasks,
  onToggle,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editUrl, setEditUrl] = useState(task.url || '');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditText(task.text);
      setEditUrl(task.url || '');
      textInputRef.current?.focus();
    }
  }, [isEditing, task]);

  const handleSaveEdit = () => {
    const trimmedText = editText.trim();
    if (!trimmedText) return; // Obligatorio
    const formattedUrl = editUrl.trim() ? normalizeUrl(editUrl) : '';
    onUpdate(task.id, trimmedText, formattedUrl);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(task.text);
    setEditUrl(task.url || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // Modo edición en línea
  if (isEditing) {
    return (
      <li className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-sky-300 dark:border-sky-600 shadow-sm transition">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveEdit();
          }}
          className="space-y-2.5"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Actividad (obligatorio):
            </label>
            <input
              ref={textInputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              required
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900"
              placeholder="Ej. Ver TDI - bandeja de entrada"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Enlace (opcional, ej. carpeta Drive o intranet):
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                <LinkIcon className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900"
                placeholder="drive.google.com/... o portal"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Presioná <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded text-[10px]">Enter</kbd> para guardar, <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded text-[10px]">Esc</kbd> para cancelar
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!editText.trim()}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 transition cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </li>
    );
  }

  const isFirst = index === 0;
  const isLast = index === totalTasks - 1;
  const hasUrl = Boolean(task.url && task.url.trim().length > 0);

  return (
    <li
      className={`group flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-150 ${
        task.completed
          ? 'bg-slate-100/70 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/80'
          : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Checkbox, Botón de enlace y Texto */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={task.completed ? `Marcar "${task.text}" como pendiente` : `Marcar "${task.text}" como cumplida`}
          className="shrink-0 text-slate-400 hover:text-sky-600 dark:text-slate-500 dark:hover:text-sky-400 transition cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-sky-500 rounded"
        >
          {task.completed ? (
            <div className="w-5 h-5 rounded-md bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 hover:border-sky-500 dark:hover:border-sky-400 bg-white dark:bg-slate-800 transition-colors" />
          )}
        </button>

        {/* Botón de enlace a la web (a la izquierda del texto y a la derecha del check) */}
        {hasUrl && (
          <a
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Abrir enlace y marcar como realizada: ${task.url}`}
            aria-label={`Abrir enlace para ${task.text} y marcar como realizada`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/70 dark:text-sky-300 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 transition cursor-pointer shrink-0 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            onClick={(e) => {
              // Evita que el evento burbujee a contenedores externos
              e.stopPropagation();
              // Si la actividad aún no está completada, se marca como realizada automáticamente al abrir su link
              if (!task.completed) {
                onToggle(task.id);
              }
            }}
          >
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Abrir</span>
          </a>
        )}

        <div className="min-w-0 flex-1">
          <span
            onClick={() => onToggle(task.id)}
            className={`cursor-pointer select-none text-base break-words transition-all duration-150 block leading-snug ${
              task.completed
                ? 'line-through text-slate-400 dark:text-slate-500 italic'
                : 'text-slate-800 dark:text-slate-100 font-medium'
            }`}
          >
            {task.text}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Reordenar Subir */}
        <button
          type="button"
          onClick={() => onMoveUp(index)}
          disabled={isFirst}
          title="Subir de posición"
          aria-label="Subir actividad"
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        {/* Reordenar Bajar */}
        <button
          type="button"
          onClick={() => onMoveDown(index)}
          disabled={isLast}
          title="Bajar de posición"
          aria-label="Bajar actividad"
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* Editar */}
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          title="Editar actividad y enlace"
          aria-label="Editar actividad"
          className="p-1.5 rounded-md text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Pencil className="w-4 h-4" />
        </button>

        {/* Eliminar (con confirmación simple) */}
        {isConfirmingDelete ? (
          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/50 p-0.5 rounded-lg border border-red-200 dark:border-red-900 animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="px-2 py-0.5 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
              title="Confirmar eliminación"
              aria-label="Confirmar eliminación de actividad"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
              title="Cancelar"
              aria-label="Cancelar eliminación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            title="Eliminar actividad"
            aria-label="Eliminar actividad"
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </li>
  );
};
