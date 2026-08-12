import React, { useState, useEffect } from "react";
import axios from "axios";
import doc from "../../assets/google-docs.png";

const GetAllReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await axios.get("/api/v1/user/allReports");
        const sortedData = (data || []).sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setReports(sortedData);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] font-['Plus_Jakarta_Sans']">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a3b47]"></div>
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading counselor reports...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-['Plus_Jakarta_Sans'] max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3b47] via-[#002531] to-[#142834] rounded-3xl p-6 md:p-8 text-white shadow-lg border border-white/10 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#acecdc]/20 text-[#acecdc] rounded-full text-xs font-bold uppercase tracking-wider border border-[#acecdc]/30">
            Academic & Career History
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-['Manrope'] text-white">
          Session Analysis Reports
        </h1>
        <p className="text-sm text-[#85a5b3] max-w-xl">
          Automated SWOT analysis, recommendations, and roadmaps generated from your counselor interactions.
        </p>
      </div>

      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-between gap-4 group text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center p-3 border border-teal-100 group-hover:scale-105 transition-transform">
                <img
                  src={doc}
                  alt="Report Document"
                  className="h-full w-auto object-contain"
                />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="font-extrabold text-[#002531] text-base capitalize line-clamp-2 font-['Manrope']">
                  {report.title || "Academic Counselor Report"}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {report.date ? new Date(report.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Recent Session"}
                </p>
              </div>

              <a
                href={report.filePath || "#"}
                target="_blank"
                rel="noopener noreferrer"
                download={!report.filePath?.startsWith("data:") ? `${report.title || "report"}.pdf` : undefined}
                className="w-full bg-[#002531] hover:bg-[#1a3b47] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <span>View & Download Report</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-gray-400">description</span>
          <h3 className="text-lg font-bold text-[#002531]">No Counselor Reports Generated</h3>
          <p className="text-xs text-gray-500 max-w-md">
            Complete a counselor chat session in the Counselor section and click "End Session" to generate your comprehensive academic report.
          </p>
        </div>
      )}
    </div>
  );
};

export default GetAllReports;
