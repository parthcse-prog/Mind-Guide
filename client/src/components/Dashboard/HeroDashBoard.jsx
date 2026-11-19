import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartColumn,
  faChartPie,
  faChartLine,
  faCalendarDays,
  faUserCheck,
  faFileLines,
  faFilter,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";

Chart.register(...registerables);

// Counselors and report categories in Saarthi
const COUNSELORS = [
  "Dr. Alex",
  "Maya Lin",
  "Ethan Rostova",
  "Marcus Cole",
];

const REPORT_CATEGORIES = [
  "Career & Academic Roadmap",
  "Emotional Wellness & Stress Audit",
  "Relationship & Interpersonal Reflection",
  "Confidence & Ambition Assessment",
  "General Session Report",
];

const CATEGORY_META = {
  "Career & Academic Roadmap": { short: "Roadmap", color: "#0f766e" },
  "Emotional Wellness & Stress Audit": { short: "Wellness", color: "#3b82f6" },
  "Relationship & Interpersonal Reflection": { short: "Relationships", color: "#8b5cf6" },
  "Confidence & Ambition Assessment": { short: "Confidence", color: "#f59e0b" },
  "General Session Report": { short: "General", color: "#10b981" },
};

// Helper to generate realistic historical mock data anchored to today
const generateMockHistory = () => {
  const sessions = [];
  const reports = [];
  const now = new Date();

  // Pattern of mock sessions and reports over the last 30 days
  const mockSchedule = [
    { daysAgo: 28, count: 3, counselor: "Dr. Alex", report: "Career & Academic Roadmap" },
    { daysAgo: 25, count: 2, counselor: "Maya Lin", report: "Emotional Wellness & Stress Audit" },
    { daysAgo: 22, count: 4, counselor: "Marcus Cole", report: null },
    { daysAgo: 20, count: 2, counselor: "Dr. Alex", report: "General Session Report" },
    { daysAgo: 17, count: 5, counselor: "Ethan Rostova", report: "Relationship & Interpersonal Reflection" },
    { daysAgo: 14, count: 3, counselor: "Maya Lin", report: "Emotional Wellness & Stress Audit" },
    { daysAgo: 11, count: 6, counselor: "Dr. Alex", report: "Career & Academic Roadmap" },
    { daysAgo: 8, count: 4, counselor: "Marcus Cole", report: "Confidence & Ambition Assessment" },
    { daysAgo: 6, count: 3, counselor: "Ethan Rostova", report: null },
    { daysAgo: 4, count: 5, counselor: "Dr. Alex", report: "General Session Report" },
    { daysAgo: 2, count: 6, counselor: "Maya Lin", report: "Emotional Wellness & Stress Audit" },
    { daysAgo: 1, count: 8, counselor: "Dr. Alex", report: "Career & Academic Roadmap" },
    { daysAgo: 0, count: 4, counselor: "Marcus Cole", report: "Confidence & Ambition Assessment" },
  ];

  mockSchedule.forEach((item) => {
    const d = new Date(now);
    d.setDate(d.getDate() - item.daysAgo);
    d.setHours(12, 0, 0, 0);

    for (let i = 0; i < item.count; i++) {
      sessions.push({
        date: new Date(d.getTime() + i * 3600000),
        counselor: item.counselor,
      });
    }

    if (item.report) {
      reports.push({
        date: d,
        title: item.report,
        counselor: item.counselor,
      });
    }
  });

  return { sessions, reports };
};

