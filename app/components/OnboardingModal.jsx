"use client";

import { useState, useMemo } from "react";
import { Sparkles, Calendar, Heart, Clock, ArrowRight, Baby } from "lucide-react";
import { computeFromLMP, computeFromEDD } from "../lib/pregnancyData";

export default function OnboardingModal({ isOpen, onClose, onSave, initialData }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState(initialData?.mode || "lmp"); // "lmp" or "edd"
  const [lmpDate, setLmpDate] = useState(
    initialData?.lmpDate || (() => {
      // Default to ~14 weeks ago for a nice preview
      const d = new Date();
      d.setDate(d.getDate() - 98);
      return d.toISOString().split("T")[0];
    })()
  );
  const [eddDate, setEddDate] = useState(
    initialData?.eddDate || (() => {
      const d = new Date();
      d.setDate(d.getDate() + 182);
      return d.toISOString().split("T")[0];
    })()
  );
  const [cycleLength, setCycleLength] = useState(initialData?.cycleLength || 28);

  // Live calculation preview
  const previewStats = useMemo(() => {
    if (mode === "lmp") {
      return computeFromLMP(lmpDate, Number(cycleLength));
    } else {
      return computeFromEDD(eddDate);
    }
  }, [mode, lmpDate, eddDate, cycleLength]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!previewStats) return;

    onSave({
      mode,
      lmpDate: previewStats.lmpDate,
      eddDate: previewStats.eddDate,
      cycleLength: Number(cycleLength),
      stats: previewStats
    });
  };

  // Preset quick helpers for user convenience
  const handleQuickPreset = (weeksAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - (weeksAgo * 7));
    const formatted = d.toISOString().split("T")[0];
    setMode("lmp");
    setLmpDate(formatted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-lg glass-card-elevated rounded-3xl p-5 sm:p-8 shadow-2xl border border-rose-100 relative overflow-hidden max-h-[92dvh] overflow-y-auto my-auto">
        {/* Soft background glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white shadow-lg shadow-rose-200">
              <Baby className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Welcome to Your Pregnancy Journey
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Tell us a little bit about your timeline so we can personalize your week-by-week tracker and reminders.
            </p>
          </div>

          {/* Mode Switcher: LMP or EDD */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-rose-50/70 rounded-2xl mb-5 border border-rose-100">
            <button
              type="button"
              onClick={() => setMode("lmp")}
              className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                mode === "lmp"
                  ? "bg-white text-rose-600 shadow-sm border border-rose-100"
                  : "text-slate-600 hover:text-rose-500"
              }`}
            >
              📅 Last Period Date (LMP)
            </button>
            <button
              type="button"
              onClick={() => setMode("edd")}
              className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                mode === "edd"
                  ? "bg-white text-rose-600 shadow-sm border border-rose-100"
                  : "text-slate-600 hover:text-rose-500"
              }`}
            >
              🎯 Due Date (EDD)
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {mode === "lmp" ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Day of Your Last Period (LMP)
                  </label>
                  <input
                    type="date"
                    value={lmpDate}
                    onChange={(e) => setLmpDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-white/90 text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Doctors calculate gestational age from the first day of your last menstrual cycle.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                    <span>Average Menstrual Cycle Length</span>
                    <span className="text-rose-600 font-bold">{cycleLength} days</span>
                  </div>
                  <input
                    type="range"
                    min="21"
                    max="35"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(e.target.value)}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>21 days</span>
                    <span>28 days (Average)</span>
                    <span>35 days</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Estimated Due Date (EDD)
                </label>
                <input
                  type="date"
                  value={eddDate}
                  onChange={(e) => setEddDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-white/90 text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Provided by your doctor or ultrasound scan.
                </p>
              </div>
            )}

            {/* Live Calculation Preview Card */}
            {previewStats && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-100 text-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{previewStats.weekInfo?.emoji}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">
                        Week {previewStats.currentWeek}, Day {previewStats.currentDayOfWeek}
                      </h4>
                      <p className="text-xs text-rose-600 font-medium">
                        Trimester {previewStats.trimester} • Baby is size of a {previewStats.weekInfo?.fruit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-500 block">Due Date</span>
                    <span className="text-sm font-bold text-slate-800">
                      {new Date(previewStats.eddDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-rose-200/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-amber-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${previewStats.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>{previewStats.progressPercent}% Complete</span>
                  <span>{previewStats.daysLeft} days to go</span>
                </div>
              </div>
            )}

            {/* Quick Presets for fast testing */}
            <div className="pt-1">
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Quick Preview Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "🌱 Week 6 (1st Tri)", weeks: 6 },
                  { label: "🫑 Week 18 (2nd Tri)", weeks: 18 },
                  { label: "🎃 Week 28 (3rd Tri)", weeks: 28 },
                  { label: "🍉 Week 38 (Full Term)", weeks: 38 }
                ].map((p) => (
                  <button
                    key={p.weeks}
                    type="button"
                    onClick={() => handleQuickPreset(p.weeks)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center gap-3 pt-3">
              {initialData && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-sm font-bold shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2"
              >
                <span>Start My Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
