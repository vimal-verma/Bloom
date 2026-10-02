"use client";

import { Sparkles, Calendar, Bell, Droplets, Pill, BookOpen, HeartPulse, Settings } from "lucide-react";

export default function Header({ 
  stats, 
  activeTab, 
  setActiveTab, 
  onOpenSettings,
  notificationStatus,
  onRequestNotification
}) {
  return (
    <header className="sticky top-0 z-30 w-full glass-card border-b border-rose-100/70 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Pregnancy Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-400 via-pink-400 to-amber-300 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                  Bloom & Nurture
                </h1>
                <span className="hidden sm:inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60">
                  Pregnancy Companion
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {stats ? (
                  <span>
                    <strong className="text-rose-600 font-bold">Week {stats.currentWeek}</strong>, Day {stats.currentDayOfWeek} • Trimester {stats.trimester}
                  </span>
                ) : (
                  "Your Gentle Journey"
                )}
              </p>
            </div>
          </div>

          {/* Quick Actions & Settings */}
          <div className="flex items-center gap-2">
            {notificationStatus !== "granted" && (
              <button
                onClick={onRequestNotification}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors shadow-xs"
                title="Enable browser notifications for reminders"
              >
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span>Enable Alerts</span>
              </button>
            )}

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-rose-50/80 text-slate-700 text-xs sm:text-sm font-medium border border-rose-100 transition-all shadow-xs"
              title="Change Due Date or Settings"
            >
              <Calendar className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline">Due Date / Dates</span>
              <Settings className="w-3.5 h-3.5 text-slate-400 sm:hidden" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 mt-3 pt-2.5 border-t border-rose-100/50 overflow-x-auto no-scrollbar">
          {[
            { id: "journey", label: "My Journey", icon: Sparkles },
            { id: "reminders", label: "Water & Medicine", icon: Droplets, badge: "Daily" },
            { id: "weekguide", label: "Week by Week", icon: BookOpen },
            { id: "caretools", label: "Care Tools", icon: HeartPulse },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-rose-500 text-white shadow-md shadow-rose-200/80 scale-[1.02]"
                    : "text-slate-600 hover:bg-rose-50/70 hover:text-rose-600"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && !isActive && (
                  <span className="hidden md:inline-block text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
