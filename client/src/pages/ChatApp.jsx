/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import AssistantAvatar, { COUNSELOR_CONFIGS } from "../components/AssistantAvatar";
import ScrollableFeed from "react-scrollable-feed";
import ReportModal from "../components/ReportModal";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { callGatewayLLMDirect } from "../services/llmService";
import { speakWithNeuralTTS, stopNeuralTTS } from "../services/azureSpeechService";

// Helper for relative timestamps (e.g. "Just now", "5m ago", "Yesterday")
const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [renderContent, setRenderContent] = useState([]);
  const inputElement = useRef(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { type } = useParams();
  const [report, setReport] = useState();
  const userInfo = useSelector((state) => state.mindGuide?.userInfo);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);

  // ChatGPT-style Session Persistence State
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [currentSessionTitle, setCurrentSessionTitle] = useState("Counseling Session");
  const [sessionList, setSessionList] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitleText, setEditingTitleText] = useState("");

  const normType = (type || "").toLowerCase().trim();
  const activeCounselor = COUNSELOR_CONFIGS[normType] || COUNSELOR_CONFIGS["academic counselor"];

  // Stop speech synthesis immediately when component unmounts / user navigates away
  useEffect(() => {
    return () => {
      stopNeuralTTS();
      setIsSpeaking(false);
    };
  }, []);

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.info("Voice input is not supported in this browser. You can type your message below.");
      return;
    }
    if (!listening) {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
      setListening(true);
    } else {
      SpeechRecognition.stopListening();
      setListening(false);
    }
  };

  const microphoneAnimationControls = useAnimation();
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus();
    }
  }, [messages]);

  // Fetch or initialize chat sessions on mount & when counselor type changes
  useEffect(() => {
    if (!type) return;

    const loadSessions = async () => {
      try {
        const res = await axios.get(`/api/v1/chat/sessions?counselorType=${encodeURIComponent(type)}`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          const sessions = res.data.data;
          setSessionList(sessions);

          // If there is an existing recent session, resume it
          if (sessions.length > 0) {
            const latestSession = sessions[0];
            const detailRes = await axios.get(`/api/v1/chat/sessions/${latestSession._id}`);
            if (detailRes.data?.success && detailRes.data.data) {
              setCurrentSessionId(latestSession._id);
              setCurrentSessionTitle(detailRes.data.data.title || "Counseling Session");
              setMessages(detailRes.data.data.messages || []);
              return;
            }
          }
        }

        // Otherwise create a fresh initial session
        const initRes = await axios.post("/api/v1/chat/sessions", {
          counselorType: type,
        });
        if (initRes.data?.success && initRes.data.data) {
          const newSession = initRes.data.data;
          setCurrentSessionId(newSession._id);
          setCurrentSessionTitle(newSession.title);
          setMessages(newSession.messages || []);
          setSessionList([
            {
              _id: newSession._id,
              title: newSession.title,
              counselorType: newSession.counselorType,
              lastActivity: newSession.lastActivity,
              createdAt: newSession.createdAt,
              messageCount: 0,
              preview: "New session started",
            },
          ]);
        }
      } catch (err) {
        console.warn("Could not initialize chat sessions from server:", err);
        // Fallback to legacy endpoint if offline
        try {
          const legacyRes = await axios.get(`http://localhost:3001/api/v1/chat/${type}`);
          if (legacyRes.status === 200 && Array.isArray(legacyRes.data)) {
            setMessages(legacyRes.data);
          }
        } catch (legacyErr) {
          console.error("Legacy chat fetch also failed:", legacyErr);
        }
      }
    };

    loadSessions();
  }, [type, userInfo]);

  // Load a chosen past session
  const handleSelectSession = async (sessionId) => {
    if (sessionId === currentSessionId) return;
    stopNeuralTTS();
    setIsSpeaking(false);
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/chat/sessions/${sessionId}`);
      if (res.data?.success && res.data.data) {
        setCurrentSessionId(sessionId);
        setCurrentSessionTitle(res.data.data.title || "Counseling Session");
        setMessages(res.data.data.messages || []);
        setIsSidebarOpen(false); // Close mobile drawer
        toast.info(`Loaded: ${res.data.data.title}`);
      }
    } catch (err) {
      console.error("Error loading chat session:", err);
      toast.error("Failed to load session transcript");
    } finally {
      setLoading(false);
    }
  };

  // Start a new session (+ New Chat)
  const handleNewSession = async () => {
    stopNeuralTTS();
    setIsSpeaking(false);
    setLoading(true);
    try {
      const res = await axios.post("/api/v1/chat/sessions", {
        counselorType: type || "academic counselor",
      });
      if (res.data?.success && res.data.data) {
        const newSession = res.data.data;
        setCurrentSessionId(newSession._id);
        setCurrentSessionTitle(newSession.title);
        setMessages(newSession.messages || []);
        setSessionList((prev) => [
          {
            _id: newSession._id,
            title: newSession.title,
            counselorType: newSession.counselorType,
            lastActivity: newSession.lastActivity,
            createdAt: newSession.createdAt,
            messageCount: 0,
            preview: "Started new conversation",
          },
          ...prev,
        ]);
        setIsSidebarOpen(false);
        toast.success("Started new counseling session");
      }
    } catch (err) {
      console.error("Error creating new session:", err);
      toast.error("Failed to create new session");
    } finally {
      setLoading(false);
    }
  };

  // Rename session title
  const handleRenameSession = async (sessionId, e) => {
    if (e) e.stopPropagation();
    if (!editingTitleText.trim()) {
      setEditingSessionId(null);
      return;
    }
    try {
      const res = await axios.patch(`/api/v1/chat/sessions/${sessionId}`, {
        title: editingTitleText.trim(),
      });
      if (res.data?.success) {
        setSessionList((prev) =>
          prev.map((s) => (s._id === sessionId ? { ...s, title: editingTitleText.trim() } : s))
        );
        if (currentSessionId === sessionId) {
          setCurrentSessionTitle(editingTitleText.trim());
        }
        toast.success("Session renamed");
      }
    } catch (err) {
      console.error("Error renaming session:", err);
      toast.error("Failed to rename session");
    } finally {
      setEditingSessionId(null);
      setEditingTitleText("");
    }
  };

  // Delete session
  const handleDeleteSession = async (sessionId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat session?")) return;
    try {
      const res = await axios.delete(`/api/v1/chat/sessions/${sessionId}`);
      if (res.data?.success) {
        const remaining = sessionList.filter((s) => s._id !== sessionId);
        setSessionList(remaining);
        toast.success("Session deleted");
        if (currentSessionId === sessionId) {
          if (remaining.length > 0) {
            handleSelectSession(remaining[0]._id);
          } else {
            handleNewSession();
          }
        }
      }
    } catch (err) {
      console.error("Error deleting session:", err);
      toast.error("Failed to delete session");
    }
  };

  const generateText = async () => {
    if (inputText.trim() === "") {
      return;
    }
    try {
      const userMessage = {
        role: "user",
        content: inputText,
        timestamp: new Date().toISOString(),
      };
      setInputText("");

      setLoading(true);
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      const botResponseText = await callGatewayLLMDirect(updatedMessages);
      setLoading(false);

      const botMessage = {
        role: "assistant",
        content: botResponseText,
        timestamp: new Date().toISOString(),
      };

      setMessages([...updatedMessages, botMessage]);

      // Automatically persist to MongoDB session like ChatGPT
      if (currentSessionId) {
        axios
          .post(`/api/v1/chat/sessions/${currentSessionId}/messages`, {
            userMessage,
            assistantMessage: botMessage,
          })
          .then((res) => {
            if (res.data?.success && res.data.data) {
              const updatedTitle = res.data.data.title;
              if (updatedTitle && updatedTitle !== currentSessionTitle) {
                setCurrentSessionTitle(updatedTitle);
                setSessionList((prev) =>
                  prev.map((s) =>
                    s._id === currentSessionId
                      ? {
                          ...s,
                          title: updatedTitle,
                          lastActivity: new Date().toISOString(),
                          preview: botResponseText.substring(0, 85),
                        }
                      : s
                  )
                );
              } else {
                setSessionList((prev) =>
                  prev.map((s) =>
                    s._id === currentSessionId
                      ? {
                          ...s,
                          lastActivity: new Date().toISOString(),
                          preview: botResponseText.substring(0, 85),
                        }
                      : s
                  )
                );
              }
            }
          })
          .catch((err) => {
            console.warn("Could not auto-save message to session:", err.message);
          });
      }

      try {
        await speakWithNeuralTTS({
          text: botResponseText,
          gender: activeCounselor.gender,
          counselorName: activeCounselor.name,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      } catch (error) {
        console.error("Error in Neural Speech Synthesis:", error);
        setIsSpeaking(false);
      }
    } catch (err) {
      setLoading(false);
      setIsSpeaking(false);
      console.error("Error occurred while communicating directly with Gateway LLM", err);
      toast.error("Failed to generate response from AI service");
    }
  };

  const HandleReportGenerate = async () => {
    try {
      setLoading(true);
      const gptReportPrompt = [
        ...messages,
        {
          role: "system",
          content: `I am ${userInfo?.name || "User"} I want you to create a report from the above chat conversation for the user. compile a formal report with proper space and headings, including SWOT analysis, roadmap, tips, recommendation with proper roadmap, videos, books, blogs,news anything and tricks to help user. To help user to understand more about him/her.`,
        },
      ];

      const reportContent = await callGatewayLLMDirect(gptReportPrompt);
      setLoading(false);
      setReport(reportContent);
      setReportModalOpen(true);
    } catch (err) {
      setLoading(false);
      console.error("Error in generating report from Gateway LLM", err);
      toast.error("Failed to generate report");
    }
  };

  useEffect(() => {
    const content = messages.map((message, index) => {
      const isUserMessage = message.role === "user";

      return (
        <div
          key={index}
          className={`w-full flex ${
            message.role === "system" ? "hidden" : "block"
          } ${isUserMessage ? "justify-end" : "justify-start"} my-3`}
        >
          <div
            className={`flex items-start max-w-[90%] gap-3 ${
              isUserMessage ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
                isUserMessage
                  ? "bg-[#4648d4] text-white rounded-tr-none shadow-[0_8px_32px_rgba(70,72,212,0.18)]"
                  : "bg-white/70 backdrop-blur-xl border border-white/60 text-[#131b2e] rounded-tl-none shadow-xs"
              }`}
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
              {message.timestamp && (
                <div
                  className={`text-[10px] mt-1.5 flex items-center gap-1 ${
                    isUserMessage ? "text-white/70 justify-end" : "text-slate-400 justify-start"
                  }`}
                >
                  <span className="material-symbols-outlined text-[11px]">schedule</span>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });

    if (loading) {
      content.push(
        <div key="loading-indicator" className="w-full flex justify-start my-3">
          <div className="flex items-center gap-1.5 px-4 py-3 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl rounded-tl-none shadow-sm">
            <motion.span
              className="w-2 h-2 bg-[#4648d4] rounded-full"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className="w-2 h-2 bg-[#4648d4] rounded-full"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              className="w-2 h-2 bg-[#4648d4] rounded-full"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      );
    }

    setRenderContent(content);
  }, [messages, loading]);

  useEffect(() => {
    if (listening) {
      microphoneAnimationControls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.5, repeat: Infinity },
        color: "#dc2c4f",
      });
    } else {
      microphoneAnimationControls.start({
        color: "#002531",
      });
      microphoneAnimationControls.stop();
    }
  }, [listening, microphoneAnimationControls]);

  useEffect(() => {
    setTotalMessages(messages.length);
  }, [messages]);

  return (
    <div className="h-[88vh] bg-gradient-to-br from-[#e2e7ff] via-[#faf8ff] to-[#f0dbff] flex relative w-full font-['Plus_Jakarta_Sans'] overflow-hidden">
      {report && (
        <ReportModal
          report={report}
          open={isReportModalOpen}
          onClose={() => setReportModalOpen(false)}
        />
      )}

      {/* Left Partition: Prominent 3D Robot Assistant */}
      <div className="hidden md:flex w-1/3 lg:w-2/5 h-full relative border-r border-white/40 bg-white/20 backdrop-blur-md flex-col items-center justify-between p-4 overflow-hidden">
        <div className="w-full flex-1 flex items-center justify-center relative">
          <AssistantAvatar
            size="w-full h-full"
            loading={loading}
            isSpeaking={isSpeaking}
            counselorType={type}
          />
        </div>

        {/* Counselor Title & Status Badge */}
        <div className="w-full bg-white/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 shadow-sm z-10 shrink-0 mb-2 flex flex-col items-center text-center gap-1">
          <h3 className="text-base font-bold text-[#131b2e]">{activeCounselor.name}</h3>
          <p className="text-xs font-medium text-[#4648d4]">{activeCounselor.title}</p>
        </div>
      </div>

      {/* Right Partition: Chat Interface & Sessions */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header 3D Avatar Display */}
        <div className="flex md:hidden w-full h-36 bg-white/30 backdrop-blur-sm border-b border-white/40 flex-col items-center justify-center relative p-2 shrink-0">
          <div className="w-full h-24">
            <AssistantAvatar
              size="w-full h-full"
              loading={loading}
              isSpeaking={isSpeaking}
              counselorType={type}
            />
          </div>
          <div className="text-center bg-white/70 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/60 z-10">
            <span className="text-xs font-bold text-[#131b2e]">{activeCounselor.name}</span>
          </div>
        </div>

        {/* Top Session Toolbar (ChatGPT-style) */}
        <div className="w-full bg-white/70 backdrop-blur-md border-b border-white/50 px-4 md:px-6 py-2.5 flex items-center justify-between shrink-0 z-10 gap-3 shadow-xs">
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
              title="Chat History"
            >
              <span className="material-symbols-outlined text-xl text-[#4648d4]">history</span>
              <span className="text-xs font-bold hidden sm:inline text-slate-700">
                History ({sessionList.length})
              </span>
            </button>

            <div className="h-4 w-px bg-slate-300 mx-1 shrink-0 hidden sm:block"></div>

            {/* Current Session Title */}
            <div className="flex items-center gap-2 truncate flex-1">
              <span className="text-xs md:text-sm font-bold text-[#131b2e] truncate">
                {currentSessionTitle}
              </span>
              <button
                onClick={() => {
                  setEditingSessionId(currentSessionId);
                  setEditingTitleText(currentSessionTitle);
                  setIsSidebarOpen(true);
                }}
                className="text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                title="Rename Session"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleNewSession}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#4648d4] font-bold text-xs border border-[#4648d4]/30 shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
              title="Start a new chat thread"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>

        {/* ChatGPT Collapsible History Drawer */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="absolute inset-0 bg-slate-900 z-30 backdrop-blur-2xs"
              />

              {/* Drawer Content */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="absolute top-0 bottom-0 left-0 w-80 md:w-96 bg-white/95 backdrop-blur-xl border-r border-slate-200/90 shadow-2xl z-40 flex flex-col overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl text-[#4648d4]">forum</span>
                    <h3 className="font-extrabold text-sm text-[#002531]">Chat History</h3>
                    <span className="text-[10px] font-bold bg-[#4648d4]/10 text-[#4648d4] px-2 py-0.5 rounded-full">
                      {sessionList.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                {/* + New Chat CTA inside drawer */}
                <div className="p-3 border-b border-slate-100">
                  <button
                    onClick={handleNewSession}
                    className="w-full bg-[#4648d4] hover:bg-[#3638c4] text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    <span>Start New Conversation</span>
                  </button>
                </div>

                {/* Sessions List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                  {sessionList.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No saved sessions found.
                    </div>
                  ) : (
                    sessionList.map((session) => {
                      const isActive = session._id === currentSessionId;
                      const isEditing = editingSessionId === session._id;

                      return (
                        <div
                          key={session._id}
                          onClick={() => !isEditing && handleSelectSession(session._id)}
                          className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                            isActive
                              ? "bg-[#4648d4]/10 border-[#4648d4]/40 shadow-xs"
                              : "bg-white hover:bg-slate-50 border-slate-200/70"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            {isEditing ? (
                              <div
                                className="flex items-center gap-1.5 flex-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  value={editingTitleText}
                                  onChange={(e) => setEditingTitleText(e.target.value)}
                                  className="w-full text-xs border border-[#4648d4] rounded-lg px-2 py-1 outline-none font-semibold text-[#002531]"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleRenameSession(session._id, e);
                                    if (e.key === "Escape") setEditingSessionId(null);
                                  }}
                                />
                                <button
                                  onClick={(e) => handleRenameSession(session._id, e)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                >
                                  <span className="material-symbols-outlined text-sm">check</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSessionId(null);
                                  }}
                                  className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                >
                                  <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                              </div>
                            ) : (
                              <>
                                <h4
                                  className={`text-xs font-bold truncate flex-1 ${
                                    isActive ? "text-[#4648d4]" : "text-[#131b2e]"
                                  }`}
                                >
                                  {session.title || "Counseling Session"}
                                </h4>

                                {/* Action Buttons (Rename / Delete) */}
                                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingSessionId(session._id);
                                      setEditingTitleText(session.title || "");
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                                    title="Rename"
                                  >
                                    <span className="material-symbols-outlined text-xs">edit</span>
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteSession(session._id, e)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                                    title="Delete session"
                                  >
                                    <span className="material-symbols-outlined text-xs">delete</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Preview snippet */}
                          {session.preview && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                              "{session.preview}"
                            </p>
                          )}

                          {/* Metadata row */}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-100">
                            <span className="capitalize">{session.counselorType || "Counselor"}</span>
                            <span>{formatRelativeTime(session.lastActivity || session.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Scrollable Messages Feed */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 pb-28">
          <ScrollableFeed>{renderContent}</ScrollableFeed>
        </div>

        {/* Floating Glassmorphic Input Bar */}
        <div className="absolute bottom-2 left-0 right-0 px-4 md:px-8 z-20">
          <div className="w-full bg-white/70 backdrop-blur-xl rounded-full p-2.5 flex items-center shadow-[0_8px_32px_rgba(31,38,135,0.12)] border border-white/80 gap-2">
            {/* Input field */}
            <input
              type="text"
              className="flex-grow bg-transparent border-none focus:ring-0 text-sm md:text-base px-4 text-[#131b2e] placeholder:text-[#464554]/50 outline-none"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              ref={inputElement}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  generateText();
                  if (inputElement.current) {
                    inputElement.current.focus();
                  }
                }
              }}
            />

            {/* Voice Search Button */}
            <motion.button
              animate={microphoneAnimationControls}
              onClick={startListening}
              className="w-10 h-10 flex items-center justify-center rounded-full text-[#002531] hover:bg-[#002531]/10 transition-colors active:scale-90"
              title="Voice Input"
            >
              <FontAwesomeIcon icon={faMicrophone} className="text-xl" />
            </motion.button>

            {/* Send Button */}
            <button
              className="bg-[#4648d4] hover:bg-[#3638c4] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all"
              onClick={() => {
                setInputText(transcript);
                resetTranscript();
                generateText();
              }}
              title="Send Message"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                send
              </span>
            </button>

            {/* End Session Button */}
            <button
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                totalMessages < 15
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#dc2c4f] hover:bg-[#b90538] text-white active:scale-95"
              }`}
              onClick={() => {
                if (totalMessages < 15) {
                  toast.warning("Minimum 15 messages required to end session");
                } else {
                  HandleReportGenerate();
                }
              }}
            >
              End Session
            </button>
          </div>

          {/* Disclaimer Text */}
          <div className="w-full text-center mt-2 pb-1 text-[11px] text-[#464554]/70 tracking-wide font-medium">
            AI Assistants can make mistakes. Always check relevant information.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
