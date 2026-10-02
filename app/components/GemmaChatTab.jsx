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
  HeartHandshake
} from "lucide-react";
import { playChime } from "../lib/soundUtils";

export default function GemmaChatTab({ stats }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "assistant",
      content: `Hello mama! 🌸 I am **Pregnancy Gemma**, your private local AI pregnancy companion.

I'm aware that you are currently at **Week ${stats?.currentWeek || 1} (Trimester ${stats?.trimester || 1})**, and your little one is approximately the size of a **${stats?.weekInfo?.fruit || "little seed"}**!

How are you feeling today? You can ask me anything about your current week's symptoms, safe exercises, hydration, foods, or what's developing in baby!`
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("checking"); // "online", "offline", "checking"
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Check Ollama status on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      if (data.status === "online" && data.available) {
        setConnectionStatus("online");
      } else {
        setConnectionStatus("offline");
      }
    } catch {
      setConnectionStatus("offline");
    }
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || inputValue;
    if (!textToSend.trim() || isLoading) return;

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
          }
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
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
                    `⚠️ **Connection Note**: Could not reach local \`pregnancy-gemma\`. \n\n*Error details:* ${err.message}\n\nPlease verify that Ollama is running on your computer with \`pregnancy-gemma\`.`
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
      {/* Top Banner with Model Status */}
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
                Local 2.6B
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Private, on-device AI tuned to your gestational week & trimester.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Status pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
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
                ? "pregnancy-gemma Ready"
                : connectionStatus === "checking"
                ? "Connecting..."
                : "Ollama Offline"}
            </span>
          </div>

          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
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
          100% Private & Runs Locally
        </span>
      </div>

      {/* Chat Messages Container */}
      <div className="glass-card-elevated rounded-3xl p-4 sm:p-6 border border-rose-100 min-h-[460px] max-h-[580px] flex flex-col justify-between overflow-hidden">
        {/* Scrollable message stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
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
                  <div className="whitespace-pre-wrap font-normal">
                    {msg.content || (
                      <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                        Pregnancy Gemma is thinking...
                      </span>
                    )}
                  </div>

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
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="pt-2 border-t border-rose-100/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Suggested Questions:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-rose-50/80 hover:bg-rose-100 border border-rose-100/70 text-rose-700 text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-50 shrink-0"
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
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              placeholder={`Ask Pregnancy Gemma anything about Week ${stats?.currentWeek || 1}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl border border-rose-200/90 bg-white/95 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-slate-400"
            />

            {isLoading ? (
              <button
                type="button"
                onClick={handleStop}
                className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 transition-all flex items-center gap-1.5"
              >
                <span>Ask</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Safety Disclaimer Footer */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              For educational guidance only. Always consult your doctor or midwife for medical emergencies.
            </span>
            <span className="hidden sm:inline font-mono">
              Ollama: pregnancy-gemma:latest
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
