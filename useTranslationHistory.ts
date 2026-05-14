import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HistoryEntry {
  id: string;
  source: string;
  target: string;
  lang: string;
  mode: 'translate' | 'scan' | 'paste';
  timestamp: number;
}

const STORAGE_KEY = '@lingua_history_v2';

export function useTranslationHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) setHistory(JSON.parse(raw));
    });
  }, []);

  const addEntry = async (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...history].slice(0, 100);
    setHistory(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return { history, addEntry, clearHistory };
}
