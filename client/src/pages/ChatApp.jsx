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
import { motion, useAnimation } from "framer-motion";
import AssistantAvatar, { COUNSELOR_CONFIGS } from "../components/AssistantAvatar";
import ScrollableFeed from "react-scrollable-feed";
import ReportModal from "../components/ReportModal";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { callGatewayLLMDirect } from "../services/llmService";
import { speakWithNeuralTTS, stopNeuralTTS } from "../services/azureSpeechService";

const sanitizeTextForSpeech = (text) => {
  if (!text) return "";
  return text
    // Strip Emojis, Symbols, and Pictographs
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}]/gu, "")
    // Strip Markdown symbols (*, #, `, _, ~, >, |, bullet points)
    .replace(/[\*\#\`\_\~\>\|\-\+\=\[\]\(\)]+/g, " ")
    // Strip URLs
    .replace(/https?:\/\/\S+/gi, "")
    // Normalize spaces
    .replace(/\s+/g, " ")
    .trim();
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
    const checkSpeaking = setInterval(() => {
      if (window.speechSynthesis) {
        setIsSpeaking(window.speechSynthesis.speaking);
      }
    }, 200);
    return () => clearInterval(checkSpeaking);
  }, []);

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

  const generateText = async () => {
    if (inputText.trim() === "") {
      return;
    }
    try {
      const userMessage = {
        role: "user",
        content: inputText,
      };
      setInputText("");

      setLoading(true);
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }

      const updatedMessages = [...messages, userMessage];
      const botResponseText = await callGatewayLLMDirect(updatedMessages);
      setLoading(false);

      const botMessage = {
        role: "assistant",
        content: botResponseText,
      };

      setMessages([...updatedMessages, botMessage]);

      try {
        await speakWithNeuralTTS({
          text: botResponseText,
          gender: activeCounselor.gender,
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
    if (!type) return;
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/v1/chat/${type}`
        );
        if (response.status === 200 && Array.isArray(response.data)) {
          setMessages(response.data);
        } else {
          console.error("Error in fetching initial messages");
        }
      } catch (err) {
        console.warn("Server chat history fetch offline, starting fresh session:", err);
      }
    };
    fetchData();
    if (inputElement.current) {
      inputElement.current.focus();
    }
  }, [type, userInfo]);

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
                  : "bg-white/60 backdrop-blur-xl border border-white/50 text-[#131b2e] rounded-tl-none"
              }`}
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
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
      // Start the animation when listening
      microphoneAnimationControls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.5, repeat: Infinity },
        color: "#dc2c4f",
      });
    } else {
      // Stop the animation when not listening
      microphoneAnimationControls.start({
        color: "#002531",
      });
      microphoneAnimationControls.stop();
    }
  }, [listening, microphoneAnimationControls]);
  useEffect(() => {
    setTotalMessages(messages.length); // Update total messages when messages change
  }, [messages]);

  return (
    <div className="h-[88vh] bg-gradient-to-br from-[#e2e7ff] via-[#faf8ff] to-[#f0dbff] flex relative w-full font-['Plus_Jakarta_Sans'] overflow-hidden">
      {report && <ReportModal report={report} open={isReportModalOpen} />}

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

      {/* Right Partition: Chat Interface & Inputs */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header 3D Avatar Display */}
        <div className="flex md:hidden w-full h-40 bg-white/30 backdrop-blur-sm border-b border-white/40 flex-col items-center justify-center relative p-2">
          <div className="w-full h-28">
            <AssistantAvatar
              size="w-full h-full"
              loading={loading}
              isSpeaking={isSpeaking}
              counselorType={type}
            />
          </div>
          <div className="text-center bg-white/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/60 z-10">
            <span className="text-xs font-bold text-[#131b2e]">{activeCounselor.name} - {activeCounselor.title}</span>
          </div>
        </div>

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
