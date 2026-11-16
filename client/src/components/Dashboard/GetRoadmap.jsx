import { useState, useEffect } from "react";
import axios from "axios";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../../redux/mindGuideSlice";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Mermaid from "react-mermaid2";

const GetRoadmap = () => {
  const [roadmapData, setRoadmapData] = useState([]);
  const [showRecommendationsIndex, setShowRecommendationsIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("graph"); // "graph" or "list"
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    // Smooth wheel zoom
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoomScale((prev) => Math.min(Math.max(prev + delta, 0.6), 2.5));
  };

  const handleResetZoomPan = () => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const [syncingSkills, setSyncingSkills] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const completedTasksCount = roadmapData.filter((item) => item.isCompleted).length;
  const totalTasksCount = roadmapData.length;
  const progress = totalTasksCount === 0 ? 0 : Math.round((completedTasksCount / totalTasksCount) * 100);

  const handleExtractSkill = async () => {
    try {
      setSyncingSkills(true);
      await axios.get("/api/v1/user/getSkills");
      const { data } = await axios.get("/api/v1/user/getUserProfile");
      dispatch(addUser(data));
      setSyncSuccess(true);
      toast.success("Skills & Verified Badges synchronized to your Profile!");
    } catch (err) {
      console.error("Error syncing skills:", err);
      toast.error(err.response?.data?.error || "Failed to sync skills from roadmap. Please try again.");
    } finally {
      setSyncingSkills(false);
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

  // Generate Mermaid Graph string dynamically based on student roadmap items
  const generateMermaidGraph = () => {
    if (!roadmapData || roadmapData.length === 0) return "";
    let code = "graph TD;\n";

    // Class Definitions for high-legibility styling
    code += `  classDef rootStyle fill:#002531,stroke:#002531,color:#ffffff,font-weight:bold,font-size:18px;\n`;
    code += `  classDef completedStyle fill:#d1fae5,stroke:#10b981,color:#065f46,font-weight:bold,font-size:16px;\n`;
    code += `  classDef pendingStyle fill:#e6f4f1,stroke:#0d9488,color:#002531,font-weight:bold,font-size:16px;\n`;
    code += `  classDef resourceStyle fill:#f8fafc,stroke:#94a3b8,color:#334155,font-size:14px;\n`;

    // Main root node
    code += `  START["${user?.name || "Student"} Counselor Roadmap"]:::rootStyle\n`;

    roadmapData.forEach((item, idx) => {
      const nodeId = `NODE_${idx}`;
      const statusIcon = item.isCompleted ? "✔ " : "";
      const label = `${statusIcon}${item.Goal.replace(/"/g, "'")}`;
      const styleClass = item.isCompleted ? "completedStyle" : "pendingStyle";

      if (idx === 0) {
        code += `  START --> ${nodeId}["${label}"]:::${styleClass}\n`;
      } else {
        const prevId = `NODE_${idx - 1}`;
        code += `  ${prevId} --> ${nodeId}["${label}"]:::${styleClass}\n`;
      }

      // Add recommendations sub-nodes if available
      if (item.recommendations && item.recommendations.length > 0) {
        item.recommendations.forEach((rec, rIdx) => {
          const recId = `REC_${idx}_${rIdx}`;
          const recLabel = rec.title.replace(/"/g, "'");
          code += `  ${nodeId} -. Resource .-> ${recId}["📚 ${recLabel}"]:::resourceStyle\n`;
        });
      }
    });

    return code;
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
      <div className="bg-gradient-to-r from-[#1a3b47] via-[#002531] to-[#142834] rounded-3xl p-6 md:p-8 text-white shadow-lg border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
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
            Interactive visual flow map derived from your counselor sessions and profile milestones.
          </p>
        </div>

        {/* View Mode Toggle: Interactive Graph vs List */}
        <div className="bg-white/10 p-1.5 rounded-2xl flex items-center border border-white/15 backdrop-blur-md self-stretch md:self-auto justify-center">
          <button
            onClick={() => setActiveTab("graph")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "graph"
                ? "bg-white text-[#002531] shadow-md"
                : "text-white/80 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm">account_tree</span>
            <span>Interactive Tree Graph</span>
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "list"
                ? "bg-white text-[#002531] shadow-md"
                : "text-white/80 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm">checklist</span>
            <span>Checklist & Goals</span>
          </button>
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

      {/* TAB CONTENT: Interactive Graph vs Checklist View */}
      {activeTab === "graph" ? (
        /* INTERACTIVE TREE VIEW WITH PAN & ZOOM */
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-col gap-4 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Interactive Canvas Controls:</span>
              <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                Scroll to Zoom • Drag to Pan
              </span>
            </div>
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={() => setZoomScale((prev) => Math.min(prev + 0.15, 2.5))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm transition-colors"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => setZoomScale((prev) => Math.max(prev - 0.15, 0.6))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm transition-colors"
                title="Zoom Out"
              >
                -
              </button>
              <button
                onClick={handleResetZoomPan}
                className="px-2.5 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors flex items-center gap-1"
                title="Reset View"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Draggable & Zoomable Viewport */}
          <div
            className={`w-full h-[520px] bg-slate-50/60 rounded-2xl overflow-hidden border border-dashed border-gray-300 relative flex items-center justify-center select-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <style>{`
              .mermaid-container svg .node rect,
              .mermaid-container svg .node polygon,
              .mermaid-container svg .node circle {
                rx: 10px !important;
                ry: 10px !important;
                stroke-width: 2px !important;
              }
              .mermaid-container svg .edgeLabel text {
                font-size: 13px !important;
                fill: #475569 !important;
              }
            `}</style>
            <div
              className="mermaid-container w-full flex justify-center origin-center transition-transform duration-75"
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomScale})`,
              }}
            >
              <Mermaid className="w-full min-w-[750px]" chart={generateMermaidGraph()} />
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="flex flex-col gap-4">
          {roadmapData.map((item, index) => (
            <div
              key={index}
              className={`bg-white rounded-3xl p-6 border transition-all shadow-sm flex flex-col gap-4 ${
                item.isCompleted ? "border-emerald-300 bg-emerald-50/30" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-2">
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
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#002531] transition-all flex items-center gap-1.5"
                >
                  <span>{showRecommendationsIndex === index ? "Hide Resources" : "View Resources"}</span>
                  {item.recommendations && item.recommendations.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px]">
                      {item.recommendations.length}
                    </span>
                  )}
                </button>
              </div>

              {item.timeline && <p className="text-xs text-gray-500 font-semibold">Timeline: {item.timeline}</p>}

              {showRecommendationsIndex === index && (
                <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
                  <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <span>Recommended Courses & Learning Resources:</span>
                  </h4>
                  {item.recommendations && item.recommendations.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {item.recommendations.map((rec, rIdx) => {
                        const isCoursera =
                          (rec.link || "").toLowerCase().includes("coursera") ||
                          (rec.title || "").toLowerCase().includes("coursera");
                        return (
                          <a
                            key={rIdx}
                            href={
                              rec.link ||
                              `https://www.coursera.org/search?query=${encodeURIComponent(
                                rec.title || item.Goal
                              )}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-slate-50 to-blue-50/40 border border-blue-200/60 rounded-xl text-xs font-bold text-[#002531] hover:text-blue-700 hover:border-blue-400 hover:shadow-sm transition-all"
                          >
                            <FaExternalLinkAlt className="text-[11px] text-blue-600" />
                            <span>{rec.title}</span>
                            {isCoursera && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">
                                Coursera
                              </span>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://www.coursera.org/search?query=${encodeURIComponent(item.Goal)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-800 hover:bg-blue-100 transition-all"
                      >
                        <FaExternalLinkAlt className="text-xs" />
                        <span>Find Courses on Coursera</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 rounded-3xl shadow-lg text-center flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-amber-300">military_tech</span>
            <h3 className="text-lg font-extrabold font-['Manrope']">Congratulations! You completed your roadmap!</h3>
          </div>
          <p className="text-xs text-emerald-100 max-w-md">
            Your learning milestones are complete. Sync your acquired competencies into verified badges on your Profile.
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center mt-1">
            <button
              onClick={handleExtractSkill}
              disabled={syncingSkills}
              className="bg-white hover:bg-emerald-50 text-emerald-900 px-6 py-2.5 rounded-xl text-xs font-extrabold shadow transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
            >
              {syncingSkills ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin"></span>
                  <span>Extracting Skills with AI...</span>
                </>
              ) : syncSuccess ? (
                <>
                  <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  <span>Synced Successfully!</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm text-emerald-700">sync</span>
                  <span>Sync Extracted Skills to Profile</span>
                </>
              )}
            </button>

            <Link
              to="/account/dashboard/profile"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm transition-all flex items-center gap-1.5"
            >
              <span>View Badges in Profile</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetRoadmap;