const HeroDashBoard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [timeRange, setTimeRange] = useState("30"); // "7", "14", "30"
  const [selectedCounselor, setSelectedCounselor] = useState("all");
  const useMockData = true;
  const [chartMode, setChartMode] = useState("doughnut"); // "doughnut" or "pie"

  // Fetch real user data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/v1/user/userDashboard");
      if (data && data.user) {
        setUserData(data.user);
      }
    } catch (err) {
      console.warn("Could not fetch user dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Merge real user data with mock dataset
  const combinedData = useMemo(() => {
    const mock = generateMockHistory();

    const cleanCounselorName = (name) => {
      if (!name) return "Dr. Alex";
      if (name.includes("Alex")) return "Dr. Alex";
      if (name.includes("Maya")) return "Maya Lin";
      if (name.includes("Ethan")) return "Ethan Rostova";
      if (name.includes("Marcus")) return "Marcus Cole";
      return name;
    };

    const realSessions = (userData?.sessionHistory || []).map((s) => ({
      date: new Date(s.date),
      counselor: cleanCounselorName(s.counselor),
    }));
    const realReports = (userData?.reportHistory || []).map((r) => ({
      date: new Date(r.date),
      title: r.title || "General Session Report",
      counselor: cleanCounselorName(r.counselor),
    }));

    if (!useMockData) {
      return {
        sessions: realSessions,
        reports: realReports,
      };
    }

    return {
      sessions: [...mock.sessions, ...realSessions],
      reports: [...mock.reports, ...realReports],
    };
  }, [userData, useMockData]);

  // Apply active filters (Time range & Counselor)
  const filteredData = useMemo(() => {
    const cutoffDays = parseInt(timeRange, 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - cutoffDays);
    cutoffDate.setHours(0, 0, 0, 0);

    const filteredSessions = combinedData.sessions.filter((s) => {
      const matchDate = new Date(s.date) >= cutoffDate;
      const matchCounselor =
        selectedCounselor === "all" || s.counselor === selectedCounselor;
      return matchDate && matchCounselor;
    });

    const filteredReports = combinedData.reports.filter((r) => {
      const matchDate = new Date(r.date) >= cutoffDate;
      const matchCounselor =
        selectedCounselor === "all" || r.counselor === selectedCounselor;
      return matchDate && matchCounselor;
    });

    return {
      sessions: filteredSessions,
      reports: filteredReports,
    };
  }, [combinedData, timeRange, selectedCounselor]);

  // Generate continuous timeline labels for the selected time range
  const timelineDates = useMemo(() => {
    const days = parseInt(timeRange, 10);
    const dates = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d);
    }
    return dates;
  }, [timeRange]);

  // Format date helper for chart labels
  const formatDateLabel = (d) => {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // 1. Bar Chart Data (Sessions Attended per Day)
  const barChartData = useMemo(() => {
    const countsMap = {};
    filteredData.sessions.forEach((s) => {
      const key = formatDateLabel(new Date(s.date));
      countsMap[key] = (countsMap[key] || 0) + 1;
    });

    const labels = timelineDates.map(formatDateLabel);
    const data = labels.map((label) => countsMap[label] || 0);

    return {
      labels,
      datasets: [
        {
          label: "Sessions Attended",
          data,
          backgroundColor: "rgba(13, 148, 136, 0.75)",
          hoverBackgroundColor: "rgba(15, 118, 110, 0.95)",
          borderColor: "rgba(13, 148, 136, 1)",
          borderWidth: 1.5,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [filteredData.sessions, timelineDates]);

  // 2. Pie / Doughnut Chart Data & Unified One-Line Legend
  const { pieChartData, reportLegend } = useMemo(() => {
    const categoryMap = {};
    REPORT_CATEGORIES.forEach((cat) => (categoryMap[cat] = 0));

    filteredData.reports.forEach((r) => {
      const title = r.title || "General Session Report";
      categoryMap[title] = (categoryMap[title] || 0) + 1;
    });

    const activeCategories = Object.keys(categoryMap).filter((k) => categoryMap[k] > 0);
    const data = activeCategories.map((k) => categoryMap[k]);
    const colors = activeCategories.map(
      (k) => CATEGORY_META[k]?.color || "#0f766e"
    );
    const total = data.reduce((a, b) => a + b, 0);

    const legend = activeCategories.map((k, idx) => ({
      fullTitle: k,
      shortLabel: CATEGORY_META[k]?.short || k,
      color: colors[idx],
      count: categoryMap[k],
      percent: total > 0 ? Math.round((categoryMap[k] / total) * 100) : 0,
    }));

    return {
      reportLegend: legend,
      pieChartData: {
        labels: activeCategories.length > 0 ? activeCategories : ["No Reports"],
        datasets: [
          {
            label: "Reports Created",
            data: data.length > 0 ? data : [0],
            backgroundColor: colors.length > 0 ? colors : ["#cbd5e1"],
            borderColor: "#ffffff",
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
    };
  }, [filteredData.reports]);

  // 3. Line Chart Data (Sessions vs Reports Comparison)
  const lineChartData = useMemo(() => {
    const sessionMap = {};
    filteredData.sessions.forEach((s) => {
      const key = formatDateLabel(new Date(s.date));
      sessionMap[key] = (sessionMap[key] || 0) + 1;
    });

    const reportMap = {};
    filteredData.reports.forEach((r) => {
      const key = formatDateLabel(new Date(r.date));
      reportMap[key] = (reportMap[key] || 0) + 1;
    });

    const labels = timelineDates.map(formatDateLabel);
    const sessionsData = labels.map((l) => sessionMap[l] || 0);
    const reportsData = labels.map((l) => reportMap[l] || 0);

    return {
      labels,
      datasets: [
        {
          label: "Sessions Attended",
          data: sessionsData,
          fill: true,
          borderColor: "#0284c7",
          backgroundColor: "rgba(2, 132, 199, 0.12)",
          tension: 0.35,
          pointRadius: 3.5,
          pointBackgroundColor: "#0284c7",
          pointHoverRadius: 6,
        },
        {
          label: "Reports Generated",
          data: reportsData,
          fill: false,
          borderColor: "#f43f5e",
          backgroundColor: "rgba(244, 63, 94, 0.12)",
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#f43f5e",
          pointHoverRadius: 6,
        },
      ],
    };
  }, [filteredData, timelineDates]);

  // Common Chart.js styling options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0c242c",
        padding: 10,
        cornerRadius: 8,
        titleFont: { family: "Plus Jakarta Sans", size: 12, weight: "bold" },
        bodyFont: { family: "Plus Jakarta Sans", size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: "Plus Jakarta Sans", size: 10 },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(226, 232, 240, 0.6)" },
        ticks: {
          precision: 0,
          font: { family: "Plus Jakarta Sans", size: 10 },
        },
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          font: { family: "Plus Jakarta Sans", size: 11, weight: "600" },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "#0c242c",
        padding: 10,
        cornerRadius: 8,
        titleFont: { family: "Plus Jakarta Sans", size: 12, weight: "bold" },
        bodyFont: { family: "Plus Jakarta Sans", size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: "Plus Jakarta Sans", size: 10 },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(226, 232, 240, 0.6)" },
        ticks: {
          precision: 0,
          font: { family: "Plus Jakarta Sans", size: 10 },
        },
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: chartMode === "doughnut" ? "62%" : "0%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0c242c",
        padding: 10,
        cornerRadius: 8,
        titleFont: { family: "Plus Jakarta Sans", size: 12, weight: "bold" },
        bodyFont: { family: "Plus Jakarta Sans", size: 12 },
        callbacks: {
          label: function (context) {
            const val = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? Math.round((val / total) * 100) : 0;
            return ` ${context.label}: ${val} (${pct}%)`;
          },
        },
      },
    },
  };

  // Calculate summary metrics
  const totalSessions = filteredData.sessions.length;
  const totalReports = filteredData.reports.length;
  const counselorCounts = filteredData.sessions.reduce((acc, s) => {
    acc[s.counselor] = (acc[s.counselor] || 0) + 1;
    return acc;
  }, {});
  const topCounselor =
    Object.entries(counselorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "Dr. Alex";

  return (
    <div className="w-full flex flex-col gap-6 font-['Plus_Jakarta_Sans'] pb-12">
      {/* Dashboard Top Header & Control Toolbar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              Analytics & Insights
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-['Manrope']">
            Overview & Engagement Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Monitor sessions attended, counseling reports generated, and avatar interaction trends.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Pills */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            {[
              { label: "7 Days", value: "7" },
              { label: "14 Days", value: "14" },
              { label: "30 Days", value: "30" },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setTimeRange(btn.value)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === btn.value
                    ? "bg-white text-teal-900 shadow-xs font-extrabold"
                    : "hover:text-slate-900"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Counselor Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedCounselor}
              onChange={(e) => setSelectedCounselor(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold py-2 pl-3 pr-8 rounded-xl cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Companions</option>
              {COUNSELORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <FontAwesomeIcon
              icon={faFilter}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* KPI Overview Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sessions Attended
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faChartColumn} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-['Manrope']">
              {totalSessions}
            </div>
            <div className="text-[11px] text-teal-700 font-semibold mt-0.5 flex items-center gap-1">
              <FontAwesomeIcon icon={faBolt} className="text-[10px]" />
              <span>In selected {timeRange} days</span>
            </div>
          </div>
        </div>

        {/* Total Reports */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reports Created
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faFileLines} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-['Manrope']">
              {totalReports}
            </div>
            <div className="text-[11px] text-rose-600 font-semibold mt-0.5">
              Across active modules
            </div>
          </div>
        </div>

        {/* Top Counselor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Top Companion
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faUserCheck} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-black text-slate-900 truncate font-['Manrope']" title={topCounselor}>
              {topCounselor.split(" ")[0]} {topCounselor.split(" ")[1] || ""}
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-0.5 truncate">
              Highest engagement
            </div>
          </div>
        </div>

        {/* Consistency Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Days
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faCalendarDays} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-['Manrope']">
              {new Set(filteredData.sessions.map((s) => new Date(s.date).toDateString())).size}
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
              Days with activity
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sessions Attended Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-xs">
                <FontAwesomeIcon icon={faChartColumn} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Sessions Attended
                </h2>
                <span className="text-[11px] text-slate-400">
                  Daily conversation volume
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
              {totalSessions} Total
            </span>
          </div>

          <div className="h-56 w-full">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Reports Created Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xs">
                <FontAwesomeIcon icon={faChartPie} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Reports Created
                </h2>
                <span className="text-[11px] text-slate-400">
                  Breakdown by category
                </span>
              </div>
            </div>

            {/* Doughnut vs Pie toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setChartMode("doughnut")}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  chartMode === "doughnut" ? "bg-white text-slate-900 shadow-2xs font-extrabold" : ""
                }`}
              >
                Donut
              </button>
              <button
                type="button"
                onClick={() => setChartMode("pie")}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  chartMode === "pie" ? "bg-white text-slate-900 shadow-2xs font-extrabold" : ""
                }`}
              >
                Pie
              </button>
            </div>
          </div>

          <div className="h-44 w-full flex items-center justify-center my-auto">
            {chartMode === "doughnut" ? (
              <Doughnut data={pieChartData} options={doughnutChartOptions} />
            ) : (
              <Pie data={pieChartData} options={doughnutChartOptions} />
            )}
          </div>

          {/* Unified horizontal one-line legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 pt-3 border-t border-slate-100">
            {reportLegend.map((item, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
                title={`${item.fullTitle}: ${item.count} reports (${item.percent}%)`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.shortLabel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sessions vs Reports Trend Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xs">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Sessions vs Reports
                </h2>
                <span className="text-[11px] text-slate-400">
                  Timeline correlation
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              Trend
            </span>
          </div>

          <div className="h-56 w-full">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDashBoard;
