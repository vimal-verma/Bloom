"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  Droplets, 
  Pill, 
  Heart, 
  CheckCircle2, 
  Info, 
  Baby, 
  ArrowRight,
  ShieldCheck,
  Smile,
  Activity,
  Bot
} from "lucide-react";
import { playWaterPop, playChime } from "../lib/soundUtils";

export default function JourneyTab({
  stats,
  waterData,
  onAddWater,
  medications,
  onToggleMedication,
  onNavigateToTab,
  onOpenSettings
}) {
  const [celebrated, setCelebrated] = useState(false);

  const handleCelebrate = () => {
    playChime();
    setCelebrated(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f43f5e", "#fb7185", "#f59e0b", "#38bdf8", "#34d399"]
    });
    setTimeout(() => setCelebrated(false), 2000);
  };

  const week = stats?.weekInfo;
  const currentWeek = stats?.currentWeek || 1;
  const currentDay = stats?.currentDayOfWeek || 0;
  const progress = stats?.progressPercent || 0;
  const daysLeft = stats?.daysLeft || 0;

  // Next due medication
  const todayTakenCount = medications.filter((m) => m.takenToday).length;
  const nextMed = medications.find((m) => !m.takenToday && m.enabled);

  // Water completion
  const waterPercent = Math.min(100, Math.round((waterData.currentMl / waterData.dailyTargetMl) * 100));

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Hero: Current Week & Baby Size Spotlight */}
      <div className="glass-card-elevated rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Ambient background blur elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-rose-200/40 via-pink-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-amber-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Big Gestational Age & Countdown */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                Trimester {stats?.trimester}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                {daysLeft} days to due date
              </span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tight leading-none">
                Week {currentWeek}
                <span className="text-xl sm:text-2xl font-bold text-rose-500 ml-2">
                  + Day {currentDay}
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 font-medium">
                Due Date:{" "}
                <span className="font-bold text-slate-800">
                  {new Date(stats?.eddDate).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </p>
            </div>

            {/* Overall Pregnancy Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                <span>Journey Progress</span>
                <span className="text-rose-600 font-bold">{progress}% Complete</span>
              </div>
              <div className="w-full bg-rose-100/70 rounded-full h-3 p-0.5 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-rose-500 via-pink-400 to-amber-400 h-full rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Conception</span>
                <span>Week 20 (Halfway)</span>
                <span>Week 40 (Birth)</span>
              </div>
            </div>

            {/* Quick Celebrate Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleCelebrate}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 transition-all flex items-center gap-2 hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Celebrate Today</span>
              </button>

              <button
                onClick={() => onNavigateToTab("weekguide")}
                className="px-4 py-2.5 rounded-2xl bg-white/80 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-semibold text-xs sm:text-sm border border-rose-100 transition-all flex items-center gap-1.5"
              >
                <span>Read Full Week Guide</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Cute Baby Comparison Badge */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-50/80 via-white to-amber-50/60 border border-rose-200/60 shadow-lg text-center relative group">
              <div className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-500 border border-rose-100 shadow-xs">
                Baby Size
              </div>

              {/* Fruit Emoji Icon with Glowing Aura */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto my-2 rounded-full bg-gradient-to-tr from-rose-100 via-pink-50 to-amber-100 flex items-center justify-center text-5xl sm:text-6xl shadow-md border-4 border-white transition-transform group-hover:scale-105">
                {week?.emoji || "👶"}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">
                {week?.fruit}
              </h3>
              <p className="text-xs text-rose-600 font-semibold mb-4">
                Week {currentWeek} Comparison
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-100/70">
                <div className="p-2.5 rounded-xl bg-white/90 border border-rose-100/50">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    Approx. Length
                  </span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    {week?.length || "—"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 border border-rose-100/50">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    Approx. Weight
                  </span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    {week?.weight || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Daily Wellness Trackers (Hydration & Medicines) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Mini Water Card */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-sky-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Daily Hydration</h3>
                  <p className="text-xs text-slate-500">Essential for amniotic fluid</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab("reminders")}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
              >
                Schedule &rarr;
              </button>
            </div>

            <div className="flex items-baseline justify-between mt-4">
              <div>
                <span className="text-3xl font-black text-slate-800">
                  {waterData.currentMl}
                </span>
                <span className="text-xs font-medium text-slate-400 ml-1">
                  / {waterData.dailyTargetMl} ml
                </span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {waterPercent}% reached
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-sky-100 rounded-full h-2.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-400 to-blue-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-sky-100/60 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500">
              {Math.round(waterData.currentMl / 250)} of {Math.round(waterData.dailyTargetMl / 250)} glasses
            </span>
            <button
              onClick={() => {
                playWaterPop();
                onAddWater(250);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 hover:scale-105"
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>+1 Glass (250ml)</span>
            </button>
          </div>
        </div>

        {/* Mini Medication Card */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-rose-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Prenatal Medicine</h3>
                  <p className="text-xs text-slate-500">Vitamins & Supplements</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab("reminders")}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
              >
                Manage &rarr;
              </button>
            </div>

            <div className="flex items-baseline justify-between mt-4">
              <div>
                <span className="text-3xl font-black text-slate-800">
                  {todayTakenCount}
                </span>
                <span className="text-xs font-medium text-slate-400 ml-1">
                  / {medications.length} taken
                </span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {todayTakenCount === medications.length ? "All Completed ✨" : "In Progress"}
              </span>
            </div>

            {/* Next medicine preview */}
            <div className="mt-2 p-2.5 rounded-xl bg-rose-50/70 border border-rose-100/80 flex items-center justify-between">
              {nextMed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-slate-700 truncate">
                    Next: {nextMed.name}
                  </span>
                  <span className="text-[11px] font-semibold text-rose-600 bg-white px-2 py-0.5 rounded-md border border-rose-100 shrink-0">
                    ⏰ {nextMed.time}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Great job! All vitamins checked off for today.
                </span>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-rose-100/60 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Daily Schedule</span>
            <button
              onClick={() => onNavigateToTab("reminders")}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition-all hover:scale-105"
            >
              Open Reminders
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="glass-card-elevated rounded-3xl p-5 sm:p-6 border border-rose-100/90 bg-gradient-to-r from-rose-50/90 via-pink-50/60 to-amber-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-400 to-amber-300 text-white flex items-center justify-center shadow-md shadow-rose-200 shrink-0">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-800 text-base">
                Ask Pregnancy Gemma AI
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Local & Private
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Have questions about your current symptoms, week {currentWeek} milestones, or nutrition? Chat with your local Gemma model anytime.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToTab("chat")}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 transition-all flex items-center gap-2 hover:scale-[1.02] shrink-0"
        >
          <span>Chat with Gemma</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Week Details: Baby Development & Mom's Changes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Baby's Development This Week */}
        <div className="glass-card rounded-3xl p-6 border border-rose-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg">Baby Development This Week</h4>
              <p className="text-xs text-slate-500">What is forming right now</p>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed font-normal bg-rose-50/50 p-4 rounded-2xl border border-rose-100/60">
            {week?.babyInfo}
          </p>

          <div className="space-y-2 pt-1">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Care Tips For Week {currentWeek}
            </h5>
            <ul className="space-y-2">
              {week?.tips?.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    ✓
                  </div>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mom's Body & Wellness */}
        <div className="glass-card rounded-3xl p-6 border border-amber-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg">Mom's Body & Sensation</h4>
              <p className="text-xs text-slate-500">Changes and common symptoms</p>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed font-normal bg-amber-50/50 p-4 rounded-2xl border border-amber-100/60">
            {week?.momInfo}
          </p>

          {/* Quick Doctor checkup highlight */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Recommended Care Milestone</span>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              {currentWeek <= 13
                ? "First trimester booking visit, ultrasound scan & baseline bloodwork (blood type, iron, thyroid, infectious screen)."
                : currentWeek <= 27
                ? "Mid-pregnancy detailed anomaly ultrasound (weeks 18-22) and gestational diabetes glucose screening (weeks 24-28)."
                : "Third trimester bi-weekly checks, fetal kick counts, blood pressure monitoring & Tdap vaccination."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
