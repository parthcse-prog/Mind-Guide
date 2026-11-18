import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { stopNeuralTTS } from "../services/azureSpeechService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpa,
  faHeart,
  faBrain,
  faBolt,
  faHandHoldingHeart,
  faRobot,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const counselors = [
  {
    type: "Maya Lin",
    counselorKey: "maya",
    title: "Mental Health & Emotional Well-Being",
    description: "Navigate stress, anxiety, emotional burnout, and find grounded inner calm.",
    icon: faSpa,
    badgeBg: "bg-teal-50",
    iconColor: "text-teal-700",
  },
  {
    type: "Ethan Rostova",
    counselorKey: "ethan",
    title: "Relationships, Love & Boundaries",
    description: "Confidential guidance for dating, breakups, friendships, and family dynamics.",
    icon: faHeart,
    badgeBg: "bg-rose-50",
    iconColor: "text-rose-700",
  },
  {
    type: "Dr. Alex (Saarthi)",
    counselorKey: "saarthi",
    title: "Chief Life & Youth Guide",
    description: "Your all-around mentor for life choices, self-doubt, identity, and direction.",
    icon: faBrain,
    badgeBg: "bg-sky-50",
    iconColor: "text-sky-800",
  },
  {
    type: "Marcus Cole",
    counselorKey: "marcus",
    title: "Confidence & Ambition Mentor",
    description: "Conquer imposter syndrome, build bold self-confidence, and unlock your true drive.",
    icon: faBolt,
    badgeBg: "bg-amber-50",
    iconColor: "text-amber-700",
  },
  {
    type: "Luna",
    counselorKey: "luna",
    title: "Empathy, Loneliness & Healing",
    description: "A deeply caring soul for feeling understood, self-worth, and emotional healing.",
    icon: faHandHoldingHeart,
    badgeBg: "bg-indigo-50",
    iconColor: "text-indigo-700",
  },
  {
    type: "Timy Robot",
    counselorKey: "timy",
    title: "Habit Design & Clear Thinking",
    description: "Practical breakdowns to stop overthinking, beat procrastination, and build daily flow.",
    icon: faRobot,
    badgeBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
];

const Counselors = () => {
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  const handleCounselorClick = (counselor) => {
    setSelectedCounselor(counselor);
    setShowConfirmation(true);
  };

  const handleConfirmation = (confirmed) => {
    if (confirmed && selectedCounselor) {
      stopNeuralTTS();
      // Store selected guide in localStorage
      localStorage.setItem("saarthi_counselor_persona", selectedCounselor.counselorKey);
      navigate("/chat");
    }
    setShowConfirmation(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 md:px-12 font-sans text-slate-800">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 font-medium mb-3 hover:text-slate-900 transition-colors cursor-pointer text-xs"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back</span>
        </button>
        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Choose Your Saarthi Companion
        </h1>
        <p className="text-slate-600 text-sm md:text-base">
          Specialized guidance for mental health, relationships, youth dilemmas, and finding clarity.
        </p>
      </div>

      {/* Counselors Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {counselors.map((counselor, index) => (
          <div
            key={index}
            onClick={() => handleCounselorClick(counselor)}
            className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
          >
            <div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${counselor.badgeBg} ${counselor.iconColor} mb-4 shadow-xs`}
              >
                <FontAwesomeIcon icon={counselor.icon} className="text-xl" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-0.5">
                {counselor.type}
              </h3>
              <p className="text-xs font-semibold text-teal-700 mb-2">
                {counselor.title}
              </p>
              <p className="text-slate-600 text-xs leading-relaxed">
                {counselor.description}
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-teal-800 font-semibold text-xs">
              <span>Start Conversation</span>
              <FontAwesomeIcon
                icon={faArrowRight}
                className="text-xs group-hover:translate-x-1 transition-transform"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedCounselor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedCounselor.badgeBg} ${selectedCounselor.iconColor} mb-3`}
            >
              <FontAwesomeIcon icon={selectedCounselor.icon} className="text-xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Connect with {selectedCounselor.type}
            </h3>
            <p className="text-xs font-semibold text-teal-700 mb-2">
              {selectedCounselor.title}
            </p>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              {selectedCounselor.description}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => handleConfirmation(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmation(true)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-teal-800 hover:bg-teal-900 text-white shadow-xs transition-colors cursor-pointer"
              >
                Begin Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Counselors;