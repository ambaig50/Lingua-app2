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
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

const STORAGE_KEY = '@lingua_history_v2';

const HistoryContext = createContext<HistoryContextType>({
  history: [],
  addEntry: () => {},
  clearHistory: () => {},
});

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try { setHistory(JSON.parse(raw)); } catch {}
      }
    });
  }, []);

  const addEntry = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, 100);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  return (
    <HistoryContext.Provider value={{ history, addEntry, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useTranslationHistory() {
  return useContext(HistoryContext);
}
