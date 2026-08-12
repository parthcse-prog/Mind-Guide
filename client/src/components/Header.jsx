import { Link, useLocation, useNavigate } from "react-router-dom";
import headIcon from "../assets/headerIcon.png";
import { useSelector, useDispatch } from "react-redux";
import { removeUser } from "../redux/mindGuideSlice";
import axios from "axios";
import { toast } from "react-toastify";

const Header = () => {
  const userInfo = useSelector((state) => state.mindGuide.userInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLinkActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await axios.post("/api/v1/user/logout");
      dispatch(removeUser());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error in logging out", error);
      toast.error("Logout failed");
    }
  };

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
        </nav>

        {/* User Profile / Logout Section */}
        <div className="flex items-center gap-3">
          {userInfo ? (
            <>
              <Link to="/account/dashboard">
                <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all active:scale-95">
                  <span className="text-sm font-semibold truncate max-w-[120px]">
                    {userInfo.name}
                  </span>
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-teal-500 shadow-sm flex-shrink-0 bg-white/20">
                    <img
                      src={
                        userInfo.pi360Profile?.student?.[0]?.ProfilePictureURL ||
                        userInfo.pi360Data?.data?.avatar ||
                        userInfo.pi360Data?.student?.[0]?.ProfilePictureURL ||
                        userInfo.pic ||
                        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                      }
                      alt={userInfo.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
                      }}
                    />
                  </div>
                </div>
              </Link>

              {/* Header Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/30 px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
                title="Log out of account"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login">
              <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all active:scale-95">
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
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
