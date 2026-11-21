import { Link, useLocation, useNavigate } from "react-router-dom";
import headIcon from "../assets/Saarthi.ai Brain Network Logo.png";
import mietWhiteLogo from "../assets/MIET Logos/miet-logo-white.png";
import googleIcon from "../assets/google.png";
import { useSelector, useDispatch } from "react-redux";
import { removeUser } from "../redux/mindGuideSlice";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faTableColumns,
  faRightFromBracket,
  faRightToBracket,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

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
      toast.success("Signed out");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Logout failed");
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
    : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop";

  const userPhoto = isFemale
    ? "/female-avatar.svg"
    : userInfo?.picture && !userInfo.picture.includes("534528741775")
    ? userInfo.picture
    : userInfo?.pic && !userInfo.pic.includes("534528741775")
    ? userInfo.pic
    : defaultAvatar;

  return (
    <header className="bg-[#0c242c] text-white py-3 px-5 md:px-10 sticky top-0 z-40 border-b border-white/10 font-['Manrope']">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        {/* Brand: Saarthi.ai & MIET */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src={headIcon}
              alt="Saarthi.ai"
              className="h-10 w-auto object-contain"
            />
            <div className="leading-tight">
              <span className="text-xl font-bold tracking-tight text-white">
                Saarthi<span className="text-teal-400 font-extrabold">.ai</span>
              </span>
              <span className="block text-[11px] text-teal-300 font-medium">
                By MIET
              </span>
            </div>
          </Link>

          <div className="hidden md:block h-6 w-px bg-white/20" />

          <img
            src={mietWhiteLogo}
            alt="MIET Jammu"
            className="hidden md:block h-7 w-auto object-contain opacity-80"
          />
        </div>

        {/* Navigation Links with FontAwesome Icons */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <Link
            to="/"
            className={`py-1.5 px-3 rounded-xl flex items-center gap-2 transition-colors ${
              isLinkActive("/") || isLinkActive("/about") || isLinkActive("/overview")
                ? "bg-white/15 text-white font-semibold"
                : "text-white/75 hover:text-white hover:bg-white/5"
            }`}
          >
            <FontAwesomeIcon icon={faCircleInfo} className="text-xs text-teal-400" />
            <span>About Us</span>
          </Link>

          {userInfo && (
            <Link
              to="/chat"
              className={`py-1.5 px-3 rounded-xl flex items-center gap-2 transition-colors ${
                isLinkActive("/chat")
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/75 hover:text-white hover:bg-white/5"
              }`}
            >
              <FontAwesomeIcon icon={faComments} className="text-xs text-teal-400" />
              <span>Chat</span>
            </Link>
          )}

          {userInfo && (
            <Link
              to="/account/dashboard/profile"
              className={`py-1.5 px-3 rounded-xl flex items-center gap-2 transition-colors ${
                location.pathname.includes("/profile") || location.pathname.includes("/dashboard")
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/75 hover:text-white hover:bg-white/5"
              }`}
            >
              <FontAwesomeIcon icon={faTableColumns} className="text-xs text-teal-400" />
              <span>Profile</span>
            </Link>
          )}
        </nav>

        {/* Profile & Auth Section */}
        <div className="flex items-center gap-3 shrink-0">
          {userInfo ? (
            <>
              <Link
                to="/account/dashboard/profile"
                className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
                title="Account Profile"
              >
                <img
                  src={userPhoto}
                  alt={userInfo.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-teal-400/50"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                  }}
                />
                <span className="hidden sm:inline text-xs font-semibold text-white max-w-[120px] truncate">
                  {userInfo.name || "User"}
                </span>
                {userInfo.isGoogleAuth && (
                  <img
                    src={googleIcon}
                    alt="Google account"
                    className="w-3.5 h-3.5 object-contain"
                  />
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex items-center gap-1.5"
                title="Sign out"
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="text-xs" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-[#0c242c] font-bold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              <FontAwesomeIcon icon={faRightToBracket} className="text-xs" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
