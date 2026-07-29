import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../../redux/mindGuideSlice";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const userInfo = useSelector((state) => state.mindGuide.userInfo);
  const dispatch = useDispatch();

  if (!userInfo) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await axios.post("/api/v1/user/logout");
      dispatch(removeUser());
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error in logging out", error);
    }
  };

  const createdAtDate = new Date(userInfo.createdAt);
  const formattedCreatedAt =
    createdAtDate.getDate() +
    " " +
    createdAtDate.toLocaleString("default", { month: "long" }) +
    " " +
    createdAtDate.getFullYear();

  return (
    <div className="flex flex-col gap-6 font-['Plus_Jakarta_Sans'] max-w-3xl">
      {/* Primary Profile Card */}
      <div className="bg-gradient-to-r from-[#f0f7f4] to-[#e7eeff] rounded-2xl p-6 md:p-8 shadow-sm border border-[#e2e8f0]/50 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#acecdc] opacity-20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          {userInfo.pic && (
            <img
              src={userInfo.pic}
              alt={userInfo.name}
              className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-white shadow-md"
            />
          )}
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-[#002531]/70">Name:</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#002531] font-['Manrope'] capitalize">
                {userInfo.name}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#002531]">
              <span className="material-symbols-outlined text-[#002531]/50 text-lg">
                mail
              </span>
              <span>{userInfo.email}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-white/70 rounded-full border border-[#c6e8f7] w-fit">
              <span className="material-symbols-outlined text-[#002531]/70 text-base">
                calendar_today
              </span>
              <span className="text-xs font-semibold text-[#002531]/80">
                Account Created: {formattedCreatedAt}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 border-t border-gray-200 flex flex-col gap-4">
        <button
          onClick={handleLogout}
          className="w-full py-3.5 bg-[#002531] hover:bg-[#1a3b47] text-white rounded-full font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md group font-['Manrope']"
        >
          <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">
            logout
          </span>
          Logout
        </button>
        <p className="text-center text-xs text-[#72787b]">
          Version 2.4.1 (Stable) • Mind Guide Account
        </p>
      </div>
    </div>
  );
};

export default Profile;
