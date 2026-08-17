import { useState, useRef, useEffect } from "react";
import axios from "axios";

const AiJobAssistant = ({ userSkills }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI Job Assistant. Tell me what kind of roles you are looking for, and I'll help you search or refine your keywords."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await axios.post("/api/v1/ai/chat", {
        messages: newMessages
      }, { 
        withCredentials: true,
        signal: controller.signal
      });

      if (response.data.success && response.data.data.response) {
        setMessages(prev => [...prev, { role: "assistant", content: response.data.data.response }]);
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled by user");
      } else {
        console.error("AI Chat Error:", error);
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now." }]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleEdit = (index, content) => {
    if (loading) return;
    setMessages(messages.slice(0, index));
    setInput(content);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#1a3b47] hover:bg-[#002531] text-[#acecdc] px-6 py-4 rounded-full shadow-lg transition-transform hover:scale-105 z-50 flex items-center justify-center gap-2 border border-[#acecdc]/30 group"
          title="AI Job Assistant"
        >
          <span className="material-symbols-outlined text-2xl group-hover:animate-pulse">smart_toy</span>
          <span className="font-extrabold text-sm tracking-wide hidden sm:block">Ask AI</span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] max-h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200/80 font-['Plus_Jakarta_Sans'] transition-all animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a3b47] to-[#002531] p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#acecdc]">smart_toy</span>
              <h3 className="font-extrabold text-sm tracking-wide">AI Job Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 flex flex-col gap-3 group/chat">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group/msg relative`}>
                {msg.role === "user" && (
                  <button 
                    onClick={() => handleEdit(idx, msg.content)}
                    className="mr-2 opacity-0 group-hover/msg:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 flex items-center justify-center disabled:opacity-0"
                    title="Edit message"
                    disabled={loading}
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                )}
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === "user" 
                      ? "bg-[#1a3b47] text-white rounded-br-sm" 
                      : "bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-sm"
                  }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-sm flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about roles, skills, or trends..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3b47]/20 transition-all text-gray-800"
              disabled={loading}
            />
            {loading ? (
              <button
                onClick={handleStop}
                className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center shrink-0 transition-colors"
                title="Stop generating"
              >
                <span className="material-symbols-outlined text-sm">stop</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full bg-[#acecdc] hover:bg-[#8ee4d0] text-[#002531] flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 disabled:hover:bg-[#acecdc]"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AiJobAssistant;
