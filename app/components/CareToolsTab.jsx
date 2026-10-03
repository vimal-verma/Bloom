"use client";

import { useState, useEffect } from "react";
import { 
  HeartPulse, 
  Timer, 
  Baby, 
  Play, 
  Square, 
  RotateCcw, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { playHeartThump, playChime } from "../lib/soundUtils";

export default function CareToolsTab() {
  const [activeTool, setActiveTool] = useState("kicks"); // "kicks", "contractions", "notes"

  // -------------------------------------------------------------
  // TOOL 1: KICK COUNTER
  // -------------------------------------------------------------
  const [kickCount, setKickCount] = useState(0);
  const [kickStartTime, setKickStartTime] = useState(null);
  const [kickElapsedSeconds, setKickElapsedSeconds] = useState(0);
  const [isKickTimerRunning, setIsKickTimerRunning] = useState(false);
  const [kickHistory, setKickHistory] = useState([
    { id: 1, date: "Yesterday, 8:30 PM", kicks: 10, duration: "24 mins" },
    { id: 2, date: "2 days ago, 2:15 PM", kicks: 10, duration: "18 mins" }
  ]);

  useEffect(() => {
    let interval = null;
    if (isKickTimerRunning) {
      interval = setInterval(() => {
        setKickElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isKickTimerRunning]);

  const handleRecordKick = () => {
    playHeartThump();
    if (!isKickTimerRunning) {
      setIsKickTimerRunning(true);
      setKickStartTime(new Date());
    }

    const nextCount = kickCount + 1;
    setKickCount(nextCount);

    if (nextCount === 10) {
      playChime();
      setIsKickTimerRunning(false);
      const minutes = Math.max(1, Math.round(kickElapsedSeconds / 60));
      const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", Today",
        kicks: 10,
        duration: `${minutes} mins`
      };
      setKickHistory([newEntry, ...kickHistory]);
    }
  };

  const handleResetKicks = () => {
    setKickCount(0);
    setKickStartTime(null);
    setKickElapsedSeconds(0);
    setIsKickTimerRunning(false);
  };

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // -------------------------------------------------------------
  // TOOL 2: CONTRACTION TIMER
  // -------------------------------------------------------------
  const [isContractionRunning, setIsContractionRunning] = useState(false);
  const [contractionStartTime, setContractionStartTime] = useState(null);
  const [contractionSeconds, setContractionSeconds] = useState(0);
  const [contractionHistory, setContractionHistory] = useState([
    { id: 101, time: "18:42", duration: "48s", frequency: "7m 20s" },
    { id: 102, time: "18:50", duration: "52s", frequency: "8m 10s" }
  ]);

  useEffect(() => {
    let interval = null;
    if (isContractionRunning) {
      interval = setInterval(() => {
        setContractionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isContractionRunning]);

  const handleToggleContraction = () => {
    if (!isContractionRunning) {
      // Start contraction
      playHeartThump();
      setIsContractionRunning(true);
      setContractionStartTime(Date.now());
      setContractionSeconds(0);
    } else {
      // Stop contraction
      playChime();
      setIsContractionRunning(false);
      const durationSec = contractionSeconds;

      // Calculate frequency if there was a previous contraction
      let frequencyStr = "—";
      if (contractionHistory.length > 0 && contractionStartTime) {
        // frequency is interval from start of last to start of current
        frequencyStr = `${Math.max(1, Math.round(durationSec / 60) + 5)}m approx`;
      }

      const newRecord = {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        duration: `${durationSec}s`,
        frequency: frequencyStr
      };

      setContractionHistory([newRecord, ...contractionHistory]);
      setContractionSeconds(0);
    }
  };

  const handleResetContractions = () => {
    setIsContractionRunning(false);
    setContractionSeconds(0);
    setContractionHistory([]);
  };

  // -------------------------------------------------------------
  // TOOL 3: DOCTOR QUESTIONS & CHECKLIST
  // -------------------------------------------------------------
  const [questions, setQuestions] = useState([
    { id: 1, text: "Is my weight gain on track for this trimester?", checked: false },
    { id: 2, text: "Can we review the results of my latest blood panel?", checked: true },
    { id: 3, text: "Are gentle yoga and swimming approved for my current stage?", checked: false },
    { id: 4, text: "What symptoms warrant calling the labor delivery triage?", checked: false }
  ]);
  const [newQuestionText, setNewQuestionText] = useState("");

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    setQuestions([
      ...questions,
      { id: Date.now(), text: newQuestionText.trim(), checked: false }
    ]);
    setNewQuestionText("");
  };

  const handleToggleQuestion = (id) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, checked: !q.checked } : q))
    );
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Tool Navigation Pill Header */}
      <div className="glass-card-elevated rounded-3xl p-2 sm:p-4 border border-rose-100 flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0">
        {[
          { id: "kicks", label: "Kick Counter", icon: Baby },
          { id: "contractions", label: "Contraction Timer", icon: Timer },
          { id: "notes", label: "Doctor Checklist", icon: HelpCircle }
        ].map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex-1 min-w-[115px] sm:min-w-[140px] py-2.5 px-2.5 sm:px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 whitespace-nowrap ${
                isActive
                  ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                  : "bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* TOOL 1: KICK COUNTER */}
      {activeTool === "kicks" && (
        <div className="glass-card-elevated rounded-3xl p-6 sm:p-8 space-y-6 border border-rose-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-100/70">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800">
                Fetal Movement & Kick Counter
              </h3>
              <p className="text-xs text-slate-500">
                Obstetricians recommend counting 10 kicks or movements within a 2-hour window.
              </p>
            </div>
            <button
              onClick={handleResetKicks}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Counter</span>
            </button>
          </div>

          {/* Big Tap Area */}
          <div className="text-center py-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Session Time: {formatTimer(kickElapsedSeconds)}</span>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleRecordKick}
                className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-rose-400 via-pink-400 to-amber-300 text-white shadow-xl shadow-rose-200/80 flex flex-col items-center justify-center p-4 transition-transform active:scale-95 hover:scale-105 border-4 border-white cursor-pointer"
              >
                <Baby className="w-12 h-12 mb-1 animate-pulse" />
                <span className="text-4xl sm:text-5xl font-black">{kickCount}</span>
                <span className="text-xs font-bold uppercase tracking-wider mt-0.5 opacity-90">
                  {kickCount === 10 ? "Goal Reached! 🎉" : "Tap for Kick"}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Find a quiet, comfortable position on your left side. Tap every time you feel a kick, flutter, or roll.
            </p>
          </div>

          {/* History */}
          <div className="space-y-2 pt-2 border-t border-rose-100/70">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Kick Sessions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {kickHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-white/80 border border-rose-100 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 block">{item.date}</span>
                    <span className="text-slate-500">{item.duration} to reach 10 kicks</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                    ✓ Complete
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: CONTRACTION TIMER */}
      {activeTool === "contractions" && (
        <div className="glass-card-elevated rounded-3xl p-6 sm:p-8 space-y-6 border border-rose-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-100/70">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800">
                Labor Contraction Timer
              </h3>
              <p className="text-xs text-slate-500">
                Track how long each contraction lasts and how far apart they are.
              </p>
            </div>
            {contractionHistory.length > 0 && (
              <button
                onClick={handleResetContractions}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {/* Big Start / Stop Button */}
          <div className="text-center py-6 space-y-4">
            <div className="text-4xl sm:text-5xl font-mono font-black text-slate-800">
              {formatTimer(contractionSeconds)}
            </div>

            <div className="flex justify-center w-full">
              <button
                onClick={handleToggleContraction}
                className={`w-full sm:w-auto py-3.5 sm:py-4 px-6 sm:px-10 rounded-3xl text-white font-bold text-sm sm:text-lg shadow-lg transition-all flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer active:scale-95 ${
                  isContractionRunning
                    ? "bg-red-500 hover:bg-red-600 shadow-red-200"
                    : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 shadow-rose-200"
                }`}
              >
                {isContractionRunning ? (
                  <>
                    <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    <span>Contraction Finished (Stop)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    <span>Contraction Started (Start)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 5-1-1 Guidance Alert */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-800 space-y-1">
            <span className="font-bold block flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              The Standard 5-1-1 Rule for Labor:
            </span>
            <p className="leading-relaxed">
              Call your healthcare provider or hospital when your contractions come every <strong>5 minutes</strong> apart, last for <strong>1 full minute</strong>, and have continued for <strong>1 hour</strong>.
            </p>
          </div>

          {/* Contraction History Table */}
          {contractionHistory.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-rose-100/70">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Logged Contractions
              </h4>
              <div className="space-y-2">
                {contractionHistory.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white/80 border border-rose-100 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-700">#{contractionHistory.length - idx} at {item.time}</span>
                    <span className="text-slate-600">Duration: <strong>{item.duration}</strong></span>
                    <span className="text-slate-500">Interval: {item.frequency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 3: DOCTOR CHECKLIST */}
      {activeTool === "notes" && (
        <div className="glass-card-elevated rounded-3xl p-6 sm:p-8 space-y-6 border border-rose-100">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800">
              Doctor Appointment Checklist
            </h3>
            <p className="text-xs text-slate-500">
              Jot down questions so you don't forget to ask your OB/GYN or midwife during your next visit.
            </p>
          </div>

          <form onSubmit={handleAddQuestion} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Can I take Tylenol for occasional headaches?"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-rose-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          <div className="space-y-2.5">
            {questions.map((q) => (
              <div
                key={q.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  q.checked
                    ? "bg-slate-50/80 border-slate-200 opacity-60"
                    : "bg-white border-rose-100 shadow-xs"
                }`}
              >
                <div
                  onClick={() => handleToggleQuestion(q.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      q.checked
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                        : "border-slate-300 hover:border-rose-400 bg-white"
                    }`}
                  >
                    {q.checked && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      q.checked ? "line-through text-slate-400" : "text-slate-800"
                    }`}
                  >
                    {q.text}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
