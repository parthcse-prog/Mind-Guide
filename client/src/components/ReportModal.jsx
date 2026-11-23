/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import html2pdf from "html2pdf.js";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faRoute,
  faArrowRight,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const ReportModal = ({ report, open, onClose, messages = [], language = "en" }) => {
  const contentRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [roadmapGenerating, setRoadmapGenerating] = useState(false);
  const [roadmapCreated, setRoadmapCreated] = useState(false);
  const userInfo = useSelector((state) => state.mindGuide.userInfo);
  const [contentReady, setContentReady] = useState(false);
  const { type: counsellorType } = useParams();
  const navigate = useNavigate();
  const saveReportToCloud = async () => {
    try {
      setUploading(true);
      const content = contentRef.current;
      if (content) {
        const pdfContent = content.cloneNode(true);
        const buttonsToRemove = pdfContent.querySelectorAll("button");
        buttonsToRemove.forEach((button) => button.remove());

        const pdfOptions = {
          margin: 10,
          filename: "report.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        html2pdf()
          .from(pdfContent)
          .set(pdfOptions)
          .output("blob")
          .then(function (blob) {
            const formData = new FormData();
            formData.append("file", blob, "report.pdf");
            axios
              .post(
                `/api/v1/user/uploadpdf/${encodeURIComponent(counsellorType || "General")}`,
                formData,
                {
                  withCredentials: true,
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              )
              .then((response) => {
                console.log("Server response:", response.data);
                toast.success("Report successfully uploaded");
                setUploading(false);
              })
              .catch((error) => {
                console.error("Upload error:", error.response);
                setUploading(false);
              });
          })
          .catch((pdfErr) => {
            console.error("html2pdf output error:", pdfErr);
            setUploading(false);
          });
      } else {
        setUploading(false);
      }
    } catch (e) {
      console.error("saveReportToCloud caught error:", e);
      setUploading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setContentReady(true);
    } else {
      setContentReady(false);
    }
  }, [open]);

  useEffect(() => {
    if (contentReady && open) {
      saveReportToCloud();
    }
  }, [contentReady, open]);

  const handleRoadmapCreation = async () => {
    try {
      setRoadmapGenerating(true);
      const isHindi =
        language === "hi"
          ? true
          : language === "en"
          ? false
          : messages && messages.some((m) => m.role === "user" && /[\u0900-\u097F]/.test(m.content || ""));
      toast.info(isHindi ? "आपका व्यक्तिगत विकास रोडमैप तैयार हो रहा है..." : "Generating your personalized growth roadmap...");
      const response = await axios.post("/api/v1/chat/roadmap", {
        messages: messages || [],
        chat: messages || [],
        language: isHindi ? "hi" : "en",
      });
      if (response.data?.success) {
        setRoadmapCreated(true);
        toast.success(isHindi ? "रोडमैप सफलतापूर्वक तैयार हो गया! आप इसे डैशबोर्ड में देख सकते हैं।" : "Roadmap created! You can now view it under Roadmap in Dashboard.");
      }
    } catch (error) {
      console.error("Error creating roadmap:", error);
      toast.error(error.response?.data?.message || "Failed to generate roadmap");
    } finally {
      setRoadmapGenerating(false);
    }
  };

  const handleCloseModal = () => {
    if (onClose) {
      onClose();
    }
  };

  const downloadReport = async () => {
    const content = contentRef.current;
    if (!content) return;

    try {
      toast.info("Generating PDF for download...");
      const pdfContent = content.cloneNode(true);
      const buttonsToRemove = pdfContent.querySelectorAll("button");
      buttonsToRemove.forEach((button) => button.remove());

      const pdfOptions = {
        margin: 10,
        filename: `${counsellorType || "Counselor"}_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().from(pdfContent).set(pdfOptions).save();
      toast.success("Report downloaded successfully!");
    } catch (err) {
      console.error("PDF download failed:", err);
      toast.error("Failed to download PDF. Please try again.");
    }
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleCloseModal}
        center
        closeOnOverlayClick={false}
        closeIcon={
          uploading ? null : (
            <button
              className="bg-red-700 px-3 py-1.5 rounded-xl font-bold text-white text-xs hover:bg-red-800 transition-colors"
              onClick={handleCloseModal}
            >
              Close & Return
            </button>
          )
        }
        classNames={{ modal: "custom-modal" }}
      >
        <div
          className="modal-content bg-slate-100 flex flex-col gap-2 rounded-2xl border border-slate-300 p-6 font-['Manrope']"
          ref={contentRef}
        >
          <div className="bg-[#122b35] text-white px-6 py-6 rounded-xl mb-2 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400">Official Assessment</span>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Saarthi.ai Companion Session Report</h2>
            </div>
            <div className="text-right text-xs text-slate-300">
              <span className="block font-bold text-white">{new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="text-[11px] text-teal-300">Confidential</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between text-xs text-slate-700 shadow-2xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Learner</span>
              <span className="font-bold text-slate-900 text-sm">{userInfo?.name || "Student"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Email</span>
              <span className="font-medium text-slate-800">{userInfo?.email}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Institution</span>
              <span className="font-bold text-slate-900">MIET Jammu</span>
            </div>
          </div>

          <div className="p-6 mt-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <ReactMarkdown className="flex flex-col gap-3 text-sm text-slate-700 leading-relaxed text-justify">
              {report}
            </ReactMarkdown>
          </div>
          {/* Action Toolbar - Side-by-side Layout */}
          <div className="mt-6 pt-4 border-t border-slate-300 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (uploading) {
                    toast.warning("Please wait, report is being uploaded...");
                  } else {
                    downloadReport();
                  }
                }}
                disabled={uploading}
                className={`px-4 py-2.5 text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2 ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FontAwesomeIcon icon={faDownload} />
                <span>Download Report</span>
              </button>

              <button
                type="button"
                onClick={handleRoadmapCreation}
                disabled={roadmapGenerating || uploading}
                className={`px-4 py-2.5 text-white rounded-xl font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2 ${
                  roadmapCreated
                    ? "bg-[#122b35] hover:bg-[#1a3b47]"
                    : "bg-teal-700 hover:bg-teal-800"
                } ${roadmapGenerating ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <FontAwesomeIcon
                  icon={roadmapGenerating ? faSpinner : faRoute}
                  className={roadmapGenerating ? "animate-spin" : ""}
                />
                <span>
                  {roadmapGenerating
                    ? "Generating Roadmap..."
                    : roadmapCreated
                    ? "Update Roadmap"
                    : "Create Roadmap"}
                </span>
              </button>

              {roadmapCreated && (
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                    navigate("/account/dashboard/getRoadmap");
                  }}
                  className="px-4 py-2.5 text-teal-900 bg-teal-100 hover:bg-teal-200 border border-teal-300 rounded-xl font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>View Roadmap</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-[11px]" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              className="px-3.5 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-300/60 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportModal;
