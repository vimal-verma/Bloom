"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  AlertCircle, 
  ShieldAlert, 
  Cpu, 
  MessageSquare,
  Baby,
  HeartHandshake,
  Settings,
  X,
  ExternalLink,
  Globe,
  Key,
  Server,
  BookOpen,
  Zap
} from "lucide-react";
import { playChime } from "../lib/soundUtils";
import MarkdownRenderer from "./MarkdownRenderer";

export default function GemmaChatTab({ stats, onOpenGuide }) {
  // 1. AI Configuration State (Persisted in localStorage)
  const [aiConfig, setAiConfig] = useState({
    provider: "ollama", // "ollama" or "gemini"
    ollamaHost: "http://127.0.0.1:11434",
    ollamaModel: "pregnancy-gemma",
    apiKey: ""
  });
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Health check state
  const [connectionStatus, setConnectionStatus] = useState("checking"); // "online", "offline", "checking"
  const [detectedModels, setDetectedModels] = useState([]);
  const [testResult, setTestResult] = useState(null);

  // Chat conversation state
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "assistant",
      content: `Hello mama! 🌸 I am **Pregnancy Gemma**, your private pregnancy AI companion.

I'm aware that you are currently at **Week ${stats?.currentWeek || 1} (Trimester ${stats?.trimester || 1})**, and your little one is approximately the size of a **${stats?.weekInfo?.fruit || "little seed"}**!

How are you feeling today? You can ask me anything about your current week's symptoms, safe exercises, hydration, foods, or what's developing in baby!`
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const chatScrollContainerRef = useRef(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const abortControllerRef = useRef(null);

  // Safely scroll ONLY the inner message box on new messages or streaming (never scrolls window)
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      if (messages.length > prevMessagesLengthRef.current || isLoading) {
        chatScrollContainerRef.current.scrollTo({
          top: chatScrollContainerRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, isLoading]);

  // Load saved AI config from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedConfig = localStorage.getItem("bloom_ai_config");
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          setAiConfig(parsed);
          checkHealth(parsed.ollamaHost);
        } catch (e) {
          checkHealth("http://127.0.0.1:11434");
        }
      } else {
        checkHealth("http://127.0.0.1:11434");
      }
    }
  }, []);

  const saveConfig = (newConfig) => {
    setAiConfig(newConfig);
    if (typeof window !== "undefined") {
      localStorage.setItem("bloom_ai_config", JSON.stringify(newConfig));
    }
    if (newConfig.provider === "ollama") {
      checkHealth(newConfig.ollamaHost);
    } else {
      setConnectionStatus(newConfig.apiKey ? "online" : "offline");
    }
  };

  const checkHealth = async (hostToTest) => {
    setConnectionStatus("checking");
    const host = hostToTest || aiConfig.ollamaHost || "http://127.0.0.1:11434";

    try {
      const res = await fetch(`/api/chat?host=${encodeURIComponent(host)}`);
      const data = await res.json();
      if (data.status === "online") {
        setConnectionStatus("online");
        setDetectedModels(data.models || []);
        setTestResult({ success: true, message: `Connected to ${data.host}` });
      } else {
        setConnectionStatus("offline");
        setTestResult({
          success: false,
          message: data.error || "Cannot reach host",
          tip: data.tip
        });
      }
    } catch (err) {
      setConnectionStatus("offline");
      setTestResult({ success: false, message: "Could not reach endpoint", tip: "Check if your tunnel is running." });
    }
  };

  // Scroll ONLY the inner chat bubbles container, NEVER the browser window!
  const scrollToBottom = (behavior = "smooth") => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: behavior
      });
    }
  };

  useEffect(() => {
    // Only scroll inner container when new messages are added or while streaming
    // Never auto-scroll on initial tab mount!
    if (messages.length > prevMessagesLengthRef.current || isLoading) {
      scrollToBottom();
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, isLoading]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || inputValue;
    if (!textToSend.trim() || isLoading) return;

    // Check if configuration is missing
    if (aiConfig.provider === "gemini" && !aiConfig.apiKey.trim()) {
      setShowConfigModal(true);
      return;
    }

    const userMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: textToSend.trim()
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue("");
    setIsLoading(true);

    const assistantMsgId = "asst-" + (Date.now() + 1);
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: "assistant", content: "" }
    ]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          userContext: {
            currentWeek: stats?.currentWeek || 1,
            currentDayOfWeek: stats?.currentDayOfWeek || 0,
            trimester: stats?.trimester || 1,
            eddDate: stats?.eddDate || "",
            weekInfo: stats?.weekInfo || null
          },
          aiConfig: aiConfig
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `HTTP error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamedText += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: streamedText } : m
          )
        );
      }

      playChime();
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Chat generation stopped by user.");
      } else {
        console.error("Chat error:", err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content:
                    `⚠️ **Connection Note**: Could not reach the AI model.\n\n*Details:* ${err.message}\n\n👉 **Tip**: Click the **⚙️ AI Settings** button above to change your **OLLAMA_HOST URL** (e.g. your Ngrok URL or remote IP) or enter a **Google Gemini API Key** (ideal when deployed on Render).`
                }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: `Chat history cleared! 🌸 What would you like to know about Week ${stats?.currentWeek || 1}?`
      }
    ]);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestedPrompts = [
    `🥗 Best nutrition & meal ideas for Week ${stats?.currentWeek || 1}?`,
    `💧 How much water do I need to prevent cramps & maintain amniotic fluid?`,
    `😴 Safe sleeping positions for Trimester ${stats?.trimester || 1}?`,
    `🩺 What tests & ultrasound checks should I ask my doctor about?`,
    `👶 When will I feel baby kicks and what is normal movement?`
  ];

  return (
    <div className="space-y-4 animate-fadeIn pb-16">
      {/* Top Banner with Model Status & AI Settings Button */}
      <div className="glass-card-elevated rounded-3xl p-5 sm:p-6 border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-400 to-amber-300 text-white flex items-center justify-center shadow-md shadow-rose-200 shrink-0">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Pregnancy Gemma AI
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                {aiConfig.provider === "gemini" ? "Gemini Cloud API" : "pregnancy-gemma"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {aiConfig.provider === "gemini"
                ? "Connected via Google Gemini API"
                : `Ollama Host: ${aiConfig.ollamaHost}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Status pill */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            title="Click to view AI connection settings"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                connectionStatus === "online"
                  ? "bg-emerald-500 animate-pulse"
                  : connectionStatus === "checking"
                  ? "bg-amber-400 animate-spin"
                  : "bg-red-400"
              }`}
            />
            <span>
              {connectionStatus === "online"
                ? "AI Ready"
                : connectionStatus === "checking"
                ? "Checking..."
                : "Setup Required"}
            </span>
          </button>

          {/* AI Settings Trigger */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold border border-rose-200/80 transition-all shadow-xs"
            title="Configure OLLAMA_HOST URL or Cloud API Key"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>AI Settings</span>
          </button>

          {/* Guide Trigger */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200/80 transition-all shadow-xs"
            title="Step-by-step setup guide for Ollama tunnels and API keys"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Guide</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Week Context Pill */}
      <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-100/80 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <Baby className="w-4 h-4 text-rose-500 shrink-0" />
          <span>
            Personalized to: <strong>Week {stats?.currentWeek}</strong> • Trimester {stats?.trimester} • Baby size: <strong>{stats?.weekInfo?.fruit}</strong>
          </span>
        </div>
        <span className="text-[11px] text-rose-600 font-bold hidden sm:inline">
          {aiConfig.provider === "gemini" ? "Cloud Mode (Render Ready)" : "100% Private Local Model"}
        </span>
      </div>

      {/* Chat Messages Container */}
      <div className="glass-card-elevated rounded-3xl p-3.5 sm:p-6 border border-rose-100 h-[65dvh] sm:h-[600px] min-h-[420px] flex flex-col justify-between overflow-hidden shadow-sm">
        {/* Scrollable message stream */}
        <div ref={chatScrollContainerRef} className="flex-1 overflow-y-auto space-y-3.5 sm:space-y-4 pr-1 mb-3">
          {/* Quick Setup Card if Not Connected */}
          {connectionStatus !== "online" && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-slate-800 space-y-2 mb-2 shadow-xs animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Connect AI to Start Chatting
                </span>
                <button
                  onClick={onOpenGuide}
                  className="text-[11px] text-amber-700 underline font-bold hover:text-amber-900"
                >
                  View Step-by-Step Guide &rarr;
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Welcome! Since this site is hosted on Render, choose how you would like to connect your AI:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAiConfig({ ...aiConfig, provider: "gemini" });
                    setShowConfigModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 hover:scale-105"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Free Cloud Key (Instant for All Users)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAiConfig({ ...aiConfig, provider: "ollama" });
                    setShowConfigModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>Connect Laptop Ollama Tunnel</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="px-3 py-1.5 rounded-xl bg-amber-100/70 hover:bg-amber-200 text-amber-900 font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Guide</span>
                </button>
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-start ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    isUser
                      ? "bg-slate-800 text-white"
                      : "bg-gradient-to-tr from-rose-400 to-pink-500 text-white shadow-xs"
                  }`}
                >
                  {isUser ? "You" : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed relative group ${
                    isUser
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm"
                      : "bg-white/95 border border-rose-100/90 text-slate-800 shadow-xs"
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                  ) : msg.content ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                      Pregnancy Gemma is thinking...
                    </span>
                  )}

                  {!isUser && msg.content && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-200 text-slate-500 transition-all text-xs"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="pt-2 border-t border-rose-100/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Suggested Questions:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth overscroll-x-contain -mx-1 px-1">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-rose-50/80 hover:bg-rose-100 border border-rose-100/70 text-rose-700 text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-50 shrink-0 active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 pt-1.5"
          >
            <input
              type="text"
              placeholder={`Ask Gemma about Week ${stats?.currentWeek || 1}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-rose-200/90 bg-white/95 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-slate-400"
            />

            {isLoading ? (
              <button
                type="button"
                onClick={handleStop}
                className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all whitespace-nowrap active:scale-95"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
              >
                <span className="hidden sm:inline">Ask</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Safety Disclaimer Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 pt-2 gap-1">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              For educational guidance only. Always consult your doctor for medical emergencies.
            </span>
            <button
              onClick={() => setShowConfigModal(true)}
              className="hover:text-rose-600 hover:underline font-mono text-[10px] sm:text-[11px] self-start sm:self-auto"
            >
              ⚙️ {aiConfig.provider === "gemini" ? "Google Gemini API" : `Ollama: ${aiConfig.ollamaModel}`}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: AI CONNECTION SETTINGS (OLLAMA HOST URL / CLOUD API KEY) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-lg glass-card-elevated rounded-3xl p-5 sm:p-7 shadow-2xl border border-rose-100 relative max-h-[90dvh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">
                    AI Connection Settings
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose between local/remote Ollama or Google Gemini Cloud API
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Provider Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-rose-50/70 rounded-2xl my-4 border border-rose-100">
              <button
                type="button"
                onClick={() => setAiConfig({ ...aiConfig, provider: "ollama" })}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  aiConfig.provider === "ollama"
                    ? "bg-white text-rose-600 shadow-sm border border-rose-100"
                    : "text-slate-600 hover:text-rose-500"
                }`}
              >
                <Server className="w-4 h-4" />
                <span>Ollama (Local / Remote)</span>
              </button>
              <button
                type="button"
                onClick={() => setAiConfig({ ...aiConfig, provider: "gemini" })}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  aiConfig.provider === "gemini"
                    ? "bg-white text-rose-600 shadow-sm border border-rose-100"
                    : "text-slate-600 hover:text-rose-500"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Gemini API (Render Ready)</span>
              </button>
            </div>

            {/* Quick Link to Detailed Guide */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  setShowConfigModal(false);
                  onOpenGuide && onOpenGuide();
                }}
                className="w-full p-2.5 rounded-2xl bg-amber-50/90 hover:bg-amber-100 border border-amber-200/80 text-amber-900 text-xs font-semibold flex items-center justify-between transition-colors shadow-xs"
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>How to connect your laptop model or get a free Gemini API key?</span>
                </span>
                <span className="text-amber-700 underline font-bold whitespace-nowrap ml-2">Read Guide &rarr;</span>
              </button>
            </div>

            {/* OLLAMA HOST CONFIGURATION */}
            {aiConfig.provider === "ollama" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    OLLAMA_HOST URL
                  </label>
                  <input
                    type="text"
                    value={aiConfig.ollamaHost}
                    onChange={(e) => setAiConfig({ ...aiConfig, ollamaHost: e.target.value })}
                    placeholder="http://127.0.0.1:11434"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-white text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    • <strong>Local laptop</strong>: Use <code>http://127.0.0.1:11434</code>
                    <br />
                    • <strong>Deployed on Render</strong>: Use your public tunnel (e.g. <code>https://xxxx.ngrok-free.app</code>) or remote server URL.
                  </p>
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-800 space-y-1">
                    <span className="font-bold flex items-center gap-1 text-amber-900">
                      💡 Recommended Tunnel Command:
                    </span>
                    <p className="leading-relaxed">
                      Run <code>npx ngrok http 11434 --host-header="localhost"</code>. The <code>--host-header="localhost"</code> flag rewrites the header at the HTTP layer, bypassing Ollama's 403 Forbidden check instantly!
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ollama Model Name
                  </label>
                  <input
                    type="text"
                    value={aiConfig.ollamaModel}
                    onChange={(e) => setAiConfig({ ...aiConfig, ollamaModel: e.target.value })}
                    placeholder="pregnancy-gemma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-white text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-slate-400">Quick Select:</span>
                    {["pregnancy-gemma", "gemma2:2b", "llama3.2"].map((mod) => (
                      <button
                        key={mod}
                        type="button"
                        onClick={() => setAiConfig({ ...aiConfig, ollamaModel: mod })}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                          aiConfig.ollamaModel === mod
                            ? "bg-rose-500 text-white font-bold"
                            : "bg-slate-100 hover:bg-rose-100 text-slate-600"
                        }`}
                      >
                        {mod}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    *If you haven't created the custom model, choose <code>gemma2:2b</code> (it exists globally for all Ollama users and works out-of-the-box).
                  </p>
                </div>

                {/* Test Connection Button */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => checkHealth(aiConfig.ollamaHost)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 active:scale-95"
                    >
                      <Server className="w-3.5 h-3.5" />
                      <span>Test Ollama Host</span>
                    </button>

                    {testResult && (
                      <span
                        className={`text-xs font-semibold flex items-center gap-1 ${
                          testResult.success ? "text-emerald-600" : "text-red-500 font-bold"
                        }`}
                      >
                        {testResult.success ? "✓" : "✗"} {testResult.message}
                      </span>
                    )}
                  </div>

                  {testResult && !testResult.success && testResult.tip && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-[11px] text-amber-900">
                        💡 Fix for this error:
                      </span>
                      <p className="text-[11px] leading-relaxed">
                        {testResult.tip}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GEMINI CLOUD API KEY CONFIGURATION */}
            {aiConfig.provider === "gemini" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Google Gemini API Key</span>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-600 hover:underline flex items-center gap-1 font-normal text-[11px]"
                    >
                      <span>Get free API key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="password"
                    value={aiConfig.apiKey}
                    onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 bg-white text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ideal when deploying on <strong>Render</strong> or cloud hosts where Ollama isn't installed. Uses Gemini 2.0 Flash with automatic fallback and the exact same obstetric guidelines!
                  </p>
                </div>
              </div>
            )}

            {/* Save Buttons */}
            <div className="flex items-center gap-3 pt-5 border-t border-rose-100 mt-5">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  saveConfig(aiConfig);
                  setShowConfigModal(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save AI Configuration</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
