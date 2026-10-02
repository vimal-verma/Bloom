"use client";

import { useEffect } from "react";
import { X, Droplets, Pill, Sparkles, CheckCircle2 } from "lucide-react";

export default function ToastAlert({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    water: Droplets,
    med: Pill,
    success: CheckCircle2,
    sparkle: Sparkles,
  };

  const Icon = icons[toast.type] || Sparkles;

  const bgStyles = {
    water: "from-sky-500 to-blue-600 text-white shadow-sky-200",
    med: "from-rose-500 to-pink-600 text-white shadow-rose-200",
    success: "from-emerald-500 to-teal-600 text-white shadow-emerald-200",
    sparkle: "from-amber-400 to-rose-500 text-white shadow-amber-200"
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-short">
      <div
        className={`p-4 rounded-2xl bg-gradient-to-r ${
          bgStyles[toast.type] || bgStyles.sparkle
        } shadow-xl flex items-start gap-3 border border-white/20`}
      >
        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="font-bold text-sm leading-snug">{toast.title}</h4>
          <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors shrink-0 text-white/80 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
