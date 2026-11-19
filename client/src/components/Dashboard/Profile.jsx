import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeUser, addUser } from "../../redux/mindGuideSlice";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faCakeCandles,
  faHourglassHalf,
  faGlobe,
  faCircleCheck,
  faPen,
  faCheck,
  faXmark,
  faRightFromBracket,
  faAward,
  faRotate,
  faBriefcase,
  faFileSignature,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import googleIcon from "../../assets/google.png";
import mietLogo from "../../assets/MIET Logos/miet-logo-dark.png";
import badge from "../../assets/badge.png";
import tick from "../../assets/tick.png";
import JobBoard from "./JobBoard";
import ResumeAnalyzer from "./ResumeAnalyzer";

const Profile = () => {
  const userInfo = useSelector((state) => state.mindGuide.userInfo);
  const dispatch = useDispatch();

  const [isEditingDob, setIsEditingDob] = useState(false);
  const [dob, setDob] = useState(userInfo?.dob || "15 August 2003");
  const [loadingDob, setLoadingDob] = useState(false);
  const [syncingSkills, setSyncingSkills] = useState(false);
  const [isJobBoardOpen, setIsJobBoardOpen] = useState(false);
  const [isResumeAnalyzerOpen, setIsResumeAnalyzerOpen] = useState(false);
  const [jobBoardKey, setJobBoardKey] = useState(0);

  const handleRefreshJobBoard = (e) => {
    e.stopPropagation();
    setJobBoardKey((prev) => prev + 1);
    if (!isJobBoardOpen) setIsJobBoardOpen(true);
    toast.info("Refreshing job board...");
  };

  useEffect(() => {
    const refreshProfile = async () => {
      try {
        const { data } = await axios.get("/api/v1/user/getUserProfile");
        if (data) {
          dispatch(addUser(data));
          if (data.dob) setDob(data.dob);
        }
      } catch (err) {
        console.warn("Could not refresh profile:", err.message);
      }
    };
    refreshProfile();
  }, [dispatch]);

  const handleSyncSkills = async () => {
    try {
      setSyncingSkills(true);
      await axios.get("/api/v1/user/getSkills");
      const { data } = await axios.get("/api/v1/user/getUserProfile");
      if (data) dispatch(addUser(data));
      toast.success("Skills & Verified Badges synchronized to your Profile!");
    } catch (err) {
      console.error("Error syncing skills:", err);
      toast.error("Failed to sync skills from roadmap.");
    } finally {
      setSyncingSkills(false);
    }
  };

  const calculateAge = (dobString) => {
    if (!dobString) return "—";
    const parsedDate = new Date(dobString);
    if (!isNaN(parsedDate.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - parsedDate.getFullYear();
      const monthDiff = today.getMonth() - parsedDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < parsedDate.getDate())
      ) {
        age--;
      }
      return age >= 0 ? `${age} years` : "—";
    }
    const yearMatch = dobString.match(/\b(19\d{2}|20\d{2})\b/);
    if (yearMatch) {
      const currentYear = new Date().getFullYear();
      const age = currentYear - parseInt(yearMatch[1], 10);
      return `${age} years`;
    }
    return "—";
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/v1/user/logout");
      dispatch(removeUser());
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSaveDob = async () => {
    setLoadingDob(true);
    try {
      const response = await axios.post("/api/v1/user/google-login", {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.pic,
        dob: dob,
      });
      dispatch(addUser(response.data));
      setIsEditingDob(false);
      toast.success("Birthday updated");
    } catch (err) {
      console.error("Failed to update DOB:", err);
      toast.error("Could not update birthday");
    } finally {
      setLoadingDob(false);
    }
  };

  const createdAtDate = new Date(userInfo?.createdAt || Date.now());
  const formattedCreatedAt =
    createdAtDate.getDate() +
    " " +
    createdAtDate.toLocaleString("default", { month: "long" }) +
    " " +
    createdAtDate.getFullYear();

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userInfo?.name || "Parth"
  )}&background=0c242c&color=2dd4bf&size=256&bold=true`;

  const profilePic =
    userInfo?.picture && !userInfo.picture.includes("534528741775")
      ? userInfo.picture
      : userInfo?.pic && !userInfo.pic.includes("534528741775")
      ? userInfo.pic
      : fallbackAvatar;

  const locale = userInfo?.locale || "en-IN (English)";

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-['Manrope'] pb-12">
      {/* Account Identity Card */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            <img
              src={profilePic}
              alt={userInfo?.name || "User"}
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackAvatar;
              }}
            />
            <div
              className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full border border-slate-200 shadow-xs"
              title="Google Account"
            >
              <img src={googleIcon} alt="Google" className="w-4 h-4 object-contain" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {userInfo?.name || "Parth Sharma"}
              </h1>
              <img
                src={mietLogo}
                alt="MIET"
                className="h-7 object-contain opacity-70 mix-blend-multiply hidden sm:block"
              />
            </div>

            <p className="text-sm text-slate-600 flex items-center justify-center sm:justify-start gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-teal-700 text-xs" />
              <span>{userInfo?.email || "user@mietjammu.in"}</span>
              <FontAwesomeIcon
                icon={faCircleCheck}
                className="text-emerald-600 text-xs ml-0.5"
                title="Verified"
              />
            </p>

            <p className="text-xs text-slate-400">
              Member since {formattedCreatedAt}
            </p>
          </div>
        </div>
      </section>

      {/* Skill Badges & Verified Achievements Card */}
      {((userInfo?.skills && userInfo.skills.length > 0) ||
        (userInfo?.roadmap && userInfo.roadmap.some((r) => r.isCompleted))) && (
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200 shadow-2xs">
                <FontAwesomeIcon icon={faAward} className="text-lg" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Skill Badges & Verified Achievements</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Earned through completed Saarthi roadmap milestones & verified by MIET Jammu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                {(userInfo?.skills?.length || 0)} Badges Earned
              </span>
              <button
                type="button"
                onClick={handleSyncSkills}
                disabled={syncingSkills}
                className="text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                title="Synchronize latest roadmap competencies"
              >
                <FontAwesomeIcon
                  icon={faRotate}
                  className={syncingSkills ? "animate-spin text-teal-600" : "text-teal-600"}
                />
                <span>{syncingSkills ? "Syncing..." : "Sync Badges"}</span>
              </button>
            </div>
          </div>

          {/* Technical Competencies */}
          {(userInfo?.skills || []).filter((s) => s.type === "technical" || !s.type).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Technical Competencies
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(userInfo.skills || [])
                  .filter((s) => s.type === "technical" || !s.type)
                  .map((skillObj, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 rounded-2xl border border-blue-100 hover:border-blue-300 transition-all shadow-2xs group"
                    >
                      <div className="w-11 h-11 shrink-0 flex items-center justify-center bg-white rounded-xl shadow-xs border border-blue-100 group-hover:scale-110 transition-transform">
                        <img src={badge} alt="Technical Badge" className="h-8 w-8 object-contain" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-extrabold text-slate-900 truncate" title={typeof skillObj === "string" ? skillObj : skillObj.skill}>
                          {typeof skillObj === "string" ? skillObj : skillObj.skill}
                        </span>
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                          Verified Badge
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Professional & Soft Skills */}
          {(userInfo?.skills || []).some((s) => s.type === "non-technical") && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Professional & Applied Skills
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {userInfo.skills
                  .filter((s) => s.type === "non-technical")
                  .map((skillObj, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50/50 to-teal-50/30 rounded-2xl border border-emerald-100 hover:border-emerald-300 transition-all shadow-2xs group"
                    >
                      <div className="w-11 h-11 shrink-0 flex items-center justify-center bg-white rounded-xl shadow-xs border border-emerald-100 group-hover:scale-110 transition-transform">
                        <img src={tick} alt="Skill Verified" className="h-8 w-8 object-contain" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-extrabold text-slate-900 truncate" title={typeof skillObj === "string" ? skillObj : skillObj.skill}>
                          {typeof skillObj === "string" ? skillObj : skillObj.skill}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                          Certified Skill
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Verified Google Account Attributes */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <img src={googleIcon} alt="Google" className="w-4 h-4 object-contain" />
            <span>Account Details</span>
          </h2>
          <span className="text-xs text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg">
            Google Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Full Name */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-start gap-3">
            <FontAwesomeIcon icon={faUser} className="text-teal-700 text-sm mt-0.5" />
            <div className="space-y-0.5 overflow-hidden">
              <span className="text-slate-400 font-medium">Name</span>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {userInfo?.name || "Parth Sharma"}
              </p>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-start gap-3">
            <FontAwesomeIcon icon={faCakeCandles} className="text-teal-700 text-sm mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Date of Birth</span>
                <button
                  type="button"
                  onClick={() => setIsEditingDob(!isEditingDob)}
                  className="text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
                >
                  <FontAwesomeIcon icon={isEditingDob ? faXmark : faPen} className="mr-1" />
                  {isEditingDob ? "Cancel" : "Edit"}
                </button>
              </div>

              {isEditingDob ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    placeholder="e.g. 07 October 1999"
                    className="p-1.5 text-xs border border-teal-500 rounded-lg outline-hidden w-full font-semibold bg-white"
                  />
                  <button
                    onClick={handleSaveDob}
                    disabled={loadingDob}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-900">
                  {dob}
                </p>
              )}
            </div>
          </div>

          {/* Calculated Age */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-start gap-3">
            <FontAwesomeIcon icon={faHourglassHalf} className="text-teal-700 text-sm mt-0.5" />
            <div className="space-y-0.5 overflow-hidden">
              <span className="text-slate-400 font-medium">Age</span>
              <p className="text-sm font-semibold text-slate-900">
                {calculateAge(dob)}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-start gap-3">
            <FontAwesomeIcon icon={faEnvelope} className="text-teal-700 text-sm mt-0.5" />
            <div className="space-y-0.5 overflow-hidden">
              <span className="text-slate-400 font-medium">Email</span>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {userInfo?.email || "user@mietjammu.in"}
              </p>
            </div>
          </div>

          {/* Locale */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-start gap-3 sm:col-span-2">
            <FontAwesomeIcon icon={faGlobe} className="text-teal-700 text-sm mt-0.5" />
            <div className="space-y-0.5 overflow-hidden">
              <span className="text-slate-400 font-medium">Locale</span>
              <p className="text-sm font-semibold text-slate-900">
                {locale}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Saarthi.ai with MIET Jammu</span>
          <button
            onClick={handleLogout}
            className="text-slate-600 hover:text-red-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>Sign out</span>
          </button>
        </div>
      </section>

      {/* Collapsible Resume Analyzer Section */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
        <div
          onClick={() => setIsResumeAnalyzerOpen(!isResumeAnalyzerOpen)}
          className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200 shadow-2xs">
              <FontAwesomeIcon icon={faFileSignature} className="text-base" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  ATS Resume Analyzer & Feedback
                </h2>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Upload your resume PDF for instant ATS score benchmarking and keyword gap insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 transition-transform">
              <FontAwesomeIcon icon={isResumeAnalyzerOpen ? faChevronUp : faChevronDown} className="text-xs" />
            </div>
          </div>
        </div>

        {isResumeAnalyzerOpen && (
          <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/40">
            <ResumeAnalyzer />
          </div>
        )}
      </section>

      {/* Collapsible Job Board Section */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
        <div
          onClick={() => setIsJobBoardOpen(!isJobBoardOpen)}
          className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 border border-teal-200 shadow-2xs">
              <FontAwesomeIcon icon={faBriefcase} className="text-base" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Job Board
                </h2>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Feed
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Active opportunities tailored to your career tracks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleRefreshJobBoard}
              className="p-2 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Refresh job opportunities"
            >
              <FontAwesomeIcon icon={faRotate} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 transition-transform">
              <FontAwesomeIcon icon={isJobBoardOpen ? faChevronUp : faChevronDown} className="text-xs" />
            </div>
          </div>
        </div>

        {isJobBoardOpen && (
          <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/40">
            <JobBoard key={jobBoardKey} />
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;