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
import AssistantAvatar from "../components/AssistantAvatar";
import ScrollableFeed from "react-scrollable-feed";
import ReportModal from "../components/ReportModal";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { callGatewayLLMDirect } from "../services/llmService";

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [renderContent, setRenderContent] = useState([]);
  const inputElement = useRef(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const { type } = useParams();
  const [report, setReport] = useState();
  const userInfo = useSelector((state) => state.mindGuide.userInfo);
  const { type: counsellorType } = useParams();
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const startListening = () => {
    if (!listening) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
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
  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  useEffect(() => {
    setInputText(transcript);
  }, [transcript]);
  useEffect(() => {
    inputElement.current.focus();
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
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
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
        const utterance = new SpeechSynthesisUtterance(botResponseText);
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Error in Speech Synthesis:", error);
      }
    } catch (err) {
      setLoading(false);
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
    console.log("userInfo ", userInfo);
    if (!userInfo) return;
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/v1/chat/${type}`
        );
        if (response.status === 200) {
          setMessages(response.data);
        } else {
          console.error("Error in fetching initial messages");
        }
      } catch (err) {
        console.error("Error in fetching initial messages", err);
      }
    };
    fetchData();
    inputElement.current.focus();
  }, [type, userInfo]);

  useEffect(() => {
    setRenderContent(
      messages.map((message, index) => {
        const isUserMessage = message.role === "user";
        const isNewMessage = index === messages.length - 1;

        return (
          <div
            key={index}
            className={`w-full flex ${
              message.role === "system" ? "hidden" : "block"
            } ${isUserMessage ? "justify-end" : "justify-start"} my-3`}
          >
            <div
              className={`flex items-start max-w-[85%] md:max-w-[70%] gap-3 ${
                isUserMessage ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {isNewMessage && !isUserMessage && <AssistantAvatar />}
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
      })
    );
  }, [messages]);

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
    <div className="h-[88vh] bg-gradient-to-br from-[#e2e7ff] via-[#faf8ff] to-[#f0dbff] flex flex-col relative w-full font-['Plus_Jakarta_Sans'] overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3 bg-white/80 p-6 rounded-2xl shadow-xl border border-white/60">
            <motion.div
              className="w-10 h-10 border-4 border-[#4648d4] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, ease: "linear", repeat: Infinity }}
            />
            <span className="text-xs font-semibold text-[#4648d4] uppercase tracking-wider">
              AI Thinking...
            </span>
          </div>
        </div>
      )}

      {report && <ReportModal report={report} open={isReportModalOpen} />}

      {/* Main Chat Canvas Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6 space-y-6 pb-28">
        <ScrollableFeed>{renderContent}</ScrollableFeed>
      </div>

      {/* Floating Glassmorphic Input Bar */}
      <div className="absolute bottom-4 left-0 right-0 px-4 md:px-12 z-20">
        <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-xl rounded-full p-2.5 flex items-center shadow-[0_8px_32px_rgba(31,38,135,0.12)] border border-white/80 gap-2">
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
                inputElement.current.focus();
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
      </div>
    </div>
  );
};

export default ChatApp;
