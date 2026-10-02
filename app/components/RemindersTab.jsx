"use client";

import { useState } from "react";
import { 
  Droplets, 
  Pill, 
  Plus, 
  Trash2, 
  Clock, 
  Bell, 
  BellRing, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Check,
  ChevronRight
} from "lucide-react";
import { playWaterPop, playChime, triggerNotification } from "../lib/soundUtils";

export default function RemindersTab({
  waterData,
  onUpdateWaterConfig,
  onAddWater,
  onResetWater,
  medications,
  onUpdateMedicationTime,
  onToggleMedTaken,
  onAddMedication,
  onDeleteMedication,
  onToggleMedActive,
  onTriggerToast,
  notificationStatus,
  onRequestNotification
}) {
  // New medication form state
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedTime, setNewMedTime] = useState("09:00");
  const [newMedNotes, setNewMedNotes] = useState("");
  const [newMedCategory, setNewMedCategory] = useState("Supplements");

  // Water calculations
  const totalGlasses = Math.max(1, Math.round(waterData.dailyTargetMl / waterData.glassSizeMl));
  const currentGlasses = Math.floor(waterData.currentMl / waterData.glassSizeMl);
  const waterPercent = Math.min(100, Math.round((waterData.currentMl / waterData.dailyTargetMl) * 100));

  // Handle adding new custom medicine
  const handleCreateMed = (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    onAddMedication({
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || "1 dose",
      time: newMedTime,
      notes: newMedNotes.trim() || "Take as instructed by your healthcare provider.",
      category: newMedCategory,
      enabled: true,
      color: "rose"
    });

    // Reset form
    setNewMedName("");
    setNewMedDosage("");
    setNewMedTime("09:00");
    setNewMedNotes("");
    setShowAddMedModal(false);

    onTriggerToast({
      type: "med",
      title: "Medicine Added!",
      message: `Reminder set for ${newMedName} at ${newMedTime}.`
    });
  };

  // Test water reminder alert
  const handleTestWaterReminder = () => {
    playChime();
    triggerNotification("💧 Hydration Check for Baby & Mom!", {
      body: "Time for a refreshing glass of water. Keep yourself and baby hydrated!"
    });
    onTriggerToast({
      type: "water",
      title: "Water Reminder 💧",
      message: "Time for a refreshing glass of water! Staying hydrated maintains amniotic fluid."
    });
  };

  // Test medicine reminder alert
  const handleTestMedReminder = (med) => {
    playChime();
    triggerNotification(`💊 Medicine Reminder: ${med.name}`, {
      body: `It's ${med.time}. Don't forget your ${med.dosage}.`
    });
    onTriggerToast({
      type: "med",
      title: `Reminder: ${med.name} 💊`,
      message: `Scheduled for ${med.time} (${med.dosage}). ${med.notes || ""}`
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Notification status bar if not yet granted */}
      {notificationStatus !== "granted" && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-900">
                Turn on Daily Reminder Alerts
              </h4>
              <p className="text-xs text-amber-700">
                Get sound chimes and browser alerts at your chosen times even if this tab is in the background.
              </p>
            </div>
          </div>
          <button
            onClick={onRequestNotification}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap"
          >
            Allow Notifications
          </button>
        </div>
      )}

      {/* SECTION 1: WATER REMINDERS & TRACKER */}
      <div className="glass-card-elevated rounded-3xl p-6 sm:p-8 space-y-6 border border-sky-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-100/70">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-500 text-white flex items-center justify-center shadow-md shadow-sky-200">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                  Daily Water & Hydration
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                  2.5L Target
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Log your water intake and customize reminder frequencies according to your schedule.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestWaterReminder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold border border-sky-200 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Water Chime</span>
            </button>
            <button
              onClick={onResetWater}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold transition-colors"
              title="Reset today's water counter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Visual Water Fill & Intake Status */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Interactive Progress Display */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-4xl font-black text-slate-800 tracking-tight">
                  {waterData.currentMl}
                </span>
                <span className="text-sm font-semibold text-slate-400 ml-1.5">
                  / {waterData.dailyTargetMl} ml
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-sky-600 block">
                  {currentGlasses} of {totalGlasses} Glasses
                </span>
                <span className="text-xs text-slate-400">
                  {Math.max(0, waterData.dailyTargetMl - waterData.currentMl)} ml left
                </span>
              </div>
            </div>

            {/* Big Progress bar */}
            <div className="w-full bg-sky-100/80 rounded-full h-4 p-0.5 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${waterPercent}%` }}
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => {
                  playWaterPop();
                  onAddWater(250);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>+1 Glass (250 ml)</span>
              </button>

              <button
                onClick={() => {
                  playWaterPop();
                  onAddWater(500);
                }}
                className="py-2.5 px-3 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+500 ml Bottle</span>
              </button>

              <button
                onClick={() => {
                  if (waterData.currentMl > 0) onAddWater(-250);
                }}
                disabled={waterData.currentMl <= 0}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-600 text-xs font-semibold transition-colors"
                title="Undo last glass"
              >
                Undo
              </button>
            </div>
          </div>

          {/* Right: Glass Visual Grid */}
          <div className="md:col-span-6 bg-sky-50/60 p-4 rounded-2xl border border-sky-100">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block mb-2">
              Today's Glasses (Tap to toggle)
            </span>
            <div className="grid grid-cols-5 sm:grid-cols-5 gap-2.5">
              {Array.from({ length: totalGlasses }).map((_, index) => {
                const isFilled = index < currentGlasses;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      playWaterPop();
                      if (isFilled) {
                        onAddWater(-250);
                      } else {
                        onAddWater(250);
                      }
                    }}
                    className={`h-16 rounded-xl border flex flex-col items-center justify-center p-1 transition-all ${
                      isFilled
                        ? "bg-gradient-to-b from-sky-300 via-sky-400 to-blue-500 border-sky-400 text-white shadow-sm scale-100"
                        : "bg-white/80 border-sky-200/80 text-sky-300 hover:border-sky-300 hover:bg-sky-50/50"
                    }`}
                    title={`Glass #${index + 1} (250 ml)`}
                  >
                    <Droplets className={`w-5 h-5 ${isFilled ? "animate-pulse" : "opacity-40"}`} />
                    <span className="text-[10px] font-bold mt-1">
                      {isFilled ? "250ml" : `#${index + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CUSTOMIZE WATER REMINDER TIMINGS */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50/90 via-white to-blue-50/60 border border-sky-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <h4 className="font-bold text-sm text-slate-800">
                Customize Water Reminder Schedule
              </h4>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={waterData.reminderEnabled}
                onChange={(e) =>
                  onUpdateWaterConfig({ reminderEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              <span className="ml-2 text-xs font-semibold text-slate-700">
                {waterData.reminderEnabled ? "Active" : "Paused"}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Interval Frequency */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Remind Me Every:
              </label>
              <select
                value={waterData.intervalMinutes}
                onChange={(e) =>
                  onUpdateWaterConfig({ intervalMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value={45}>Every 45 minutes</option>
                <option value={60}>Every 1 hour (Recommended)</option>
                <option value={90}>Every 1.5 hours</option>
                <option value={120}>Every 2 hours</option>
                <option value={180}>Every 3 hours</option>
              </select>
            </div>

            {/* Active Window: Start Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Start Time (Morning):
              </label>
              <input
                type="time"
                value={waterData.startTime || "08:00"}
                onChange={(e) =>
                  onUpdateWaterConfig({ startTime: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            {/* Active Window: End Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                End Time (Evening):
              </label>
              <input
                type="time"
                value={waterData.endTime || "21:30"}
                onChange={(e) =>
                  onUpdateWaterConfig({ endTime: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-sky-800 bg-sky-100/60 p-2.5 rounded-xl">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              Reminders will gently alert you every <strong>{waterData.intervalMinutes} mins</strong> between{" "}
              <strong>{waterData.startTime}</strong> and <strong>{waterData.endTime}</strong> without interrupting your sleep.
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: MEDICINE & PRENATAL VITAMINS REMINDERS & TRACKER */}
      <div className="glass-card-elevated rounded-3xl p-6 sm:p-8 space-y-6 border border-rose-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-100/70">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-400 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-200">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                  Medicine & Vitamins
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  Custom Timing
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Change timings anytime to fit your changing daily routine, meals, and doctor advice.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddMedModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-200 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medicine</span>
            </button>
          </div>
        </div>

        {/* Medication List */}
        <div className="space-y-3.5">
          {medications.map((med) => {
            const isTaken = !!med.takenToday;

            return (
              <div
                key={med.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isTaken
                    ? "bg-emerald-50/60 border-emerald-200/80 shadow-xs"
                    : "bg-white/90 border-rose-100 hover:border-rose-200 shadow-sm"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Checkbox & Name */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => {
                        playChime();
                        onToggleMedTaken(med.id);
                      }}
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isTaken
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                          : "border-slate-300 hover:border-rose-400 bg-white"
                      }`}
                      title={isTaken ? "Marked as taken (Click to undo)" : "Click to mark as taken"}
                    >
                      {isTaken && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`font-bold text-sm sm:text-base ${
                            isTaken ? "line-through text-slate-500" : "text-slate-800"
                          }`}
                        >
                          {med.name}
                        </h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {med.dosage}
                        </span>
                        {med.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                            {med.category}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        {med.notes}
                      </p>

                      {isTaken && med.takenAt && (
                        <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Taken today at {med.takenAt}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: CUSTOM TIME PICKER & ACTIONS */}
                  <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 self-end sm:self-center">
                    {/* Time Input allowing user to change timing on the fly */}
                    <div className="flex items-center gap-1.5 bg-rose-50/80 px-2.5 py-1.5 rounded-xl border border-rose-100">
                      <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <div className="text-left">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block -mb-0.5">
                          Reminder Time
                        </span>
                        <input
                          type="time"
                          value={med.time}
                          onChange={(e) => onUpdateMedicationTime(med.id, e.target.value)}
                          className="bg-transparent font-bold text-xs sm:text-sm text-slate-800 cursor-pointer focus:outline-none"
                          title="Click to change reminder timing"
                        />
                      </div>
                    </div>

                    {/* Test alert chime */}
                    <button
                      onClick={() => handleTestMedReminder(med)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Test reminder chime & alert"
                    >
                      <Bell className="w-4 h-4" />
                    </button>

                    {/* Delete medication */}
                    <button
                      onClick={() => onDeleteMedication(med.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick timing shortcuts (e.g. Morning, Afternoon, Evening) */}
                <div className="mt-3 pt-2 border-t border-slate-100/70 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400 font-medium">Quick Time Adjust:</span>
                  {[
                    { label: "Morning (08:00)", time: "08:00" },
                    { label: "Midday (12:30)", time: "12:30" },
                    { label: "Evening (18:30)", time: "18:30" },
                    { label: "Bedtime (21:30)", time: "21:30" }
                  ].map((preset) => (
                    <button
                      key={preset.time}
                      onClick={() => onUpdateMedicationTime(med.id, preset.time)}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        med.time === preset.time
                          ? "bg-rose-500 text-white font-bold"
                          : "bg-slate-100 hover:bg-rose-100 text-slate-600"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Essential Prenatal Timing Note */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Pharmacist Advice on Pregnancy Timing:</span>
          </div>
          <p className="text-xs text-amber-700 leading-relaxed">
            • <strong>Iron & Calcium:</strong> Do not take Iron and Calcium together, as calcium hinders iron absorption. Space them at least 2 hours apart.
            <br />
            • <strong>Folic Acid / Multivitamin:</strong> Best taken in the morning with food to reduce nausea and sustain all-day energy.
          </p>
        </div>
      </div>

      {/* MODAL: ADD CUSTOM MEDICATION */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-card-elevated rounded-3xl p-6 sm:p-7 shadow-2xl border border-rose-100">
            <h3 className="text-xl font-bold text-slate-800 mb-1">Add Medication or Vitamin</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add any prescription medicine, prenatal supplement, or vitamin with custom timing.
            </p>

            <form onSubmit={handleCreateMed} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medicine / Supplement Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Progesterone, DHA Omega-3, Thyroid"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 tablet, 200mg"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reminder Time *
                  </label>
                  <input
                    type="time"
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newMedCategory}
                  onChange={(e) => setNewMedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="Supplements">Prenatal Supplements</option>
                  <option value="Prescription">Prescription Medication</option>
                  <option value="Blood & Energy">Blood / Iron Support</option>
                  <option value="Hormones">Hormonal Support</option>
                  <option value="Other">Other Daily Care</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructions / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take with orange juice after lunch"
                  value={newMedNotes}
                  onChange={(e) => setNewMedNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-sm font-bold shadow-md shadow-rose-200 transition-all"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
