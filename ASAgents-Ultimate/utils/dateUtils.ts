export function ensureDate(date: string | Date | undefined): Date | undefined {
  if (!date) return undefined;
  return typeof date === 'string' ? new Date(date) : date;
}

export function ensureDateString(date: string | Date | undefined): string | undefined {
  if (!date) return undefined;
  return typeof date === 'string' ? date : date.toISOString();
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return '';
  const d = ensureDate(date);
  return d ? d.toLocaleDateString() : '';
}

export function parseDate(dateStr: string | Date): Date {
  return typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
}
