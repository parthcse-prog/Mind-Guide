import { Link, useLocation } from "react-router-dom";
import headIcon from "../assets/headerIcon.png";
import { useSelector } from "react-redux";

const Header = () => {
  const userInfo = useSelector((state) => state.mindGuide.userInfo);
  const location = useLocation();

  const isLinkActive = (path) => location.pathname === path;

  return (
    <header className="bg-[#1a3b47] text-white py-4 px-6 md:px-12 sticky top-0 z-40 border-b border-white/10 font-['Manrope']">
      <div className="max-w-[1366px] mx-auto flex justify-between items-center">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={headIcon} alt="Mind Guide Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-extrabold tracking-tight text-white hover:text-teal-300 transition-colors">
              Mind Guide
            </h1>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-10 font-medium text-base">
          <a
            href="/#secTwo"
            className="hover:text-teal-300 transition-colors relative group py-2"
          >
            About Us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-300 transition-all group-hover:w-full"></span>
          </a>
          <Link
            to="/counselors"
            className={`transition-colors relative group py-2 ${
              isLinkActive("/counselors")
                ? "text-teal-300 font-bold border-b-2 border-teal-300"
                : "hover:text-teal-300"
            }`}
          >
            Counselors
            {!isLinkActive("/counselors") && (
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-300 transition-all group-hover:w-full"></span>
            )}
          </Link>
          {/* <Link
            to="/tools"
            className={`transition-colors relative group py-2 ${
              isLinkActive("/tools")
                ? "text-teal-300 font-bold border-b-2 border-teal-300"
                : "hover:text-teal-300"
            }`}
          >
            Tools
            {!isLinkActive("/tools") && (
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-300 transition-all group-hover:w-full"></span>
            )}
          </Link> */}
        </nav>

        {/* User Profile / Login Pill */}
        <Link to={userInfo ? "/account/dashboard" : "/login"}>
          <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all active:scale-95">
            {userInfo ? (
              <>
                <span className="text-sm font-semibold truncate max-w-[120px]">
                  {userInfo.name}
                </span>
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-teal-500 shadow-sm flex-shrink-0">
                  <img
                    src={userInfo.pic}
                    alt={userInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </>
            ) : (
              <span className="flex items-center gap-2 text-sm font-semibold text-teal-300 hover:text-white transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <span>Login</span>
              </span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
