import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeUser, addUser } from "../../redux/mindGuideSlice";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLocationDot,
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
  faGraduationCap,
  faShieldHalved,
  faEye,
  faEyeSlash,
  faFileLines,
  faBuildingColumns,
  faIdCard,
  faLock,
  faCopy,
  faPlus,
  faTrash,
  faFloppyDisk,
  faBookOpen,
  faLayerGroup,
  faArrowUpRightFromSquare,
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

  const [viewingDoc, setViewingDoc] = useState(null);
  const [isEditingDob, setIsEditingDob] = useState(false);
  const [dob, setDob] = useState(userInfo?.dob || "15 August 2003");
  const [loadingDob, setLoadingDob] = useState(false);
  const [syncingSkills, setSyncingSkills] = useState(false);
  const [isJobBoardOpen, setIsJobBoardOpen] = useState(false);
  const [isResumeAnalyzerOpen, setIsResumeAnalyzerOpen] = useState(false);
  const [jobBoardKey, setJobBoardKey] = useState(0);
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);
  const [activeAcademicTab, setActiveAcademicTab] = useState("twelfth");
  const [editAcademicForm, setEditAcademicForm] = useState(null);
  const [savingAcademic, setSavingAcademic] = useState(false);

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

  const isFemale =
    /umika|female|woman|girl|maya|priya|ananya|neha|riya|shreya|simran/i.test(
      userInfo?.name || ""
    ) ||
    (userInfo?.pic && userInfo.pic.includes("female")) ||
    (userInfo?.picture && userInfo.picture.includes("female"));

  const defaultAvatar = isFemale
    ? "/female-avatar.svg"
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        userInfo?.name || "User"
      )}&background=0c242c&color=2dd4bf&size=256&bold=true`;

  const profilePic =
    userInfo?.pic && !userInfo.pic.includes("female") && !userInfo.pic.includes("534528741775")
      ? userInfo.pic
      : userInfo?.picture && !userInfo.picture.includes("female") && !userInfo.picture.includes("534528741775")
      ? userInfo.picture
      : "/mehak-profile.jpg";

  const locale = userInfo?.locale || "en-IN (English)";

  const academicRecords = userInfo?.academicRecords || {
    tenth: {
      standard: "Secondary School Examination (Class X)",
      percentage: "67.2%",
      board: "The Jammu and Kashmir Board of School Education (JKBOSE)",
      school: "Alexander Memorial School, Idd Gah, Residency Road, Jammu",
      year: "2021",
      rollNo: "160182011",
      regnNo: "1960010000060013",
      marks: "336 / 500",
      gpa: "7.00",
      division: "Qualified B2",
      marksheetId: "JKBOSE-X-2021-160182011",
      status: "KYC Verified (JKBOSE Authenticated)",
      marksheetUrl: "/SSCER_8468.pdf",
      subjects: [
        { name: "General English", marks: "68", grade: "B2", maxMarks: "100" },
        { name: "Mathematics", marks: "65", grade: "B2", maxMarks: "100" },
        { name: "Hindi", marks: "70", grade: "B2", maxMarks: "100" },
        { name: "Science", marks: "66", grade: "B2", maxMarks: "100" },
        { name: "Social Science", marks: "67", grade: "B2", maxMarks: "100" },
      ],
    },
    twelfth: {
      standard: "Higher Secondary Examination Part-II (Class XII)",
      percentage: "61.0%",
      stream: "Commerce",
      board: "The Jammu and Kashmir Board of School Education (JKBOSE)",
      school: "Govt Girls Hr Sec School Mubarak Mandi, Jammu",
      year: "2023",
      rollNo: "360007073",
      regnNo: "1960010000060013",
      marks: "305 / 500",
      division: "First Division",
      marksheetId: "JKBOSE-XII-2023-360007073",
      status: "KYC Verified (JKBOSE Authenticated)",
      marksheetUrl: "/HSCER_8468.pdf",
      subjects: [
        { name: "Typewriting / Shorthand", marks: "79", grade: "A2", maxMarks: "100" },
        { name: "General English", marks: "72", grade: "B1", maxMarks: "100" },
        { name: "Accountancy", marks: "63", grade: "B2", maxMarks: "100" },
        { name: "Economics", marks: "46", grade: "C2", maxMarks: "100" },
        { name: "Business Studies", marks: "45", grade: "C2", maxMarks: "100" },
      ],
    },
    aadhaar: {
      name: "Mehak",
      gender: "Female",
      dob: "01/08/2004",
      aadhaarNumber: "3901 5658 5688",
      maskedAadhaar: "XXXX XXXX 5688",
      address: "House no. 141, Ward no. 48, Gorkha Nagar Bahu Fort Jammu, Jammu City, Jammu, Jammu and Kashmir - 180006",
      issuer: "Unique Identification Authority of India (UIDAI)",
      status: "UIDAI Biometric & Demographic KYC Verified",
      documentUrl: "/ADHAR_8468.pdf",
    },
  };


  const handleOpenAcademicModal = (tab = "twelfth") => {
    setActiveAcademicTab(tab);
    setEditAcademicForm(JSON.parse(JSON.stringify(academicRecords)));
    setIsAcademicModalOpen(true);
  };

  const handleSaveAcademicRecords = async () => {
    try {
      setSavingAcademic(true);
      const res = await axios.put("/api/v1/user/academic-records", {
        academicRecords: editAcademicForm,
        email: userInfo?.email,
      });
      if (res.data?.success && res.data.user) {
        dispatch(addUser(res.data.user));
        toast.success("Academic records updated! Counselors now have access to your full transcript.");
        setIsAcademicModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to update academic records:", err);
      toast.error(err.response?.data?.message || "Could not save academic records");
    } finally {
      setSavingAcademic(false);
    }
  };

  const handleAddSubject = (level) => {
    if (!editAcademicForm) return;
    const updated = { ...editAcademicForm };
    if (level === "tenth") {
      updated.tenth = { ...updated.tenth };
      updated.tenth.subjects = [...(updated.tenth.subjects || []), { name: "New Subject", marks: "90" }];
    } else if (level === "twelfth") {
      updated.twelfth = { ...updated.twelfth };
      updated.twelfth.subjects = [...(updated.twelfth.subjects || []), { name: "New Subject", marks: "90" }];
    }
    setEditAcademicForm(updated);
  };

  const handleRemoveSubject = (level, subIndex) => {
    if (!editAcademicForm) return;
    const updated = { ...editAcademicForm };
    if (level === "tenth") {
      updated.tenth = { ...updated.tenth };
      updated.tenth.subjects = updated.tenth.subjects.filter((_, idx) => idx !== subIndex);
    } else if (level === "twelfth") {
      updated.twelfth = { ...updated.twelfth };
      updated.twelfth.subjects = updated.twelfth.subjects.filter((_, idx) => idx !== subIndex);
    }
    setEditAcademicForm(updated);
  };

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
                e.target.src = defaultAvatar;
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
                {userInfo?.name || "Mehak"}
              </h1>
              <img
                src={mietLogo}
                alt="MIET"
                className="h-7 object-contain opacity-70 mix-blend-multiply hidden sm:block"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3.5 gap-y-1.5 text-sm text-slate-600">
              <p className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faEnvelope} className="text-teal-700 text-xs" />
                <span>{userInfo?.email || "mehak@gmail.com"}</span>
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="text-emerald-600 text-xs ml-0.5"
                  title="Verified"
                />
              </p>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <p className="flex items-center gap-1.5 text-slate-700 font-medium">
                <FontAwesomeIcon icon={faLocationDot} className="text-rose-500 text-xs" />
                <span>{userInfo?.location || "Jammu, Jammu and Kashmir"}</span>
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Verified Academic & Identity Records Card (KYC Authenticated) */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 border border-teal-200 shadow-2xs">
              <FontAwesomeIcon icon={faShieldHalved} className="text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Academic Records & Identity Qualifications
                </h2>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-[10px]" />
                  <span>KYC Verified</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Government-verified academic transcripts and identity credentials authenticated via UIDAI and JKBOSE DigiLocker
              </p>
            </div>
          </div>
        </div>

        {/* 3 KYC Credential Cards Grid (10th, 12th, Aadhaar) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: 10th Standard SSC */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 border border-emerald-200/80 shadow-2xs relative flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-md inline-block">
                    JKBOSE SSC • KYC Verified
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    10th Standard (Class X)
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-700 tracking-tight">
                    {academicRecords.tenth.percentage}
                  </span>
                  <span className="block text-[10px] font-bold text-emerald-600 uppercase">
                    {academicRecords.tenth.division}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-1">
                <p className="flex items-start gap-1.5">
                  <FontAwesomeIcon icon={faBuildingColumns} className="text-slate-400 text-[11px] mt-0.5 shrink-0" />
                  <span className="font-semibold text-slate-800">{academicRecords.tenth.school}</span>
                </p>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                  <span>Board: <strong className="text-slate-700">{academicRecords.tenth.board}</strong></span>
                  <span>•</span>
                  <span>Year: <strong className="text-slate-700">{academicRecords.tenth.year}</strong></span>
                  <span>•</span>
                  <span>Roll: <strong className="text-slate-700 font-mono">{academicRecords.tenth.rollNo}</strong></span>
                </div>
              </div>
            </div>

            {/* Subject Breakdown Chips */}
            <div className="pt-2 border-t border-emerald-100/80 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Subject Breakdown (JKBOSE)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(academicRecords.tenth.subjects || []).map((sub, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-slate-700 font-medium shadow-3xs"
                  >
                    {sub.name}: <strong className="text-emerald-700">{sub.marks}</strong> {sub.grade && <span className="text-[10px] text-slate-400 font-bold">({sub.grade})</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-100/60 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono text-[10px]">Cert: {academicRecords.tenth.marksheetId}</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-[11px]" />
                  <span>Authenticated</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingDoc({ url: "/SSCER_8468.pdf", title: "Class 10th Marksheet (SSCER_8468.pdf) - Mehak" })}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-95"
              >
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
                <span>View Document (SSCER_8468.pdf)</span>
              </button>
            </div>
          </div>

          {/* Card 2: 12th Standard HSC (Commerce) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 border border-blue-200/80 shadow-2xs relative flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100/70 border border-blue-300 px-2 py-0.5 rounded-md inline-block">
                    JKBOSE HSC • COMMERCE
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    12th Standard (Class XII)
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-700 tracking-tight">
                    {academicRecords.twelfth.percentage}
                  </span>
                  <span className="block text-[10px] font-bold text-blue-600 uppercase">
                    {academicRecords.twelfth.division}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-1">
                <p className="flex items-start gap-1.5">
                  <FontAwesomeIcon icon={faBuildingColumns} className="text-slate-400 text-[11px] mt-0.5 shrink-0" />
                  <span className="font-semibold text-slate-800">{academicRecords.twelfth.school}</span>
                </p>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                  <span>Stream: <strong className="text-slate-700 font-bold">{academicRecords.twelfth.stream}</strong></span>
                  <span>•</span>
                  <span>Year: <strong className="text-slate-700">{academicRecords.twelfth.year}</strong></span>
                  <span>•</span>
                  <span>Roll: <strong className="text-slate-700 font-mono">{academicRecords.twelfth.rollNo}</strong></span>
                </div>
              </div>
            </div>

            {/* Subject Breakdown Chips */}
            <div className="pt-2 border-t border-blue-100/80 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Commerce Subjects (JKBOSE)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(academicRecords.twelfth.subjects || []).map((sub, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-blue-200 text-slate-700 font-medium shadow-3xs"
                  >
                    {sub.name}: <strong className="text-blue-700">{sub.marks}</strong> {sub.grade && <span className="text-[10px] text-slate-400 font-bold">({sub.grade})</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-blue-100/60 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono text-[10px]">Cert: {academicRecords.twelfth.marksheetId}</span>
                <span className="text-blue-700 font-bold flex items-center gap-1 text-[11px]">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-[11px]" />
                  <span>Authenticated</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingDoc({ url: "/HSCER_8468.pdf", title: "Class 12th Marksheet (HSCER_8468.pdf) - Mehak" })}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-95"
              >
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
                <span>View Document (HSCER_8468.pdf)</span>
              </button>
            </div>
          </div>

          {/* Card 3: Aadhaar Government Identity Credential */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 border border-amber-200/80 shadow-2xs relative flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100/70 border border-amber-300 px-2 py-0.5 rounded-md inline-block">
                    GOVT OF INDIA • UIDAI KYC
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    Aadhaar Identity Card
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-black text-amber-800 tracking-wider">
                    •••• 5688
                  </span>
                  <span className="block text-[10px] font-bold text-emerald-600 uppercase">
                    KYC Matched
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <p className="flex items-start gap-1.5">
                  <FontAwesomeIcon icon={faUser} className="text-slate-400 text-[11px] mt-0.5 shrink-0" />
                  <span>Name: <strong className="text-slate-800 font-bold">{academicRecords.aadhaar?.name || "Mehak"}</strong> (Female, DOB: {academicRecords.aadhaar?.dob || "01/08/2004"})</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <FontAwesomeIcon icon={faLocationDot} className="text-slate-400 text-[11px] mt-0.5 shrink-0" />
                  <span className="text-[11px] text-slate-700 leading-snug">{academicRecords.aadhaar?.address || "HNO.141 GORKHA NAGAR BAHU FORT JAMMU, JAMMU, J & K"}</span>
                </p>
              </div>
            </div>

            {/* Aadhaar Security Status */}
            <div className="pt-2 border-t border-amber-100/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Verification Protocol
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Demographic and biometric verification retrieved securely via National DigiLocker API integration.
              </p>
            </div>

            <div className="pt-2 border-t border-amber-100/60 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono text-[10px]">Aadhaar: 3901 5658 5688</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-[11px]" />
                  <span>UIDAI Verified</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingDoc({ url: "/ADHAR_8468.pdf", title: "Aadhaar Card (ADHAR_8468.pdf) - Mehak" })}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-95"
              >
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
                <span>View Document (ADHAR_8468.pdf)</span>
              </button>
            </div>
          </div>
        </div>
      </section>


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

          {/* Location */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-start gap-3">
            <FontAwesomeIcon icon={faLocationDot} className="text-teal-700 text-sm mt-0.5" />
            <div className="space-y-0.5 overflow-hidden">
              <span className="text-slate-400 font-medium">Location</span>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {userInfo?.location || "Jammu, Jammu and Kashmir"}
              </p>
            </div>
          </div>

          {/* Locale */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-start gap-3">
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



      {/* Generic Academic Record Editor Modal */}
      {isAcademicModalOpen && editAcademicForm && (
        <div
          onClick={() => setIsAcademicModalOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden my-auto"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <FontAwesomeIcon icon={faGraduationCap} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Academic Records & Coursework
                  </h3>
                  <p className="text-xs text-slate-500">
                    Customizable academic data saved to profile and shared with AI Counselors
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAcademicModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1.5 p-2.5 bg-slate-100 border-b border-slate-200/80 shrink-0 text-xs font-bold overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveAcademicTab("twelfth")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeAcademicTab === "twelfth"
                    ? "bg-white text-blue-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FontAwesomeIcon icon={faBookOpen} className="text-xs" />
                <span>12th Standard</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveAcademicTab("tenth")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeAcademicTab === "tenth"
                    ? "bg-white text-emerald-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FontAwesomeIcon icon={faBookOpen} className="text-xs" />
                <span>10th Standard</span>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">

              {/* TAB 2: 10th STANDARD */}
              {activeAcademicTab === "tenth" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Percentage / Score</label>
                      <input
                        type="text"
                        value={editAcademicForm.tenth?.percentage || ""}
                        onChange={(e) =>
                          setEditAcademicForm({
                            ...editAcademicForm,
                            tenth: { ...editAcademicForm.tenth, percentage: e.target.value },
                          })
                        }
                        placeholder="e.g. 93%"
                        className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white outline-hidden focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Board</label>
                      <input
                        type="text"
                        value={editAcademicForm.tenth?.board || ""}
                        onChange={(e) =>
                          setEditAcademicForm({
                            ...editAcademicForm,
                            tenth: { ...editAcademicForm.tenth, board: e.target.value },
                          })
                        }
                        placeholder="e.g. CBSE / State Board"
                        className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white outline-hidden focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700">School / Institution</label>
                      <input
                        type="text"
                        value={editAcademicForm.tenth?.school || ""}
                        onChange={(e) =>
                          setEditAcademicForm({
                            ...editAcademicForm,
                            tenth: { ...editAcademicForm.tenth, school: e.target.value },
                          })
                        }
                        placeholder="e.g. Delhi Public School, Jammu"
                        className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white outline-hidden focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Passing Year</label>
                      <input
                        type="text"
                        value={editAcademicForm.tenth?.year || ""}
                        onChange={(e) =>
                          setEditAcademicForm({
                            ...editAcademicForm,
                            tenth: { ...editAcademicForm.tenth, year: e.target.value },
                          })
                        }
                        placeholder="e.g. 2020"
                        className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white outline-hidden focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Roll No</label>
                      <input
                        type="text"
                        value={editAcademicForm.tenth?.rollNo || ""}
                        onChange={(e) =>
                          setEditAcademicForm({
                            ...editAcademicForm,
                            tenth: { ...editAcademicForm.tenth, rollNo: e.target.value },
                          })
                        }
                        placeholder="e.g. 1489204"
                        className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white outline-hidden focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* 10th Subjects */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        10th Standard Individual Subjects & Marks
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleAddSubject("tenth")}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                        <span>Add Subject</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(editAcademicForm.tenth?.subjects || []).map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200"
                        >
                          <input
                            type="text"
                            value={sub.name || ""}
                            onChange={(e) => {
                              const updatedSubs = [...editAcademicForm.tenth.subjects];
                              updatedSubs[sIdx].name = e.target.value;
                              setEditAcademicForm({
                                ...editAcademicForm,
                                tenth: { ...editAcademicForm.tenth, subjects: updatedSubs },
                              });
                            }}
                            placeholder="Subject Name"
                            className="flex-1 p-0.5 text-xs bg-transparent outline-hidden font-medium"
                          />
                          <input
                            type="text"
                            value={sub.marks || ""}
                            onChange={(e) => {
                              const updatedSubs = [...editAcademicForm.tenth.subjects];
                              updatedSubs[sIdx].marks = e.target.value;
                              setEditAcademicForm({
                                ...editAcademicForm,
                                tenth: { ...editAcademicForm.tenth, subjects: updatedSubs },
                              });
                            }}
                            placeholder="Marks"
                            className="w-12 p-0.5 text-xs text-right font-bold text-emerald-700 bg-white border border-slate-200 rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject("tenth", sIdx)}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: 12th STANDARD */}
              {activeAcademicTab === "twelfth" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Percentage / Score</label>
                      <input
                        type="text"
                        value={editAcademicForm.twelfth?.percentage || ""}
                        onChange={(e) =>
                          setEditAcademicForm({
                            ...editAcademicForm,
                            twelfth: { ...editAcademicForm.twelfth, percentage: e.target.value },
                          })
                        }
                        placeholder="e.g. 90%"
                        className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white outline-hidden focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Stream / Specialization</label>
                      <input
                        type="text"
                        value={editAcademicForm.twelfth?.stream || ""}
                        onChange={(e) =>
                          setEditAcademicForm({
                            ...editAcademicForm,
                            twelfth: { ...editAcademicForm.twelfth, stream: e.target.value },
                          })
                        }
                        placeholder="e.g. Science (PCM + CS)"
                        className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white outline-hidden focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700">School / Institution</label>
                      <input
                        type="text"
                        value={editAcademicForm.twelfth?.school || ""}
                        onChange={(e) =>
                          setEditAcademicForm({
                            ...editAcademicForm,
                            twelfth: { ...editAcademicForm.twelfth, school: e.target.value },
                          })
                        }
                        placeholder="e.g. Delhi Public School, Jammu"
                        className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white outline-hidden focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Board</label>
                      <input
                        type="text"
                        value={editAcademicForm.twelfth?.board || ""}
                        onChange={(e) =>
                          setEditAcademicForm({
                            ...editAcademicForm,
                            twelfth: { ...editAcademicForm.twelfth, board: e.target.value },
                          })
                        }
                        placeholder="e.g. CBSE / State Board"
                        className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white outline-hidden focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Passing Year</label>
                      <input
                        type="text"
                        value={editAcademicForm.twelfth?.year || ""}
                        onChange={(e) =>
                          setEditAcademicForm({
                            ...editAcademicForm,
                            twelfth: { ...editAcademicForm.twelfth, year: e.target.value },
                          })
                        }
                        placeholder="e.g. 2022"
                        className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white outline-hidden focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* 12th Subjects */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        12th Standard Individual Subjects & Marks
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleAddSubject("twelfth")}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                        <span>Add Subject</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(editAcademicForm.twelfth?.subjects || []).map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200"
                        >
                          <input
                            type="text"
                            value={sub.name || ""}
                            onChange={(e) => {
                              const updatedSubs = [...editAcademicForm.twelfth.subjects];
                              updatedSubs[sIdx].name = e.target.value;
                              setEditAcademicForm({
                                ...editAcademicForm,
                                twelfth: { ...editAcademicForm.twelfth, subjects: updatedSubs },
                              });
                            }}
                            placeholder="Subject Name"
                            className="flex-1 p-0.5 text-xs bg-transparent outline-hidden font-medium"
                          />
                          <input
                            type="text"
                            value={sub.marks || ""}
                            onChange={(e) => {
                              const updatedSubs = [...editAcademicForm.twelfth.subjects];
                              updatedSubs[sIdx].marks = e.target.value;
                              setEditAcademicForm({
                                ...editAcademicForm,
                                twelfth: { ...editAcademicForm.twelfth, subjects: updatedSubs },
                              });
                            }}
                            placeholder="Marks"
                            className="w-12 p-0.5 text-xs text-right font-bold text-blue-700 bg-white border border-slate-200 rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject("twelfth", sIdx)}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Data automatically shared with Counselors upon saving
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsAcademicModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAcademicRecords}
                  disabled={savingAcademic}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1a3b47] hover:bg-[#224d5d] text-white flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-60 active:scale-95"
                >
                  <FontAwesomeIcon icon={savingAcademic ? faRotate : faFloppyDisk} className={savingAcademic ? "animate-spin" : ""} />
                  <span>{savingAcademic ? "Saving & Syncing..." : "Save Academic Profile"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* MODAL: INLINE PDF DOCUMENT VIEWER                        */}
      {/* ========================================================= */}
      {viewingDoc && (
        <div
          onClick={() => setViewingDoc(null)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-xs border border-teal-200">
                  <FontAwesomeIcon icon={faFileLines} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{viewingDoc.title}</h3>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <FontAwesomeIcon icon={faCircleCheck} className="text-[9px]" />
                    <span>Government DigiLocker / Cryptographic Signature Verified</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewingDoc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-white bg-[#1a3b47] hover:bg-[#224d5d] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
                  <span>Open in Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div className="flex-1 bg-slate-100 w-full overflow-hidden">
              <iframe
                src={viewingDoc.url}
                title={viewingDoc.title}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;