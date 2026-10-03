"use client";

import { useState } from "react";
import { 
  X, 
  HelpCircle, 
  Bot, 
  Server, 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  Droplets, 
  Pill, 
  Sparkles, 
  HeartPulse, 
  Calendar,
  Terminal,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Laptop,
  Zap,
  Lock,
  AlertCircle
} from "lucide-react";

export default function AppGuideModal({ isOpen, onClose, onOpenAiSettings }) {
  const [activeGuideTab, setActiveGuideTab] = useState("ai"); // "ai", "tracking", "reminders", "care"
  const [copiedText, setCopiedText] = useState(null);
  const [userProfile, setUserProfile] = useState("beginner"); // "beginner" vs "advanced"

  if (!isOpen) return null;

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[92vh] glass-card-elevated rounded-3xl p-5 sm:p-7 shadow-2xl border border-rose-100 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-rose-200">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-slate-800">
                User Guide & Setup Instructions
              </h3>
              <p className="text-xs text-slate-500">
                Simple, step-by-step instructions for visitors and moms.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-rose-50/70 rounded-2xl my-3 border border-rose-100 shrink-0 text-xs font-semibold">
          {[
            { id: "ai", label: "🤖 AI Assistant", title: "AI Connection" },
            { id: "tracking", label: "🌸 Journey", title: "Pregnancy Dates" },
            { id: "reminders", label: "⏰ Reminders", title: "Water & Meds" },
            { id: "care", label: "🩺 Tools", title: "Care Tools" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveGuideTab(tab.id)}
              className={`py-2 px-1 text-center rounded-xl transition-all ${
                activeGuideTab === tab.id
                  ? "bg-white text-rose-600 shadow-sm border border-rose-100 font-bold"
                  : "text-slate-600 hover:text-rose-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body content (scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* TAB 1: AI CONNECTION GUIDE */}
          {activeGuideTab === "ai" && (
            <div className="space-y-4">
              {/* Beginner vs Advanced Toggle */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                    Which describes you best?
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Choose your setup type to see the simplest instructions for your device.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-rose-100 self-stretch sm:self-auto">
                  <button
                    onClick={() => setUserProfile("beginner")}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      userProfile === "beginner"
                        ? "bg-rose-500 text-white shadow-xs"
                        : "text-slate-600 hover:text-rose-600"
                    }`}
                  >
                    ⚡ Easiest (Cloud)
                  </button>
                  <button
                    onClick={() => setUserProfile("advanced")}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      userProfile === "advanced"
                        ? "bg-rose-500 text-white shadow-xs"
                        : "text-slate-600 hover:text-rose-600"
                    }`}
                  >
                    💻 Laptop Ollama
                  </button>
                </div>
              </div>

              {/* BEGINNER TRACK: CLOUD API */}
              {userProfile === "beginner" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-white border border-rose-100 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Quick Cloud Setup (Works 24/7 on Phones & Render)
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Takes 30 Seconds • Free
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      If you are visiting this website from a phone, tablet, or don't have Ollama installed, you can use a free Google Gemini Cloud Key. It provides the exact same week-by-week pregnancy intelligence!
                    </p>

                    <div className="space-y-2.5 pt-1 text-xs">
                      {/* Step 1 */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                          1
                        </span>
                        <div className="flex-1">
                          <strong className="text-slate-800 block">Get your free API key:</strong>
                          <span>Open </span>
                          <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-rose-600 font-bold hover:underline inline-flex items-center gap-0.5"
                          >
                            Google AI Studio (aistudio.google.com) <ExternalLink className="w-3 h-3" />
                          </a>
                          <span>, sign in with your Google account, and click <strong>"Create API Key"</strong>. It costs $0.</span>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                          2
                        </span>
                        <div className="flex-1">
                          <strong className="text-slate-800 block">Open AI Settings in this app:</strong>
                          <span>Go to the <strong>"Ask Gemma AI"</strong> tab, click the <strong>"⚙️ AI Settings"</strong> button, and choose <strong>"Gemini API (Render Ready)"</strong>.</span>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                          3
                        </span>
                        <div className="flex-1">
                          <strong className="text-slate-800 block">Paste your key & Save:</strong>
                          <span>Paste your key and click <strong>"Save AI Configuration"</strong>. You can now chat in real time anytime!</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADVANCED TRACK: OLLAMA TUNNEL */}
              {userProfile === "advanced" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-white border border-rose-100 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                        <Server className="w-4 h-4 text-rose-500" />
                        Connect your Local Laptop Model (`pregnancy-gemma`)
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        100% Private & Local
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      When using the deployed website (<code>https://pregnancy-sxq4.onrender.com/</code>), the website is hosted in the cloud. To connect it to the <code>pregnancy-gemma</code> model on your personal laptop, run a quick free tunnel:
                    </p>

                    <div className="space-y-3 text-xs">
                      {/* Step 1 */}
                      <div>
                        <span className="font-semibold text-slate-700 block mb-1">
                          Step 1: Run your model in Ollama
                        </span>
                        <p className="text-[11px] text-slate-500 mb-1.5">
                          Choose whichever option applies to you:
                        </p>
                        <div className="space-y-2">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                              ⚡ Option A: For Any User (Run Standard Gemma 2B):
                            </span>
                            <div className="flex items-center justify-between bg-slate-900 text-rose-200 px-3 py-1.5 rounded-lg font-mono text-xs">
                              <span>ollama run gemma2:2b</span>
                              <button
                                onClick={() => handleCopy("cmd_gemma", "ollama run gemma2:2b")}
                                className="p-1 hover:text-white transition-colors"
                                title="Copy command"
                              >
                                {copiedText === "cmd_gemma" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                              *Available to everyone in Ollama library. Our app automatically injects all week-by-week pregnancy guidelines and trimester context!
                            </p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                              📦 Option B: Or create the exact "pregnancy-gemma" model using our repo's Modelfile:
                            </span>
                            <div className="flex items-center justify-between bg-slate-900 text-rose-200 px-3 py-1.5 rounded-lg font-mono text-xs">
                              <span>ollama create pregnancy-gemma -f Modelfile</span>
                              <button
                                onClick={() => handleCopy("cmd_create", "ollama create pregnancy-gemma -f Modelfile")}
                                className="p-1 hover:text-white transition-colors"
                                title="Copy command"
                              >
                                {copiedText === "cmd_create" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div>
                        <span className="font-semibold text-slate-700 block mb-1">
                          Step 2: Expose your local port via a free tunnel
                        </span>
                        
                        {/* 403 Forbidden & OLLAMA_ORIGINS Info Box */}
                        <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900 space-y-1.5 mb-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Crucial Requirement to Avoid 403 Forbidden Error:</span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            The <strong>403 Forbidden</strong> error is caused by Ollama's internal CORS/Host security filter. By default, Ollama refuses to respond to any external domain name (like <code>wet-spoons-trade.loca.lt</code>) unless the environment variable <code>OLLAMA_ORIGINS="*"</code> is set on your computer.
                          </p>
                          <div className="pt-1 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                              Run once in PowerShell (Windows) to enable:
                            </span>
                            <div className="flex items-center justify-between bg-slate-900 text-amber-200 px-3 py-1.5 rounded-lg font-mono text-xs">
                              <span>[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')</span>
                              <button
                                onClick={() => handleCopy("cmd_origins", "[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')")}
                                className="p-1 hover:text-white transition-colors"
                                title="Copy command"
                              >
                                {copiedText === "cmd_origins" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <span className="text-[10px] text-amber-700 block font-medium">
                              *After running this, restart Ollama so it loads the new setting.
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 mb-1.5 font-medium">Choose whichever tunnel method you prefer:</p>
                        
                        <div className="space-y-2.5">
                          {/* Option 1: Ngrok with host-header (VERIFIED & RECOMMENDED) */}
                          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/90 space-y-2 shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                🌟 Option 1: Ngrok (Recommended & Verified Working)
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                100% Reliable
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">
                              Run this command in any PowerShell or Terminal window:
                            </p>
                            <div className="flex items-center justify-between bg-slate-900 text-rose-200 px-3 py-2 rounded-xl font-mono text-xs shadow-inner">
                              <span>npx ngrok http 11434 --host-header="localhost"</span>
                              <button
                                onClick={() => handleCopy("cmd_ngrok", "npx ngrok http 11434 --host-header=\"localhost\"")}
                                className="p-1 hover:text-white transition-colors"
                                title="Copy command"
                              >
                                {copiedText === "cmd_ngrok" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-600 leading-relaxed">
                              ✨ <strong>Why this works:</strong> The <code>--host-header="localhost"</code> flag rewrites the incoming web header so Ollama sees it as local traffic and allows it without 403 Forbidden!
                              <br />
                              Outputs an HTTPS URL like: <code>https://xxxx.ngrok-free.app</code>. Copy that into AI Settings!
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div>
                        <span className="font-semibold text-slate-700 block mb-1">
                          Step 3: Paste the URL in AI Settings
                        </span>
                        <p className="text-slate-600 text-xs">
                          In the website, click <strong>"Ask Gemma AI"</strong> → <strong>"⚙️ AI Settings"</strong> → Paste your <code>https://xxxx.lhr.life</code> or <code>https://xxxx.ngrok-free.app</code> URL → Click <strong>Save</strong>!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Frequently Asked Questions */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Frequently Asked Questions
                </h4>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <p>
                    <strong>Q: Is this free to use?</strong>
                    <br />
                    Yes! Both Ollama (runs locally on your PC) and Google AI Studio (free API key tier) are 100% free of charge.
                  </p>
                  <p>
                    <strong>Q: Why did I get a "403 Forbidden" error when testing my tunnel?</strong>
                    <br />
                    The 403 Forbidden error is caused by Ollama's internal CORS/Host security filter. By default, Ollama refuses to respond to any external domain name (like <code>wet-spoons-trade.loca.lt</code>) unless the environment variable <code>OLLAMA_ORIGINS="*"</code> is set on your computer. Set the variable using the command in Step 2, restart Ollama, and test again.
                  </p>
                  <p>
                    <strong>Q: Is my medical & pregnancy data safe?</strong>
                    <br />
                    Yes. All pregnancy dates, water records, and medication schedules are saved strictly inside your own device's browser (LocalStorage). Nothing is sold or tracked.
                  </p>
                </div>
              </div>

              {onOpenAiSettings && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAiSettings();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Open AI Settings to Connect Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* TAB 2: PREGNANCY TRACKING GUIDE */}
          {activeGuideTab === "tracking" && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white border border-rose-100 space-y-2 shadow-xs">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  How to Set or Change Your Dates
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Click the <strong>"Due Date / Dates"</strong> button in the top header at any time:
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600">
                  <li>
                    <strong>Last Menstrual Period (LMP):</strong> If you know when your last period began, choose this. You can also adjust your average cycle length (28 days default).
                  </li>
                  <li>
                    <strong>Estimated Due Date (EDD):</strong> If your ultrasound scan or OB/GYN has already given you an exact due date, choose this option to calculate gestational weeks backward automatically.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-2">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  Baby Growth Milestones & Encyclopedia
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Visit the <strong>"Week by Week"</strong> tab to browse all 40 weeks of fetal development, compare baby to fruits and vegetables, and see recommended doctor screenings (such as NIPT, anomaly ultrasound, and glucose test).
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: WATER & MEDICINE REMINDERS GUIDE */}
          {activeGuideTab === "reminders" && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white border border-sky-100 space-y-2 shadow-xs">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-500" />
                  Daily Water Hydration Tracker & Reminders
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600">
                  <li>
                    <strong>Logging Water:</strong> Tap <strong>+1 Glass (250 ml)</strong>, <strong>+500 ml Bottle</strong>, or tap the visual glass icons directly!
                  </li>
                  <li>
                    <strong>Changing Reminder Frequency:</strong> In the "Water & Medicine" tab, choose whether you want reminders every 45 mins, 1 hr, 1.5 hrs, 2 hrs, or 3 hrs.
                  </li>
                  <li>
                    <strong>Active Window:</strong> Set your morning Start Time (e.g. 08:00 AM) and bedtime End Time (e.g. 09:30 PM) so reminders never disturb your sleep.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-rose-100 space-y-2 shadow-xs">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-rose-500" />
                  Customizing Medicine & Prenatal Vitamin Timings
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600">
                  <li>
                    <strong>Change Reminder Times:</strong> On each medicine card, click the time input (e.g. <code>08:30</code>) to pick any exact hour and minute that matches your daily breakfast, lunch, or dinner!
                  </li>
                  <li>
                    <strong>Quick Adjust Shortcuts:</strong> Click preset buttons like <em>Morning (08:00)</em> or <em>Bedtime (21:30)</em> for 1-click updates.
                  </li>
                  <li>
                    <strong>Mark as Taken:</strong> Click the checkmark to record that you've taken your dose. Resets automatically every midnight.
                  </li>
                  <li>
                    <strong>Add Custom Medicine:</strong> Click <strong>+ Add Medicine</strong> to track any doctor prescription with dosage and notes.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: CARE TOOLS */}
          {activeGuideTab === "care" && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white border border-rose-100 space-y-2 shadow-xs">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  Kick Counter & Contraction Timer
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600">
                  <li>
                    <strong>Kick Counter:</strong> From week 28 onward, lie comfortably on your left side and tap the heartbeat button every time baby kicks or rolls. The app measures how long it takes to reach 10 kicks.
                  </li>
                  <li>
                    <strong>Contraction Timer:</strong> Tap Start when a contraction begins and Stop when it eases. The app measures duration and interval according to the standard <strong>5-1-1 Rule</strong>.
                  </li>
                  <li>
                    <strong>Doctor Checklist:</strong> Add questions as you think of them during the week so you never forget to ask your OB/GYN during visits.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-rose-100 shrink-0 flex items-center justify-between text-xs text-slate-500">
          <span>Bloom & Nurture Pregnancy Companion</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
