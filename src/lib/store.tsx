import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { LogEntry } from './guidance';
import { Profile } from './profile';
import { computeTargets, Targets } from './targets';

const PROFILE_KEY = 'nutriwork.profile.v1';
const LOG_KEY = 'nutriwork.log.v1';

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type Store = {
  ready: boolean;
  profile?: Profile;
  targets?: Targets;
  entries: LogEntry[];
  saveProfile: (p: Profile) => Promise<void>;
  addEntries: (e: LogEntry[]) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  entriesFor: (date: string) => LogEntry[];
  resetAll: () => Promise<void>;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile>();
  const [entries, setEntries] = useState<LogEntry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, l] = await Promise.all([AsyncStorage.getItem(PROFILE_KEY), AsyncStorage.getItem(LOG_KEY)]);
        if (p) setProfile(JSON.parse(p));
        if (l) setEntries(JSON.parse(l));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const saveProfile = useCallback(async (p: Profile) => {
    setProfile(p);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  }, []);

  const persistEntries = useCallback((next: LogEntry[]) => {
    AsyncStorage.setItem(LOG_KEY, JSON.stringify(next)).catch(() => {});
    return next;
  }, []);

  const addEntries = useCallback(
    async (e: LogEntry[]) => setEntries((prev) => persistEntries([...prev, ...e])),
    [persistEntries],
  );

  const removeEntry = useCallback(
    async (id: string) => setEntries((prev) => persistEntries(prev.filter((x) => x.id !== id))),
    [persistEntries],
  );

  const resetAll = useCallback(async () => {
    await AsyncStorage.multiRemove([PROFILE_KEY, LOG_KEY]);
    setProfile(undefined);
    setEntries([]);
  }, []);

  const value = useMemo<Store>(
    () => ({
      ready,
      profile,
      targets: profile ? computeTargets(profile) : undefined,
      entries,
      saveProfile,
      addEntries,
      removeEntry,
      entriesFor: (date) => entries.filter((e) => e.date === date),
      resetAll,
    }),
    [ready, profile, entries, saveProfile, addEntries, removeEntry, resetAll],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
