/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faPaperPlane,
  faVolumeHigh,
  faVolumeXmark,
  faClockRotateLeft,
  faPlus,
  faPen,
  faTrashCan,
  faCheck,
  faXmark,
  faFileLines,
  faBrain,
  faSpa,
  faHeart,
  faBolt,
  faWandMagicSparkles,
  faRobot,
  faCompass,
  faLightbulb,
  faRotate,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import AssistantAvatar, { COUNSELOR_CONFIGS } from "../components/AssistantAvatar";
import ScrollableFeed from "react-scrollable-feed";
import ReportModal from "../components/ReportModal";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { callGatewayLLMDirect } from "../services/llmService";
import { speakWithNeuralTTS, stopNeuralTTS } from "../services/azureSpeechService";

// Helper for relative timestamps
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

// Available avatars for the selector (FontAwesome icons, clean metadata)
const AVAILABLE_AVATARS = [
  {
    id: "saarthi",
    name: "Alex",
    fullName: "Dr. Alex (Saarthi)",
    role: "Chief Life & Youth Guide",
    description: "Your all-around mentor for life choices, self-doubt, identity, and direction.",
    icon: faBrain,
    badgeBg: "bg-sky-50",
    iconColor: "text-sky-800",
  },
  {
    id: "maya",
    name: "Maya",
    fullName: "Maya Lin",
    role: "Mental Health & Calm Guide",
    description: "Navigate stress, anxiety, emotional burnout, and find grounded inner calm.",
    icon: faSpa,
    badgeBg: "bg-teal-50",
    iconColor: "text-teal-700",
  },
  {
    id: "ethan",
    name: "Ethan",
    fullName: "Ethan Rostova",
    role: "Relationships & Youth Confidant",
    description: "Confidential guidance for dating, breakups, friendships, and family dynamics.",
    icon: faHeart,
    badgeBg: "bg-rose-50",
    iconColor: "text-rose-700",
  },
  {
    id: "marcus",
    name: "Marcus",
    fullName: "Marcus Cole",
    role: "Confidence & Ambition Mentor",
    description: "Conquer imposter syndrome, build bold self-confidence, and unlock your true drive.",
    icon: faBolt,
    badgeBg: "bg-amber-50",
    iconColor: "text-amber-700",
  },
];

// Starter prompt ideas for "Ask Me Anything"
const STARTER_PROMPTS = [
  {
    title: "Overcoming Anxiety",
    prompt: "I've been feeling anxious and overwhelmed lately. Can you help me unpack what I'm feeling and offer a calm, practical perspective?",
    icon: faSpa,
  },
  {
    title: "Relationship Boundaries",
    prompt: "I'm having a confusing situation in my relationship and don't know how to express healthy boundaries without guilt. What should I do?",
    icon: faHeart,
  },
  {
    title: "Feeling Stuck in Life",
    prompt: "I feel like everyone my age is ahead of me while I feel stuck and lost about my future. How do I stop comparing and build my own journey?",
    icon: faCompass,
  },
  {
    title: "Quiet the Inner Critic",
    prompt: "How can I build real self-confidence and quiet that persistent inner critic when facing new challenges?",
    icon: faLightbulb,
  },
];

