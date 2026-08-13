import { useState, useEffect } from "react";
import axios from "axios";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../../redux/mindGuideSlice";
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

  // Generate Mermaid Graph string dynamically based on student roadmap items
  const generateMermaidGraph = () => {
    if (!roadmapData || roadmapData.length === 0) return "";
    let code = "%%{init: { 'theme': 'base', 'themeVariables': { 'fontSize': '18px', 'fontFamily': 'Plus Jakarta Sans, sans-serif', 'primaryColor': '#e6f4f1', 'primaryTextColor': '#002531', 'primaryBorderColor': '#0d9488', 'lineColor': '#0d9488', 'secondaryColor': '#d1fae5', 'tertiaryColor': '#ffffff' } } }%%\n";
    code += "graph TD;\n";

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
            Counselor Growth Roadmap
          </h1>
          <p className="text-sm text-[#85a5b3] max-w-xl">
            Interactive visual flow map derived from your counselor sessions and profile milestones.
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="bg-white/10 p-1.5 rounded-2xl flex items-center gap-2 border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab("graph")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === "graph" ? "bg-[#acecdc] text-[#002531] shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">account_tree</span>
            <span>Visual Graph View</span>
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === "list" ? "bg-[#acecdc] text-[#002531] shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">format_list_bulleted</span>
            <span>Milestone List</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm font-bold text-[#002531]">
          <span>Overall Roadmap Progress</span>
          <span className="text-[#1a3b47]">{progress}% Completed</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* GRAPH VIEW */}
      {activeTab === "graph" ? (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-col gap-4 overflow-x-auto">
          <div className="flex items-center justify-between border-b pb-4 border-gray-100 flex-wrap gap-3">
            <h3 className="font-extrabold text-[#002531] text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600">hub</span>
              Visual Dependency Graph
            </h3>

            {/* Zoom Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setZoomScale((prev) => Math.max(prev - 0.2, 0.6))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm hover:bg-gray-50 text-gray-700 font-bold text-base transition-all"
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="text-xs font-bold px-2 text-[#002531]">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  onClick={() => setZoomScale((prev) => Math.min(prev + 0.2, 2.5))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm hover:bg-gray-50 text-gray-700 font-bold text-base transition-all"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={handleResetZoomPan}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white shadow-sm hover:bg-gray-50 text-teal-700 transition-all ml-1"
                  title="Reset Zoom & Pan"
                >
                  Reset
                </button>
              </div>
              <span className="text-xs text-gray-500 hidden md:inline">
                Click checkboxes below to mark progress
              </span>
            </div>
          </div>

          {/* Render Mermaid Visual Chart with Mouse Drag-to-Pan */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`w-full min-h-[480px] bg-slate-50/50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center overflow-hidden relative select-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {/* Helper pill */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-semibold text-gray-600 border border-gray-200/80 shadow-xs pointer-events-none z-10 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-teal-600">pan_tool</span>
              <span>Click & drag to pan • Use + / - to zoom</span>
            </div>

            <style>{`
              .mermaid-container svg {
                font-size: 16px !important;
                max-width: 100% !important;
                height: auto !important;
                min-width: 750px;
              }
              .mermaid-container svg text {
                font-size: 16px !important;
                font-weight: 700 !important;
                font-family: 'Plus Jakarta Sans', sans-serif !important;
              }
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

          {/* Interactive Node Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            {roadmapData.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleTaskClick(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  item.isCompleted
                    ? "bg-emerald-50/80 border-emerald-300 text-emerald-900"
                    : "bg-white border-gray-200 hover:border-teal-400 text-gray-800"
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.isCompleted || false}
                  onChange={() => {}}
                  className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                />
                <span className="text-xs font-bold">{item.Goal}</span>
              </div>
            ))}
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
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold border border-teal-200 flex items-center gap-2 transition-all"
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
