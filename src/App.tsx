import React, { useState, useEffect, useRef } from 'react';
import { 
  RotateCcw, 
  Download, 
  Upload, 
  HelpCircle, 
  CheckCircle2, 
  CalendarDays,
  FileSpreadsheet,
  CheckSquare,
  BarChart3,
  ArrowUpDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { Task, TabType } from './types';
import { TaskItem } from './components/TaskItem';
import { TaskForm } from './components/TaskForm';
import { PWAInstallButton } from './components/PWAInstallButton';
import { HelpModal } from './components/HelpModal';
import { 
  getLocalDateString, 
  getFormattedDateInSpanish, 
  getLocalMonthString, 
  getFormattedMonthInSpanish 
} from './utils/date';

// Claves de almacenamiento local (mantenemos la clave diaria previa para preservar datos existentes)
const STORAGE_KEY_DAILY_TASKS = 'gis_parana_tareas_items_v1';
const STORAGE_KEY_MONTHLY_TASKS = 'gis_parana_tareas_mensuales_v1';
const STORAGE_KEY_LAST_RESET_DAILY = 'gis_parana_tareas_last_reset_date';
const STORAGE_KEY_LAST_RESET_MONTHLY = 'gis_parana_tareas_last_reset_month';
const STORAGE_KEY_ACTIVE_TAB = 'gis_parana_active_tab';
const STORAGE_KEY_ORDER_V2 = 'gis_parana_tareas_order_v2';
const STORAGE_KEY_EXPTES_SIE = 'gis_parana_exptes_sie_v1';

// 6 tareas iniciales para la pestaña "tareas diarias" (orden oficial definitivo)
const INITIAL_DAILY_TASKS_SEED: Omit<Task, 'id' | 'createdAt'>[] = [
  { text: 'SIE - interno despacho (imprimir captura)', url: '', completed: false },
  { text: 'TDI - bandeja de entrada', url: '', completed: false },
  { text: 'TDO - portal gestión de obra', url: '', completed: false },
  { text: 'Liquidaciones (drive Factibilidades)', url: '', completed: false },
  { text: 'Planos Eléctricos (drive GIS) / SIE - cargar Subterráneas, Aéreos y Demoliciones', url: '', completed: false },
  { text: 'Buscar expedientes en Área Técnica', url: '', completed: false },
];

// 3 tareas iniciales para la pestaña "estadísticas mensuales"
const INITIAL_MONTHLY_TASKS_SEED: Omit<Task, 'id' | 'createdAt'>[] = [
  { text: 'Liquidaciones (Power BI)', url: '', completed: false },
  { text: 'Expedientes de obra nueva -papel- (Power BI)', url: '', completed: false },
  { text: 'Autorización de trámites digitales (TDO)', url: '', completed: false },
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Jerarquía y orden oficial exacto para la pestaña "tareas diarias"
function getCanonicalDailyRank(text: string): number {
  const t = text.toLowerCase();
  // 1. SIE - interno despacho (imprimir captura)
  if (t.includes('despacho') || t.includes('captura')) return 0;
  // 2. TDI - bandeja de entrada
  if (t.includes('tdi')) return 1;
  // 3. TDO - portal gestión de obra
  if (t.includes('tdo')) return 2;
  // 4. Liquidaciones (drive Factibilidades)
  if (t.includes('liquidaciones')) return 3;
  // 5. Planos Eléctricos (drive GIS) / SIE - cargar Subterráneas, Aéreos y Demoliciones
  if (
    t.includes('planos') ||
    t.includes('eléctricos') ||
    t.includes('electricas') ||
    t.includes('eléctricas') ||
    t.includes('subterráneas') ||
    t.includes('subterraneas') ||
    t.includes('aéreos') ||
    t.includes('aereos') ||
    t.includes('demoliciones') ||
    t.includes('alarma')
  ) return 4;
  // 6. Buscar expedientes en Área Técnica
  if (t.includes('expediente') || t.includes('área técnica') || t.includes('area tecnica')) return 5;
  if (t.includes('sie')) return 0;
  return 999;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_TAB);
    return saved === 'monthly' ? 'monthly' : 'daily';
  });

  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [monthlyTasks, setMonthlyTasks] = useState<Task[]>([]);

  const [todayDateString, setTodayDateString] = useState<string>('');
  const [formattedDateText, setFormattedDateText] = useState<string>('');
  const [currentMonthString, setCurrentMonthString] = useState<string>('');
  const [formattedMonthText, setFormattedMonthText] = useState<string>('');

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCompletedMonthly, setShowCompletedMonthly] = useState(false);
  const [exptesSie, setExptesSie] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EXPTES_SIE);
    return saved !== null ? saved : '00';
  });

  const handleExptesSieChange = (val: string) => {
    setExptesSie(val);
    try {
      localStorage.setItem(STORAGE_KEY_EXPTES_SIE, val);
    } catch (err) {
      console.error('Error guardando cantidad de expedientes en SIE', err);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 3200);
  };

  // Inicialización y verificación de jornada / mes
  useEffect(() => {
    const today = getLocalDateString();
    const currentMonth = getLocalMonthString();

    setTodayDateString(today);
    setFormattedDateText(getFormattedDateInSpanish());
    setCurrentMonthString(currentMonth);
    setFormattedMonthText(getFormattedMonthInSpanish());

    // 1. Cargar tareas diarias
    let loadedDailyTasks: Task[] = [];
    const savedDailyRaw = localStorage.getItem(STORAGE_KEY_DAILY_TASKS);
    if (savedDailyRaw) {
      try {
        const parsed = JSON.parse(savedDailyRaw);
        if (Array.isArray(parsed)) {
          loadedDailyTasks = parsed;
        }
      } catch (err) {
        console.error('Error parseando tareas diarias guardadas', err);
      }
    } else {
      loadedDailyTasks = INITIAL_DAILY_TASKS_SEED.map((item, idx) => ({
        ...item,
        id: generateId() + idx,
        createdAt: Date.now() + idx,
      }));
    }

    // Actualizar nombres y consolidar al nuevo esquema oficial de 6 cards
    const cardPlanosText = 'Planos Eléctricos (drive GIS) / SIE - cargar Subterráneas, Aéreos y Demoliciones';
    const cardSieDespachoText = 'SIE - interno despacho (imprimir captura)';

    let foundMergedCard = false;
    const filteredDaily: Task[] = [];
    for (const t of loadedDailyTasks) {
      const lower = t.text.toLowerCase();
      if (lower.includes('tdi')) {
        filteredDaily.push({ ...t, text: 'TDI - bandeja de entrada' });
      } else if (lower.includes('tdo')) {
        filteredDaily.push({ ...t, text: 'TDO - portal gestión de obra' });
      } else if (
        lower.includes('despacho') || 
        (lower.includes('sie') && !lower.includes('cargar') && !lower.includes('subterráneas') && !lower.includes('subterraneas') && !lower.includes('demoliciones') && !lower.includes('planos'))
      ) {
        filteredDaily.push({ ...t, text: cardSieDespachoText });
      } else if (
        lower.includes('planos') ||
        lower.includes('eléctricas') ||
        lower.includes('electricas') ||
        lower.includes('subterráneas') ||
        lower.includes('subterraneas') ||
        lower.includes('aéreos') ||
        lower.includes('aereos') ||
        lower.includes('demoliciones') ||
        lower.includes('alarma')
      ) {
        if (!foundMergedCard) {
          foundMergedCard = true;
          filteredDaily.push({
            ...t,
            text: cardPlanosText,
          });
        } else {
          // Si había una segunda tarjeta que se fusiona, absorbemos su URL si la primera no tenía
          const target = filteredDaily.find((item) => item.text === cardPlanosText);
          if (target && !target.url && t.url) {
            target.url = t.url;
          }
        }
      } else if (lower.includes('liquidaciones')) {
        filteredDaily.push({ ...t, text: 'Liquidaciones (drive Factibilidades)' });
      } else if (lower.includes('expediente') || lower.includes('área técnica') || lower.includes('area tecnica')) {
        filteredDaily.push({ ...t, text: 'Buscar expedientes en Área Técnica' });
      } else {
        filteredDaily.push(t);
      }
    }
    loadedDailyTasks = filteredDaily;

    // Asegurar que las 6 tareas oficiales por defecto estén siempre presentes
    // sin perder ningún enlace (url) cargado por el usuario
    INITIAL_DAILY_TASKS_SEED.forEach((seedTask) => {
      const rank = getCanonicalDailyRank(seedTask.text);
      const exists = loadedDailyTasks.some((t) => getCanonicalDailyRank(t.text) === rank);
      if (!exists) {
        loadedDailyTasks.push({
          id: generateId() + '-' + rank,
          text: seedTask.text,
          url: '',
          completed: false,
          createdAt: Date.now() + rank,
        });
      }
    });

    // Ordenar de forma obligatoria las tareas institucionales según el orden oficial:
    // 1. SIE - interno despacho (imprimir captura)
    // 2. TDI - bandeja de entrada
    // 3. TDO - portal gestión de obra
    // 4. Liquidaciones (drive Factibilidades)
    // 5. Planos Eléctricos (drive GIS) / SIE - cargar Subterráneas, Aéreos y Demoliciones
    // 6. Buscar expedientes en Área Técnica
    loadedDailyTasks.sort((a, b) => {
      const rankA = getCanonicalDailyRank(a.text);
      const rankB = getCanonicalDailyRank(b.text);
      if (rankA !== 999 && rankB !== 999) return rankA - rankB;
      if (rankA !== 999) return -1;
      if (rankB !== 999) return 1;
      return 0;
    });

    // Comprobar último reinicio diario
    const lastDailyReset = localStorage.getItem(STORAGE_KEY_LAST_RESET_DAILY);
    if (lastDailyReset !== today) {
      loadedDailyTasks = loadedDailyTasks.map((t) => ({ ...t, completed: false }));
      localStorage.setItem(STORAGE_KEY_LAST_RESET_DAILY, today);
    }
    setDailyTasks(loadedDailyTasks);

    // 2. Cargar tareas mensuales (estadísticas mensuales)
    let loadedMonthlyTasks: Task[] = [];
    const savedMonthlyRaw = localStorage.getItem(STORAGE_KEY_MONTHLY_TASKS);
    if (savedMonthlyRaw) {
      try {
        const parsed = JSON.parse(savedMonthlyRaw);
        if (Array.isArray(parsed)) {
          loadedMonthlyTasks = parsed;
        }
      } catch (err) {
        console.error('Error parseando estadísticas mensuales guardadas', err);
      }
    } else {
      loadedMonthlyTasks = INITIAL_MONTHLY_TASKS_SEED.map((item, idx) => ({
        ...item,
        id: generateId() + '-m-' + idx,
        createdAt: Date.now() + idx,
      }));
    }

    // Comprobar último reinicio mensual
    const lastMonthlyReset = localStorage.getItem(STORAGE_KEY_LAST_RESET_MONTHLY);
    if (!lastMonthlyReset) {
      // Primera vez que se abre la app: registrar mes en curso
      localStorage.setItem(STORAGE_KEY_LAST_RESET_MONTHLY, currentMonth);
    } else if (lastMonthlyReset !== currentMonth) {
      // ¡Nuevo mes detectado!: destildar todas las tareas mensuales.
      // Al destildarse, monthlyCompleted vuelve a 0 y el strikethrough desaparece automáticamente.
      loadedMonthlyTasks = loadedMonthlyTasks.map((t) => ({ ...t, completed: false }));
      localStorage.setItem(STORAGE_KEY_LAST_RESET_MONTHLY, currentMonth);
      showToast('Nuevo mes.\nVer Estadísticas mensuales.');
    }
    setMonthlyTasks(loadedMonthlyTasks);

    setIsInitialized(true);
  }, []);

  // Guardar tareas en localStorage cuando cambian
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY_DAILY_TASKS, JSON.stringify(dailyTasks));
    }
  }, [dailyTasks, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY_MONTHLY_TASKS, JSON.stringify(monthlyTasks));
    }
  }, [monthlyTasks, isInitialized]);

  // Guardar pestaña activa
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_TAB, activeTab);
    }
  }, [activeTab, isInitialized]);

  // Detector de cambio de día y mes (por visibilidad de pestaña y por intervalo de fondo)
  useEffect(() => {
    const checkRollover = () => {
      const today = getLocalDateString();
      const currentMonth = getLocalMonthString();

      setTodayDateString(today);
      setFormattedDateText(getFormattedDateInSpanish());
      setCurrentMonthString(currentMonth);
      setFormattedMonthText(getFormattedMonthInSpanish());

      // 1. Verificar reinicio diario
      const lastDailyReset = localStorage.getItem(STORAGE_KEY_LAST_RESET_DAILY);
      if (lastDailyReset && lastDailyReset !== today) {
        setDailyTasks((prev) => prev.map((t) => ({ ...t, completed: false })));
        localStorage.setItem(STORAGE_KEY_LAST_RESET_DAILY, today);
        showToast('¡Nueva jornada iniciada! Tareas diarias reiniciadas.');
      }

      // 2. Verificar detección de nuevo mes:
      // Se destildan las tareas de Estadísticas mensuales, lo que elimina automáticamente el strikethrough
      const lastMonthlyReset = localStorage.getItem(STORAGE_KEY_LAST_RESET_MONTHLY);
      if (lastMonthlyReset && lastMonthlyReset !== currentMonth) {
        setMonthlyTasks((prev) => prev.map((t) => ({ ...t, completed: false })));
        localStorage.setItem(STORAGE_KEY_LAST_RESET_MONTHLY, currentMonth);
        showToast('Nuevo mes.\nVer Estadísticas mensuales.');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkRollover();
      }
    };

    // Revisar periódicamente cada 30 segundos mientras la app esté abierta
    const intervalId = setInterval(checkRollover, 30000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Tareas actuales según la pestaña activa
  const currentTasks = activeTab === 'daily' ? dailyTasks : monthlyTasks;
  const setCurrentTasks = (updater: (prev: Task[]) => Task[]) => {
    if (activeTab === 'daily') {
      setDailyTasks(updater);
    } else {
      setMonthlyTasks(updater);
    }
  };

  // Manejadores de Tareas (compatibles con ambas pestañas)
  const handleToggleTask = (id: string) => {
    if (activeTab === 'monthly') {
      setMonthlyTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
        const total = next.length;
        const completed = next.filter((t) => t.completed).length;
        if (total > 0 && completed === total) {
          // Todas las estadísticas mensuales cumplidas: cambiar automáticamente el enfoque a Tareas diarias
          setTimeout(() => {
            setShowCompletedMonthly(false);
            setActiveTab('daily');
            showToast('¡Estadísticas mensuales cumplidas!\nOcultas para enfocar en Tareas diarias.');
          }, 350);
        }
        return next;
      });
    } else {
      setDailyTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    }
  };

  const handleAddTask = (text: string, url: string) => {
    const newTask: Task = {
      id: generateId(),
      text,
      url,
      completed: false,
      createdAt: Date.now(),
    };
    setCurrentTasks((prev) => [...prev, newTask]);
    showToast(activeTab === 'daily' ? 'Tarea diaria agregada' : 'Estadística mensual agregada');
  };

  const handleUpdateTask = (id: string, newText: string, newUrl: string) => {
    setCurrentTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText, url: newUrl } : t))
    );
    showToast('Actividad actualizada');
  };

  const handleDeleteTask = (id: string) => {
    setCurrentTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Actividad eliminada');
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setCurrentTasks((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= currentTasks.length - 1) return;
    setCurrentTasks((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Reordenar tareas diarias según el orden oficial dispuesto
  const handleSortOfficialOrder = () => {
    if (activeTab === 'daily') {
      setDailyTasks((prev) => {
        const sorted = [...prev].sort((a, b) => {
          const rankA = getCanonicalDailyRank(a.text);
          const rankB = getCanonicalDailyRank(b.text);
          if (rankA !== 999 && rankB !== 999) return rankA - rankB;
          if (rankA !== 999) return -1;
          if (rankB !== 999) return 1;
          return 0;
        });
        return sorted;
      });
      showToast('Tareas diarias ordenadas según lista oficial');
    }
  };

  // Reinicio manual de la pestaña activa
  const handleManualReset = () => {
    setCurrentTasks((prev) => prev.map((t) => ({ ...t, completed: false })));
    showToast(
      activeTab === 'daily' 
        ? 'Tareas diarias destildadas' 
        : 'Estadísticas del mes destildadas'
    );
  };

  // Exportar respaldo unificado en formato JSON
  const handleExport = () => {
    const exportData = {
      app: 'Diario de Tareas - GIS y Estadísticas Paraná',
      version: 2,
      exportDate: new Date().toISOString(),
      dailyTasks,
      monthlyTasks,
      exptesSie,
      // Retrocompatibilidad con backups anteriores
      tasks: dailyTasks,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `diario-de-tareas-gis-parana-${todayDateString || getLocalDateString()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Copia de seguridad descargada');
  };

  // Importar desde JSON con retrocompatibilidad
  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        const sanitizeList = (rawList: any[]): Task[] => {
          return rawList
            .filter((item) => item && typeof item.text === 'string' && item.text.trim())
            .map((item, idx) => ({
              id: item.id ? String(item.id) : generateId() + idx,
              text: item.text.trim(),
              url: typeof item.url === 'string' ? item.url.trim() : '',
              completed: Boolean(item.completed),
              createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now() + idx,
            }));
        };

        // Si contiene formato V2 con dailyTasks o monthlyTasks
        if (parsed && (Array.isArray(parsed.dailyTasks) || Array.isArray(parsed.monthlyTasks))) {
          if (Array.isArray(parsed.dailyTasks)) {
            setDailyTasks(sanitizeList(parsed.dailyTasks));
          }
          if (Array.isArray(parsed.monthlyTasks)) {
            setMonthlyTasks(sanitizeList(parsed.monthlyTasks));
          }
          if (parsed.exptesSie !== undefined) {
            const strVal = String(parsed.exptesSie);
            setExptesSie(strVal);
            localStorage.setItem(STORAGE_KEY_EXPTES_SIE, strVal);
          }
          showToast('Copia de seguridad importada con éxito');
          return;
        }

        // Formato legado (solo lista de tareas)
        let importedList: any[] = [];
        if (Array.isArray(parsed)) {
          importedList = parsed;
        } else if (parsed && Array.isArray(parsed.tasks)) {
          importedList = parsed.tasks;
        } else {
          throw new Error('Formato no reconocido');
        }

        const sanitized = sanitizeList(importedList);
        if (sanitized.length === 0) {
          showToast('El archivo no contiene actividades válidas');
          return;
        }

        // Importar en la pestaña activa
        if (activeTab === 'daily') {
          setDailyTasks(sanitized);
        } else {
          setMonthlyTasks(sanitized);
        }
        showToast(`Se importaron ${sanitized.length} actividades en ${activeTab === 'daily' ? 'tareas diarias' : 'estadísticas mensuales'}`);
      } catch (err) {
        console.error(err);
        showToast('Error al leer el archivo JSON');
      } finally {
        if (event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Cálculos de conteo y progreso
  const dailyTotal = dailyTasks.length;
  const dailyCompleted = dailyTasks.filter((t) => t.completed).length;

  const monthlyTotal = monthlyTasks.length;
  const monthlyCompleted = monthlyTasks.filter((t) => t.completed).length;
  const isMonthlyAllDone = monthlyTotal > 0 && monthlyCompleted === monthlyTotal;
  const isMonthlyTabHidden = isMonthlyAllDone && !showCompletedMonthly;

  // Si las estadísticas mensuales están completas y ocultas, asegurar el foco en Tareas diarias
  useEffect(() => {
    if (isMonthlyTabHidden && activeTab === 'monthly') {
      setActiveTab('daily');
    }
  }, [isMonthlyTabHidden, activeTab]);

  const currentTotal = currentTasks.length;
  const currentCompleted = currentTasks.filter((t) => t.completed).length;
  const progressPercent = currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-10 px-4 flex flex-col items-center">
      {/* Notificación flotante / Toast accesible */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="whitespace-pre-line leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Input oculto para importar JSON */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json,application/json"
        className="hidden"
        aria-hidden="true"
      />

      {/* Panel principal: Ancho máximo ~640px, centrado */}
      <main className="w-full max-w-[640px] space-y-5">
        {/* Cabecera institucional */}
        <header className="space-y-2">
          {/* Texto institucional superior */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              Departamento GIS y Estadísticas | Municipalidad de Paraná
            </span>

            {/* Barra de utilidades superiores: primero el ? y luego Instalar app */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                title="Guía y ayuda de uso"
                aria-label="Abrir guía y ayuda"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <PWAInstallButton />
            </div>
          </div>

          {/* Título de la app, fecha y Card de Exptes en SIE */}
          <div className="pt-1 flex items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Diario de Tareas
              </h1>
              <p className="flex items-center gap-1.5 mt-1 text-sm text-slate-600 dark:text-slate-400 font-normal">
                <CalendarDays className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>
                  {activeTab === 'daily' 
                    ? (formattedDateText || 'Cargando fecha...') 
                    : (formattedMonthText ? `Período: ${formattedMonthText}` : 'Cargando período...')}
                </span>
              </p>
            </div>

            {/* Card editable: Exptes en SIE */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex flex-col items-center justify-center text-center text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-tight select-none">
                <span>Exptes</span>
                <span>en SIE</span>
              </div>
              <input
                type="text"
                value={exptesSie}
                onChange={(e) => handleExptesSieChange(e.target.value)}
                placeholder="00"
                aria-label="Cantidad de expedientes en SIE"
                title="Editar cantidad de expedientes en SIE (guardado automático)"
                className="w-20 sm:w-24 h-14 sm:h-16 rounded-2xl bg-slate-200/90 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-center text-3xl sm:text-4xl font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 shadow-2xs transition-all"
              />
            </div>
          </div>
        </header>

        {/* Selector de Pestañas (Navegación principal) */}
        <nav
          role="tablist"
          aria-label="Pestañas de tareas"
          className={`grid ${isMonthlyTabHidden ? 'grid-cols-1' : 'grid-cols-2'} p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800/90 border border-slate-300/70 dark:border-slate-700/80 shadow-xs transition-all`}
        >
          {/* Pestaña 1: Tareas diarias */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'daily'}
            aria-controls="panel-daily"
            onClick={() => setActiveTab('daily')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4 shrink-0" />
            <span>Tareas diarias</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium transition ${
                activeTab === 'daily'
                  ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
                  : 'bg-slate-300/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {dailyCompleted}/{dailyTotal}
            </span>
          </button>

          {/* Pestaña 2: Estadísticas mensuales (oculta si están 3/3 cumplidas para mantener el enfoque en diarias) */}
          {!isMonthlyTabHidden && (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'monthly'}
              aria-controls="panel-monthly"
              onClick={() => setActiveTab('monthly')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeTab === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className={`w-4 h-4 shrink-0 ${isMonthlyAllDone ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
              <span
                className={
                  isMonthlyAllDone
                    ? 'line-through decoration-2 decoration-slate-400 dark:decoration-slate-500 text-slate-400 dark:text-slate-500'
                    : ''
                }
              >
                Estadísticas mensuales
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium transition ${
                  isMonthlyAllDone
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : activeTab === 'monthly'
                    ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
                    : 'bg-slate-300/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {monthlyCompleted}/{monthlyTotal}
              </span>
            </button>
          )}
        </nav>

        {/* Barra de estado y progreso de la pestaña activa */}
        <section
          aria-label={`Progreso de ${activeTab === 'daily' ? 'tareas diarias' : 'estadísticas mensuales'}`}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
        >
          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white text-base">
                {currentCompleted} de {currentTotal} cumplidas
              </span>
              {currentTotal > 0 && currentCompleted === currentTotal && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ¡Todo listo!
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Botón para forzar orden oficial en tareas diarias */}
              {activeTab === 'daily' && (
                <button
                  type="button"
                  onClick={handleSortOfficialOrder}
                  title="Alinear las tarjetas al orden oficial acordado"
                  aria-label="Ordenar tareas diarias según lista oficial"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Orden oficial</span>
                </button>
              )}

              {/* Botón manual de reiniciar tildes */}
              <button
                type="button"
                onClick={handleManualReset}
                title={
                  activeTab === 'daily'
                    ? 'Destilda todas las tareas diarias'
                    : 'Destilda todas las estadísticas mensuales'
                }
                aria-label="Reiniciar tildes"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>{activeTab === 'daily' ? 'Reiniciar día' : 'Reiniciar mes'}</span>
              </button>
            </div>
          </div>

          {/* Barra de progreso visual */}
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 dark:bg-emerald-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </section>

        {/* Listado de actividades de la pestaña activa */}
        <section 
          id={activeTab === 'daily' ? 'panel-daily' : 'panel-monthly'}
          role="tabpanel"
          aria-label={activeTab === 'daily' ? 'Lista de tareas diarias' : 'Lista de estadísticas mensuales'}
        >
          {currentTasks.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {activeTab === 'daily' 
                  ? 'No hay tareas diarias cargadas.' 
                  : 'No hay estadísticas mensuales cargadas.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Escribí el nombre y opcionalmente el enlace al reporte de Power BI o portal.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {currentTasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  totalTasks={currentTasks.length}
                  onToggle={handleToggleTask}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              ))}
            </ul>
          )}
        </section>

        {/* Formulario de agregar actividad según la pestaña */}
        <TaskForm 
          onAdd={handleAddTask} 
          title={activeTab === 'daily' ? 'Nueva tarea diaria' : 'Nueva estadística mensual'}
          placeholderText={
            activeTab === 'daily' 
              ? 'Actividad (ej. Revisar expedientes)...' 
              : 'Informe (ej. Liquidaciones Power BI)...'
          }
        />

        {/* Aviso discreto cuando las estadísticas mensuales están completadas y ocultas */}
        {isMonthlyAllDone && !showCompletedMonthly && (
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Estadísticas mensuales cumplidas ({monthlyCompleted}/{monthlyTotal}) • Ocultas para enfocar en Tareas diarias.</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setShowCompletedMonthly(true);
                setActiveTab('monthly');
              }}
              title="Mostrar pestaña de Estadísticas mensuales"
              className="inline-flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 cursor-pointer ml-2 shrink-0 py-0.5 px-2 rounded-md hover:bg-sky-50 dark:hover:bg-slate-800 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver</span>
            </button>
          </div>
        )}

        {/* Barra para volver a ocultar si se está mostrando temporalmente la pestaña completada */}
        {isMonthlyAllDone && showCompletedMonthly && activeTab === 'monthly' && (
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Estadísticas mensuales completadas para este período.</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setShowCompletedMonthly(false);
                setActiveTab('daily');
              }}
              title="Ocultar y volver al foco de Tareas diarias"
              className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 cursor-pointer ml-2 shrink-0 py-0.5 px-2 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Ocultar y enfocar en Tareas diarias</span>
            </button>
          </div>
        )}

        {/* Acciones de respaldo (Exportar / Importar) */}
        <footer className="pt-2 pb-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              title="Descargar copia de seguridad en JSON (incluye tareas diarias y mensuales)"
              aria-label="Exportar respaldo de tareas a archivo JSON"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition cursor-pointer shadow-2xs font-medium"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Cargar copia de seguridad desde un archivo JSON"
              aria-label="Importar respaldo desde archivo JSON"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition cursor-pointer shadow-2xs font-medium"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Importar</span>
            </button>
          </div>

          <div className="text-right text-[11px] text-slate-400">
            <span>
              {activeTab === 'daily' 
                ? 'Reinicio diario automático activo' 
                : 'Reinicio mensual automático activo'}
            </span>
          </div>
        </footer>
      </main>

      {/* Modal de Ayuda e Instrucciones */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
