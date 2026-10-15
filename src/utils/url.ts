/**
 * Normaliza y valida una URL ingresada por el usuario.
 * Si no incluye protocolo (ej. 'drive.google.com'), se antepone 'https://'.
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Si ya tiene protocolo http:// o https://
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Si tiene formato de protocolo diferente (ej. mailto: o file:) lo dejamos tal cual
  if (/^[a-zA-Z]+:\/\//.test(trimmed)) {
    return trimmed;
  }

  // Prepend https://
  return `https://${trimmed}`;
}

/**
 * Valida si una cadena puede considerarse una URL válida.
 */
export function isValidUrl(input: string): boolean {
  const normalized = normalizeUrl(input);
  if (!normalized) return false;
  try {
    const url = new URL(normalized);
    return Boolean(url.hostname && url.hostname.length > 1);
  } catch {
    return false;
  }
}
