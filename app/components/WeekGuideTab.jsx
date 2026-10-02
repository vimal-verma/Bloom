"use client";

import { useState } from "react";
import { 
  WEEKS_DATA 
} from "../lib/pregnancyData";
import { 
  BookOpen, 
  Baby, 
  Heart, 
  Sparkles, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Bookmark
} from "lucide-react";

export default function WeekGuideTab({ currentWeek = 1 }) {
  const [selectedWeekNum, setSelectedWeekNum] = useState(currentWeek);
  const [activeTrimesterFilter, setActiveTrimesterFilter] = useState(0); // 0 = all

  const selectedWeek = WEEKS_DATA.find((w) => w.week === selectedWeekNum) || WEEKS_DATA[0];

  const filteredWeeks = activeTrimesterFilter === 0 
    ? WEEKS_DATA 
    : WEEKS_DATA.filter((w) => w.trimester === activeTrimesterFilter);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Controls & Trimester Filters */}
      <div className="glass-card-elevated rounded-3xl p-6 sm:p-7 border border-rose-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-400 to-amber-400 text-white flex items-center justify-center shadow-md shadow-rose-200">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Week by Week Pregnancy Guide
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Explore milestones, baby growth, and mom's physical changes for all 40 weeks.
              </p>
            </div>
          </div>

          {/* Jump to current week button */}
          <button
            onClick={() => setSelectedWeekNum(currentWeek)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold border border-rose-200/80 transition-all self-start sm:self-auto"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Jump to My Current Week ({currentWeek})</span>
          </button>
        </div>

        {/* Trimester Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-100/70">
          {[
            { id: 0, label: "All Weeks (1 - 40)" },
            { id: 1, label: "Trimester 1 (W1 - W13)" },
            { id: 2, label: "Trimester 2 (W14 - W27)" },
            { id: 3, label: "Trimester 3 (W28 - W40)" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTrimesterFilter(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTrimesterFilter === t.id
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Horizontal Week Pill Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
          {filteredWeeks.map((w) => {
            const isSelected = w.week === selectedWeekNum;
            const isUserCurrent = w.week === currentWeek;

            return (
              <button
                key={w.week}
                onClick={() => setSelectedWeekNum(w.week)}
                className={`flex flex-col items-center justify-center min-w-[62px] h-[72px] rounded-2xl border transition-all shrink-0 relative ${
                  isSelected
                    ? "bg-gradient-to-b from-rose-500 to-pink-500 border-rose-500 text-white shadow-md shadow-rose-200 scale-105"
                    : "bg-white/90 border-rose-100 hover:border-rose-200 text-slate-700"
                }`}
              >
                {isUserCurrent && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white ring-1 ring-amber-300" />
                )}
                <span className="text-xl mb-0.5">{w.emoji}</span>
                <span className="text-[11px] font-bold">W{w.week}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Week Detailed Spotlight */}
      <div className="glass-card-elevated rounded-3xl p-6 sm:p-8 space-y-6 border border-rose-100">
        {/* Navigation Arrows & Title */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-100/70">
          <button
            onClick={() => setSelectedWeekNum((prev) => Math.max(1, prev - 1))}
            disabled={selectedWeekNum <= 1}
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 disabled:opacity-30 text-slate-700 transition-colors"
            title="Previous Week"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 uppercase tracking-wider">
              Trimester {selectedWeek.trimester}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">
              Week {selectedWeek.week}: {selectedWeek.name}
            </h3>
          </div>

          <button
            onClick={() => setSelectedWeekNum((prev) => Math.min(40, prev + 1))}
            disabled={selectedWeekNum >= 40}
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 disabled:opacity-30 text-slate-700 transition-colors"
            title="Next Week"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Baby Size Card in Guide */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-200/60 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center text-5xl shrink-0 border-2 border-rose-100">
            {selectedWeek.emoji}
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Baby Size Comparison
            </span>
            <h4 className="text-xl sm:text-2xl font-bold text-slate-800">
              Size of a {selectedWeek.fruit}
            </h4>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-2">
              <span className="px-3 py-1 rounded-xl bg-white/90 border border-rose-100 text-xs font-semibold text-slate-700">
                📏 Length: <strong>{selectedWeek.length}</strong>
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/90 border border-rose-100 text-xs font-semibold text-slate-700">
                ⚖️ Weight: <strong>{selectedWeek.weight}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Sections: Baby & Mom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Baby's Development */}
          <div className="p-5 rounded-2xl bg-white/90 border border-rose-100 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600 font-bold text-base">
              <Baby className="w-5 h-5" />
              <span>Baby's Development</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {selectedWeek.babyInfo}
            </p>
          </div>

          {/* Mom's Body Changes */}
          <div className="p-5 rounded-2xl bg-white/90 border border-amber-100 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-700 font-bold text-base">
              <Heart className="w-5 h-5" />
              <span>Mom's Body Changes</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {selectedWeek.momInfo}
            </p>
          </div>
        </div>

        {/* Doctor and Self-Care Tips */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/70 to-slate-50 border border-rose-100 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Essential Tips for Week {selectedWeek.week}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {selectedWeek.tips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/90 border border-rose-100/70 flex items-start gap-2 shadow-xs text-xs text-slate-700 font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
