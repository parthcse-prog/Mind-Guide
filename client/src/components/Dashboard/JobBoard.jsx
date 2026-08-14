import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const INDIAN_REGIONS = [
  "All India",
  "Jammu",
  "Delhi / NCR",
  "Bengaluru",
  "Mumbai",
  "Pune",
  "Hyderabad",
  "Remote",
];

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("All India");
  const [selectedType, setSelectedType] = useState("all"); // "all", "internship", "fulltime"
  const [searchQuery, setSearchQuery] = useState("");
  const user = useSelector((state) => state.mindGuide.userInfo);

  const fetchJobs = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await axios.get("/api/v1/user/jobs", {
        params: {
          region: selectedRegion,
          type: selectedType,
        },
      });

      setJobs(response.data.jobs || []);
      if (isManualRefresh) {
        toast.success("Active Engineering Jobs & Internships Refreshed Real-Time!");
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedRegion, selectedType]);

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.requiredSkills.some((s) => s.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center font-['Plus_Jakarta_Sans']">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a3b47]"></div>
        <p className="mt-4 text-sm font-semibold text-gray-600">
          Matching real-time active jobs & internships across India...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-['Plus_Jakarta_Sans'] max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1a3b47] via-[#002531] to-[#142834] rounded-3xl p-6 md:p-8 text-white shadow-lg border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#acecdc]/20 text-[#acecdc] rounded-full text-xs font-bold uppercase tracking-wider border border-[#acecdc]/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live India Job Feed
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-['Manrope'] text-white">
            Engineering Job & Internship Board
          </h1>
          <p className="text-sm text-[#85a5b3] max-w-xl">
            Real-time opportunities for Engineering Freshers & Undergrads (0-1 Year Experience) matched against your profile & counselor report skills.
          </p>
        </div>

        {/* Real-Time Refresh Button */}
        <button
          onClick={() => fetchJobs(true)}
          disabled={refreshing}
          className="bg-[#acecdc] hover:bg-[#8ee4d0] text-[#002531] px-5 py-3 rounded-2xl font-extrabold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2.5 shrink-0 disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-lg ${refreshing ? "animate-spin" : ""}`}>
            refresh
          </span>
          <span>{refreshing ? "Fetching Live..." : "Refresh Jobs"}</span>
        </button>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-3 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Search by role, company, or skill (e.g. React, Python)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 transition-colors text-[#002531]"
          />
        </div>



        {/* Job Type Toggle */}
        <div className="bg-gray-100 p-1 rounded-xl flex items-center shrink-0 border border-gray-200">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedType === "all" ? "bg-white text-[#002531] shadow-xs" : "text-gray-600"
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setSelectedType("internship")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedType === "internship" ? "bg-white text-[#002531] shadow-xs" : "text-gray-600"
            }`}
          >
            Internships
          </button>
          <button
            onClick={() => setSelectedType("fulltime")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedType === "fulltime" ? "bg-white text-[#002531] shadow-xs" : "text-gray-600"
            }`}
          >
            Full-Time (0-1 Yr)
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-5xl text-gray-300">work_off</span>
          <h3 className="text-lg font-bold text-[#002531]">No matching jobs found in {selectedRegion}</h3>
          <p className="text-xs text-gray-500 max-w-sm">
            Try switching regions (e.g. All India / Remote) or clear your search term to see active engineering opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => {
            const isHighMatch = job.matchPercentage >= 80;
            const isGoodMatch = job.matchPercentage >= 65 && job.matchPercentage < 80;

            const badgeBg = isHighMatch
              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
              : isGoodMatch
              ? "bg-teal-100 text-teal-800 border-teal-300"
              : "bg-amber-100 text-amber-800 border-amber-300";

            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-5 relative overflow-hidden group hover:border-teal-400"
              >
                {/* Top Section */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                        <img
                          src={job.logo}
                          alt={job.company}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentNode.innerText = job.company.charAt(0);
                          }}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[#002531] text-base group-hover:text-teal-700 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-xs font-semibold text-gray-500">{job.company}</p>
                      </div>
                    </div>

                    {/* Match Badge */}
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-extrabold border shrink-0 flex items-center gap-1 ${badgeBg}`}
                    >
                      <span>🎯</span>
                      <span>{job.matchPercentage}% Match</span>
                    </div>
                  </div>

                  {/* Meta Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-slate-500">
                        location_on
                      </span>
                      {job.location}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1 border border-indigo-100">
                      <span className="material-symbols-outlined text-sm">payments</span>
                      {job.stipendSalary}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                      {job.type} • {job.experience}
                    </span>
                  </div>

                  {/* Required Skills List */}
                  <div className="mt-2 flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Required Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills Warning Section */}
                  {job.missingSkills && job.missingSkills.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col gap-1 mt-1">
                      <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-amber-600">
                          warning
                        </span>
                        Missing Skills to Learn
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {job.missingSkills.map((mSk) => (
                          <span
                            key={mSk}
                            className="px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-900 text-[11px] font-semibold"
                          >
                            + {mSk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-gray-400">
                      Posted {job.postedDate}
                    </span>
                    {job.originalSource === "Himalayas" && (
                      <a 
                        href="https://himalayas.app/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1"
                        title="View remote jobs on Himalayas"
                      >
                        <span className="material-symbols-outlined text-[12px]">public</span>
                        Source: Himalayas
                      </a>
                    )}
                  </div>
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#1a3b47] hover:bg-[#002531] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Apply Now</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobBoard;
