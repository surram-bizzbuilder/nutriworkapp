import { useEffect } from 'react';
import { AppState } from 'react-native';

import { syncReminders } from '../lib/reminders';
import { dateKey, useStore } from '../lib/store';

// Keeps scheduled meal reminders in step with the profile and today's log.
export function ReminderSync() {
  const { profile, targets, entries } = useStore();

  useEffect(() => {
    if (!profile || !targets) return;
    const run = () => syncReminders(profile, targets, entries.filter((e) => e.date === dateKey())).catch(() => {});
    run();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && run());
    return () => sub.remove();
  }, [profile, targets, entries]);

  return null;
}
