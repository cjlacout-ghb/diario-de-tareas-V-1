/**
 * Retorna la fecha local actual en formato YYYY-MM-DD (ej: '2026-09-24')
 * Usa componentes locales (getFullYear, getMonth, getDate) para evitar desfases de zona horaria UTC.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna la fecha formateada en formato largo en español de Argentina.
 * Ej: "jueves, 24 de septiembre de 2026"
 */
export function getFormattedDateInSpanish(date: Date = new Date()): string {
  try {
    const formatted = new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);

    // Capitalizar la primera letra (ej: "Jueves 24 de septiembre de 2026")
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    // Fallback simple
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    const str = `${dayName}, ${day} de ${monthName} de ${year}`;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Retorna el mes local actual en formato YYYY-MM (ej: '2026-10')
 */
export function getLocalMonthString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Retorna el mes y año formateados en español. Ej: "Octubre de 2026"
 */
export function getFormattedMonthInSpanish(date: Date = new Date()): string {
  try {
    const formatted = new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: 'long',
    }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    const str = `${monthName} de ${year}`;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

