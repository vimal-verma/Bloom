"use client";

import { Sparkles, Droplets, Bot, BookOpen, HeartPulse } from "lucide-react";

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "journey", label: "Journey", icon: Sparkles },
    { id: "reminders", label: "Reminders", icon: Droplets, badge: "Daily" },
    { id: "chat", label: "Gemma AI", icon: Bot, highlight: true },
    { id: "weekguide", label: "Weeks", icon: BookOpen },
    { id: "caretools", label: "Tools", icon: HeartPulse },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-rose-100/90 shadow-[0_-8px_25px_-5px_rgba(244,63,94,0.08)] pb-safe transition-all">
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all relative ${
                isActive
                  ? "text-rose-600 font-bold scale-105"
                  : "text-slate-500 hover:text-rose-500 font-medium"
              }`}
            >
              {/* Highlight background pill for active state */}
              {isActive && (
                <span className="absolute inset-0 bg-rose-50/90 rounded-2xl -z-10 animate-fadeIn" />
              )}

              {/* Icon Container with subtle glow if active */}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "scale-110 text-rose-600 stroke-[2.5]" : "stroke-[1.8]"
                  } ${tab.highlight && !isActive ? "text-amber-500" : ""}`}
                />

                {/* AI Pulse dot */}
                {tab.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                )}
              </div>

              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
