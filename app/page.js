"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Header from "./components/Header";
import JourneyTab from "./components/JourneyTab";
import RemindersTab from "./components/RemindersTab";
import WeekGuideTab from "./components/WeekGuideTab";
import CareToolsTab from "./components/CareToolsTab";
import GemmaChatTab from "./components/GemmaChatTab";
import OnboardingModal from "./components/OnboardingModal";
import SettingsModal from "./components/SettingsModal";
import AppGuideModal from "./components/AppGuideModal";
import MobileBottomNav from "./components/MobileBottomNav";
import ToastAlert from "./components/ToastAlert";
import { 
  DEFAULT_MEDICATIONS, 
  DEFAULT_WATER_CONFIG, 
  computeFromLMP, 
  computeFromEDD 
} from "./lib/pregnancyData";
import { 
  playChime, 
  triggerNotification, 
  requestNotificationPermission 
} from "./lib/soundUtils";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("journey"); // "journey", "reminders", "chat", "weekguide", "caretools"

  // User pregnancy state
  const [userData, setUserData] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Water tracker state
  const [waterData, setWaterData] = useState({
    ...DEFAULT_WATER_CONFIG,
    currentMl: 0,
    lastLoggedDate: new Date().toDateString()
  });

  // Medications state
  const [medications, setMedications] = useState(DEFAULT_MEDICATIONS);

  // Notification status
  const [notificationStatus, setNotificationStatus] = useState("default");

  // Active toast
  const [activeToast, setActiveToast] = useState(null);

  // Track fired alerts to avoid duplicate spam in same minute
  const lastAlertMinuteRef = useRef("");

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      // Check notification permission
      if ("Notification" in window) {
        setNotificationStatus(Notification.permission);
      }

      // Load User Pregnancy Data
      const savedUser = localStorage.getItem("bloom_user_pregnancy");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          // Recompute stats to match today's date
          let updatedStats = null;
          if (parsed.mode === "edd") {
            updatedStats = computeFromEDD(parsed.eddDate);
          } else {
            updatedStats = computeFromLMP(parsed.lmpDate, parsed.cycleLength || 28);
          }
          setUserData({ ...parsed, stats: updatedStats });
        } catch (e) {
          console.error("Error parsing saved user data", e);
          setShowOnboarding(true);
        }
      } else {
        // First time user: open onboarding modal
        setShowOnboarding(true);
      }

      // Load Water Data
      const savedWater = localStorage.getItem("bloom_water_data");
      if (savedWater) {
        try {
          const parsedWater = JSON.parse(savedWater);
          const todayStr = new Date().toDateString();
          // If it's a new day, reset water intake to 0
          if (parsedWater.lastLoggedDate !== todayStr) {
            setWaterData({
              ...parsedWater,
              currentMl: 0,
              lastLoggedDate: todayStr
            });
          } else {
            setWaterData(parsedWater);
          }
        } catch (e) {
          console.error("Error reading water data", e);
        }
      }

      // Load Medications
      const savedMeds = localStorage.getItem("bloom_medications");
      if (savedMeds) {
        try {
          const parsedMeds = JSON.parse(savedMeds);
          const todayStr = new Date().toDateString();
          // If date changed, reset takenToday
          const refreshed = parsedMeds.map((m) => {
            if (m.lastTakenDate !== todayStr) {
              return { ...m, takenToday: false, takenAt: null, lastTakenDate: todayStr };
            }
            return m;
          });
          setMedications(refreshed);
        } catch (e) {
          console.error("Error loading medications", e);
        }
      }
    }
  }, []);

  // 2. Persist state changes to LocalStorage
  useEffect(() => {
    if (!mounted) return;
    if (userData) {
      localStorage.setItem("bloom_user_pregnancy", JSON.stringify(userData));
    }
  }, [userData, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("bloom_water_data", JSON.stringify(waterData));
  }, [waterData, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("bloom_medications", JSON.stringify(medications));
  }, [medications, mounted]);

  // 3. Background Minute-by-Minute Reminder Engine
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, "0");
      const currentMins = now.getMinutes().toString().padStart(2, "0");
      const currentTimeStr = `${currentHours}:${currentMins}`;

      // Avoid double-triggering in the same minute
      if (lastAlertMinuteRef.current === currentTimeStr) return;

      // --- CHECK MEDICATIONS ---
      medications.forEach((med) => {
        if (med.enabled && !med.takenToday && med.time === currentTimeStr) {
          lastAlertMinuteRef.current = currentTimeStr;
          playChime();
          triggerNotification(`💊 Medicine Reminder: ${med.name}`, {
            body: `It's ${med.time}! Don't forget your ${med.dosage}. (${med.notes})`
          });
          setActiveToast({
            type: "med",
            title: `Time for ${med.name}! 💊`,
            message: `Scheduled for ${med.time} (${med.dosage}). ${med.notes || ""}`
          });
        }
      });

      // --- CHECK WATER REMINDER ---
      if (waterData.reminderEnabled && waterData.startTime && waterData.endTime) {
        if (currentTimeStr >= waterData.startTime && currentTimeStr <= waterData.endTime) {
          // Check if minute matches interval
          const totalMinutesInDay = now.getHours() * 60 + now.getMinutes();
          const startParts = waterData.startTime.split(":");
          const startTotalMins = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);

          const diffMins = totalMinutesInDay - startTotalMins;
          if (diffMins > 0 && diffMins % waterData.intervalMinutes === 0) {
            lastAlertMinuteRef.current = currentTimeStr;
            playChime();
            triggerNotification("💧 Gentle Hydration Reminder", {
              body: "Drink a glass of water to keep you and your baby hydrated!"
            });
            setActiveToast({
              type: "water",
              title: "Hydration Time 💧",
              message: "Time for a glass of water. Keep baby and yourself well-hydrated!"
            });
          }
        }
      }
    }, 15000); // checks every 15 seconds

    return () => clearInterval(interval);
  }, [mounted, medications, waterData]);

  // Handlers for Water
  const handleAddWater = (deltaMl) => {
    setWaterData((prev) => {
      const nextMl = Math.max(0, prev.currentMl + deltaMl);
      const isGoalReached = nextMl >= prev.dailyTargetMl && prev.currentMl < prev.dailyTargetMl;

      if (isGoalReached) {
        playChime();
        setActiveToast({
          type: "success",
          title: "Hydration Goal Reached! 🎉",
          message: `You've reached your daily ${prev.dailyTargetMl} ml target for today! Wonderful job mom!`
        });
      }

      return {
        ...prev,
        currentMl: nextMl,
        lastLoggedDate: new Date().toDateString()
      };
    });
  };

  const handleResetWater = () => {
    setWaterData((prev) => ({
      ...prev,
      currentMl: 0,
      lastLoggedDate: new Date().toDateString()
    }));
    setActiveToast({
      type: "water",
      title: "Water Reset",
      message: "Today's water counter has been reset to 0."
    });
  };

  const handleUpdateWaterConfig = (newConfig) => {
    setWaterData((prev) => ({
      ...prev,
      ...newConfig
    }));
    setActiveToast({
      type: "water",
      title: "Water Schedule Updated",
      message: "Your customized reminder timings have been saved."
    });
  };

  // Handlers for Medications
  const handleUpdateMedicationTime = (id, newTime) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, time: newTime } : m))
    );
    setActiveToast({
      type: "med",
      title: "Medicine Time Changed",
      message: `Reminder updated to ${newTime}.`
    });
  };

  const handleToggleMedTaken = (id) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextTaken = !m.takenToday;
          const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          return {
            ...m,
            takenToday: nextTaken,
            takenAt: nextTaken ? timeStr : null,
            lastTakenDate: new Date().toDateString()
          };
        }
        return m;
      })
    );
  };

  const handleAddMedication = (newMed) => {
    const item = {
      ...newMed,
      id: "med-" + Date.now(),
      takenToday: false,
      takenAt: null,
      lastTakenDate: new Date().toDateString()
    };
    setMedications((prev) => [...prev, item]);
  };

  const handleDeleteMedication = (id) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
    setActiveToast({
      type: "med",
      title: "Medicine Removed",
      message: "Medication has been removed from reminders."
    });
  };

  const handleToggleMedActive = (id) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  // Request Notification permission
  const handleRequestNotification = async () => {
    const status = await requestNotificationPermission();
    setNotificationStatus(status);
    if (status === "granted") {
      playChime();
      setActiveToast({
        type: "success",
        title: "Notifications Enabled!",
        message: "You'll now receive timely chimes & reminders for water and medications."
      });
    }
  };

  // Onboarding / Settings save
  const handleSaveUserData = (data) => {
    setUserData(data);
    setShowOnboarding(false);
    playChime();
    setActiveToast({
      type: "sparkle",
      title: "Welcome aboard! 🌸",
      message: `Tracking your journey at Week ${data.stats.currentWeek}.`
    });
  };

  // Reset all data
  const handleResetAllData = () => {
    if (confirm("Reset all pregnancy data and restart onboarding?")) {
      localStorage.removeItem("bloom_user_pregnancy");
      localStorage.removeItem("bloom_water_data");
      localStorage.removeItem("bloom_medications");
      setUserData(null);
      setWaterData({ ...DEFAULT_WATER_CONFIG, currentMl: 0 });
      setMedications(DEFAULT_MEDICATIONS);
      setShowSettings(false);
      setShowOnboarding(true);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50/50">
        <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback default stats for display if not saved yet
  const effectiveStats =
    userData?.stats ||
    computeFromLMP(
      (() => {
        const d = new Date();
        d.setDate(d.getDate() - 98); // ~Week 14
        return d.toISOString().split("T")[0];
      })()
    );

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-rose-200 selection:text-rose-800">
      {/* Top Header */}
      <Header
        stats={effectiveStats}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenSettings={() => setShowSettings(true)}
        onOpenGuide={() => setShowGuide(true)}
        notificationStatus={notificationStatus}
        onRequestNotification={handleRequestNotification}
      />

      {/* Main Body Content with mobile bottom nav safe padding */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6 pb-28 md:pb-16">
        {activeTab === "journey" && (
          <JourneyTab
            stats={effectiveStats}
            waterData={waterData}
            onAddWater={handleAddWater}
            medications={medications}
            onToggleMedication={handleToggleMedTaken}
            onNavigateToTab={handleTabChange}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        {activeTab === "reminders" && (
          <RemindersTab
            waterData={waterData}
            onUpdateWaterConfig={handleUpdateWaterConfig}
            onAddWater={handleAddWater}
            onResetWater={handleResetWater}
            medications={medications}
            onUpdateMedicationTime={handleUpdateMedicationTime}
            onToggleMedTaken={handleToggleMedTaken}
            onAddMedication={handleAddMedication}
            onDeleteMedication={handleDeleteMedication}
            onToggleMedActive={handleToggleMedActive}
            onTriggerToast={(toast) => setActiveToast(toast)}
            notificationStatus={notificationStatus}
            onRequestNotification={handleRequestNotification}
          />
        )}

        {activeTab === "chat" && (
          <GemmaChatTab
            stats={effectiveStats}
            onOpenGuide={() => setShowGuide(true)}
          />
        )}

        {activeTab === "weekguide" && (
          <WeekGuideTab currentWeek={effectiveStats.currentWeek} />
        )}

        {activeTab === "caretools" && <CareToolsTab />}
      </main>

      {/* App-Grade Mobile Bottom Navigation Bar (Hidden on Desktop) */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSave={handleSaveUserData}
        initialData={userData}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        userData={userData}
        onUpdateUserData={handleSaveUserData}
        waterData={waterData}
        onUpdateWaterConfig={handleUpdateWaterConfig}
        onResetAllData={handleResetAllData}
      />

      {/* User Guide & Tutorial Modal */}
      <AppGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        onOpenAiSettings={() => {
          setShowGuide(false);
          setActiveTab("chat");
        }}
      />

      {/* Floating Toast Notification */}
      <ToastAlert toast={activeToast} onClose={() => setActiveToast(null)} />
    </div>
  );
}
