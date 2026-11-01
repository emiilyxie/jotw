"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import WeekCard from "@/components/WeekCard";
import { getAllWeekIds, getCurrentWeekId, getDefaultStandardIndex } from "@/lib/weeks";
import { WeekRecord, getWeekRecord } from "@/lib/storage";
import { STANDARDS } from "@/lib/standards";

export default function Home() {
  const [weekIds, setWeekIds] = useState<string[]>([]);
  const [records, setRecords] = useState<Record<string, WeekRecord | null>>({});
  const [currentWeekId, setCurrentWeekId] = useState("");

  const completedCount = Object.values(records).filter((r) => r?.completed).length;

  // SHUFFLED indices of standards that have already been transcribed —
  // passed to the current week card so rerolls avoid them
  const completedIndices = useMemo(() => {
    const indices = new Set<number>();
    for (const [id, rec] of Object.entries(records)) {
      if (rec?.completed) {
        const history = rec.rerollHistory;
        indices.add(
          history && history.length > 0 ? history[history.length - 1] : getDefaultStandardIndex(id)
        );
      }
    }
    return indices;
  }, [records]);

  useEffect(() => {
    const ids = getAllWeekIds();
    const current = getCurrentWeekId();
    setWeekIds(ids);
    setCurrentWeekId(current);
    const initial: Record<string, WeekRecord | null> = {};
    for (const id of ids) {
      initial[id] = getWeekRecord(id);
    }
    setRecords(initial);
  }, []);

  const handleRecordChange = useCallback((record: WeekRecord) => {
    setRecords((prev) => ({ ...prev, [record.weekId]: record }));
  }, []);

  const currentIndex = weekIds.indexOf(currentWeekId);
  const pastWeekIds = weekIds.slice(currentIndex + 1);
  const hasHistory = pastWeekIds.length > 0;

  return (
    <div className="min-h-screen bg-[#090909] text-[#e0e0e0]">
      <header className="border-b border-[#1e1e1e] bg-[#0c0c0c]">
        <div className="max-w-2xl mx-auto px-5 py-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-serif text-[#f0e4c4] leading-none">
                Jam of the Week
              </h1>
              <p className="text-sm text-[#555] mt-1.5">
                {STANDARDS.length} standards · one per week
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {completedCount > 0 && (
                <div className="text-right">
                  <div className="text-lg font-serif text-[#4ade80]">{completedCount}</div>
                  <div className="text-[10px] text-[#444] uppercase tracking-widest">
                    transcribed
                  </div>
                </div>
              )}
              <Link
                href="/standards"
                className="text-xs text-[#666] hover:text-[#aaa] border border-[#2a2a2a] hover:border-[#444] rounded-lg px-3 py-1.5 transition-colors"
              >
                All standards
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-10">
        {currentWeekId && weekIds.length > 0 && (
          <section>
            <WeekCard
              weekId={currentWeekId}
              record={records[currentWeekId] ?? null}
              onRecordChange={handleRecordChange}
              completedIndices={completedIndices}
              isCurrent
            />
          </section>
        )}

        {hasHistory && (
          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#555] mb-4">
              History
            </h2>
            <div className="space-y-3">
              {pastWeekIds.map((id) => (
                <WeekCard
                  key={id}
                  weekId={id}
                  record={records[id] ?? null}
                  onRecordChange={handleRecordChange}
                />
              ))}
            </div>
          </section>
        )}

        {!hasHistory && currentWeekId && (
          <p className="text-sm text-[#444] text-center py-6">
            History will appear here after the first week passes.
          </p>
        )}
      </main>
    </div>
  );
}
