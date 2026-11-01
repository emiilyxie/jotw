import { STANDARDS, JazzStandard } from "./standards";

// Project starts week of June 15, 2026 (ISO week 2026-W25)
export const START_WEEK_ID = "2026-W26";

const SHUFFLED = [...STANDARDS].sort((a, b) =>
  a.priority !== b.priority ? a.priority - b.priority : a.title.localeCompare(b.title)
);

// Parse "2026-W25" → { year: 2026, week: 25 }
function parseWeekId(weekId: string): { year: number; week: number } {
  const [yearStr, weekStr] = weekId.split("-W");
  return { year: parseInt(yearStr, 10), week: parseInt(weekStr, 10) };
}

// Get the Monday date of a given ISO week
export function getWeekStartDate(weekId: string): Date {
  const { year, week } = parseWeekId(weekId);
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7; // Monday=1 … Sunday=7
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1);
  const result = new Date(week1Monday);
  result.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  return result;
}

// Get the Sunday end date of a given ISO week
export function getWeekEndDate(weekId: string): Date {
  const start = getWeekStartDate(weekId);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return end;
}

// How many weeks since the project start (1-indexed)
export function getProjectWeekNumber(weekId: string): number {
  const startDate = getWeekStartDate(START_WEEK_ID);
  const weekDate = getWeekStartDate(weekId);
  const diffDays = Math.round(
    (weekDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.floor(diffDays / 7) + 1;
}

// Current ISO weekId like "2026-W25"
export function getCurrentWeekId(): string {
  const now = new Date();
  const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  // Shift to Thursday of current week to determine the ISO year
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${week.toString().padStart(2, "0")}`;
}

// Index of the deterministic default standard for a week
export function getDefaultStandardIndex(weekId: string): number {
  return (getProjectWeekNumber(weekId) - 1) % SHUFFLED.length;
}

// The standard for a week. rerollHistory is a stack of SHUFFLED indices chosen
// by past rerolls; the top of the stack wins over the default.
export function getStandardForWeek(weekId: string, rerollHistory?: number[]): JazzStandard {
  if (rerollHistory && rerollHistory.length > 0) {
    return SHUFFLED[rerollHistory[rerollHistory.length - 1]];
  }
  return SHUFFLED[getDefaultStandardIndex(weekId)];
}

// Pick a random SHUFFLED index for a reroll.
// Avoids: already-completed standards, the default assignment, anything shown
// earlier this session. Falls back gracefully if choices run out.
export function pickRerollIndex(
  weekId: string,
  completedIndices: Set<number>,
  rerollHistory: number[]
): number {
  const defaultIdx = getDefaultStandardIndex(weekId);
  const shownThisSession = new Set([defaultIdx, ...rerollHistory]);

  // Preferred pool: not completed and not shown this session
  let pool: number[] = [];
  for (let i = 0; i < SHUFFLED.length; i++) {
    if (!completedIndices.has(i) && !shownThisSession.has(i)) pool.push(i);
  }

  // Fallback: not completed, but ok to re-show something from this session
  if (pool.length === 0) {
    const current = rerollHistory.at(-1) ?? defaultIdx;
    for (let i = 0; i < SHUFFLED.length; i++) {
      if (!completedIndices.has(i) && i !== current) pool.push(i);
    }
  }

  // Last resort: anything different from what's currently showing
  if (pool.length === 0) {
    const current = rerollHistory.at(-1) ?? defaultIdx;
    for (let i = 0; i < SHUFFLED.length; i++) {
      if (i !== current) pool.push(i);
    }
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

// All week IDs from project start through the current week, newest first
export function getAllWeekIds(): string[] {
  const currentId = getCurrentWeekId();
  const startDate = getWeekStartDate(START_WEEK_ID);
  const currentDate = getWeekStartDate(currentId);
  const totalWeeks =
    Math.round((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  const ids: string[] = [];
  for (let i = totalWeeks - 1; i >= 0; i--) {
    const d = new Date(startDate);
    d.setUTCDate(startDate.getUTCDate() + i * 7);
    ids.push(dateToWeekId(d));
  }
  return ids;
}

function dateToWeekId(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${week.toString().padStart(2, "0")}`;
}

// Format a date range for display: "Jun 15 – 21, 2026"
export function formatWeekRange(weekId: string): string {
  const start = getWeekStartDate(weekId);
  const end = getWeekEndDate(weekId);
  const startMonth = start.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const year = end.getUTCFullYear();
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}
