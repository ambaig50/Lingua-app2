import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HistoryEntry {
  id: string;
  source: string;
  target: string;
  lang: string;
  mode: 'translate' | 'scan' | 'paste';
  timestamp: number;
}

interface HistoryContextType {
  history: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const STORAGE_KEY = '@lingua_history_v2';

const HistoryContext = createContext<HistoryContextType>({
  history: [],
  addEntry: async () => {},
  clearHistory: async () => {},
});

// Single provider wraps the whole app — all screens share same state
export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load from storage once on app start
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) setHistory(JSON.parse(raw));
    });
  }, []);

  const addEntry = useCallback(async (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    // Update shared state immediately — all screens see it instantly
    setHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, 100);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <HistoryContext.Provider value={{ history, addEntry, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

// Simple hook — all screens use this, all get same live state
export function useTranslationHistory() {
  return useContext(HistoryContext);
}
