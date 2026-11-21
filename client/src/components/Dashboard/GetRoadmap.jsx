import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../../redux/mindGuideSlice";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import mermaid from "mermaid";

// Error Boundary to prevent any unhandled render exceptions from white-screening the app
class RoadmapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Roadmap rendering error caught by ErrorBoundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-['Plus_Jakarta_Sans']">
          <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-md max-w-lg flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-4xl text-amber-500">warning</span>
            <h3 className="text-xl font-bold text-[#002531]">Roadmap Display Notice</h3>
            <p className="text-xs text-gray-600">
              We encountered a slight issue displaying the interactive canvas. You can reload or access the checklist view.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-[#1a3b47] hover:bg-[#002531] text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
            >
              Reload Roadmap
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Robust Mermaid SVG Viewer using dangerouslySetInnerHTML to prevent React 18 DOM reconciliation removeChild crashes
const SafeMermaidViewer = ({ chartCode, panPosition, zoomScale }) => {
  const [svgHtml, setSvgHtml] = useState("");
  const [renderError, setRenderError] = useState(false);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let active = true;
    if (!chartCode) {
      setSvgHtml("");
      setRendering(false);
      return;
    }

    const renderChart = async () => {
      try {
        setRendering(true);
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            fontFamily: "Plus Jakarta Sans, sans-serif",
            primaryColor: "#f0fdfa",
            primaryTextColor: "#002531",
            primaryBorderColor: "#0d9488",
            lineColor: "#64748b",
            secondaryColor: "#d1fae5",
            tertiaryColor: "#f8fafc",
          },
          securityLevel: "loose",
        });

        const id = `mermaid_svg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const { svg } = await mermaid.render(id, chartCode);
        if (active) {
          setSvgHtml(svg);
          setRenderError(false);
          setRendering(false);
        }
      } catch (err) {
        console.warn("Mermaid render error (falling back to visual pipeline):", err);
        if (active) {
          setRenderError(true);
          setRendering(false);
        }
      }
    };

    renderChart();
    return () => {
      active = false;
    };
  }, [chartCode]);

  if (renderError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-teal-600 mb-2">account_tree</span>
        <p className="text-sm font-bold text-gray-700">Displaying Visual Flow Nodes</p>
        <p className="text-xs text-gray-500 max-w-md mt-1">
          Switch to the Visual Flow or Checklist tab to interact directly with your milestones and resources.
        </p>
      </div>
    );
  }

  if (rendering && !svgHtml) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3b47]"></div>
      </div>
    );
  }

  return (
    <div
      className="mermaid-viewport w-full flex justify-center items-center transition-transform duration-75 select-none"
      style={{
        transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomScale})`,
      }}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
};

