import { LogEntry } from './guidance';

function key(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Consecutive days with at least one logged entry, counting back from today.
// Today not being logged yet doesn't break a streak that ran through yesterday.
export function streakDays(entries: Pick<LogEntry, 'date'>[], now: Date = new Date()): number {
  const days = new Set(entries.map((e) => e.date));
  const cursor = new Date(now);
  if (!days.has(key(cursor))) cursor.setDate(cursor.getDate() - 1);
  let n = 0;
  while (days.has(key(cursor))) {
    n++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}
