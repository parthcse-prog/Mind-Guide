import { Link, Outlet, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableColumns,
  faFileLines,
  faRoute,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const Dashboard = () => {
  const options = [
    {
      title: "Dashboard",
      icon: faTableColumns,
      link: "",
    },
    {
      title: "Reports",
      icon: faFileLines,
      link: "./reports",
    },
    {
      title: "Roadmap",
      icon: faRoute,
      link: "./getRoadmap",
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
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0c242c] text-white p-5 flex flex-col gap-2 sticky top-0 h-screen shadow-md border-r border-slate-800/50">
        <div className="mb-4 px-2 pt-2">
          <span className="text-xs uppercase font-bold tracking-wider text-teal-400 block mb-1">
            Overview
          </span>
          <h2 className="text-lg font-bold tracking-tight text-white">Navigation</h2>
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
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-[1000px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;