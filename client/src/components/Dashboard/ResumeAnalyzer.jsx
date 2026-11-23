import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Clean inline SVG Radar Chart (Zero-dependency, high performance)
const CompetencyRadarChart = ({ metrics }) => {
  if (!metrics || metrics.length < 3) return null;

  const size = 300;
  const center = size / 2;
  const radius = 100;
  const numPoints = metrics.length;
  const angleStep = (Math.PI * 2) / numPoints;

  // Concentric polygon rings (25%, 50%, 75%, 100%)
  const rings = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (value, index, maxVal = 100) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / maxVal) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const candidatePoints = metrics
    .map((m, i) => {
      const { x, y } = getCoordinates(m.candidate || 0, i);
      return `${x},${y}`;
    })
    .join(" ");

  const benchmarkPoints = metrics
    .map((m, i) => {
      const { x, y } = getCoordinates(m.benchmark || 80, i);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Concentric Webs */}
        {rings.map((ring, ringIdx) => {
          const ringPoints = metrics
            .map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const r = ring * radius;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            })
            .join(" ");

          return (
            <polygon
              key={ringIdx}
              points={ringPoints}
              fill={ringIdx === rings.length - 1 ? "#f8fafc" : "none"}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={ringIdx < rings.length - 1 ? "3 3" : undefined}
            />
          );
        })}

        {/* Axis Lines & Labels */}
        {metrics.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const endX = center + radius * Math.cos(angle);
          const endY = center + radius * Math.sin(angle);
          const labelDist = radius + 22;
          const labelX = center + labelDist * Math.cos(angle);
          const labelY = center + labelDist * Math.sin(angle);

          return (
            <g key={i}>
              <line
                x1={center}
                y1={center}
                x2={endX}
                y2={endY}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[11px] font-semibold fill-slate-600"
              >
                {m.subject}
              </text>
            </g>
          );
        })}

        {/* Benchmark Polygon (Target Role) */}
        <polygon
          points={benchmarkPoints}
          fill="rgba(148, 163, 184, 0.15)"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Candidate Polygon (Overlay) */}
        <polygon
          points={candidatePoints}
          fill="rgba(70, 72, 212, 0.22)"
          stroke="#4648d4"
          strokeWidth="2.5"
        />

        {/* Candidate Data Dots */}
        {metrics.map((m, i) => {
          const { x, y } = getCoordinates(m.candidate || 0, i);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.5"
              className="fill-[#4648d4] stroke-white stroke-2 shadow-sm"
            />
          );
        })}
      </svg>

      {/* Chart Legend */}
      <div className="flex items-center gap-5 mt-4 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#4648d4] inline-block shadow-sm"></span>
          <span className="text-slate-700">Candidate Score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-1 border-t-2 border-dashed border-slate-400 inline-block"></span>
          <span className="text-slate-500">Target Role Benchmark</span>
        </div>
      </div>
    </div>
  );
};

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        toast.error("Please upload a valid PDF file.");
        return;
      }
      setFile(selected);
    }
  };

  const handleCopyBullet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success("Optimized bullet copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please upload your resume PDF.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);

      const response = await axios.post("/api/v1/user/resume-analyze", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setResult(response.data.data);
        toast.success("Resume Audit Complete!");
      } else {
        toast.error("Analysis failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const pillars = result?.fourPillars || {
    atsParseability: result?.percentage || 0,
    coreCompetencies: result?.percentage || 0,
    technicalAlignment: result?.percentage || 0,
    quantifiableImpact: Math.max(0, (result?.percentage || 0) - 15),
    behavioralCultureFit: result?.percentage || 0,
    psychologicalRoleFit: result?.percentage || 0
  };

  return (
    <div className="w-full flex flex-col gap-6 fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#4648d4]/10 via-[#00a884]/10 to-transparent rounded-bl-full pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#4648d4]/10 text-[#4648d4] border border-[#4648d4]/20">
              <span className="w-2 h-2 rounded-full bg-[#4648d4] animate-pulse"></span>
              Neural ATS Engine • Institutional Intelligence
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#002531] tracking-tight">
            AI Resume & ATS Intelligence
          </h2>
          <p className="text-[#002531]/70 text-sm mt-1 max-w-2xl">
            Recruiter-grade audit analyzing semantic competency, ATS formatting hygiene, Google X-Y-Z quantifiable impact, and cultural fit.
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4648d4] to-[#6366f1] text-white flex items-center justify-center shadow-md shadow-[#4648d4]/20 shrink-0">
          <span className="material-symbols-outlined text-3xl">psychology</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Inputs (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* 1. Upload Resume */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#002531] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#4648d4]/10 text-[#4648d4] text-xs font-bold flex items-center justify-center">1</span>
                Upload Candidate Resume (PDF)
              </h3>
              {file && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Ready to scan
                </span>
              )}
            </div>

            <div 
              className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                file 
                  ? 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/50' 
                  : 'border-[#acecdc] bg-[#f0f7f4]/40 hover:bg-[#f0f7f4]/90'
              }`}
              onClick={() => document.getElementById('resume-upload').click()}
            >
              <input 
                type="file" 
                id="resume-upload" 
                className="hidden" 
                accept="application/pdf"
                onChange={handleFileChange}
              />
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${file ? 'bg-emerald-100 text-emerald-700' : 'bg-[#4648d4]/10 text-[#4648d4]'}`}>
                <span className="material-symbols-outlined text-2xl">
                  {file ? 'picture_as_pdf' : 'upload_file'}
                </span>
              </div>
              {file ? (
                <div>
                  <p className="font-bold text-[#002531] text-sm truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-[#002531]/60 mt-1">{(file.size / 1024).toFixed(1)} KB • Click to replace</p>
                </div>
              ) : (
                <>
                  <p className="font-bold text-[#002531] text-sm">Click to select resume PDF</p>
                  <p className="text-xs text-[#002531]/60 mt-1">Supports standard PDF resumes up to 5MB</p>
                </>
              )}
            </div>
          </div>

          {/* 2. Job Description */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#002531] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#4648d4]/10 text-[#4648d4] text-xs font-bold flex items-center justify-center">2</span>
                Target Job Description
              </h3>
            </div>

            <textarea
              className="w-full h-44 rounded-2xl border border-gray-200 p-4 text-xs md:text-sm text-[#002531] focus:outline-none focus:ring-2 focus:ring-[#4648d4]/30 resize-none bg-gray-50/50 leading-relaxed font-sans"
              placeholder="Paste the target job description or requirements here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#4648d4] to-[#5b5de6] hover:from-[#3b3db0] hover:to-[#4e50d6] text-white font-bold py-4 px-6 rounded-2xl shadow-[0_8px_20px_rgba(70,72,212,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed text-base"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                <span>Running Resume Audit...</span>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                <span>Audit Resume</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column - Results (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-white/60 min-h-[560px] flex flex-col">
          {!result && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 text-slate-400">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                <span className="material-symbols-outlined text-4xl">document_scanner</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-600 mb-1">Awaiting Upload & Job Description</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Upload your resume PDF and paste a target role to unlock 4-Pillar Recruiter Scoring, Competency Radar, and Google X-Y-Z bullet rewrites.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-5 text-[#4648d4]">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#4648d4]/20 animate-ping"></div>
                <div className="w-16 h-16 rounded-full border-4 border-[#4648d4]/30 border-t-[#4648d4] animate-spin"></div>
                <span className="material-symbols-outlined text-2xl absolute text-[#4648d4]">psychology</span>
              </div>
              <div>
                <h4 className="font-bold text-lg text-[#002531]">Resume Audit in Progress</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Parsing resume semantics, evaluating keyword vectors, and generating Google X-Y-Z impact rewrites...
                </p>
              </div>
            </div>
          )}

          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6 flex-1"
            >
              {/* Top Hero Score Card */}
              <div className="bg-gradient-to-br from-[#f8fafc] via-[#f0f7f4]/60 to-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-6">
                {/* Radial Score Gauge */}
                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.2"
                    />
                    <path
                      className={
                        result.percentage >= 75 
                          ? "text-emerald-500" 
                          : result.percentage >= 50 
                            ? "text-amber-500" 
                            : "text-rose-500"
                      }
                      strokeDasharray={`${result.percentage}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-[#002531]">{result.percentage}%</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Overall</span>
                  </div>
                </div>

                {/* Recruiter Verdict */}
                <div className="flex-1 flex flex-col gap-1.5 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      result.percentage >= 75
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : result.percentage >= 50
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}>
                      {result.percentage >= 75 ? "Highly Competitive" : result.percentage >= 50 ? "Solid Foundation" : "Gaps Detected"}
                    </span>
                    {result.roleCategory && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {result.roleCategory}
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-slate-400">
                      Evaluated by AI Recruiter Engine
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-[#002531]/85 font-medium leading-relaxed mt-1">
                    "{result.verdict}"
                  </p>
                </div>
              </div>

              {/* 4-Pillar Recruiter Audit Scorecard */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#4648d4]">fact_check</span>
                  4-Pillar Recruiter Audit Scorecard
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Pillar 1: ATS Parseability */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-500">ATS Parseability</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-lg font-black text-[#002531]">{pillars.atsParseability}%</span>
                      <span className="text-[10px] font-bold text-slate-400">Layout</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pillars.atsParseability}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Pillar 2: Core Competencies */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-500">Core Competencies</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-lg font-black text-[#002531]">{pillars.coreCompetencies || pillars.technicalAlignment}%</span>
                      <span className="text-[10px] font-bold text-slate-400">Domain</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pillars.coreCompetencies || pillars.technicalAlignment}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Pillar 3: Quantifiable Impact */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-500">Quantifiable Impact</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-lg font-black text-[#002531]">{pillars.quantifiableImpact}%</span>
                      <span className="text-[10px] font-bold text-slate-400">X-Y-Z</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pillars.quantifiableImpact}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Pillar 4: Behavioral & Role Fit */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-500">Behavioral & Role Fit</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-lg font-black text-[#002531]">{pillars.behavioralCultureFit || pillars.psychologicalRoleFit}%</span>
                      <span className="text-[10px] font-bold text-slate-400">PI360</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pillars.behavioralCultureFit || pillars.psychologicalRoleFit}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Row: Radar Chart & ATS Linter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Competency Spider / Radar Chart */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col items-center justify-center">
                  <div className="w-full flex items-center justify-between mb-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#4648d4]">radar</span>
                      Competency Radar
                    </h5>
                    <span className="text-[10px] font-semibold text-slate-400">5 Dimensions</span>
                  </div>
                  <CompetencyRadarChart metrics={result.radarMetrics} />
                </div>

                {/* ATS Formatting Hygiene & Linter */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#4648d4]">rule</span>
                    ATS Hygiene & Formatting Linter
                  </h5>
                  <div className="flex flex-col gap-2.5 flex-1 justify-center">
                    {(result.atsChecks || []).map((check, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-2.5 p-2 rounded-xl bg-white border border-slate-100 text-xs shadow-2xs"
                      >
                        <span className={`material-symbols-outlined text-base mt-0.5 shrink-0 ${check.passed ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {check.passed ? 'check_circle' : 'warning'}
                        </span>
                        <div className="flex-1">
                          <p className="font-bold text-[#002531]">{check.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{check.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Google X-Y-Z Bullet Point Optimizer */}
              {result.bulletOptimizations && result.bulletOptimizations.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#4648d4]">auto_fix_high</span>
                      Google "X-Y-Z" Impact Scorer & AI Bullet Optimizer
                    </h4>
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      Accomplished [X] measured by [Y] by doing [Z]
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {result.bulletOptimizations.map((bullet, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col gap-3"
                      >
                        {/* Original Bullet */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Original • {bullet.impactType || "Low Impact"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 italic bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                            "{bullet.original}"
                          </p>
                        </div>

                        {/* Rewritten Bullet with Copy Action */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">verified</span>
                              AI Optimized (Google Formula)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyBullet(bullet.improved, idx)}
                              className="text-xs font-semibold text-[#4648d4] hover:text-[#3b3db0] flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg hover:bg-[#4648d4]/10"
                            >
                              <span className="material-symbols-outlined text-sm">
                                {copiedIndex === idx ? 'check' : 'content_copy'}
                              </span>
                              <span>{copiedIndex === idx ? 'Copied!' : 'Copy to Resume'}</span>
                            </button>
                          </div>
                          <p className="text-xs text-[#002531] font-semibold bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-100/80 leading-relaxed">
                            {bullet.improved}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Semantic Skill Match & Gap Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matching Skills */}
                <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200/80 flex flex-col">
                  <h4 className="font-bold text-emerald-800 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Matching Competencies ({result.matching?.length || 0})
                  </h4>
                  <ul className="flex flex-wrap gap-1.5">
                    {result.matching?.length > 0 ? (
                      result.matching.map((skill, i) => (
                        <li key={i} className="bg-white text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-emerald-600">done</span>
                          {skill}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-400 italic">No exact technical overlap detected.</li>
                    )}
                  </ul>
                </div>

                {/* Missing Skills */}
                <div className="bg-rose-50/40 p-4 rounded-2xl border border-rose-200/80 flex flex-col">
                  <h4 className="font-bold text-rose-800 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <span className="material-symbols-outlined text-sm">error</span>
                    Critical Missing Keywords ({result.missing?.length || 0})
                  </h4>
                  <ul className="flex flex-wrap gap-1.5">
                    {result.missing?.length > 0 ? (
                      result.missing.map((skill, i) => (
                        <li 
                          key={i} 
                          onClick={() => {
                            navigator.clipboard.writeText(skill);
                            toast.info(`Copied "${skill}" keyword`);
                          }}
                          className="bg-white text-rose-800 hover:bg-rose-100/60 cursor-pointer text-xs font-semibold px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs flex items-center gap-1 transition-colors"
                          title="Click to copy keyword"
                        >
                          <span className="material-symbols-outlined text-xs text-rose-500">add</span>
                          {skill}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-400 italic">No critical skill gaps identified!</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Actionable Recruiter Next Steps */}
              {result.actionableTips && result.actionableTips.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex flex-col gap-2">
                  <h4 className="font-bold text-indigo-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-indigo-600">bolt</span>
                    Priority Actions Before Submitting Application
                  </h4>
                  <ul className="flex flex-col gap-1.5 text-xs text-indigo-950 font-medium">
                    {result.actionableTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-indigo-200/70 text-indigo-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
