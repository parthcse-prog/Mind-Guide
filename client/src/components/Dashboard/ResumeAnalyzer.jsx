import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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
        toast.success("Analysis complete!");
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

  return (
    <div className="w-full flex flex-col gap-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#4648d4]/10 to-transparent rounded-bl-full pointer-events-none"></div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#002531] tracking-tight">
            Resume Analyzer
          </h2>
          <p className="text-[#002531]/60 text-sm mt-1">
            Compare your resume against any job description to discover matching skills and identify gaps.
          </p>
        </div>
        <span className="material-symbols-outlined text-[#4648d4] text-4xl opacity-80">
          document_scanner
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col - Inputs */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/60">
            <h3 className="text-lg font-bold text-[#002531] mb-4">1. Upload Resume (PDF)</h3>
            <div className="relative border-2 border-dashed border-[#acecdc] rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-[#f0f7f4]/30 hover:bg-[#f0f7f4]/80 transition-colors cursor-pointer"
                 onClick={() => document.getElementById('resume-upload').click()}>
              <input 
                type="file" 
                id="resume-upload" 
                className="hidden" 
                accept="application/pdf"
                onChange={handleFileChange}
              />
              <span className="material-symbols-outlined text-4xl text-[#4648d4] mb-2">upload_file</span>
              {file ? (
                <p className="font-semibold text-[#002531]">{file.name}</p>
              ) : (
                <>
                  <p className="font-semibold text-[#002531]">Click to upload PDF</p>
                  <p className="text-sm text-[#002531]/60 mt-1">Max file size: 5MB</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/60">
            <h3 className="text-lg font-bold text-[#002531] mb-4">2. Job Description</h3>
            <textarea
              className="w-full h-48 rounded-2xl border border-gray-200 p-4 text-sm text-[#002531] focus:outline-none focus:ring-2 focus:ring-[#4648d4]/30 resize-none bg-gray-50/50"
              placeholder="Paste the target job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            ></textarea>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-[#4648d4] hover:bg-[#3b3db0] text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_rgba(70,72,212,0.25)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
            ) : (
              <>
                <span className="material-symbols-outlined">analytics</span>
                Analyze Match
              </>
            )}
          </button>
        </div>

        {/* Right Col - Results */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/60 h-full min-h-[500px] flex flex-col">
          <h3 className="text-lg font-bold text-[#002531] mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
            <span className="material-symbols-outlined text-[#4648d4]">monitoring</span>
            Analysis Results
          </h3>
          
          {!result && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
              <span className="material-symbols-outlined text-5xl opacity-50">data_exploration</span>
              <p>Upload your resume and JD to see results</p>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-[#4648d4] gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#4648d4]/30 border-t-[#4648d4]"></div>
              <p className="font-semibold animate-pulse">Analyzing with AI...</p>
            </div>
          )}

          {result && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6 flex-1 overflow-y-auto pr-2 custom-scrollbar"
            >
              {/* Score */}
              <div className="flex items-center gap-6 p-5 bg-[#f0f7f4]/50 rounded-2xl border border-[#acecdc]/30">
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className={result.percentage >= 70 ? "text-green-500" : result.percentage >= 40 ? "text-orange-500" : "text-red-500"}
                      strokeDasharray={`${result.percentage}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-[#002531] leading-none">{result.percentage}%</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-1">Match Score</h4>
                  <p className="text-sm text-[#002531]/80 font-medium leading-relaxed">
                    {result.verdict}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {/* Matching Skills */}
                <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100 flex flex-col">
                  <h4 className="font-bold text-green-700 flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    Matching Skills
                  </h4>
                  <ul className="flex flex-wrap gap-2">
                    {result.matching?.length > 0 ? (
                      result.matching.map((skill, i) => (
                        <li key={i} className="bg-white text-green-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-green-200">
                          {skill}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 italic">No exact matches found.</li>
                    )}
                  </ul>
                </div>

                {/* Missing Skills */}
                <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 flex flex-col">
                  <h4 className="font-bold text-red-700 flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-lg">error</span>
                    Missing Skills
                  </h4>
                  <ul className="flex flex-wrap gap-2">
                    {result.missing?.length > 0 ? (
                      result.missing.map((skill, i) => (
                        <li key={i} className="bg-white text-red-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-red-200">
                          {skill}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 italic">No missing skills detected!</li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
