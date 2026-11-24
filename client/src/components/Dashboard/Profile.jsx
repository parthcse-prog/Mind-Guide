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
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);
  const [activeAcademicTab, setActiveAcademicTab] = useState("college");
  const [editAcademicForm, setEditAcademicForm] = useState(null);
  const [savingAcademic, setSavingAcademic] = useState(false);
  const [expandedSemesters, setExpandedSemesters] = useState(true);

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

  const profilePic = isFemale
    ? "/female-avatar.svg"
    : userInfo?.picture && !userInfo.picture.includes("534528741775")
    ? userInfo.picture
    : userInfo?.pic && !userInfo.pic.includes("534528741775")
    ? userInfo.pic
    : defaultAvatar;

  const locale = userInfo?.locale || "en-IN (English)";

  const academicRecords = userInfo?.academicRecords || {
    tenth: {
      standard: "10th Standard (Secondary Examination)",
      percentage: "93%",
      board: "CBSE",
      school: "Delhi Public School, Jammu",
      year: "2020",
      rollNo: "1489204",
      marksheetId: "CBSE-X-2020-93821",
      status: "Verified by DigiLocker",
      subjects: [
        { name: "Mathematics", marks: "95" },
        { name: "Science", marks: "94" },
        { name: "English Language & Lit.", marks: "92" },
        { name: "Social Science", marks: "91" },
        { name: "Hindi Course A", marks: "93" },
      ],
    },
    twelfth: {
      standard: "12th Standard (Senior Secondary Examination)",
      percentage: "90%",
      stream: "Science (PCM with Computer Science)",
      board: "CBSE",
      school: "Delhi Public School, Jammu",
      year: "2022",
      rollNo: "2489204",
      marksheetId: "CBSE-XII-2022-90142",
      status: "Verified by DigiLocker",
      subjects: [
        { name: "Computer Science", marks: "96" },
        { name: "Mathematics", marks: "91" },
        { name: "Physics", marks: "89" },
        { name: "Chemistry", marks: "88" },
        { name: "English Core", marks: "92" },
      ],
    },
    college: {
      degree: "B.Tech Computer Science & Engineering",
      institution: "Model Institute of Engineering & Technology (MIET), Jammu",
      currentCgpa: "8.84 CGPA",
      semester: "7th Semester",
      enrollmentNo: "MIET/CSE/2022/041",
      status: "Active MIET Student",
      stream: "Computer Science & Engineering",
      semesters: [
        {
          sem: "Semester 1",
          sgpa: "8.60",
          credits: "22",
          status: "Completed",
          subjects: [
            { name: "Engineering Mathematics I", marks: "88" },
            { name: "Engineering Physics", marks: "85" },
            { name: "Basic Electrical Engg.", marks: "84" },
            { name: "Programming in C", marks: "90" },
          ],
        },
        {
          sem: "Semester 2",
          sgpa: "8.75",
          credits: "22",
          status: "Completed",
          subjects: [
            { name: "Engineering Mathematics II", marks: "89" },
            { name: "Data Structures & Algorithms", marks: "92" },
            { name: "Digital Electronics", marks: "86" },
            { name: "Python for Engineers", marks: "91" },
          ],
        },
        {
          sem: "Semester 3",
          sgpa: "8.85",
          credits: "24",
          status: "Completed",
          subjects: [
            { name: "Object-Oriented Programming (Java)", marks: "93" },
            { name: "Discrete Mathematical Structures", marks: "87" },
            { name: "Computer Organization & Arch.", marks: "86" },
            { name: "Database Management Systems", marks: "92" },
          ],
        },
        {
          sem: "Semester 4",
          sgpa: "8.70",
          credits: "24",
          status: "Completed",
          subjects: [
            { name: "Operating Systems", marks: "88" },
            { name: "Design & Analysis of Algorithms", marks: "94" },
            { name: "Theory of Computation", marks: "82" },
            { name: "Software Engineering & Agile", marks: "89" },
          ],
        },
        {
          sem: "Semester 5",
          sgpa: "9.05",
          credits: "24",
          status: "Completed",
          subjects: [
            { name: "Computer Networks", marks: "91" },
            { name: "Web Technologies & MERN Stack", marks: "97" },
            { name: "Artificial Intelligence Foundations", marks: "92" },
            { name: "Cloud Computing & DevOps", marks: "88" },
          ],
        },
        {
          sem: "Semester 6",
          sgpa: "8.90",
          credits: "24",
          status: "Completed",
          subjects: [
            { name: "Machine Learning & Neural Nets", marks: "90" },
            { name: "Information Security & Cryptography", marks: "87" },
            { name: "Distributed Systems", marks: "89" },
            { name: "Full-Stack Capstone Project I", marks: "95" },
          ],
        },
        {
          sem: "Semester 7",
          sgpa: "8.95",
          credits: "20",
          status: "In Progress / Current",
          subjects: [
            { name: "Deep Learning & Generative AI", marks: "93" },
            { name: "Scalable Microservices Architecture", marks: "91" },
            { name: "Major Project Phase II", marks: "96" },
          ],
        },
      ],
    },
  };

  const digiLocker = userInfo?.digiLocker || {
    isLinked: true,
    digiLockerId: "DL-JAMMU-984210",
    lastSynced: "24 Nov 2026, 11:30 AM",
    fakeAadhaar: "7342 9180 4892",
    maskedAadhaar: "•••• •••• 4892",
    issuedDocuments: [
      {
        docType: "Aadhaar Card",
        issuer: "Unique Identification Authority of India (UIDAI)",
        verifiedDate: "14 Aug 2021",
        docId: "UIDAI-AADH-4892",
        uri: "in.gov.uidai.aadhaar",
      },
      {
        docType: "Class X Marksheet (93%)",
        issuer: "Central Board of Secondary Education (CBSE)",
        verifiedDate: "18 Jul 2020",
        docId: "CBSE-X-2020-1489204",
        uri: "in.gov.cbse.cert.x",
      },
      {
        docType: "Class XII Marksheet (90%)",
        issuer: "Central Board of Secondary Education (CBSE)",
        verifiedDate: "22 Jul 2022",
        docId: "CBSE-XII-2022-2489204",
        uri: "in.gov.cbse.cert.xii",
      },
      {
        docType: "College Enrollment & Bonafide",
        issuer: "MIET Jammu Academic Registry",
        verifiedDate: "05 Sep 2022",
        docId: "MIET-ENR-2022-CS041",
        uri: "in.edu.mietjammu.student",
      },
    ],
  };

  const handleCopyAadhaar = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(digiLocker.fakeAadhaar);
      toast.info("Aadhaar Number copied to clipboard");
    }
  };

  const handleOpenAcademicModal = (tab = "college") => {
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

  const handleAddSubject = (level, semIndex = null) => {
    if (!editAcademicForm) return;
    const updated = { ...editAcademicForm };
    if (level === "tenth") {
      updated.tenth = { ...updated.tenth };
      updated.tenth.subjects = [...(updated.tenth.subjects || []), { name: "New Subject", marks: "90" }];
    } else if (level === "twelfth") {
      updated.twelfth = { ...updated.twelfth };
      updated.twelfth.subjects = [...(updated.twelfth.subjects || []), { name: "New Subject", marks: "90" }];
    } else if (level === "semester" && semIndex !== null) {
      updated.college = { ...updated.college };
      const sems = [...(updated.college.semesters || [])];
      sems[semIndex] = {
        ...sems[semIndex],
        subjects: [...(sems[semIndex].subjects || []), { name: "New Course", marks: "85" }],
      };
      updated.college.semesters = sems;
    }
    setEditAcademicForm(updated);
  };

  const handleRemoveSubject = (level, subIndex, semIndex = null) => {
    if (!editAcademicForm) return;
    const updated = { ...editAcademicForm };
    if (level === "tenth") {
      updated.tenth = { ...updated.tenth };
      updated.tenth.subjects = updated.tenth.subjects.filter((_, idx) => idx !== subIndex);
    } else if (level === "twelfth") {
      updated.twelfth = { ...updated.twelfth };
      updated.twelfth.subjects = updated.twelfth.subjects.filter((_, idx) => idx !== subIndex);
    } else if (level === "semester" && semIndex !== null) {
      updated.college = { ...updated.college };
      const sems = [...(updated.college.semesters || [])];
      sems[semIndex] = {
        ...sems[semIndex],
        subjects: sems[semIndex].subjects.filter((_, idx) => idx !== subIndex),
      };
      updated.college.semesters = sems;
    }
    setEditAcademicForm(updated);
  };

  const handleAddSemester = () => {
    if (!editAcademicForm) return;
    const updated = { ...editAcademicForm };
    updated.college = { ...updated.college };
    const currentSems = updated.college.semesters || [];
    const nextNum = currentSems.length + 1;
    updated.college.semesters = [
      ...currentSems,
      {
        sem: `Semester ${nextNum}`,
        sgpa: "9.00",
        credits: "20",
        status: "In Progress / Current",
        subjects: [
          { name: "Elective Specialization", marks: "90" },
          { name: "Major Project Phase II", marks: "94" },
        ],
      },
    ];
    setEditAcademicForm(updated);
  };

  const handleRemoveSemester = (semIndex) => {
    if (!editAcademicForm) return;
    const updated = { ...editAcademicForm };
    updated.college = { ...updated.college };
    updated.college.semesters = (updated.college.semesters || []).filter((_, idx) => idx !== semIndex);
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
          </div>
        </div>
      </section>



      {/* Verified Academic Records Card */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-200 shadow-2xs">
              <FontAwesomeIcon icon={faGraduationCap} className="text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Academic Records & Qualifications
                </h2>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-[10px]" />
                  <span>DigiLocker Verified</span>
                </span>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                  Synced to Counselors
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Generic & editable academic trajectory (10th, 12th, and semester-wise higher education) used by counselors for personalized guidance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => handleOpenAcademicModal("college")}
              className="text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Edit marks, semesters and courses"
            >
              <FontAwesomeIcon icon={faPen} className="text-teal-600 text-xs" />
              <span>Edit Records</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenAcademicModal("college")}
              className="text-xs font-bold text-white bg-[#1a3b47] hover:bg-[#224d5d] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
              title="Add a new semester or qualification"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              <span>Add Semester</span>
            </button>
          </div>
        </div>

        {/* 10th and 12th Standard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 10th Standard Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 border border-emerald-200/80 shadow-2xs relative flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2.5 py-0.5 rounded-md inline-block">
                      Secondary Examination
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenAcademicModal("tenth")}
                      className="text-slate-400 hover:text-emerald-700 p-1 text-xs transition-colors cursor-pointer"
                      title="Edit 10th Standard Marks"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    10th Standard (Class X)
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-700 tracking-tight">
                    {academicRecords.tenth.percentage}
                  </span>
                  <span className="block text-[10px] font-bold text-emerald-600 uppercase">
                    Distinction
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-1">
                <p className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faBuildingColumns} className="text-slate-400 text-[11px]" />
                  <span className="font-semibold text-slate-800">{academicRecords.tenth.school}</span>
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                  <span>Board: <strong className="text-slate-700">{academicRecords.tenth.board}</strong></span>
                  <span>•</span>
                  <span>Passing Year: <strong className="text-slate-700">{academicRecords.tenth.year}</strong></span>
                  <span>•</span>
                  <span>Roll No: <strong className="text-slate-700">{academicRecords.tenth.rollNo}</strong></span>
                </div>
              </div>
            </div>

            {/* Subject Breakdown Chips */}
            <div className="pt-2 border-t border-emerald-100/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Subject Scores (Out of 100)
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenAcademicModal("tenth")}
                  className="text-[10px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  + Add / Edit Subjects
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(academicRecords.tenth.subjects || []).map((sub, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-slate-700 font-medium shadow-3xs"
                  >
                    {sub.name}: <strong className="text-emerald-700">{sub.marks}</strong>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-400 font-mono text-[10px]">Cert ID: {academicRecords.tenth.marksheetId}</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <FontAwesomeIcon icon={faCircleCheck} className="text-[11px]" />
                <span>Verified</span>
              </span>
            </div>
          </div>

          {/* 12th Standard Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 border border-blue-200/80 shadow-2xs relative flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 border border-blue-300 px-2.5 py-0.5 rounded-md inline-block">
                      Senior Secondary
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenAcademicModal("twelfth")}
                      className="text-slate-400 hover:text-blue-700 p-1 text-xs transition-colors cursor-pointer"
                      title="Edit 12th Standard Marks"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    12th Standard (Class XII)
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-700 tracking-tight">
                    {academicRecords.twelfth.percentage}
                  </span>
                  <span className="block text-[10px] font-bold text-blue-600 uppercase">
                    Distinction
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-1">
                <p className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faBuildingColumns} className="text-slate-400 text-[11px]" />
                  <span className="font-semibold text-slate-800">{academicRecords.twelfth.school}</span>
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                  <span>Stream: <strong className="text-slate-700">{academicRecords.twelfth.stream}</strong></span>
                  <span>•</span>
                  <span>Board: <strong className="text-slate-700">{academicRecords.twelfth.board}</strong></span>
                  <span>•</span>
                  <span>Passing Year: <strong className="text-slate-700">{academicRecords.twelfth.year}</strong></span>
                </div>
              </div>
            </div>

            {/* Subject Breakdown Chips */}
            <div className="pt-2 border-t border-blue-100/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Subject Scores (Out of 100)
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenAcademicModal("twelfth")}
                  className="text-[10px] font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  + Add / Edit Subjects
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(academicRecords.twelfth.subjects || []).map((sub, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-blue-200 text-slate-700 font-medium shadow-3xs"
                  >
                    {sub.name}: <strong className="text-blue-700">{sub.marks}</strong>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-400 font-mono text-[10px]">Cert ID: {academicRecords.twelfth.marksheetId}</span>
              <span className="text-blue-700 font-bold flex items-center gap-1">
                <FontAwesomeIcon icon={faCircleCheck} className="text-[11px]" />
                <span>Verified</span>
              </span>
            </div>
          </div>
        </div>

        {/* Current Degree (MIET College Record) */}
        <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-50/60 shadow-xs">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/70 bg-white">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                <img src={mietLogo} alt="MIET" className="h-7 object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {academicRecords.college.degree}
                  </h4>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                    {academicRecords.college.semester}
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-0.5">
                  {academicRecords.college.institution} • Enrollment: <strong className="text-slate-700 font-mono">{academicRecords.college.enrollmentNo}</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:text-right">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Cumulative CGPA</span>
                <span className="text-base font-black text-teal-700 tracking-tight">{academicRecords.college.currentCgpa}</span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAcademicModal("college")}
                className="p-2 text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Edit Degree & Semesters"
              >
                <FontAwesomeIcon icon={faPen} className="text-xs" />
              </button>
            </div>
          </div>

          {/* Semester-wise Academic Performance Accordion */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLayerGroup} className="text-teal-700 text-xs" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Semester-wise Performance & Coursework ({(academicRecords.college.semesters || []).length} Semesters)
                </h5>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAcademicModal("college")}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                  <span>Add Semester</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedSemesters(!expandedSemesters)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white border border-slate-200 transition-colors cursor-pointer"
                >
                  <span>{expandedSemesters ? "Collapse" : "Expand All"}</span>
                  <FontAwesomeIcon icon={expandedSemesters ? faChevronUp : faChevronDown} className="text-[10px]" />
                </button>
              </div>
            </div>

            {expandedSemesters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {(academicRecords.college.semesters || []).map((semObj, semIdx) => (
                  <div
                    key={semIdx}
                    className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-2.5 group"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block">
                          {semObj.sem}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Credits: {semObj.credits || "22"} • {semObj.status || "Completed"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                          SGPA {semObj.sgpa}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenAcademicModal("college")}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-teal-700 transition-opacity cursor-pointer"
                          title="Edit Semester"
                        >
                          <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                        </button>
                      </div>
                    </div>

                    {/* Semester Subjects */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Coursework & Grades:
                      </span>
                      <div className="flex flex-col gap-1">
                        {(semObj.subjects || []).map((course, cIdx) => (
                          <div
                            key={cIdx}
                            className="flex items-center justify-between text-[11px] bg-slate-50/70 px-2 py-0.5 rounded-md border border-slate-100"
                          >
                            <span className="text-slate-700 truncate pr-2 font-medium" title={course.name}>
                              {course.name}
                            </span>
                            <span className="font-bold text-teal-700 shrink-0">
                              {course.marks}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Quick Add Semester Card */}
                <div
                  onClick={() => handleOpenAcademicModal("college")}
                  className="p-5 rounded-xl border border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/30 hover:bg-teal-50/70 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] group"
                >
                  <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                  </div>
                  <span className="text-xs font-bold text-teal-800">
                    Add Next Semester
                  </span>
                  <span className="text-[11px] text-teal-600 mt-0.5">
                    Click to add semester SGPA & courses
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DigiLocker Verified Identity & Document Vault */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            {/* DigiLocker Official Styled Emblem */}
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm relative overflow-hidden shrink-0">
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-500"></div>
              <span>DL</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>DigiLocker Identity & Document Vault</span>
                </h2>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>DigiLocker Linked</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Government-verified digital credentials and Aadhaar ID retrieved securely from DigiLocker National Locker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500">
            <span>Last Synced: <strong className="text-slate-700">{digiLocker.lastSynced}</strong></span>
          </div>
        </div>

        {/* Aadhaar Card Security Row with Password-Style Reveal */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#102a33] to-slate-900 text-white shadow-sm relative overflow-hidden">
          {/* Subtle Tri-color decorative accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-500"></div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm text-amber-300">
                <FontAwesomeIcon icon={faIdCard} className="text-xl" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Government of India • UIDAI
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    Aadhaar Verified
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  Aadhaar Identity (DigiLocker Pulled)
                </h3>
                <p className="text-xs text-slate-300">
                  Linked to student account: <span className="text-white font-medium">{userInfo?.name || "Umika Sharma"}</span> (DOB: {dob})
                </p>
              </div>
            </div>

            {/* Password-style Masked Aadhaar Box */}
            <div className="bg-white/10 border border-white/15 backdrop-blur-md px-4 py-2.5 rounded-xl flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-start">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-300 font-medium">Aadhaar Number (Hashed & Protected)</span>
                <span className="text-base font-mono font-bold tracking-widest text-emerald-300 select-all">
                  {showAadhaar ? digiLocker.fakeAadhaar : digiLocker.maskedAadhaar}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pl-2 border-l border-white/15">
                <button
                  type="button"
                  onClick={() => setShowAadhaar(!showAadhaar)}
                  className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                  title={showAadhaar ? "Hide Aadhaar" : "Reveal Aadhaar"}
                >
                  <FontAwesomeIcon icon={showAadhaar ? faEyeSlash : faEye} className="text-xs" />
                </button>
                <button
                  type="button"
                  onClick={handleCopyAadhaar}
                  className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                  title="Copy Aadhaar"
                >
                  <FontAwesomeIcon icon={faCopy} className="text-xs" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Issued Documents Grid from DigiLocker */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Issued Documents from DigiLocker ({(digiLocker.issuedDocuments || []).length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Digitally Signed & Tamper-Evident</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(digiLocker.issuedDocuments || []).map((doc, dIdx) => (
              <div
                key={dIdx}
                onClick={() => setSelectedDoc(doc)}
                className="p-3.5 rounded-xl bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-300 transition-all flex items-start justify-between gap-3 cursor-pointer group shadow-3xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FontAwesomeIcon icon={faFileLines} className="text-sm" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h4 className="text-xs font-extrabold text-slate-900 truncate group-hover:text-blue-900">
                      {doc.docType}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {doc.issuer}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                      <span>Issued: {doc.verifiedDate}</span>
                      <span>•</span>
                      <span className="font-mono">{doc.docId}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md px-1.5 py-0.5 text-[10px] font-bold">
                  <FontAwesomeIcon icon={faCircleCheck} className="mr-1 text-[9px]" />
                  <span>Verified</span>
                </div>
              </div>
            ))}
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

      {/* DigiLocker Document Verification Modal */}
      {selectedDoc && (
        <div
          onClick={() => setSelectedDoc(null)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  DL
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    DigiLocker Verified Document
                  </h3>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <FontAwesomeIcon icon={faCircleCheck} className="text-[9px]" />
                    <span>Cryptographically Signed by Issuer</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Document Name</span>
                <p className="font-bold text-slate-900 text-sm">{selectedDoc.docType}</p>
                <p className="text-slate-600 text-[11px]">{selectedDoc.issuer}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Certificate ID</span>
                  <span className="font-mono font-bold text-slate-800 truncate block">{selectedDoc.docId}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Verification Date</span>
                  <span className="font-bold text-slate-800">{selectedDoc.verifiedDate}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-600" />
                  <span>National Academic Depository / UIDAI Authenticated</span>
                </div>
                <p className="text-[10px] text-emerald-700">
                  This digital credential was issued directly into student DigiLocker Account ({digiLocker.digiLockerId}) and carries PKI digital signature validity under the Information Technology Act.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedDoc(null)}
              className="w-full py-2.5 bg-[#1a3b47] hover:bg-[#224d5d] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close Verification Certificate
            </button>
          </div>
        </div>
      )}

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
                onClick={() => setActiveAcademicTab("college")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeAcademicTab === "college"
                    ? "bg-white text-teal-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FontAwesomeIcon icon={faBuildingColumns} className="text-xs" />
                <span>College / Semesters</span>
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
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              {/* TAB 1: COLLEGE / DEGREE / SEMESTERS */}
              {activeAcademicTab === "college" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Degree / Qualification</label>
                      <input
                        type="text"
                        value={editAcademicForm.college?.degree || ""}
                        onChange={(e) =>
                          setEditAcademicForm({
                            ...editAcademicForm,
                            college: { ...editAcademicForm.college, degree: e.target.value },
                          })
                        }
                        placeholder="e.g. B.Tech Computer Science & Engineering"
                        className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white outline-hidden focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Institution / College</label>
                      <input
                        type="text"
                        value={editAcademicForm.college?.institution || ""}
                        onChange={(e) =>
                          setEditAcademicForm({
                            ...editAcademicForm,
                            college: { ...editAcademicForm.college, institution: e.target.value },
                          })
                        }
                        placeholder="e.g. MIET Jammu"
                        className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white outline-hidden focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Cumulative CGPA</label>
                      <input
                        type="text"
                        value={editAcademicForm.college?.currentCgpa || ""}
                        onChange={(e) =>
                          setEditAcademicForm({
                            ...editAcademicForm,
                            college: { ...editAcademicForm.college, currentCgpa: e.target.value },
                          })
                        }
                        placeholder="e.g. 8.84 CGPA"
                        className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white outline-hidden focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Current Semester</label>
                      <input
                        type="text"
                        value={editAcademicForm.college?.semester || ""}
                        onChange={(e) =>
                          setEditAcademicForm({
                            ...editAcademicForm,
                            college: { ...editAcademicForm.college, semester: e.target.value },
                          })
                        }
                        placeholder="e.g. 7th Semester"
                        className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white outline-hidden focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Semesters Manager */}
                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        Semester-wise SGPA & Subjects ({(editAcademicForm.college?.semesters || []).length})
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddSemester}
                        className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                        <span>Add Semester</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(editAcademicForm.college?.semesters || []).map((semItem, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <input
                                type="text"
                                value={semItem.sem || `Semester ${sIdx + 1}`}
                                onChange={(e) => {
                                  const updatedSems = [...editAcademicForm.college.semesters];
                                  updatedSems[sIdx].sem = e.target.value;
                                  setEditAcademicForm({
                                    ...editAcademicForm,
                                    college: { ...editAcademicForm.college, semesters: updatedSems },
                                  });
                                }}
                                className="w-28 p-1 font-bold bg-white border border-slate-300 rounded-md text-xs"
                              />
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400 text-[10px]">SGPA:</span>
                                <input
                                  type="text"
                                  value={semItem.sgpa || ""}
                                  onChange={(e) => {
                                    const updatedSems = [...editAcademicForm.college.semesters];
                                    updatedSems[sIdx].sgpa = e.target.value;
                                    setEditAcademicForm({
                                      ...editAcademicForm,
                                      college: { ...editAcademicForm.college, semesters: updatedSems },
                                    });
                                  }}
                                  placeholder="8.8"
                                  className="w-16 p-1 font-bold text-teal-700 bg-white border border-slate-300 rounded-md text-xs"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400 text-[10px]">Credits:</span>
                                <input
                                  type="text"
                                  value={semItem.credits || ""}
                                  onChange={(e) => {
                                    const updatedSems = [...editAcademicForm.college.semesters];
                                    updatedSems[sIdx].credits = e.target.value;
                                    setEditAcademicForm({
                                      ...editAcademicForm,
                                      college: { ...editAcademicForm.college, semesters: updatedSems },
                                    });
                                  }}
                                  placeholder="22"
                                  className="w-14 p-1 bg-white border border-slate-300 rounded-md text-xs"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveSemester(sIdx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer self-end sm:self-auto"
                              title="Delete Semester"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>

                          {/* Subjects in this Semester */}
                          <div className="space-y-1.5 pl-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                              <span>Courses & Grades:</span>
                              <button
                                type="button"
                                onClick={() => handleAddSubject("semester", sIdx)}
                                className="text-teal-700 hover:underline font-bold text-[10px] cursor-pointer"
                              >
                                + Add Course
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(semItem.subjects || []).map((course, cIdx) => (
                                <div
                                  key={cIdx}
                                  className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200"
                                >
                                  <input
                                    type="text"
                                    value={course.name || ""}
                                    onChange={(e) => {
                                      const updatedSems = [...editAcademicForm.college.semesters];
                                      updatedSems[sIdx].subjects[cIdx].name = e.target.value;
                                      setEditAcademicForm({
                                        ...editAcademicForm,
                                        college: { ...editAcademicForm.college, semesters: updatedSems },
                                      });
                                    }}
                                    placeholder="Course title"
                                    className="flex-1 p-0.5 text-xs outline-hidden"
                                  />
                                  <input
                                    type="text"
                                    value={course.marks || ""}
                                    onChange={(e) => {
                                      const updatedSems = [...editAcademicForm.college.semesters];
                                      updatedSems[sIdx].subjects[cIdx].marks = e.target.value;
                                      setEditAcademicForm({
                                        ...editAcademicForm,
                                        college: { ...editAcademicForm.college, semesters: updatedSems },
                                      });
                                    }}
                                    placeholder="Marks/Grade"
                                    className="w-12 p-0.5 text-xs text-right font-bold text-teal-700 outline-hidden border-l border-slate-200 pl-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSubject("semester", cIdx, sIdx)}
                                    className="text-slate-300 hover:text-red-500 p-0.5 cursor-pointer text-xs"
                                  >
                                    <FontAwesomeIcon icon={faXmark} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

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
    </div>
  );
};

export default Profile;