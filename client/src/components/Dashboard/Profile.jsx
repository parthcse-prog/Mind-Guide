import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../../redux/mindGuideSlice";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const userInfo = useSelector((state) => state.mindGuide.userInfo);
  const dispatch = useDispatch();

  const [personalityData, setPersonalityData] = React.useState(null);
  const [aiSummary, setAiSummary] = React.useState(null);
  const [loadingPersonality, setLoadingPersonality] = React.useState(true);
  const [personalityError, setPersonalityError] = React.useState(null);

  React.useEffect(() => {
    if (userInfo?.email) {
      const fetchPersonality = async () => {
        setLoadingPersonality(true);
        setPersonalityError(null);
        try {
          // We must route this through our backend proxy because PI360 servers block CORS preflight requests 
          // when we try to send the Authorization header directly from the browser.
          const res = await axios.get(
            `/api/v1/user/personality`,
            { headers: { "X-PI360-Token": userInfo.pi360Token || "" } }
          );
          
          const reportData = res.data?.report;
          const summaryData = res.data?.summary;

          if (reportData?.status === 'error') {
            setPersonalityError(reportData.message || "Error fetching report");
          } else {
            setPersonalityData(reportData?.data || reportData);
          }

          if (summaryData?.status !== 'error') {
            setAiSummary(summaryData?.data || summaryData);
          }
        } catch (err) {
          console.error("Failed to fetch personality data:", err);
          setPersonalityError(err.message || "Network Error (CORS?)");
        } finally {
          setLoadingPersonality(false);
        }
      };
      fetchPersonality();
    } else {
      setLoadingPersonality(false);
    }
  }, [userInfo?.email]);

  if (!userInfo) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await axios.post("/api/v1/user/logout");
      dispatch(removeUser());
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error in logging out", error);
    }
  };

  const createdAtDate = new Date(userInfo.createdAt || Date.now());
  const formattedCreatedAt =
    createdAtDate.getDate() +
    " " +
    createdAtDate.toLocaleString("default", { month: "long" }) +
    " " +
    createdAtDate.getFullYear();

  // Extract PI360 data object or student profile object
  const rawPi360 = userInfo.pi360Profile || userInfo.pi360Data || {};
  const pi360 =
    rawPi360.student?.[0] ||
    rawPi360.data?.student?.[0] ||
    rawPi360.data ||
    rawPi360 ||
    {};

  const profilePic =
    pi360.ProfilePictureURL ||
    pi360.avatar ||
    userInfo.pic ||
    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

  // Parse portfolio sections from ResumeDrafts OR direct API arrays (Education, Projects, Certifications, etc.)
  let cvSections = [];
  try {
    // 1. Check for ResumeDrafts or cv_drafts
    const findDrafts = (obj) => {
      if (!obj || typeof obj !== "object") return null;
      if (Array.isArray(obj.ResumeDrafts) && obj.ResumeDrafts.length > 0) return obj.ResumeDrafts;
      if (Array.isArray(obj.cv_drafts) && obj.cv_drafts.length > 0) return obj.cv_drafts;
      if (Array.isArray(obj.sections) && obj.sections.length > 0) return obj;
      for (const k of Object.keys(obj)) {
        if (obj[k] && typeof obj[k] === "object") {
          const res = findDrafts(obj[k]);
          if (res) return res;
        }
      }
      return null;
    };

    const found = findDrafts(userInfo);
    if (found) {
      if (Array.isArray(found)) {
        const latestDraft = found[found.length - 1];
        const content = latestDraft?.Content || latestDraft;
        const parsed = typeof content === "string" ? JSON.parse(content) : content;
        if (parsed?.sections && Array.isArray(parsed.sections)) {
          cvSections = parsed.sections;
        }
      } else if (found.sections && Array.isArray(found.sections)) {
        cvSections = found.sections;
      }
    }

    // 2. Direct Fallback if cvSections is still empty: construct sections from direct PI360 keys
    if (cvSections.length === 0) {
      const directMap = [
        { title: "Education", items: pi360.Education },
        { title: "Projects", items: pi360.Projects },
        { title: "Certifications", items: pi360.Certifications },
        { title: "Internships", items: pi360.Internships },
        { title: "Experience", items: pi360.Experience },
        { title: "Achievements", items: pi360.Achievements },
        { title: "Seminar", items: pi360.Seminar },
        { title: "Membership", items: pi360.Membership },
      ];

      cvSections = directMap
        .filter((sec) => Array.isArray(sec.items) && sec.items.length > 0)
        .map((sec) => ({
          title: sec.title,
          items: sec.items.map((it) => ({
            title: it.title || it.role || it.Degree || it.Course || it.ProjectTitle || it.CertificateName || "Record",
            company: it.company || it.Institute || it.Organization || "",
            date: it.date || it.Year || it.Duration || "",
            details: Array.isArray(it.details) ? it.details : [it.Description || it.Remarks || ""].filter(Boolean),
          })),
        }));
    }
  } catch (err) {
    console.error("Error parsing CV sections:", err);
  }

  // Filter basic student metadata key-values
  const basicInfo = Object.entries(pi360).filter(([key, val]) => {
    return (
      val !== null &&
      val !== undefined &&
      typeof val !== "object" &&
      !key.toLowerCase().includes("token") &&
      !key.toLowerCase().includes("url") &&
      !key.toLowerCase().includes("picture")
    );
  });

  // Safely extract Big 5 Traits from PI360 response
  let extractedTraits = {};
  if (personalityData) {
    if (personalityData?.key_metrics?.trait_scores) {
      extractedTraits = personalityData.key_metrics.trait_scores;
    } else if (personalityData?.trait_scores) {
      extractedTraits = personalityData.trait_scores;
    } else {
      const big5Keys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
      Object.entries(personalityData).forEach(([k, v]) => {
        if (big5Keys.includes(k.toLowerCase())) {
          extractedTraits[k] = v;
        }
      });
    }
    // Fallback: use top-level primitives
    if (Object.keys(extractedTraits).length === 0) {
      Object.entries(personalityData).forEach(([k, v]) => {
        if (typeof v !== 'object' && !['email', 'student_id', 'status'].includes(k.toLowerCase())) {
          extractedTraits[k] = v;
        }
      });
    }
  }

  return (
    <div className="flex flex-col gap-6 font-['Plus_Jakarta_Sans'] max-w-4xl pb-10">
      {/* Primary Profile Header Card */}
      <div className="bg-gradient-to-r from-[#f0f7f4] via-[#e7eeff] to-[#f4f0ff] rounded-3xl p-6 md:p-8 shadow-sm border border-[#e2e8f0]/60 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#acecdc] opacity-20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 shrink-0">
          <img
            src={profilePic}
            alt={userInfo.name}
            className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-white shadow-lg bg-white"
          />
        </div>

        <div className="relative z-10 flex flex-col gap-2.5 text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#4648d4]">PI360 Student Profile</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#002531] font-['Manrope'] capitalize">
                {pi360.Name || pi360.name || userInfo.name}
              </h2>
            </div>
            {pi360.accountType && (
              <span className="px-3 py-1 bg-[#4648d4]/10 text-[#4648d4] rounded-full text-xs font-bold w-fit mx-auto md:mx-0 border border-[#4648d4]/20 uppercase">
                {pi360.accountType} ({pi360.role || "student"})
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-[#002531]">
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-gray-200">
              <span className="material-symbols-outlined text-[#4648d4] text-base">mail</span>
              <span className="font-medium">{userInfo.email}</span>
            </div>

            {pi360.batch && (
              <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-gray-200">
                <span className="material-symbols-outlined text-[#4648d4] text-base">school</span>
                <span className="font-medium">Batch: {pi360.batch}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
            <span className="material-symbols-outlined text-[#002531]/50 text-sm">calendar_today</span>
            <span className="text-xs font-semibold text-[#002531]/70">
              Registered Account: {formattedCreatedAt}
            </span>
          </div>
        </div>
      </div>

      {/* PI360 Personality & AI Summary */}
      {(personalityData || aiSummary || loadingPersonality || personalityError) && (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/60 shadow-sm flex flex-col gap-6 relative overflow-hidden">
          <h3 className="text-xl font-bold text-[#002531] flex items-center gap-2 border-b border-gray-100 pb-4">
            <span className="material-symbols-outlined text-[#4648d4] text-2xl">psychology</span>
            Personality & AI Analysis
          </h3>
          
          {loadingPersonality ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4648d4]"></div>
            </div>
          ) : personalityError ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 text-center">
              {personalityError}
            </div>
          ) : (!personalityData && !aiSummary) ? (
            <div className="text-gray-500 text-sm text-center py-4">No personality data found for this account.</div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 overflow-hidden w-full">
              {/* Big 5 Traits */}
              {Object.keys(extractedTraits).length > 0 && (
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Big 5 Traits</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(extractedTraits).map(([trait, value]) => {
                      const valString = typeof value === 'object' && value !== null ? value.score || value.value || String(value) : String(value);
                      return (
                        <div key={trait} className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between items-start gap-1">
                          <span className="font-semibold text-xs text-gray-500 uppercase tracking-wide truncate w-full">{trait.replace(/_/g, " ")}</span>
                          <span className="font-bold text-base text-[#4648d4]">{valString}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Summary */}
              {aiSummary && (
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">AI Summary</h4>
                  <div className="bg-[#f0f7f4]/50 p-5 rounded-2xl border border-[#acecdc]/30 flex-1 flex items-start overflow-y-auto max-h-[300px]">
                    <p className="text-sm text-[#002531]/80 leading-relaxed italic whitespace-pre-wrap break-words w-full">
                      {(() => {
                        const summaryText = typeof aiSummary === 'string' ? aiSummary : aiSummary.ai_summary || aiSummary.summary || aiSummary.text || "";
                        if (!summaryText) return JSON.stringify(aiSummary);
                        
                        // Parse simple bold markdown **text**
                        const parts = summaryText.split(/(\*\*.*?\*\*)/g);
                        return parts.map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="font-bold text-[#002531]">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        });
                      })()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dynamic Render of Education, Projects, Experience, Internships, Certifications */}
      {cvSections.length > 0 &&
        cvSections.map((sec, idx) => {
          if (!sec.items || sec.items.length === 0) return null;
          return (
            <div
              key={idx}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-sm flex flex-col gap-4"
            >
              <h3 className="text-lg font-bold text-[#002531] flex items-center gap-2 border-b pb-3 capitalize">
                <span className="material-symbols-outlined text-[#4648d4]">
                  {sec.title.toLowerCase().includes("education")
                    ? "school"
                    : sec.title.toLowerCase().includes("project")
                    ? "code"
                    : sec.title.toLowerCase().includes("certif")
                    ? "workspace_premium"
                    : sec.title.toLowerCase().includes("intern")
                    ? "work"
                    : "star"}
                </span>
                {sec.title}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sec.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between gap-2 hover:bg-gray-100/80 transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-[#002531]">
                        {item.title || item.role || item.company || "Item"}
                      </h4>
                      {item.company && item.title && (
                        <p className="text-xs font-semibold text-[#4648d4]">{item.company}</p>
                      )}
                      {item.date && (
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">{item.date}</p>
                      )}
                    </div>

                    {item.details && Array.isArray(item.details) && item.details.filter(Boolean).length > 0 && (
                      <ul className="text-xs text-gray-600 space-y-1 mt-1 border-t pt-2">
                        {item.details.filter(Boolean).map((d, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-1.5">
                            <span className="text-[#4648d4] font-bold">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {/* Dynamic Student Records Grid */}
      {basicInfo.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-sm flex flex-col gap-4">
          <h3 className="text-lg font-bold text-[#002531] flex items-center gap-2 border-b pb-3">
            <span className="material-symbols-outlined text-[#4648d4]">badge</span>
            Student Metadata & System Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {basicInfo.map(([key, val]) => (
              <div
                key={key}
                className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 flex flex-col gap-1 transition-all hover:bg-gray-100/80"
              >
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="text-sm font-bold text-[#002531] truncate">
                  {String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-4 flex flex-col gap-4">
        <button
          onClick={handleLogout}
          className="w-full py-3.5 bg-[#002531] hover:bg-[#1a3b47] text-white rounded-full font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md group font-['Manrope']"
        >
          <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">
            logout
          </span>
          Logout
        </button>
        <p className="text-center text-xs text-[#72787b]">
          Version 2.4.1 (Stable) • Integrated PI360 Mind Guide Account
        </p>
      </div>
    </div>
  );
};

export default Profile;
