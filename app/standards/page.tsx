"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { STANDARDS, Priority } from "@/lib/standards";
import { getDefaultStandardIndex, getStandardForWeek, getAllWeekIds, getCurrentWeekId } from "@/lib/weeks";
import { WeekRecord, getWeekRecord } from "@/lib/storage";

// Build a map from standard title → { weekNumber, weekId, record }
function buildWeekMap() {
  const allIds = getAllWeekIds();
  const currentId = getCurrentWeekId();
  // allIds is newest-first; reverse for 1-indexed numbering
  const ordered = [...allIds].reverse();

  const map = new Map<string, { weekNum: number; weekId: string; record: WeekRecord | null }>();
  for (let i = 0; i < ordered.length; i++) {
    const weekId = ordered[i];
    const rec = getWeekRecord(weekId);
    const standard = getStandardForWeek(weekId, rec?.rerollHistory);
    map.set(standard.title, { weekNum: i + 1, weekId, record: rec });
  }
  return map;
}

const PRIORITY_LABELS: Record<Priority, string> = {
  1: "Priority 1 — Critical",
  2: "Priority 2 — High",
  3: "Priority 3 — Medium",
  4: "Priority 4 — Lower",
};

const CATEGORY_COLORS: Record<string, string> = {
  Blues: "text-[#6eb5ff]",
  Latin: "text-[#a8e6a0]",
  Ballad: "text-[#d4a0e8]",
  "Rhythm Changes": "text-[#ffcf77]",
  "Jazz Standard": "text-[#f5c27a]",
  Standard: "text-[#e8e8e8]",
  Funk: "text-[#ff9f7f]",
};

const SORTED = [...STANDARDS].sort((a, b) =>
  a.priority !== b.priority ? a.priority - b.priority : a.title.localeCompare(b.title)
);

export default function StandardsPage() {
  const [weekMap, setWeekMap] = useState<Map<string, { weekNum: number; weekId: string; record: WeekRecord | null }>>(new Map());

  useEffect(() => {
    setWeekMap(buildWeekMap());
  }, []);

  const priorities = [1, 2, 3, 4] as Priority[];

  return (
    <div className="min-h-screen bg-[#090909] text-[#e0e0e0]">
      <header className="border-b border-[#1e1e1e] bg-[#0c0c0c]">
        <div className="max-w-3xl mx-auto px-5 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-[#f0e4c4] leading-none">All Standards</h1>
            <p className="text-sm text-[#555] mt-1.5">{STANDARDS.length} tunes</p>
          </div>
          <Link
            href="/"
            className="text-xs text-[#666] hover:text-[#aaa] border border-[#2a2a2a] hover:border-[#444] rounded-lg px-3 py-1.5 transition-colors"
          >
            ← This week
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 space-y-10">
        {priorities.map((priority) => {
          const group = SORTED.filter((s) => s.priority === priority);
          return (
            <section key={priority}>
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#555] mb-4">
                {PRIORITY_LABELS[priority]}
                <span className="text-[#3a3a3a] ml-2 font-normal normal-case tracking-normal">
                  {group.length} tunes
                </span>
              </h2>
              <div className="space-y-px">
                {group.map((standard) => {
                  const entry = weekMap.get(standard.title);
                  const isCompleted = entry?.record?.completed ?? false;
                  const isCurrent = entry?.weekId === getCurrentWeekId();
                  const isPast = entry && !isCurrent;
                  const categoryColor = CATEGORY_COLORS[standard.category] ?? "text-[#e8e8e8]";

                  return (
                    <div
                      key={standard.title}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group ${
                        isCompleted ? "bg-[#0f1a0f]" : isCurrent ? "bg-[#1a1508]" : "hover:bg-[#141414]"
                      }`}
                    >
                      {/* Week badge */}
                      <span className="text-xs tabular-nums w-14 shrink-0 text-right">
                        {entry ? (
                          <span className={isCurrent ? "text-[#d4a843]" : "text-[#444]"}>
                            Wk {entry.weekNum}
                          </span>
                        ) : (
                          <span className="text-[#2a2a2a]">—</span>
                        )}
                      </span>

                      {/* Title */}
                      <span
                        className={`flex-1 text-sm ${
                          isCompleted
                            ? "text-[#4ade80]"
                            : isCurrent
                            ? "text-[#f5e8c4]"
                            : "text-[#c8c8c8]"
                        }`}
                      >
                        {standard.title}
                      </span>

                      {/* Category */}
                      <span className={`text-xs shrink-0 ${categoryColor} opacity-70`}>
                        {standard.category}
                      </span>

                      {/* Done badge */}
                      {isCompleted && (
                        <span className="text-[10px] font-bold tracking-widest uppercase text-[#4ade80] opacity-60">
                          ✓
                        </span>
                      )}
                      {isCurrent && !isCompleted && (
                        <span className="text-[10px] font-bold tracking-widest uppercase text-[#d4a843] opacity-80">
                          now
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