const ChatApp = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const initialAvatar = (type || "saarthi").toLowerCase().trim();
  const [selectedAvatarId, setSelectedAvatarId] = useState(initialAvatar);
  const [hasChosenAvatar, setHasChosenAvatar] = useState(Boolean(type));

  const handleSelectAvatar = (avId) => {
    stopNeuralTTS();
    setIsSpeaking(false);
    setSelectedAvatarId(avId);
    setHasChosenAvatar(true);
  };

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [renderContent, setRenderContent] = useState([]);
  const inputElement = useRef(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [report, setReport] = useState();
  const userInfo = useSelector((state) => state.mindGuide?.userInfo);
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);

  // Session State
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [currentSessionTitle, setCurrentSessionTitle] = useState("New Conversation");
  const [sessionList, setSessionList] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitleText, setEditingTitleText] = useState("");

  const activeCounselor =
    COUNSELOR_CONFIGS[selectedAvatarId] ||
    COUNSELOR_CONFIGS["saarthi"] ||
    COUNSELOR_CONFIGS["academic counselor"];

  useEffect(() => {
    return () => {
      stopNeuralTTS();
      setIsSpeaking(false);
    };
  }, []);

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.info("Voice input is not supported in this browser.");
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

  // Load or create session
  useEffect(() => {
    const counselorKey = selectedAvatarId || "saarthi";

    const loadSessions = async () => {
      try {
        const res = await axios.get(
          `/api/v1/chat/sessions?counselorType=${encodeURIComponent(counselorKey)}`
        );
        if (res.data?.success && Array.isArray(res.data.data)) {
          const sessions = res.data.data;
          setSessionList(sessions);

          if (sessions.length > 0) {
            const latestSession = sessions[0];
            const detailRes = await axios.get(`/api/v1/chat/sessions/${latestSession._id}`);
            if (detailRes.data?.success && detailRes.data.data) {
              setCurrentSessionId(latestSession._id);
              setCurrentSessionTitle(detailRes.data.data.title || "Conversation");
              setMessages(detailRes.data.data.messages || []);
              return;
            }
          }
        }

        const initRes = await axios.post("/api/v1/chat/sessions", {
          counselorType: counselorKey,
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
              preview: "New conversation",
            },
          ]);
        }
      } catch (err) {
        console.warn("Could not load sessions:", err);
      }
    };

    loadSessions();
  }, [selectedAvatarId, userInfo]);

  const handleSelectSession = async (sessionId) => {
    if (sessionId === currentSessionId) return;
    stopNeuralTTS();
    setIsSpeaking(false);
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/chat/sessions/${sessionId}`);
      if (res.data?.success && res.data.data) {
        setCurrentSessionId(sessionId);
        setCurrentSessionTitle(res.data.data.title || "Conversation");
        setMessages(res.data.data.messages || []);
        setIsSidebarOpen(false);
      }
    } catch (err) {
      toast.error("Could not load session");
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = async () => {
    stopNeuralTTS();
    setIsSpeaking(false);
    setLoading(true);
    try {
      const res = await axios.post("/api/v1/chat/sessions", {
        counselorType: selectedAvatarId || "saarthi",
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
      }
    } catch (err) {
      toast.error("Could not create new session");
    } finally {
      setLoading(false);
    }
  };

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
          prev.map((s) =>
            s._id === sessionId ? { ...s, title: editingTitleText.trim() } : s
          )
        );
        if (currentSessionId === sessionId) {
          setCurrentSessionTitle(editingTitleText.trim());
        }
      }
    } catch (err) {
      toast.error("Could not rename session");
    } finally {
      setEditingSessionId(null);
      setEditingTitleText("");
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Delete this conversation?")) return;
    try {
      const res = await axios.delete(`/api/v1/chat/sessions/${sessionId}`);
      if (res.data?.success) {
        const remaining = sessionList.filter((s) => s._id !== sessionId);
        setSessionList(remaining);
        if (currentSessionId === sessionId) {
          if (remaining.length > 0) {
            handleSelectSession(remaining[0]._id);
          } else {
            handleNewSession();
          }
        }
      }
    } catch (err) {
      toast.error("Could not delete session");
    }
  };

  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    try {
      const userMessage = {
        role: "user",
        content: query,
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

      const userName = userInfo?.name || "Friend";
      const systemInstruction = {
        role: "system",
        content: `You are Saarthi.ai (सारथी - your trusted companion and personal guide), developed by MIET.
Active Companion Persona: ${activeCounselor.name} (${activeCounselor.title}).
You are speaking with ${userName}.

Your mission:
- Open "Ask Me Anything" on any question, curiosities, everyday situations, learning, and life decisions.
- Thoughtful advice, perspective, emotional clarity, and practical guidance.

Tone & Approach:
- Sincere warmth, deep empathy, non-judgmental validation.
- Direct, clear, insightful, actionable answers. Avoid robotic jargon.
- Format cleanly with markdown.`,
      };

      const messagesWithSystem = [systemInstruction, ...updatedMessages];
      const botResponseText = await callGatewayLLMDirect(messagesWithSystem);
      setLoading(false);

      const botMessage = {
        role: "assistant",
        content: botResponseText,
        timestamp: new Date().toISOString(),
      };

      setMessages([...updatedMessages, botMessage]);

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
              }
              setSessionList((prev) =>
                prev.map((s) =>
                  s._id === currentSessionId
                    ? {
                        ...s,
                        title: updatedTitle || s.title,
                        lastActivity: new Date().toISOString(),
                        preview: botResponseText.substring(0, 85),
                      }
                    : s
                )
              );
            }
          })
          .catch((err) => {
            console.warn("Could not auto-save message:", err.message);
          });
      }

      if (isTtsEnabled) {
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
          console.error("Speech error:", error);
          setIsSpeaking(false);
        }
      }
    } catch (err) {
      setLoading(false);
      setIsSpeaking(false);
      console.error("Chat generation error:", err);
      toast.error(err.message || "Failed to generate response");
    }
  };

  const HandleReportGenerate = async () => {
    try {
      setLoading(true);
      const gptReportPrompt = [
        ...messages,
        {
          role: "system",
          content: `I am ${userInfo?.name || "User"}. Provide a concise summary of our conversation with key insights, action steps, and encouragement. Format cleanly with markdown.`,
        },
      ];

      const reportContent = await callGatewayLLMDirect(gptReportPrompt);
      setLoading(false);
      setReport(reportContent);
      setReportModalOpen(true);
    } catch (err) {
      setLoading(false);
      toast.error("Could not generate summary");
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
            className={`flex items-start max-w-[90%] md:max-w-[80%] gap-3 ${
              isUserMessage ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`p-4 rounded-2xl text-sm leading-relaxed ${
                isUserMessage
                  ? "bg-[#1a3b47] text-white rounded-tr-none shadow-xs"
                  : "bg-white border border-slate-200 text-slate-900 rounded-tl-none shadow-xs"
              }`}
            >
              <div className="prose prose-sm max-w-none text-inherit prose-headings:text-inherit prose-a:text-teal-700">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
              {message.timestamp && (
                <div
                  className={`text-[10px] mt-1.5 ${
                    isUserMessage ? "text-teal-200/80 text-right" : "text-slate-400 text-left"
                  }`}
                >
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
          <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-xs text-xs text-slate-600">
            <span>Thinking</span>
            <div className="flex items-center gap-1">
              <motion.span
                className="w-1.5 h-1.5 bg-teal-600 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
              />
              <motion.span
                className="w-1.5 h-1.5 bg-teal-600 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
              />
              <motion.span
                className="w-1.5 h-1.5 bg-teal-600 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </div>
        </div>
      );
    }

    setRenderContent(content);
  }, [messages, loading]);

  useEffect(() => {
    if (listening) {
      microphoneAnimationControls.start({
        scale: [1, 1.15, 1],
        transition: { duration: 0.5, repeat: Infinity },
        color: "#0f766e",
      });
    } else {
      microphoneAnimationControls.start({
        color: "#334155",
      });
      microphoneAnimationControls.stop();
    }
  }, [listening, microphoneAnimationControls]);

  useEffect(() => {
    setTotalMessages(messages.length);
  }, [messages]);

  if (!hasChosenAvatar) {
    return (
      <div className="min-h-[88vh] bg-slate-50 flex items-center justify-center px-4 py-8 font-['Manrope'] text-slate-800">
        <div className="max-w-4xl w-full space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Choose an Avatar
            </h1>
            <p className="text-xs text-slate-500">
              Select an avatar to start your conversation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AVAILABLE_AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => handleSelectAvatar(av.id)}
                className="flex flex-col items-center bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-teal-600 transition-all overflow-hidden cursor-pointer group text-center"
              >
                {/* Literal 3D Avatar Viewport */}
                <div className="w-full h-64 bg-[#122b35] relative flex items-center justify-center pointer-events-none">
                  <AssistantAvatar
                    size="w-full h-full"
                    counselorType={av.id}
                    loading={false}
                    isSpeaking={false}
                    hideStatusPill={true}
                  />
                </div>

                {/* Name Only - No specifications */}
                <div className="py-3 px-2 w-full bg-white group-hover:bg-slate-50 transition-colors border-t border-slate-100">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors block truncate">
                    {av.fullName}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[88vh] bg-slate-50 flex relative w-full font-['Manrope'] overflow-hidden">
      {report && (
        <ReportModal
          report={report}
          open={isReportModalOpen}
          onClose={() => setReportModalOpen(false)}
        />
      )}

      {/* Left Stage: 3D Avatar & Clean Switcher */}
      <div className="hidden md:flex w-2/5 lg:w-[36%] h-full relative bg-[#122b35] text-white flex-col justify-between p-4 border-r border-slate-200/20">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between z-10 px-2 py-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              {activeCounselor.name}
            </span>
            <span className="text-[11px] text-teal-300">
              {activeCounselor.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopNeuralTTS();
                  setIsSpeaking(false);
                }
                setIsTtsEnabled(!isTtsEnabled);
              }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-xs ${
                isTtsEnabled
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-white/30"
              }`}
              title={isTtsEnabled ? "Mute voice" : "Enable voice"}
            >
              <FontAwesomeIcon icon={isTtsEnabled ? faVolumeHigh : faVolumeXmark} />
            </button>

            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                isSpeaking
                  ? "bg-emerald-500/20 text-emerald-300"
                  : loading
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-white/10 text-white/60"
              }`}
            >
              {isSpeaking ? "Speaking" : loading ? "Thinking" : "Ready"}
            </span>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="w-full flex-1 flex items-center justify-center relative my-1">
          <AssistantAvatar
            size="w-full h-full"
            loading={loading}
            isSpeaking={isSpeaking}
            counselorType={selectedAvatarId}
          />
        </div>

        {/* Switch Companion Button */}
        <div className="z-10 pt-1">
          <button
            type="button"
            onClick={() => {
              stopNeuralTTS();
              setIsSpeaking(false);
              setHasChosenAvatar(false);
            }}
            className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faRotate} className="text-xs text-teal-400" />
            <span>Switch Companion</span>
          </button>
        </div>
      </div>

      {/* Right Stage: Clean Chat Experience */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-50">
        {/* Top Session Toolbar */}
        <div className="w-full bg-white border-b border-slate-200 px-4 md:px-6 py-2.5 flex items-center justify-between shrink-0 z-10 gap-3">
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
              title="Chat history"
            >
              <FontAwesomeIcon icon={faClockRotateLeft} className="text-teal-700 text-xs" />
              <span>History</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

            <div className="flex items-center gap-2 truncate flex-1">
              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {currentSessionTitle}
              </span>
              <button
                onClick={() => {
                  setEditingSessionId(currentSessionId);
                  setEditingTitleText(currentSessionTitle);
                  setIsSidebarOpen(true);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs"
                title="Rename"
              >
                <FontAwesomeIcon icon={faPen} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleNewSession}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-[#1a3b47] hover:bg-[#224d5d] text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              title="New conversation"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* History Drawer */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="absolute inset-0 bg-slate-900 z-30"
              />

              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="absolute top-0 bottom-0 left-0 w-80 md:w-96 bg-white border-r border-slate-200 shadow-xl z-40 flex flex-col overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <FontAwesomeIcon icon={faClockRotateLeft} className="text-teal-700" />
                    <span>Conversations ({sessionList.length})</span>
                  </h3>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>

                <div className="p-3 border-b border-slate-100">
                  <button
                    onClick={handleNewSession}
                    className="w-full bg-[#1a3b47] hover:bg-[#224d5d] text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Start New Conversation</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                  {sessionList.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      No saved conversations yet.
                    </div>
                  ) : (
                    sessionList.map((session) => {
                      const isActive = session._id === currentSessionId;
                      const isEditing = editingSessionId === session._id;

                      return (
                        <div
                          key={session._id}
                          onClick={() => !isEditing && handleSelectSession(session._id)}
                          className={`group p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                            isActive
                              ? "bg-teal-50/70 border-teal-300 font-semibold"
                              : "bg-white hover:bg-slate-50 border-slate-200/80"
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
                                  className="w-full text-xs border border-teal-500 rounded-md p-1 outline-hidden"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleRenameSession(session._id, e);
                                    if (e.key === "Escape") setEditingSessionId(null);
                                  }}
                                />
                                <button
                                  onClick={(e) => handleRenameSession(session._id, e)}
                                  className="p-1 text-teal-700"
                                >
                                  <FontAwesomeIcon icon={faCheck} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSessionId(null);
                                  }}
                                  className="p-1 text-slate-400"
                                >
                                  <FontAwesomeIcon icon={faXmark} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <h4 className="truncate flex-1 text-slate-900">
                                  {session.title || "Conversation"}
                                </h4>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingSessionId(session._id);
                                      setEditingTitleText(session.title || "");
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-700"
                                  >
                                    <FontAwesomeIcon icon={faPen} />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteSession(session._id, e)}
                                    className="p-1 text-slate-400 hover:text-red-600"
                                  >
                                    <FontAwesomeIcon icon={faTrashCan} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                            <span>{session.counselorType || "Saarthi"}</span>
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

        {/* Scrollable Feed */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-3 pb-32">
          {messages.length === 0 ? (
            /* Hallmark Calm Hero */
            <div className="max-w-xl mx-auto py-12 text-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  How can I support you today?
                </h1>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  A confidential space for mental health, relationships, youth dilemmas, and finding clarity.
                </p>
              </div>

              {/* Starter Prompt Cards with FontAwesome */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                {STARTER_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-left transition-colors flex items-start gap-3 group shadow-2xs"
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-teal-700 text-sm mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {item.prompt}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ScrollableFeed>{renderContent}</ScrollableFeed>
          )}
        </div>

        {/* Bottom Input Bar */}
        <div className="absolute bottom-4 left-0 right-0 px-4 md:px-8 z-20">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2 flex items-center border border-slate-200 shadow-sm gap-2">
            <input
              type="text"
              className="flex-grow bg-transparent border-none text-sm px-3 text-slate-900 placeholder:text-slate-400 outline-hidden"
              placeholder={`Ask ${activeCounselor.name} anything...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              ref={inputElement}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            {/* Voice Input */}
            <motion.button
              animate={microphoneAnimationControls}
              onClick={startListening}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              title="Voice Input"
            >
              <FontAwesomeIcon icon={faMicrophone} className="text-sm" />
            </motion.button>

            {/* Send */}
            <button
              className="bg-[#1a3b47] hover:bg-[#224d5d] text-white w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              onClick={() => {
                if (transcript) {
                  handleSendMessage(transcript);
                  resetTranscript();
                } else {
                  handleSendMessage();
                }
              }}
              title="Send"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
            </button>

            {totalMessages >= 3 && (
              <button
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors shrink-0 flex items-center gap-1.5"
                onClick={HandleReportGenerate}
                title="Summary"
              >
                <FontAwesomeIcon icon={faFileLines} />
                <span>Summary</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
