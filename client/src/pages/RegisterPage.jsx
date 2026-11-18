import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addUser } from "../redux/mindGuideSlice";
import { GoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faUserPlus,
  faXmark,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import mietLogo from "../assets/MIET Logos/miet-logo-dark.png";
import saarthiLogo from "../assets/Saarthi.ai Brain Network Logo.png";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pic, setPic] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showClientIdConfig, setShowClientIdConfig] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(
    (() => {
      const saved = localStorage.getItem("saarthi_google_client_id");
      return (
        (saved && !saved.includes("exampleclientid") ? saved : "") ||
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        "799502808392-6ntdd1hqkpjqagf63ujn67dfstv0bvrb.apps.googleusercontent.com"
      );
    })()
  );

  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [googleAvatarUrl, setGoogleAvatarUrl] = useState(
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop"
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlePicUpload = async (e) => {
    const pics = e.target.files[0];
    if (!pics) {
      toast.error("Please select an image!");
      return;
    }
    if (
      pics.type === "image/jpeg" ||
      pics.type === "image/jpg" ||
      pics.type === "image/png"
    ) {
      setLoading(true);
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "Mind-Guide");
      data.append("cloud_name", "gvyc6qop");
      try {
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/gvyc6qop/image/upload",
          data,
          {
            withCredentials: false,
          }
        );
        toast.success("Image uploaded");
        setPic(response.data.url.toString());
      } catch (error) {
        console.log("Cloudinary upload fallback:", error);
        toast.info("Using male avatar");
        setPic(
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop"
        );
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please select a JPEG or PNG image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.warning("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post("/api/v1/user/", {
        name,
        email,
        password,
        pic:
          pic ||
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop",
      });
      dispatch(addUser(res.data));
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Register Error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/v1/user/google-login", {
        credential: credentialResponse.credential,
      });
      dispatch(addUser(response.data));
      toast.success(`Registered with Google: Welcome, ${response.data.name}!`);
      navigate("/");
    } catch (err) {
      console.error("Google authentication error:", err);
      toast.error("Could not complete Google registration");
    } finally {
      setLoading(false);
    }
  };

  const handleManualGoogleRegister = async (customProfile = null) => {
    setLoading(true);
    try {
      const payload = customProfile || {
        email: googleEmail || "parth.cse@mietjammu.in",
        name: googleName || "Parth Sharma",
        picture:
          googleAvatarUrl ||
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop",
      };

      const response = await axios.post("/api/v1/user/google-login", payload);
      dispatch(addUser(response.data));
      toast.success(`Registered with Google as ${response.data.name}`);
      setShowGoogleModal(false);
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Google registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClientId = () => {
    if (!clientIdInput.trim()) {
      localStorage.removeItem("saarthi_google_client_id");
      toast.info("Cleared Client ID");
    } else {
      localStorage.setItem("saarthi_google_client_id", clientIdInput.trim());
      toast.success("Client ID saved! Page will reload");
    }
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-10 bg-slate-100 font-sans text-slate-800">
      <div className="w-full max-w-sm bg-white rounded-2xl p-7 border border-slate-200/80 shadow-lg">
        {/* Brand Header */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <img
              src={saarthiLogo}
              alt="Saarthi.ai"
              className="h-10 w-auto object-contain"
            />
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Saarthi<span className="text-teal-600 font-extrabold">.ai</span>
            </span>
          </div>
          <img
            src={mietLogo}
            alt="MIET Jammu"
            className="h-8 object-contain mix-blend-multiply opacity-80"
          />
        </div>

        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Join Saarthi AI for mental wellness and life guidance
          </p>
        </div>

        {/* Real Google OAuth Component or One-Click Button */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-center w-full overflow-hidden">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google authentication failed")}
              shape="rectangular"
              theme="outline"
              size="large"
              text="signup_with"
              width="336"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
            >
              Register with custom Google profile
            </button>
            <button
              type="button"
              onClick={() => setShowClientIdConfig(!showClientIdConfig)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Google Client ID Settings"
            >
              <FontAwesomeIcon icon={faGear} />
            </button>
          </div>
        </div>

        {/* Google Client ID Configuration Drawer */}
        {showClientIdConfig && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 mb-4">
            <span className="font-bold text-slate-800 block">
              Google OAuth Client ID
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              To connect real Google accounts, obtain an OAuth Client ID from{" "}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="text-teal-700 underline"
              >
                Google Cloud Console
              </a>{" "}
              and add <code className="bg-slate-200 px-1 rounded">http://localhost:5173</code> to Authorized JavaScript Origins.
            </p>
            <input
              type="text"
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              placeholder="e.g. 12345678-abc.apps.googleusercontent.com"
              className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-hidden"
            />
            <button
              type="button"
              onClick={handleSaveClientId}
              className="w-full py-1.5 bg-teal-700 text-white rounded-lg font-semibold text-xs cursor-pointer"
            >
              Save & Reload
            </button>
          </div>
        )}

        <div className="relative flex items-center justify-center mb-4">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-2 text-[10px] uppercase font-semibold text-slate-400">
            or with email
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Full Name
            </label>
            <input
              required
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-teal-600 focus:outline-hidden transition-colors"
              placeholder="Parth Sharma"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Email Address
            </label>
            <input
              required
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-teal-600 focus:outline-hidden transition-colors"
              placeholder="parth.cse@mietjammu.in"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-teal-600 focus:outline-hidden transition-colors pr-8"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Confirm
              </label>
              <input
                required
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-teal-600 focus:outline-hidden transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="profilePic"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Profile Photo (Optional)
            </label>
            <input
              type="file"
              id="profilePic"
              accept="image/*"
              onChange={handlePicUpload}
              className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-teal-800 hover:bg-teal-900 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faUserPlus} />
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-teal-700 hover:text-teal-900 font-semibold"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Manual Google Profile Modal for Local Dev */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">
                Register with Google Profile
              </span>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Enter any real Google user details to register and log in instantly without needing a Google Cloud API Key.
            </p>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                  Google Full Name
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="e.g. Parth Sharma"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                  Google Account Email
                </label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="e.g. parth.cse@mietjammu.in"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                  Profile Photo URL (Male Avatar Default)
                </label>
                <input
                  type="url"
                  value={googleAvatarUrl}
                  onChange={(e) => setGoogleAvatarUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleManualGoogleRegister()}
                className="px-3 py-1.5 bg-teal-800 text-white rounded text-xs font-semibold"
              >
                Register & Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;