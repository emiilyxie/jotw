"use client";

import { useCallback } from "react";
import {
  getStandardForWeek,
  getProjectWeekNumber,
  formatWeekRange,
  getCurrentWeekId,
} from "@/lib/weeks";
import { WeekRecord, markCompleted, markIncomplete, rerollWeek, undoReroll } from "@/lib/storage";

const PRIORITY_LABEL: Record<number, string> = {
  1: "Critical",
  2: "High",
  3: "Medium",
  4: "Lower",
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

interface Props {
  weekId: string;
  record: WeekRecord | null;
  onRecordChange: (record: WeekRecord) => void;
  completedIndices?: Set<number>;
  isCurrent?: boolean;
}

export default function WeekCard({
  weekId,
  record,
  onRecordChange,
  completedIndices,
  isCurrent,
}: Props) {
  const rerollHistory = record?.rerollHistory ?? [];
  const standard = getStandardForWeek(weekId, rerollHistory);
  const weekNum = getProjectWeekNumber(weekId);
  const dateRange = formatWeekRange(weekId);
  const currentWeekId = getCurrentWeekId();
  const isPast = weekId < currentWeekId;
  const isCompleted = record?.completed ?? false;
  const categoryColor = CATEGORY_COLORS[standard.category] ?? "text-[#e8e8e8]";
  const canUndo = isCurrent && rerollHistory.length > 0;

  const handleComplete = useCallback(() => {
    onRecordChange(markCompleted(weekId));
  }, [weekId, onRecordChange]);

  const handleUncomplete = useCallback(() => {
    onRecordChange(markIncomplete(weekId));
  }, [weekId, onRecordChange]);

  const handleReroll = useCallback(() => {
    onRecordChange(rerollWeek(weekId, completedIndices ?? new Set()));
  }, [weekId, onRecordChange, completedIndices]);

  const handleUndo = useCallback(() => {
    onRecordChange(undoReroll(weekId));
  }, [weekId, onRecordChange]);

  return (
    <div
      className={`rounded-xl border p-5 transition-all duration-200 ${
        isCurrent
          ? "border-[#d4a843] bg-[#1a1508] shadow-lg shadow-[#d4a84320]"
          : isCompleted
          ? "border-[#2a4a2a] bg-[#0f1a0f]"
          : "border-[#252525] bg-[#111111]"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isCurrent && (
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#d4a843] bg-[#d4a84320] border border-[#d4a84340] px-2 py-0.5 rounded-full">
              This Week
            </span>
          )}
          <span className="text-xs text-[#666] font-medium">Week {weekNum}</span>
          <span className="text-[#444]">·</span>
          <span className="text-xs text-[#666]">{dateRange}</span>
        </div>
        {isCompleted && (
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#4ade80] bg-[#4ade8015] border border-[#4ade8030] px-2 py-0.5 rounded-full whitespace-nowrap">
            ✓ Done
          </span>
        )}
      </div>

      {/* Standard title */}
      <h2
        className={`font-serif text-2xl leading-tight mb-1 ${
          isCurrent ? "text-[#f5e8c4]" : isCompleted ? "text-[#9fc49f]" : "text-[#d8d8d8]"
        }`}
      >
        {standard.title}
      </h2>

      {/* Category / priority */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs font-medium ${categoryColor}`}>{standard.category}</span>
        <span className="text-[#444]">·</span>
        <span className="text-xs text-[#555]">
          Priority {standard.priority} — {PRIORITY_LABEL[standard.priority]}
        </span>
        {rerollHistory.length > 0 && (
          <>
            <span className="text-[#444]">·</span>
            <span className="text-xs text-[#555]">rerolled {rerollHistory.length}×</span>
          </>
        )}
      </div>

      {/* Actions */}
      {(isCurrent || isPast) && (
        <div className="flex items-center gap-2 flex-wrap">
          {isCompleted ? (
            <button
              onClick={handleUncomplete}
              className="text-xs text-[#555] hover:text-[#888] border border-[#333] hover:border-[#555] rounded-lg px-3 py-1.5 transition-colors"
            >
              Mark incomplete
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="text-xs font-medium text-[#0a0a0a] bg-[#d4a843] hover:bg-[#e0b84e] rounded-lg px-3 py-1.5 transition-colors"
            >
              Mark complete
            </button>
          )}

          {isCurrent && (
            <>
              <button
                onClick={handleReroll}
                className="text-xs text-[#888] hover:text-[#bbb] border border-[#333] hover:border-[#555] rounded-lg px-3 py-1.5 transition-colors"
              >
                Reroll
              </button>
              {canUndo && (
                <button
                  onClick={handleUndo}
                  className="text-xs text-[#555] hover:text-[#888] rounded-lg px-2 py-1.5 transition-colors"
                  title="Undo last reroll"
                >
                  ← Undo
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