// Main GetRoadmap Component
const GetRoadmapContent = () => {
  const [roadmapData, setRoadmapData] = useState([]);
  const [showRecommendationsIndex, setShowRecommendationsIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("graph"); // "graph", "pipeline", "list"
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [syncingSkills, setSyncingSkills] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const user = useSelector((state) => state.mindGuide.userInfo);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await axios.get("/api/v1/user/roadmap");
        setRoadmapData(Array.isArray(response.data.roadmap) ? response.data.roadmap : []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load user roadmap:", err);
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
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoomScale((prev) => Math.min(Math.max(prev + delta, 0.5), 2.5));
  };

  const handleResetZoomPan = () => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const completedTasksCount = roadmapData.filter((item) => item?.isCompleted).length;
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
    updatedRoadmapData[index] = {
      ...updatedRoadmapData[index],
      isCompleted: !updatedRoadmapData[index]?.isCompleted,
    };
    setRoadmapData(updatedRoadmapData);
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      await axios.put("/api/v1/chat/roadmap", { roadmap: roadmapData });
      setUnsavedChanges(false);
      toast.success("Roadmap progress saved successfully!");
    } catch (err) {
      console.error("Error saving roadmap progress:", err);
      toast.error("Failed to save progress. Please try again.");
    }
  };

  // Helper to thoroughly sanitize strings for safe Mermaid diagram generation
  const sanitize = (text) => {
    if (!text) return "Milestone";
    return String(text)
      .replace(/["'`]/g, "") // remove quotes
      .replace(/[()[\]{}]/g, " ") // replace brackets/parentheses with spaces
      .replace(/[;:#&|<>\\]/g, " ") // remove syntax breaking characters
      .replace(/[\r\n]+/g, " ") // remove newlines
      .replace(/\s+/g, " ") // normalize whitespace
      .trim()
      .slice(0, 75); // max length
  };

  // Generate Mermaid Graph string dynamically based on student roadmap items
  const generateMermaidGraph = () => {
    if (!roadmapData || roadmapData.length === 0) return "";
    let code = "graph TD\n";

    // Class styles
    code += `  classDef rootStyle fill:#002531,stroke:#0d9488,stroke-width:2px,color:#ffffff,font-weight:bold;\n`;
    code += `  classDef doneStyle fill:#d1fae5,stroke:#10b981,stroke-width:2px,color:#065f46,font-weight:bold;\n`;
    code += `  classDef todoStyle fill:#f0fdfa,stroke:#0d9488,stroke-width:2px,color:#0f172a,font-weight:bold;\n`;
    code += `  classDef recStyle fill:#f8fafc,stroke:#94a3b8,stroke-width:1px,stroke-dasharray:3 3,color:#334155;\n`;

    const cleanName = sanitize(user?.name || "Student");
    code += `  START["${cleanName} Career Roadmap"]:::rootStyle\n`;

    roadmapData.forEach((item, idx) => {
      const nodeId = `N${idx}`;
      const isDone = Boolean(item?.isCompleted);
      const icon = isDone ? "Done: " : "";
      const goal = sanitize(item?.Goal || item?.goal || item?.title || `Milestone ${idx + 1}`);
      const timeline = sanitize(item?.timeline || "");
      const fullLabel = timeline ? `${icon}${goal} (${timeline})` : `${icon}${goal}`;
      const style = isDone ? "doneStyle" : "todoStyle";

      if (idx === 0) {
        code += `  START --> ${nodeId}["${fullLabel}"]:::${style}\n`;
      } else {
        const prevId = `N${idx - 1}`;
        code += `  ${prevId} --> ${nodeId}["${fullLabel}"]:::${style}\n`;
      }

      if (Array.isArray(item?.recommendations) && item.recommendations.length > 0) {
        item.recommendations.slice(0, 3).forEach((rec, rIdx) => {
          const recId = `R${idx}_${rIdx}`;
          const recTitle = sanitize(typeof rec === "string" ? rec : rec?.title || "Resource");
          code += `  ${nodeId} -.- ${recId}["Course: ${recTitle}"]:::recStyle\n`;
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

        {/* View Mode Toggle */}
        <div className="bg-white/10 p-1.5 rounded-2xl flex items-center border border-white/15 backdrop-blur-md self-stretch md:self-auto justify-center flex-wrap gap-1">
          <button
            onClick={() => setActiveTab("graph")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "graph"
                ? "bg-white text-[#002531] shadow-md"
                : "text-white/80 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm">account_tree</span>
            <span>Tree Graph</span>
          </button>
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "pipeline"
                ? "bg-white text-[#002531] shadow-md"
                : "text-white/80 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm">timeline</span>
            <span>Visual Flow</span>
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "list"
                ? "bg-white text-[#002531] shadow-md"
                : "text-white/80 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm">checklist</span>
            <span>Checklist</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm font-bold text-[#002531]">
          <span>Overall Progress</span>
          <span className="text-[#1a3b47]">{progress}% Completed ({completedTasksCount} / {totalTasksCount} Milestones)</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* TAB CONTENT: Interactive Graph */}
      {activeTab === "graph" && (
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
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => setZoomScale((prev) => Math.max(prev - 0.15, 0.5))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                title="Zoom Out"
              >
                -
              </button>
              <button
                onClick={handleResetZoomPan}
                className="px-2.5 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset View"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Draggable & Zoomable Viewport */}
          <div
            className={`w-full min-h-[500px] bg-slate-50/60 rounded-2xl overflow-hidden border border-dashed border-gray-300 relative flex items-center justify-center select-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <style>{`
              .mermaid-viewport svg {
                max-width: 100% !important;
                height: auto !important;
              }
              .mermaid-viewport svg .node rect,
              .mermaid-viewport svg .node polygon,
              .mermaid-viewport svg .node circle {
                rx: 10px !important;
                ry: 10px !important;
              }
            `}</style>
            <SafeMermaidViewer
              chartCode={generateMermaidGraph()}
              panPosition={panPosition}
              zoomScale={zoomScale}
            />
          </div>
        </div>
      )}

      {/* TAB CONTENT: Visual Pipeline Flow Mode */}
      {activeTab === "pipeline" && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200/80 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-[#002531]">Milestone Progression Flow</h2>
              <p className="text-xs text-gray-500">Step-by-step roadmap pipeline. Click any milestone to toggle completion.</p>
            </div>
            <span className="px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-bold border border-teal-200">
              {progress}% Ready
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {roadmapData.map((item, index) => {
              const isDone = Boolean(item?.isCompleted);
              const goalText = item?.Goal || item?.goal || item?.title || `Milestone ${index + 1}`;
              const timelineText = item?.timeline || `Phase ${index + 1}`;
              const recs = Array.isArray(item?.recommendations) ? item.recommendations : [];

              return (
                <div key={index} className="flex flex-col items-center w-full">
                  <div
                    onClick={() => handleTaskClick(index)}
                    className={`w-full rounded-2xl p-5 border transition-all shadow-xs cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isDone
                        ? "bg-emerald-50/50 border-emerald-300 hover:border-emerald-400"
                        : "bg-white border-gray-200 hover:border-teal-400"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 transition-colors ${
                          isDone
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 border border-slate-300"
                        }`}
                      >
                        {isDone ? "✓" : index + 1}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200/60">
                            {timelineText}
                          </span>
                          {isDone && (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                              Completed
                            </span>
                          )}
                        </div>
                        <h3 className={`text-base font-bold ${isDone ? "text-emerald-950 line-through opacity-85" : "text-[#002531]"}`}>
                          {goalText}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskClick(index);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isDone
                            ? "bg-emerald-200 text-emerald-900 hover:bg-emerald-300"
                            : "bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                        }`}
                      >
                        {isDone ? "Mark Pending" : "Mark Done"}
                      </button>
                    </div>
                  </div>

                  {/* Connected Recommended Resources under the node */}
                  {recs.length > 0 && (
                    <div className="w-[94%] bg-slate-50/70 rounded-b-xl p-3 border-x border-b border-gray-200 flex flex-wrap gap-2 items-center">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Resources:</span>
                      {recs.map((rec, rIdx) => {
                        const recTitle = typeof rec === "string" ? rec : rec?.title || "Resource";
                        const recLink = typeof rec === "string" ? null : rec?.link;
                        return (
                          <a
                            key={rIdx}
                            href={recLink || `https://www.coursera.org/search?query=${encodeURIComponent(recTitle)}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-xs font-medium text-slate-700 hover:text-blue-700 transition-colors shadow-2xs"
                          >
                            <FaExternalLinkAlt className="text-[10px] text-blue-500" />
                            <span className="truncate max-w-[200px]">{recTitle}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {/* Directional Arrow between flow nodes */}
                  {index < roadmapData.length - 1 && (
                    <div className="my-2 flex flex-col items-center">
                      <div className="w-0.5 h-4 bg-teal-400"></div>
                      <span className="material-symbols-outlined text-teal-600 text-sm -mt-1">expand_more</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Detailed Checklist View */}
      {activeTab === "list" && (
        <div className="flex flex-col gap-4">
          {roadmapData.map((item, index) => {
            const goalText = item?.Goal || item?.goal || item?.title || `Milestone ${index + 1}`;
            const isDone = Boolean(item?.isCompleted);
            const timelineText = item?.timeline || "";
            const recs = Array.isArray(item?.recommendations) ? item.recommendations : [];

            return (
              <div
                key={index}
                className={`bg-white rounded-3xl p-6 border transition-all shadow-sm flex flex-col gap-4 ${
                  isDone ? "border-emerald-300 bg-emerald-50/30" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div
                    className="flex items-center gap-3 cursor-pointer select-none"
                    onClick={() => handleTaskClick(index)}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => {}}
                      className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                    />
                    <h3 className={`text-base font-extrabold ${isDone ? "text-emerald-950 line-through opacity-85" : "text-[#002531]"}`}>
                      {goalText}
                    </h3>
                  </div>

                  <button
                    onClick={() =>
                      setShowRecommendationsIndex(showRecommendationsIndex === index ? null : index)
                    }
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#002531] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{showRecommendationsIndex === index ? "Hide Resources" : "View Resources"}</span>
                    {recs.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px]">
                        {recs.length}
                      </span>
                    )}
                  </button>
                </div>

                {timelineText && (
                  <p className="text-xs text-gray-500 font-semibold">Timeline: {timelineText}</p>
                )}

                {showRecommendationsIndex === index && (
                  <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
                    <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <span>Recommended Courses & Learning Resources:</span>
                    </h4>
                    {recs.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {recs.map((rec, rIdx) => {
                          const recTitle = typeof rec === "string" ? rec : rec?.title || "Resource";
                          const recLink = typeof rec === "string" ? null : rec?.link;
                          const isCoursera =
                            (recLink || "").toLowerCase().includes("coursera") ||
                            (recTitle || "").toLowerCase().includes("coursera");
                          return (
                            <a
                              key={rIdx}
                              href={
                                recLink ||
                                `https://www.coursera.org/search?query=${encodeURIComponent(
                                  recTitle || goalText
                                )}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-slate-50 to-blue-50/40 border border-blue-200/60 rounded-xl text-xs font-bold text-[#002531] hover:text-blue-700 hover:border-blue-400 hover:shadow-sm transition-all"
                            >
                              <FaExternalLinkAlt className="text-[11px] text-blue-600" />
                              <span>{recTitle}</span>
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
                          href={`https://www.coursera.org/search?query=${encodeURIComponent(goalText)}`}
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
            );
          })}
        </div>
      )}

      {/* Save Action Bar */}
      {unsavedChanges && (
        <div className="bg-white rounded-2xl p-4 border border-teal-200 shadow-lg flex justify-between items-center sticky bottom-4 z-20">
          <span className="text-xs font-bold text-gray-700">You have unsaved task completions.</span>
          <button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Save Progress
          </button>
        </div>
      )}

      {/* Completion Trophy Card */}
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
              className="bg-white hover:bg-emerald-50 text-emerald-900 px-6 py-2.5 rounded-xl text-xs font-extrabold shadow transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
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

// Export wrapped in ErrorBoundary
const GetRoadmap = () => {
  return (
    <RoadmapErrorBoundary>
      <GetRoadmapContent />
    </RoadmapErrorBoundary>
  );
};

export default GetRoadmap;
