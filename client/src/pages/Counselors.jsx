import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { stopNeuralTTS } from "../services/azureSpeechService";

const counselors = [
  {
    type: "Academic Counselor",
    description: "Navigate your educational path with expert support.",
    icon: "school",
    badgeBg: "bg-[#c6e8f7]",
    iconColor: "text-[#002531]",
  },
  {
    type: "Career Counselor",
    description: "Discover your professional potential and goals.",
    icon: "work",
    badgeBg: "bg-[#acecdc]",
    iconColor: "text-[#2d6d60]",
  },
  {
    type: "Personal Counselor",
    description: "Find clarity and growth in your personal life.",
    icon: "psychology",
    badgeBg: "bg-[#d8e3fa]",
    iconColor: "text-[#002531]",
  },
  {
    type: "Financial Counselor",
    description: "Practical guidance for managing your finances.",
    icon: "payments",
    badgeBg: "bg-[#dde4e1]",
    iconColor: "text-[#002531]",
  },
  {
    type: "Health and Wellness Counselor",
    description: "Holistic support for your physical and mental well-being.",
    icon: "self_improvement",
    badgeBg: "bg-[#afefdf]",
    iconColor: "text-[#2d6d60]",
  },
  {
    type: "Student Life Counselor",
    description: "Make the most of your student experience.",
    icon: "groups",
    badgeBg: "bg-[#e7eeff]",
    iconColor: "text-[#002531]",
  },
  {
    type: "Emotional Support Counselor",
    description: "Compassionate listening and emotional guidance.",
    icon: "favorite",
    badgeBg: "bg-[#aaccdb]",
    iconColor: "text-[#002531]",
  },
];

const Counselors = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    stopNeuralTTS();
  }, []);

  const handleCounselorClick = (counselor) => {
    setSelectedCounselor(counselor);
    setShowConfirmation(true);
  };

  const handleConfirmation = (confirmed) => {
    if (confirmed && selectedCounselor) {
      const link = `/counselors/chat/${selectedCounselor.type.toLowerCase()}`;
      navigate(link);
    }
    setShowConfirmation(false);
  };

  return (
    <div className="bg-[#f9f9ff] min-h-screen py-10 px-4 md:px-12 antialiased text-[#111c2c]">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#002531] font-medium mb-4 hover:opacity-75 transition-opacity"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back</span>
        </button>
        <h1 className="text-3xl md:text-4xl font-bold text-[#002531] mb-2 font-['Manrope']">
          Find your guide
        </h1>
        <p className="text-[#41484b] text-base md:text-lg font-['Plus_Jakarta_Sans']">
          Choose a designated counselor to start your journey.
        </p>
      </div>

      {/* Counselors Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {counselors.map((counselor, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-5 group cursor-pointer hover:-translate-y-1"
            onClick={() => handleCounselorClick(counselor)}
          >
            <div className="flex justify-between items-start">
              <div
                className={`w-14 h-14 ${counselor.badgeBg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-105`}
              >
                <span
                  className={`material-symbols-outlined ${counselor.iconColor} text-3xl`}
                >
                  {counselor.icon}
                </span>
              </div>
              <span className="material-symbols-outlined text-[#72787b] opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                chevron_right
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#002531] mb-2 font-['Manrope'] group-hover:text-[#28695c] transition-colors">
                {counselor.type}
              </h3>
              <p className="text-[#41484b] text-sm leading-relaxed font-['Plus_Jakarta_Sans']">
                {counselor.description}
              </p>
            </div>

            <button
              className="w-full py-3 bg-[#002531] hover:bg-[#1a3b47] text-white rounded-full font-semibold text-sm transition-all duration-200 shadow-sm active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                handleCounselorClick(counselor);
              }}
            >
              Choose Counselor
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-[#c6e8f7] rounded-xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#002531] text-2xl">
                {selectedCounselor?.icon || "forum"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#002531] mb-2 font-['Manrope']">
              Start Counseling Session?
            </h3>
            <p className="text-[#41484b] text-sm mb-6 leading-relaxed">
              You are about to start a session with{" "}
              <span className="font-semibold text-[#28695c]">
                {selectedCounselor?.type}
              </span>
              .
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                onClick={() => handleConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 bg-[#002531] hover:bg-[#1a3b47] text-white rounded-full font-semibold text-sm shadow transition-colors"
                onClick={() => handleConfirmation(true)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Counselors;
