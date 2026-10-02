"use client";

import { useState } from "react";
import { X, Calendar, Droplets, Bell, RotateCcw, Check, Sparkles } from "lucide-react";
import { computeFromLMP, computeFromEDD } from "../lib/pregnancyData";
import { playChime } from "../lib/soundUtils";

export default function SettingsModal({
  isOpen,
  onClose,
  userData,
  onUpdateUserData,
  waterData,
  onUpdateWaterConfig,
  onResetAllData
}) {
  if (!isOpen) return null;

  const [mode, setMode] = useState(userData?.mode || "lmp");
  const [lmpDate, setLmpDate] = useState(userData?.lmpDate || "");
  const [eddDate, setEddDate] = useState(userData?.eddDate || "");
  const [cycleLength, setCycleLength] = useState(userData?.cycleLength || 28);
  const [targetMl, setTargetMl] = useState(waterData?.dailyTargetMl || 2500);

  const handleSave = (e) => {
    e.preventDefault();

    let newStats = null;
    if (mode === "lmp") {
      newStats = computeFromLMP(lmpDate, Number(cycleLength));
    } else {
      newStats = computeFromEDD(eddDate);
    }

    if (newStats) {
      onUpdateUserData({
        mode,
        lmpDate: newStats.lmpDate,
        eddDate: newStats.eddDate,
        cycleLength: Number(cycleLength),
        stats: newStats
      });
    }

    onUpdateWaterConfig({
      dailyTargetMl: Number(targetMl)
    });

    playChime();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-card-elevated rounded-3xl p-6 sm:p-7 shadow-2xl border border-rose-100 relative">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-500" />
            <span>Pregnancy Dates & Settings</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-4">
          {/* Method selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-rose-50/80 rounded-xl border border-rose-100">
            <button
              type="button"
              onClick={() => setMode("lmp")}
              className={`py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                mode === "lmp"
                  ? "bg-white text-rose-600 shadow-xs border border-rose-100"
                  : "text-slate-600"
              }`}
            >
              Last Period (LMP)
            </button>
            <button
              type="button"
              onClick={() => setMode("edd")}
              className={`py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                mode === "edd"
                  ? "bg-white text-rose-600 shadow-xs border border-rose-100"
                  : "text-slate-600"
              }`}
            >
              Due Date (EDD)
            </button>
          </div>

          {mode === "lmp" ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Menstrual Period (LMP)
                </label>
                <input
                  type="date"
                  value={lmpDate}
                  onChange={(e) => setLmpDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-rose-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Cycle Length</span>
                  <span className="text-rose-600">{cycleLength} days</span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="35"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Due Date
              </label>
              <input
                type="date"
                value={eddDate}
                onChange={(e) => setEddDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-rose-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          )}

          {/* Daily Water Target Setting */}
          <div className="pt-2 border-t border-rose-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              <span>Daily Water Target</span>
            </label>
            <select
              value={targetMl}
              onChange={(e) => setTargetMl(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-rose-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
            >
              <option value={2000}>2,000 ml (8 glasses)</option>
              <option value={2500}>2,500 ml (10 glasses - Recommended for pregnancy)</option>
              <option value={3000}>3,000 ml (12 glasses)</option>
              <option value={3500}>3,500 ml (14 glasses)</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-rose-100">
            <button
              type="button"
              onClick={onResetAllData}
              className="py-2.5 px-3 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
