import { useState, useEffect, useRef } from "react";
import {
  Bot,
  User,
  Send,
  ShieldCheck,
  FileText,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Loader2,
  BookOpen,
  HeartPulse,
  RotateCcw,
  Lightbulb,
  CheckCircle2
} from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [reportDetails, setReportDetails] = useState(null);
  const [lastFailedQuery, setLastFailedQuery] = useState(null);
  const [activeSourcesIndex, setActiveSourcesIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const activeId = localStorage.getItem("activeReportId");
    if (activeId) {
      setReportId(activeId);
      fetchReportAndHistory(activeId);
    } else {
      setMessages([
        {
          sender: "assistant",
          text: "Hello! I'm BloodLens Assistant, your friendly health guide.\n\nI'm here to help you understand your blood reports in plain, simple words. You can upload a report to ask specific questions about your results, or feel free to ask any general medical/laboratory question.",
          guidance: [],
          followUpQuestions: [
            "What do standard blood tests measure?",
            "What is considered a normal hemoglobin range?",
            "How can I prepare for a blood test?"
          ],
          sources: [],
          createdAt: new Date()
        }
      ]);
    }

    // Check if user clicked a specific biomarker prompt on the Dashboard
    const pendingPrompt = localStorage.getItem("pendingChatPrompt");
    if (pendingPrompt) {
      localStorage.removeItem("pendingChatPrompt");
      setInputQuery(pendingPrompt);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchReportAndHistory = async (id) => {
    try {
      // 1. Fetch report details
      const reportRes = await api.get(`/api/report/${id}`);
      if (reportRes.data.success) {
        setReportDetails(reportRes.data.data);
      }

      // 2. Fetch conversation history
      const historyRes = await api.get(`/api/chat/history/${id}`);
      if (historyRes.data.success && historyRes.data.data.length > 0) {
        setMessages(historyRes.data.data);
      } else {
        const patientName = reportRes.data.data?.patientDetails?.name || "there";
        setMessages([
          {
            sender: "assistant",
            text: `Hello ${patientName}! I've reviewed your blood report.\n\nEverything in your report is organized and ready. Feel free to ask me about any specific test, what reference ranges mean, or simple everyday habits that support your health.`,
            guidance: [],
            followUpQuestions: [
              "Which results are outside the normal range?",
              "Can you explain my report in simple words?",
              "What healthy habits support my test results?"
            ],
            sources: [],
            createdAt: new Date()
          }
        ]);
      }
    } catch (err) {
      console.warn("Could not load report history:", err.message);
    }
  };

  const handleSendMessage = async (queryToSend) => {
    const text = (queryToSend || inputQuery || "").trim();
    if (!text || loading) return;

    const userMsg = {
      sender: "user",
      text: text,
      createdAt: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryToSend) setInputQuery("");
    setLoading(true);
    setLastFailedQuery(null);

    try {
      const res = await api.post("/api/chat/query", {
        query: text,
        reportId: reportId
      });

      if (res.data.success) {
        const aiMsg = {
          sender: "assistant",
          text: res.data.data.answer,
          guidance: res.data.data.guidance || [],
          followUpQuestions: res.data.data.followUpQuestions || [],
          sources: res.data.data.sources || [],
          createdAt: new Date()
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(res.data.message || "Failed to get response");
      }
    } catch (err) {
      console.error("Chat error:", err);
      const safeMsg = err.userMessage || "I'm having a little trouble retrieving that information right now. Please try asking again in a moment.";
      toast.error(safeMsg);
      setLastFailedQuery(text);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: safeMsg,
          isError: true,
          failedQuery: text,
          guidance: [],
          followUpQuestions: [],
          sources: [],
          createdAt: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleSources = (index) => {
    setActiveSourcesIndex(activeSourcesIndex === index ? null : index);
  };

  // Get current active suggested questions from the latest assistant message
  const latestAssistantMessage = [...messages].reverse().find(m => m.sender === "assistant" && !m.isError);
  const currentSuggestions = latestAssistantMessage?.followUpQuestions?.length > 0
    ? latestAssistantMessage.followUpQuestions
    : [
        "Which results are outside normal range?",
        "Explain my report in simple words",
        "What questions should I ask my doctor?",
        "What healthy habits support my biomarkers?"
      ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Main Container */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 sm:px-6">

        {/* Chat Header */}
        <div className="border-b border-slate-200 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-xs">
                <Bot className="h-5 w-5 text-white" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-teal-500" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  BloodLens Health Assistant
                </h2>
                <p className="text-xs font-semibold text-teal-600 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Friendly • Grounded Medical Information
                </p>
              </div>
            </div>

            {/* Active Report Badge */}
            {reportDetails ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 shadow-xs">
                <FileText className="h-4 w-4 text-blue-600" />
                <div className="text-left">
                  <p className="text-[10px] font-semibold text-slate-400">
                    Active Report
                  </p>
                  <p className="max-w-[150px] truncate text-xs font-bold text-slate-700">
                    {reportDetails.patientDetails?.name || "Blood Report"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>General Q&A Mode</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Conversation Area */}
        <div className="flex flex-1 flex-col justify-between pt-4 pb-6">

          {/* Messages Feed */}
          <div className="space-y-6 overflow-y-auto pb-4 max-h-[62vh] sm:max-h-[66vh] pr-1.5">

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "assistant" && (
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-xs ${
                    msg.isError ? "bg-amber-500 text-white" : "bg-blue-600 text-white"
                  }`}>
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div className={`max-w-[90%] sm:max-w-[80%] ${msg.sender === "user" ? "text-right" : ""}`}>

                  <div
                    className={`rounded-2xl p-4 shadow-xs text-sm leading-6 whitespace-pre-line ${
                      msg.sender === "user"
                        ? "rounded-tr-xs bg-blue-600 text-white"
                        : msg.isError
                        ? "rounded-tl-xs border border-amber-200 bg-amber-50/70 text-amber-900"
                        : "rounded-tl-xs border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    {/* Message Body */}
                    <div>
                      {formatMessageText(msg.text)}
                    </div>

                    {/* Retry Button on Error */}
                    {msg.isError && msg.failedQuery && (
                      <div className="mt-3 border-t border-amber-200 pt-2.5">
                        <button
                          onClick={() => handleSendMessage(msg.failedQuery)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100/50 transition"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Try Asking Again
                        </button>
                      </div>
                    )}

                    {/* Proactive Health Guidance Items */}
                    {msg.guidance && msg.guidance.length > 0 && (
                      <div className="mt-4 rounded-xl bg-teal-50/70 border border-teal-100 p-3.5 text-left">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 mb-2">
                          <HeartPulse className="h-4 w-4 text-teal-600" />
                          General Healthy Habits to Consider:
                        </div>
                        <ul className="space-y-1.5">
                          {msg.guidance.map((tip, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-2 text-xs text-teal-900">
                              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-teal-600 shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Collapsible Source Citations */}
                    {msg.sender === "assistant" && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3.5 border-t border-slate-100 pt-2.5 text-left">
                        <button
                          onClick={() => toggleSources(index)}
                          className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition"
                        >
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                            Medical Sources & Evidence ({msg.sources.length})
                          </span>
                          {activeSourcesIndex === index ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {activeSourcesIndex === index && (
                          <div className="mt-2.5 space-y-2">
                            {msg.sources.map((src, sIdx) => (
                              <div
                                key={sIdx}
                                className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-xs text-slate-700"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-blue-600 text-[10px] uppercase tracking-wider">
                                    {src.category}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {src.fileName}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed italic">
                                  "{src.snippet}"
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="mt-1 px-1 text-[10px] text-slate-400 font-medium">
                    {msg.sender === "user" ? "You" : "BloodLens Assistant"} •{" "}
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>

                </div>

                {msg.sender === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 shadow-xs">
                    <User className="h-5 w-5 text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-xs">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="rounded-2xl rounded-tl-xs border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    Reviewing your biomarkers & preparing plain-language insights...
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts & Input Container */}
          <div className="mt-auto border-t border-slate-200 pt-3.5">

            {/* Dynamic Contextual Follow-Up Suggestions */}
            <div className="mb-2.5 flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Explore next:
              </p>
            </div>

            <div className="mb-3 flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              {currentSuggestions.map((suggestionText, idx) => (
                <Suggestion
                  key={idx}
                  text={suggestionText}
                  onClick={() => handleSendMessage(suggestionText)}
                  disabled={loading}
                />
              ))}
            </div>

            {/* Message Input Box */}
            <div className="rounded-2xl border border-slate-300 bg-white p-2 shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your report or health metrics..."
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={loading || !inputQuery.trim()}
                  aria-label="Send message"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Medical AI Disclaimer */}
            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <p className="text-[11px] text-slate-400">
                BloodLens provides educational information. It is not a medical diagnosis. Always review health decisions with your doctor.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

// Clean markdown formatter supporting bold, headings, and bullet points
function formatMessageText(text = "") {
  if (!text) return "";
  
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    // Handle bullet points
    if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
      const bulletContent = line.trim().substring(2);
      return (
        <div key={idx} className="flex items-start gap-2 my-1 pl-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
          <span>{renderFormattedInline(bulletContent)}</span>
        </div>
      );
    }

    return (
      <span key={idx} className="block min-h-[1.2rem]">
        {renderFormattedInline(line)}
      </span>
    );
  });
}

function renderFormattedInline(str) {
  // Support **bold text**
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function Suggestion({ text, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
    >
      <span>{text}</span>
      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
    </button>
  );
}