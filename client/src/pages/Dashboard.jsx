import { Link, Outlet, useLocation } from "react-router-dom";

const Dashboard = () => {
  const options = [
    {
      title: "Dashboard",
      icon: "dashboard",
      link: "",
    },
    {
      title: "Reports",
      icon: "description",
      link: "./reports",
    },
    {
      title: "Roadmap",
      icon: "map",
      link: "./getRoadmap",
    },
    {
      title: "Profile",
      icon: "person",
      link: "./profile",
    },
  ];

  const location = useLocation();
  const currentTab = location.pathname.split("/")[3];

  return (
    <div className="flex min-h-screen bg-[#f9f9ff] text-[#111c2c] font-['Plus_Jakarta_Sans']">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-gradient-to-b from-[#1a3b47] to-[#002531] text-white p-6 flex flex-col gap-3 sticky top-0 h-screen font-['Manrope'] shadow-xl">
        <div className="mb-4 px-2">
          <h2 className="text-xl font-bold tracking-tight text-white/90">Navigation</h2>
        </div>

        <nav className="flex flex-col gap-2">
          {options.map((option, i) => {
            const isActive =
              (!currentTab && option.link === "") ||
              `./${currentTab}` === option.link;

            return (
              <Link
                key={i}
                to={option.link}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  isActive
                    ? "bg-[#1a3b47] text-white shadow-md border border-white/10"
                    : "text-[#85a5b3] hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {option.icon}
                </span>
                <span>{option.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Progress Milestone Badge */}
        <div className="mt-auto p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-[#85a5b3] mb-2 uppercase tracking-wider font-bold">
            Your Progress
          </p>
          <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-[#afefdf] w-[65%] rounded-full"></div>
          </div>
          <p className="text-xs text-white/90 font-medium">65% to next milestone</p>
        </div>
      </aside>

      {/* Main Outlet Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
