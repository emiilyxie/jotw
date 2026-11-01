"use client";

import { pickRerollIndex } from "./weeks";

export interface WeekRecord {
  weekId: string;
  completed: boolean;
  rerollHistory?: number[]; // stack of SHUFFLED indices; top = current standard
  notes?: string;
  completedAt?: string;
}

const KEY = "jotw:weeks:v2";

function loadAll(): Record<string, WeekRecord> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveAll(records: Record<string, WeekRecord>) {
  localStorage.setItem(KEY, JSON.stringify(records));
}

export function getWeekRecord(weekId: string): WeekRecord | null {
  return loadAll()[weekId] ?? null;
}

export function saveWeekRecord(record: WeekRecord) {
  const all = loadAll();
  all[record.weekId] = record;
  saveAll(all);
}

export function markCompleted(weekId: string): WeekRecord {
  const existing = getWeekRecord(weekId);
  const updated: WeekRecord = {
    ...(existing ?? { weekId }),
    weekId,
    completed: true,
    completedAt: existing?.completedAt ?? new Date().toISOString(),
  };
  saveWeekRecord(updated);
  return updated;
}

export function markIncomplete(weekId: string): WeekRecord {
  const existing = getWeekRecord(weekId) ?? { weekId, completed: false };
  const updated: WeekRecord = { ...existing, completed: false, completedAt: undefined };
  saveWeekRecord(updated);
  return updated;
}

export function rerollWeek(weekId: string, completedIndices: Set<number>): WeekRecord {
  const existing = getWeekRecord(weekId) ?? { weekId, completed: false };
  const history = existing.rerollHistory ?? [];
  const newIdx = pickRerollIndex(weekId, completedIndices, history);
  const updated: WeekRecord = { ...existing, rerollHistory: [...history, newIdx] };
  saveWeekRecord(updated);
  return updated;
}

export function undoReroll(weekId: string): WeekRecord {
  const existing = getWeekRecord(weekId) ?? { weekId, completed: false };
  const history = [...(existing.rerollHistory ?? [])];
  history.pop();
  const updated: WeekRecord = { ...existing, rerollHistory: history };
  saveWeekRecord(updated);
  return updated;
}
