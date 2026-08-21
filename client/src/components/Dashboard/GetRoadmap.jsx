import { useState, useEffect } from "react";
import axios from "axios";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../../redux/mindGuideSlice";

const GetRoadmap = () => {
  const [roadmapData, setRoadmapData] = useState([]);
  const [showRecommendationsIndex, setShowRecommendationsIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const user = useSelector((state) => state.mindGuide.userInfo);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await axios.get("/api/v1/user/roadmap");
        setRoadmapData(response.data.roadmap || []);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  const completedTasksCount = roadmapData.filter((item) => item.isCompleted).length;
  const totalTasksCount = roadmapData.length;
  const progress = totalTasksCount === 0 ? 0 : Math.round((completedTasksCount / totalTasksCount) * 100);

  const handleExtractSkill = async () => {
    try {
      await axios.get("/api/v1/user/getSkills");
      const { data } = await axios.get("/api/v1/user/getUserProfile");
      dispatch(addUser(data));
    } catch (err) {
      console.log(err);
    }
  };

  const handleTaskClick = (index) => {
    const updatedRoadmapData = [...roadmapData];
    updatedRoadmapData[index].isCompleted = !updatedRoadmapData[index].isCompleted;
    setRoadmapData(updatedRoadmapData);
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      await axios.put("/api/v1/chat/roadmap", { roadmap: roadmapData });
      setUnsavedChanges(false);
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-['Plus_Jakarta_Sans']">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a3b47]"></div>
        <p className="mt-4 text-sm font-semibold text-gray-600">Loading your customized roadmap...</p>
      </div>
    );
  }

  if (roadmapData.length === 0) {
    return (
      <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 text-center font-['Plus_Jakarta_Sans']">
        <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-md max-w-lg flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-[#1a3b47]">map</span>
          <h2 className="text-2xl font-extrabold text-[#002531]">No Roadmap Generated Yet</h2>
          <p className="text-sm text-gray-600">
            Start a session with your Counselor in the Counselor section to receive a personalized step-by-step career and academic roadmap.
          </p>
          <a
            href="/counselors"
            className="bg-[#1a3b47] hover:bg-[#002531] text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95"
          >
            Start Counselor Session
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-['Plus_Jakarta_Sans'] max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1a3b47] via-[#002531] to-[#142834] rounded-3xl p-6 md:p-8 text-white shadow-lg border border-white/10 flex flex-col justify-between items-start gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#acecdc]/20 text-[#acecdc] rounded-full text-xs font-bold uppercase tracking-wider border border-[#acecdc]/30">
              Personalized Guidance
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-['Manrope'] text-white">
            Growth Roadmap
          </h1>
          <p className="text-sm text-[#85a5b3] max-w-xl">
            Interactive roadmap derived from your counselor sessions and profile milestones.
          </p>
        </div>
      </div>

      {/* Progress Bar Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm font-bold text-[#002531]">
          <span>Overall Progress</span>
          <span className="text-[#1a3b47]">{progress}% Completed</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* LIST VIEW */}
      <div className="flex flex-col gap-4">
        {roadmapData.map((item, index) => (
          <div
            key={index}
            className={`bg-white rounded-3xl p-6 border transition-all shadow-sm flex flex-col gap-4 ${
              item.isCompleted ? "border-emerald-300 bg-emerald-50/30" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => handleTaskClick(index)}
              >
                <input
                  type="checkbox"
                  checked={item.isCompleted || false}
                  onChange={() => {}}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
                <h3 className="text-base font-extrabold text-[#002531]">{item.Goal}</h3>
              </div>

              <button
                onClick={() =>
                  setShowRecommendationsIndex(showRecommendationsIndex === index ? null : index)
                }
                className="text-xs font-bold px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#002531] transition-all"
              >
                {showRecommendationsIndex === index ? "Hide Resources" : "View Resources"}
              </button>
            </div>

            {item.timeline && <p className="text-xs text-gray-500 font-semibold">Timeline: {item.timeline}</p>}

            {showRecommendationsIndex === index && (
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-gray-700">Recommended Resources & References:</h4>
                {item.recommendations && item.recommendations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {item.recommendations.map((rec, rIdx) => (
                      <a
                        key={rIdx}
                        href={rec.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-[#002531] hover:text-teal-700 hover:border-teal-200 transition-all shadow-sm"
                      >
                        <FaExternalLinkAlt className="text-xs" />
                        <span>{rec.title}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No direct links attached for this goal.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save Action Bar */}
      {unsavedChanges && (
        <div className="bg-white rounded-2xl p-4 border border-teal-200 shadow-lg flex justify-between items-center">
          <span className="text-xs font-bold text-gray-700">You have unsaved task completions.</span>
          <button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            Save Progress
          </button>
        </div>
      )}

      {progress === 100 && (
        <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-md text-center flex flex-col items-center gap-3">
          <h3 className="text-lg font-extrabold">🎉 Congratulations! You completed your roadmap!</h3>
          <button
            onClick={handleExtractSkill}
            className="bg-white text-emerald-800 px-6 py-2.5 rounded-xl text-xs font-bold shadow transition-all hover:bg-gray-100"
          >
            Sync Extracted Skills to Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default GetRoadmap;
