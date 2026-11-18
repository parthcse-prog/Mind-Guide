import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeUser, addUser } from "../../redux/mindGuideSlice";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faCakeCandles,
  faFingerprint,
  faGlobe,
  faShieldHalved,
  faCircleCheck,
  faPen,
  faCheck,
  faXmark,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import googleIcon from "../../assets/google.png";
import mietLogo from "../../assets/MIET Logos/miet-logo-dark.png";

const Profile = () => {
  const userInfo = useSelector((state) => state.mindGuide.userInfo);
  const dispatch = useDispatch();

  const [isEditingDob, setIsEditingDob] = useState(false);
  const [dob, setDob] = useState(userInfo?.dob || "15 August 2003");
  const [loadingDob, setLoadingDob] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post("/api/v1/user/logout");
      dispatch(removeUser());
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSaveDob = async () => {
    setLoadingDob(true);
    try {
      const response = await axios.post("/api/v1/user/google-login", {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.pic,
        dob: dob,
      });
      dispatch(addUser(response.data));
      setIsEditingDob(false);
      toast.success("Birthday updated");
    } catch (err) {
      console.error("Failed to update DOB:", err);
      toast.error("Could not update birthday");
    } finally {
      setLoadingDob(false);
    }
  };

  const createdAtDate = new Date(userInfo?.createdAt || Date.now());
  const formattedCreatedAt =
    createdAtDate.getDate() +
    " " +
    createdAtDate.toLocaleString("default", { month: "long" }) +
    " " +
    createdAtDate.getFullYear();

  const profilePic =
    userInfo?.picture && !userInfo.picture.includes("534528741775")
      ? userInfo.picture
      : userInfo?.pic && !userInfo.pic.includes("534528741775")
      ? userInfo.pic
      : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop";

  const googleId =
    userInfo?.googleId ||
    userInfo?._id ||
    "114829375829104820194";

  const locale = userInfo?.locale || "en-IN (English)";

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-['Manrope'] pb-12">
      {/* Account Identity Card */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            <img
              src={profilePic}
              alt={userInfo?.name || "User"}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-200"
            />
            <div
              className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full border border-slate-200 shadow-xs"
              title="Google Account"
            >
              <img src={googleIcon} alt="Google" className="w-4 h-4 object-contain" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {userInfo?.name || "Parth Sharma"}
              </h1>
              <img
                src={mietLogo}
                alt="MIET"
                className="h-7 object-contain opacity-70 mix-blend-multiply hidden sm:block"
              />
            </div>

            <p className="text-sm text-slate-600 flex items-center justify-center sm:justify-start gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-teal-700 text-xs" />
              <span>{userInfo?.email || "user@mietjammu.in"}</span>
              <FontAwesomeIcon
                icon={faCircleCheck}
                className="text-emerald-600 text-xs ml-0.5"
                title="Verified"
              />
            </p>

            <p className="text-xs text-slate-400">
              Member since {formattedCreatedAt}
            </p>
          </div>
        </div>
      </section>

      {/* Verified Google Account Attributes */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <img src={googleIcon} alt="Google" className="w-4 h-4 object-contain" />
            <span>Account Details</span>
          </h2>
          <span className="text-xs text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg">
            Google Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Full Name */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-start gap-3">
            <FontAwesomeIcon icon={faUser} className="text-teal-700 text-sm mt-0.5" />
            <div className="space-y-0.5 overflow-hidden">
              <span className="text-slate-400 font-medium">Name</span>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {userInfo?.name || "Parth Sharma"}
              </p>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-start gap-3">
            <FontAwesomeIcon icon={faCakeCandles} className="text-teal-700 text-sm mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Date of Birth</span>
                <button
                  type="button"
                  onClick={() => setIsEditingDob(!isEditingDob)}
                  className="text-teal-700 hover:text-teal-900 font-semibold"
                >
                  <FontAwesomeIcon icon={isEditingDob ? faXmark : faPen} className="mr-1" />
                  {isEditingDob ? "Cancel" : "Edit"}
                </button>
              </div>

              {isEditingDob ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    placeholder="e.g. 15 August 2003"
                    className="p-1.5 text-xs border border-teal-500 rounded-lg outline-hidden w-full font-semibold bg-white"
                  />
                  <button
                    onClick={handleSaveDob}
                    disabled={loadingDob}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shrink-0"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-900">
                  {dob}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-start gap-3">
            <FontAwesomeIcon icon={faEnvelope} className="text-teal-700 text-sm mt-0.5" />
            <div className="space-y-0.5 overflow-hidden">
              <span className="text-slate-400 font-medium">Email</span>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {userInfo?.email || "user@mietjammu.in"}
              </p>
            </div>
          </div>

          {/* Google ID */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-start gap-3">
            <FontAwesomeIcon icon={faFingerprint} className="text-teal-700 text-sm mt-0.5" />
            <div className="space-y-0.5 overflow-hidden">
              <span className="text-slate-400 font-medium">Google ID</span>
              <p className="text-xs font-mono font-semibold text-slate-800 truncate">
                {googleId}
              </p>
            </div>
          </div>

          {/* Locale */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-start gap-3">
            <FontAwesomeIcon icon={faGlobe} className="text-teal-700 text-sm mt-0.5" />
            <div className="space-y-0.5 overflow-hidden">
              <span className="text-slate-400 font-medium">Locale</span>
              <p className="text-sm font-semibold text-slate-900">
                {locale}
              </p>
            </div>
          </div>

          {/* Security */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex items-start gap-3">
            <FontAwesomeIcon icon={faShieldHalved} className="text-teal-700 text-sm mt-0.5" />
            <div className="space-y-0.5 overflow-hidden">
              <span className="text-slate-400 font-medium">Security</span>
              <p className="text-sm font-semibold text-slate-900">
                OAuth 2.0 Single Sign-On
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Saarthi.ai with MIET Jammu</span>
          <button
            onClick={handleLogout}
            className="text-slate-600 hover:text-red-700 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>Sign out</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Profile;
