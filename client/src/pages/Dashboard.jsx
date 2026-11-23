import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableColumns,
  faFileLines,
  faRoute,
  faUser,
  faBriefcase,
  faBars,
  faXmark,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    {
      title: "Dashboard",
      icon: faTableColumns,
      link: "",
    },
    {
      title: "Roadmap",
      icon: faRoute,
      link: "./getRoadmap",
    },
    {
      title: "Reports",
      icon: faFileLines,
      link: "./reports",
    },
    {
      title: "Profile",
      icon: faUser,
      link: "./profile",
    },
  ];

  const location = useLocation();
  const currentTab = location.pathname.split("/")[3];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans relative">
      {/* Floating Hamburger Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-40 bg-[#0c242c] text-white hover:bg-[#122b35] p-2.5 rounded-xl shadow-lg border border-white/10 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500"
        title={isOpen ? "Close sidebar" : "Open navigation menu"}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        <FontAwesomeIcon icon={isOpen ? faXmark : faBars} className="text-teal-400 text-sm" />
        <span className="hidden sm:inline">{isOpen ? "Hide Menu" : "Menu"}</span>
      </button>

      {/* Dimmed Backdrop when open on mobile/tablet */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 transition-opacity"
        />
      )}

      {/* Collapsible / Slide-out Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0c242c] text-white p-5 flex flex-col gap-2 z-40 shadow-2xl border-r border-slate-800/50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 px-2 pt-3 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-teal-400 block mb-0.5">
              Overview
            </span>
            <h2 className="text-lg font-bold tracking-tight text-white">Navigation</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5">
          {options.map((option, i) => {
            const isActive =
              (!currentTab && option.link === "") ||
              `./${currentTab}` === option.link;

            return (
              <Link
                key={i}
                to={option.link}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white/15 text-white shadow-xs border border-white/10"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FontAwesomeIcon icon={option.icon} className="text-sm text-teal-400 w-4" />
                <span>{option.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Outlet Area */}
      <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8 overflow-y-auto w-full transition-all">
        <div className="max-w-[1200px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;