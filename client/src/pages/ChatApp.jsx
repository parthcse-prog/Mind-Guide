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
import {
  speakWithNeuralTTS,
  stopNeuralTTS,
  transcribeAudioWithGateway,
  playPrecachedDemoAudio,
} from "../services/azureSpeechService";

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
    fullName: "Alex",
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
  const [isPreparingVoice, setIsPreparingVoice] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [chatLanguage, setChatLanguage] = useState("en"); // "en" | "hi"
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
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

  const startListening = async () => {
    if (!listening) {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      stopNeuralTTS();
      setIsSpeaking(false);
      resetTranscript();

      // Start MediaRecorder for MIET DGX STT (AI4Bharat IndicConformer for Hindi / Whisper for English)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        recorder.start(250);
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.warn("MediaRecorder mic access warning:", err);
      }

      // Also start live browser speech recognition in parallel
      if (browserSupportsSpeechRecognition) {
        SpeechRecognition.startListening({
          continuous: true,
          language: chatLanguage === "hi" ? "hi-IN" : "en-IN",
        });
      }
      setListening(true);
    } else {
      setListening(false);
      if (browserSupportsSpeechRecognition) {
        SpeechRecognition.stopListening();
      }

      // Handle recorded audio stream
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        const recorder = mediaRecorderRef.current;
        recorder.onstop = async () => {
          recorder.stream?.getTracks().forEach((t) => t.stop());
          const audioBlob = new Blob(audioChunksRef.current, {
            type: chatLanguage === "hi" ? "audio/wav" : "audio/webm",
          });

          // If browser speech didn't capture text or on Hindi voice, transcribe with MIET STT Gateway
          if (!transcript && audioBlob.size > 1000) {
            setIsTranscribing(true);
            try {
              const transcribedText = await transcribeAudioWithGateway({
                audioBlob,
                language: chatLanguage,
              });
              if (transcribedText) {
                setInputText(transcribedText);
              }
            } catch (err) {
              console.warn("MIET STT error:", err);
            } finally {
              setIsTranscribing(false);
            }
          }
        };
        recorder.stop();
      }
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
              const loadedData = detailRes.data.data;
              setCurrentSessionId(latestSession._id);
              setCurrentSessionTitle(loadedData.title || "Conversation");
              setMessages(loadedData.messages || []);
              if (loadedData.language) {
                setChatLanguage(loadedData.language);
              } else if (
                loadedData.messages &&
                loadedData.messages.some((m) => /[\u0900-\u097F]/.test(m.content))
              ) {
                setChatLanguage("hi");
              }
              return;
            }
          }
        }

        const initRes = await axios.post("/api/v1/chat/sessions", {
          counselorType: counselorKey,
          language: chatLanguage,
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
              language: chatLanguage,
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
        const loadedData = res.data.data;
        setCurrentSessionId(sessionId);
        setCurrentSessionTitle(loadedData.title || "Conversation");
        if (loadedData.counselorType) {
          const matchedAvatar = Object.keys(COUNSELOR_CONFIGS).find(
            (k) => k.toLowerCase() === loadedData.counselorType.toLowerCase()
          );
          if (matchedAvatar) {
            setSelectedAvatarId(matchedAvatar);
          }
        }
        setMessages(loadedData.messages || []);
        if (loadedData.language) {
          setChatLanguage(loadedData.language);
        } else if (
          loadedData.messages &&
          loadedData.messages.some((m) => /[\u0900-\u097F]/.test(m.content))
        ) {
          setChatLanguage("hi");
        } else {
          setChatLanguage("en");
        }
        setIsSidebarOpen(false);
      }
    } catch (err) {
      toast.error("Could not load session");
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = async (targetLang = chatLanguage) => {
    stopNeuralTTS();
    setIsSpeaking(false);
    setLoading(true);

    const counselorKey = selectedAvatarId || "saarthi";
    const userName = userInfo?.name || "Friend";
    const isMaya =
      counselorKey === "maya" ||
      counselorKey.toLowerCase().includes("maya") ||
      activeCounselor.gender === "female";
    const isHindi = targetLang === "hi";

    const initialGreeting = isHindi
      ? (isMaya
          ? `नमस्ते ${userName}! मैं आपकी सारथी साथी हूँ। मैं आपकी बात सुनने, आपके सवालों के जवाब देने और आपके मन की हर बात समझने के लिए यहाँ हूँ। आज मैं आपकी क्या मदद कर सकती हूँ?`
          : `नमस्ते ${userName}! मैं आपका सारथी साथी हूँ। मैं आपकी बात सुनने, आपके सवालों के जवाब देने और आपके मन की हर बात समझने के लिए यहाँ हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?`)
      : `Hello ${userName}! I'm your Saarthi companion. I'm here to listen, answer your questions, and explore whatever is on your mind. How can I help you today?`;

    // Immediately show localized welcome greeting in state
    setMessages([
      {
        role: "assistant",
        content: initialGreeting,
        timestamp: new Date().toISOString(),
      },
    ]);
    setCurrentSessionTitle(isHindi ? "नई बातचीत" : "New Conversation");

    try {
      const res = await axios.post("/api/v1/chat/sessions", {
        counselorType: counselorKey,
        language: targetLang,
      });
      if (res.data?.success && res.data.data) {
        const newSession = res.data.data;
        setCurrentSessionId(newSession._id);
        setCurrentSessionTitle(newSession.title);
        if (newSession.messages && newSession.messages.length > 0) {
          const visible = newSession.messages
            .filter((m) => m.role !== "system")
            .map((m) => {
              if (isHindi && m.role === "assistant" && m.content.includes("I'm your Saarthi companion")) {
                return { ...m, content: initialGreeting };
              }
              return m;
            });
          setMessages(visible);
        }
        setSessionList((prev) => [
          {
            _id: newSession._id,
            title: newSession.title,
            counselorType: newSession.counselorType,
            language: targetLang,
            lastActivity: newSession.lastActivity,
            createdAt: newSession.createdAt,
            messageCount: 0,
            preview: initialGreeting.substring(0, 85),
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

  const handleLanguageSwitch = async (newLang) => {
    // Switching or clicking EN / Hindi always starts a fresh chat in that language
    setChatLanguage(newLang);
    stopNeuralTTS();
    setIsSpeaking(false);
    await handleNewSession(newLang);
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
            handleNewSession(chatLanguage);
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
      const isHindi = chatLanguage === "hi";
      const isMaya = activeCounselor.id === "maya" || activeCounselor.name.toLowerCase().includes("maya");
      const isFemale = activeCounselor.gender === "female" || isMaya;

      // 1. Check for Pre-cached Career Guidance Demo Questions (Instant 0ms Audio & Text)
      const queryLower = query.toLowerCase();
      const isDemoQ1En =
        queryLower.includes("pcm with computer science") ||
        (queryLower.includes("torn between") && queryLower.includes("science")) ||
        (queryLower.includes("computers and coding") && queryLower.includes("entrepreneurship"));

      const isDemoQ2En =
        queryLower.includes("mandatory to prepare for jee") ||
        (queryLower.includes("jee") && queryLower.includes("coaching burnout")) ||
        queryLower.includes("learning practical software skills on my own");

      const isDemoQ1Hi =
        (queryLower.includes("10वीं") && (queryLower.includes("साइंस") || queryLower.includes("कॉमर्स"))) ||
        queryLower.includes("करियर को लेकर कुछ मार्गदर्शन");

      const isDemoQ2Hi =
        (queryLower.includes("जेईई") && queryLower.includes("कोचिंग")) ||
        queryLower.includes("बर्नआउट");

      let demoBotText = null;
      let demoAudioPath = null;

      if (isDemoQ1En) {
        demoBotText = `Congratulations on clearing your 10th boards! You are in a fantastic position because tech and business naturally amplify each other.

If you choose **Science (PCM with Computer Science)**:
- You maintain maximum technical flexibility.
- Direct eligibility for B.Tech Computer Science, Data Science, AI, and software engineering degrees.
- You can always pursue an MBA or launch tech ventures later—many top startup founders start with engineering!

If you choose **Commerce with Mathematics**:
- Directly immerses you in finance, economics, business analytics, and accountancy.
- You can still pursue coding, fintech, and product management, or degrees like BCA and B.Sc Computer Science.

**Actionable Advice**:
If you enjoy building technical products from scratch, lean towards Science. If your passion is market dynamics, business models, and financial strategies, Commerce with Mathematics is an extraordinary launchpad.`;
        demoAudioPath = isFemale
          ? "/audio/demo_en_q1_female.mp3"
          : "/audio/demo_en_q1_male.mp3";
      } else if (isDemoQ2En) {
        demoBotText = `**Absolutely not!** JEE coaching is not mandatory, and your mental well-being must always come first.

Here is the practical reality:
1. **Diverse Pathways**: A huge number of successful software engineers and startup founders never wrote JEE. Many top institutes offer admission through CUET, state-level entrance exams, or university-specific tests.
2. **Practical Skills Triumph**: In modern tech, your GitHub repositories, real-world projects, problem-solving skills, and open-source contributions matter far more than an entrance coaching rank.
3. **Prevent Burnout**: Balancing school academics with self-paced learning (Python, web development, algorithm practice) builds genuine passion without exhausting you.

Focus on your school board foundations and spend weekends building practical projects. You will thrive with confidence and balance.`;
        demoAudioPath = isFemale
          ? "/audio/demo_en_q2_female.mp3"
          : "/audio/demo_en_q2_male.mp3";
      } else if (isDemoQ1Hi) {
        demoBotText = `**10वीं बोर्ड पास करने पर आपको बहुत-बहुत बधाई!**

यह बहुत अच्छी बात है कि आपकी रुचि टेक्नोलॉजी और बिज़नेस दोनों में है। आइए दोनों विकल्पों को समझें:

1. **साइंस (PCM + कंप्यूटर साइंस)**:
   - यह आपको तकनीकी क्षेत्र में सबसे अधिक विकल्प देता है।
   - आप बी.टेक कंप्यूटर साइंस, डेटा साइंस या बीसीए कर सकते हैं।
   - भविष्य में आप एमबीए करके या स्टार्टअप शुरू करके बिज़नेस में भी आ सकते हैं।

2. **कॉमर्स (मैथ्स के साथ)**:
   - आपको फाइनेंस, इकोनॉमिक्स और बिज़नेस की गहरी समझ शुरुआत से मिलेगी।
   - आप कोडिंग और सॉफ्टवेयर स्किल्स ऑनलाइन साथ-साथ सीख सकते हैं और फिनटेक के क्षेत्र में आगे बढ़ सकते हैं।

**मार्गदर्शन**: यदि आपका प्राथमिक लक्ष्य कोर सॉफ्टवेयर और तकनीक बनाना है, तो साइंस चुनें। यदि आपकी रुचि मार्केट, फाइनेंस और व्यापार रणनीति में अधिक है, तो मैथ्स के साथ कॉमर्स बेहतरीन विकल्प है।`;
        demoAudioPath = isFemale
          ? "/audio/demo_hi_q1_female.mp3"
          : "/audio/demo_hi_q1_male.mp3";
      } else if (isDemoQ2Hi) {
        demoBotText = `**बिल्कुल भी नहीं!** जेईई कोचिंग लेना कोई अनिवार्य शर्त नहीं है, और आपकी मानसिक शांति और स्वास्थ्य सबसे महत्वपूर्ण हैं।

ज़मीनी हकीकत यह है:
1. **कई अन्य रास्ते**: सॉफ्टवेयर इंडस्ट्री में सफल होने के लिए सिर्फ आईआईटी ही एकमात्र रास्ता नहीं है। कई बेहतरीन यूनिवर्सिटीज़ CUET, राज्य स्तरीय परीक्षाओं और मेरिट के आधार पर एडमिशन देती हैं।
2. **प्रैक्टिकल कोडिंग महत्वपूर्ण है**: कंपनियों में आपकी वास्तविक कोडिंग स्किल्स, प्रोजेक्ट्स और प्रॉब्लम-सॉल्विंग क्षमता देखी जाती है, न कि किसी कोचिंग का रैंक।
3. **बर्नआउट से बचें**: स्कूल की पढ़ाई पर ध्यान दें और अपने खाली समय में खुद से कोडिंग सीखें। इससे आपकी सीखने की जिज्ञासा बनी रहेगी।

आप बिना अत्यधिक तनाव लिए स्कूल और प्रैक्टिकल स्किल्स दोनों में बहुत अच्छा प्रदर्शन कर सकते हैं!`;
        demoAudioPath = isFemale
          ? "/audio/demo_hi_q2_female.mp3"
          : "/audio/demo_hi_q2_male.mp3";
      }

      if (demoBotText && demoAudioPath) {
        const botMessage = {
          role: "assistant",
          content: demoBotText,
          timestamp: new Date().toISOString(),
        };

        setLoading(false);
        setIsPreparingVoice(false);
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
              }
            })
            .catch((err) => console.warn("Save demo session error:", err.message));
        }

        if (isTtsEnabled) {
          playPrecachedDemoAudio({
            audioSrc: demoAudioPath,
            spokenText: demoBotText,
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
          });
        }
        return;
      }

      // 2. Dynamic Conversation: Call MIET AI Services LLM & Synthesize with Edge-TTS
      let langRule = "";
      if (isHindi) {
        if (isFemale) {
          langRule = `\nLanguage & Grammar (MANDATORY FOR MAYA LIN):
- Respond in natural, warm Hindi (हिन्दी) using Devanagari script.
- CRITICAL FEMININE GRAMMAR: You are Maya Lin, a female guide. You MUST strictly use female grammatical gender (स्त्रीलिंग) for yourself at all times.
- Use feminine verb inflections for yourself: "मैं समझती हूँ" (NEVER "समझता हूँ"), "मैं कर सकती हूँ" (NEVER "सकता हूँ"), "मैं आपकी मदद करूंगी" (NEVER "करूंगा"), "मैं आपके साथ साझा करूंगी", "लूंगी" (NEVER "लूंगा"), "बताऊंगी" (NEVER "बताऊंगा").
- NEVER use masculine self-references like "समझता हूँ", "लूंगा", "करूंगा", "सकता हूँ".`;
        } else {
          langRule = `\nLanguage & Grammar:
- Respond naturally and fluently in Hindi (हिन्दी) using Devanagari script.
- You are a male mentor (${activeCounselor.name}). Use natural masculine Hindi grammar (पुल्लिंग) for yourself (e.g. "मैं समझता हूँ", "मैं सलाह दूंगा", "कर सकता हूँ").`;
        }
      } else {
        langRule = `\nLanguage: English`;
      }

      let academicContextStr = "";
      if (userInfo?.academicRecords) {
        const ar = userInfo.academicRecords;
        const items = [];
        if (ar.tenth) {
          const tSub = (ar.tenth.subjects || []).map((s) => `${s.name}: ${s.marks}${s.grade ? ` (${s.grade})` : ""}`).join(", ");
          items.push(`Class 10 (Secondary School - JKBOSE): ${ar.tenth.percentage || "67.2%"} [School: ${ar.tenth.school || "Alexander Memorial School, Jammu"}, Roll: ${ar.tenth.rollNo || "160182011"}] | Subjects: ${tSub || "N/A"}`);
        }
        if (ar.twelfth) {
          const twSub = (ar.twelfth.subjects || []).map((s) => `${s.name}: ${s.marks}${s.grade ? ` (${s.grade})` : ""}`).join(", ");
          items.push(`Class 12 (Higher Secondary - JKBOSE): ${ar.twelfth.percentage || "61.0%"}, Stream: ${ar.twelfth.stream || "COMMERCE"} [School: ${ar.twelfth.school || "Govt Girls Hr Sec School Mubarak Mandi, Jammu"}, Roll: ${ar.twelfth.rollNo || "360007073"}] | Division: ${ar.twelfth.division || "First Division"} | Subjects: ${twSub || "N/A"}`);
        }
        if (ar.aadhaar) {
          items.push(`Aadhaar KYC: Verified Identity (Mehak, Bahu Fort, Jammu, DOB: ${ar.aadhaar.dob || "01/08/2004"})`);
        }
        if (items.length > 0) {
          const guidanceInstruction = `\nSTUDENT STATUS: RECENT 12TH PASS-OUT (COMMERCE STREAM).
CRITICAL GUIDELINE FOR CAREER COUNSELOR & AVATAR AGENTS:
The student, Mehak, has just completed Class 12th in the COMMERCE stream under JKBOSE (Roll: 360007073, First Division 61.0%, top marks in Typewriting/Shorthand 79/100, English 72/100, Accountancy 63/100; Class 10th 67.2% GPA 7.00).
She is seeking comprehensive, realistic, and inspiring career counseling and post-12th guidance.
Tailor ALL guidance, roadmaps, college admissions advice, and career answers specifically to someone who has just passed 12th Commerce:
1. Professional Credentials after 12th: CA Foundation (ICAI), Company Secretary Executive Entrance Test (CSEET - ICSI), CMA Foundation (ICMAI), and CFA Foundation roadmap.
2. Higher Education & Degree Programs: B.Com (Honours), B.Com, BBA, BMS, BA Economics, and Integrated 5-Year Law (BA LLB / BBA LLB).
3. Competitive Entrance Examinations: CUET UG (Central Universities admissions), IPMAT (IIM 5-Year Integrated Program in Management), CLAT (National Law Universities), Christ/NMIMS entrance exams.
4. Banking, Finance & Government Trajectories: Preparation roadmap towards Banking roles (IBPS/SBI PO), SSC CHSL (10+2 level government examinations), and foundation for Civil Services (UPSC CSE / JKPSC).
5. Immediate High-ROI Skills to Learn after 12th: Financial modeling in Excel, Tally Prime accounting, GST filing basics, Business Communication, and Personal Finance & Stock Markets.
DO NOT assume she is pursuing engineering, coding, or already attending college. Keep answers supportive, encouraging, practical, and highly personalized to her authentic marks.`;

          academicContextStr = `\n\nVerified Student KYC & Academic Transcript (From JKBOSE Marksheets & UIDAI Aadhaar):\n${items.join("\n")}${guidanceInstruction}`;
        }
      }

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
- Format cleanly with markdown.${langRule}${academicContextStr}`,
      };

      const messagesWithSystem = [systemInstruction, ...updatedMessages];
      const botResponseText = await callGatewayLLMDirect(messagesWithSystem);

      const botMessage = {
        role: "assistant",
        content: botResponseText,
        timestamp: new Date().toISOString(),
      };

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

      // Synchronize text appearance with voice start
      let revealed = false;
      const revealBotMessage = () => {
        if (!revealed) {
          revealed = true;
          setLoading(false);
          setIsPreparingVoice(false);
          setMessages([...updatedMessages, botMessage]);
        }
      };

      if (isTtsEnabled) {
        setIsPreparingVoice(true);
        try {
          await speakWithNeuralTTS({
            text: botResponseText,
            gender: activeCounselor.gender,
            counselorName: activeCounselor.name,
            language: chatLanguage,
            onStart: () => {
              revealBotMessage(); // Reveal text the exact millisecond voice starts speaking
              setIsSpeaking(true);
            },
            onEnd: () => {
              revealBotMessage();
              setIsSpeaking(false);
            },
            onError: () => {
              revealBotMessage();
              setIsSpeaking(false);
            },
          });
        } catch (error) {
          console.error("Speech error:", error);
          revealBotMessage();
          setIsSpeaking(false);
        }
      } else {
        revealBotMessage();
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
          content: `I am ${userInfo?.name || "User"}. Provide a concise summary of our conversation with key insights, action steps, and encouragement. Format cleanly with markdown.${
            userInfo?.academicRecords?.college?.degree
              ? ` Note: Student is studying ${userInfo.academicRecords.college.degree} (CGPA: ${userInfo.academicRecords.college.currentCgpa || "N/A"}).`
              : ""
          }`,
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
    const isMaya =
      activeCounselor.id === "maya" ||
      activeCounselor.name?.toLowerCase().includes("maya") ||
      activeCounselor.gender === "female";
    const userName = userInfo?.name || "Friend";
    const localizedHindiGreeting = isMaya
      ? `नमस्ते ${userName}! मैं आपकी सारथी साथी हूँ। मैं आपकी बात सुनने, आपके सवालों के जवाब देने और आपके मन की हर बात समझने के लिए यहाँ हूँ। आज मैं आपकी क्या मदद कर सकती हूँ?`
      : `नमस्ते ${userName}! मैं आपका सारथी साथी हूँ। मैं आपकी बात सुनने, आपके सवालों के जवाब देने और आपके मन की हर बात समझने के लिए यहाँ हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?`;

    const content = messages.map((message, index) => {
      const isUserMessage = message.role === "user";
      let displayContent = message.content;
      if (
        !isUserMessage &&
        chatLanguage === "hi" &&
        (displayContent.includes("I'm your Saarthi companion") ||
          (displayContent.includes("Hello ") && displayContent.includes("Saarthi companion")))
      ) {
        displayContent = localizedHindiGreeting;
      }

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
                <ReactMarkdown>{displayContent}</ReactMarkdown>
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

    if (loading || isPreparingVoice) {
      const isMaya =
        activeCounselor.id === "maya" ||
        activeCounselor.name?.toLowerCase().includes("maya") ||
        activeCounselor.gender === "female";
      const thinkingLabel =
        chatLanguage === "hi"
          ? `${activeCounselor.name} सोच ${isMaya ? "रही" : "रहे"} हैं...`
          : `${activeCounselor.name} is thinking...`;

      content.push(
        <div key="loading-indicator" className="w-full flex justify-start my-3">
          <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-xs text-xs text-slate-600">
            <span>{thinkingLabel}</span>
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
  }, [messages, loading, isPreparingVoice]);

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
      <div className="min-h-[calc(100vh-64px)] bg-[#08181e] relative overflow-hidden flex items-center justify-center px-4 py-12 font-['Manrope'] text-white">
        {/* Luminous Ambient Glow Spheres (Creates genuine glass refraction) */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[460px] h-[460px] bg-sky-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-5xl w-full space-y-8 relative z-10">
          {/* Header Title with Glass Accent */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-teal-300 font-semibold shadow-xs mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>Saarthi Companion Selection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Choose an Avatar
            </h1>
            <p className="text-sm text-teal-100/70 max-w-md mx-auto">
              Select an avatar to start your conversation.
            </p>
          </div>

          {/* Glassmorphism Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {AVAILABLE_AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => handleSelectAvatar(av.id)}
                className="flex flex-col items-center rounded-3xl bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-2xl border border-white/20 hover:border-teal-400/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-[0_16px_40px_0_rgba(13,148,136,0.3)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer group text-center"
              >
                {/* 3D Avatar Viewport inside Glass */}
                <div className="w-full h-64 bg-gradient-to-b from-[#122b35]/40 to-[#0c242c]/60 relative flex items-center justify-center pointer-events-none">
                  <AssistantAvatar
                    size="w-full h-full"
                    counselorType={av.id}
                    loading={false}
                    isSpeaking={false}
                    hideStatusPill={true}
                  />
                </div>

                {/* Frosted Glass Footer Banner */}
                <div className="py-4 px-3 w-full bg-black/30 group-hover:bg-teal-950/40 backdrop-blur-md transition-colors border-t border-white/15">
                  <span className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors block truncate tracking-wide">
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
          messages={messages}
          language={chatLanguage}
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
                  : loading || isPreparingVoice
                  ? "bg-amber-500/20 text-amber-300 animate-pulse"
                  : "bg-white/10 text-white/60"
              }`}
            >
              {isSpeaking
                ? (chatLanguage === "hi" ? "बोल रहे हैं..." : "Speaking")
                : loading || isPreparingVoice
                ? (chatLanguage === "hi" ? "सोच रहे हैं..." : "Thinking...")
                : "Ready"}
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
            {/* Language Switcher Pill: EN | हिन्दी */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => handleLanguageSwitch("en")}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  chatLanguage === "en"
                    ? "bg-[#1a3b47] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageSwitch("hi")}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  chatLanguage === "hi"
                    ? "bg-[#1a3b47] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="हिन्दी में बदलें (Switch to Hindi)"
              >
                हिन्दी
              </button>
            </div>

            <button
              onClick={() => handleNewSession(chatLanguage)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-[#1a3b47] hover:bg-[#224d5d] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
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
                    onClick={() => handleNewSession(chatLanguage)}
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
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2.5 flex items-end border border-slate-200/90 shadow-md gap-2 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 transition-all">
            <textarea
              rows={1}
              className="flex-grow bg-transparent border-none text-sm px-3 py-1.5 text-slate-900 placeholder:text-slate-400 outline-none resize-none max-h-32 min-h-[38px] leading-relaxed custom-scrollbar"
              placeholder={
                chatLanguage === "hi"
                  ? `${activeCounselor.name} से कुछ भी पूछें... (Shift+Enter for newline)`
                  : `Ask ${activeCounselor.name} anything... (Shift+Enter for newline)`
              }
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
              }}
              ref={inputElement}
              disabled={loading || isTranscribing}
              aria-label={`Ask ${activeCounselor.name} a question`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            {/* Voice Input */}
            <motion.button
              animate={microphoneAnimationControls}
              onClick={startListening}
              disabled={loading || isTranscribing}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors shrink-0 mb-0.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500 ${
                listening
                  ? "bg-rose-50 text-rose-600 animate-pulse"
                  : isTranscribing
                  ? "bg-amber-50 text-amber-600"
                  : "text-slate-600 hover:text-teal-700 hover:bg-teal-50"
              }`}
              title={
                isTranscribing
                  ? "Transcribing with MIET DGX..."
                  : listening
                  ? "Listening (click to stop)..."
                  : `Voice Input (${chatLanguage === "hi" ? "हिन्दी" : "English"})`
              }
              aria-label="Start voice input"
            >
              <FontAwesomeIcon icon={faMicrophone} className="text-sm" />
            </motion.button>

            {/* Send */}
            <button
              className="bg-[#0c242c] hover:bg-[#122b35] text-white w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 mb-0.5 focus-visible:ring-2 focus-visible:ring-teal-500"
              onClick={() => {
                if (transcript) {
                  handleSendMessage(transcript);
                  resetTranscript();
                } else {
                  handleSendMessage();
                }
              }}
              title="Send message"
              aria-label="Send message"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
            </button>

            {totalMessages >= 3 && (
              <button
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors shrink-0 mb-0.5 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-500 cursor-pointer"
                onClick={HandleReportGenerate}
                title="Generate Session Summary Report"
                aria-label="Generate Session Summary Report"
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
