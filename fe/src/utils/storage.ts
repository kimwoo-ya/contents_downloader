import { LocalHistory } from '../types/format';

export const addHistoryUnique = (newHistory: LocalHistory) => {
  const stored = localStorage.getItem('localhistories');
  const histories: LocalHistory[] = stored ? JSON.parse(stored) : [];

  const isDuplicate = histories.some((h) => h.filename === newHistory.filename);
  if (!isDuplicate) {
    histories.push(newHistory);
    localStorage.setItem('localhistories', JSON.stringify(histories));
  }
};
