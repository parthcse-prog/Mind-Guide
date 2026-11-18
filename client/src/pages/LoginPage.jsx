import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../redux/mindGuideSlice";
import { GoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faRightToBracket,
  faXmark,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import mietLogo from "../assets/MIET Logos/miet-logo-dark.png";
import saarthiLogo from "../assets/Saarthi.ai Brain Network Logo.png";
import googleIcon from "../assets/google.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
  const userInfo = useSelector((state) => state.mindGuide.userInfo);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning("Please enter your email and password");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/v1/user/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      dispatch(addUser(response.data));
      toast.success("Welcome back");
      navigate("/");
    } catch (err) {
      console.error("Login Error:", err);
      toast.error(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // Real Google Sign-In Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/v1/user/google-login", {
        credential: credentialResponse.credential,
      });
      dispatch(addUser(response.data));
      toast.success(`Welcome, ${response.data.name}!`);
      navigate("/");
    } catch (err) {
      console.error("Google authentication error:", err);
      toast.error("Could not complete Google authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleManualGoogleLogin = async (customProfile = null) => {
    setLoading(true);
    try {
      const payload = customProfile || {
        email: googleEmail || "parth.cse@mietjammu.in",
        name: googleName || "Parth Sharma",
        picture: googleAvatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop",
      };

      const response = await axios.post("/api/v1/user/google-login", payload);
      dispatch(addUser(response.data));
      toast.success(`Signed in as ${response.data.name}`);
      setShowGoogleModal(false);
      navigate("/");
    } catch (err) {
      console.error("Google Login Error:", err);
      toast.error("Google Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClientId = () => {
    if (!clientIdInput.trim()) {
      toast.warning("Please paste a valid Google Client ID");
      return;
    }
    localStorage.setItem("saarthi_google_client_id", clientIdInput.trim());
    toast.success("Google Client ID saved! Reloading...");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("/api/v1/user/getUserProfile");
        if (response.data) {
          dispatch(addUser(response.data));
        }
      } catch (err) {
        // Not logged in
      }
    };
    if (!userInfo) {
      fetchUserProfile();
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  const hasConfiguredClientId =
    Boolean(clientIdInput) && !clientIdInput.includes("exampleclientid");

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-[#0c242c] font-['Manrope']">
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
            Sign In
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your 3D life and wellness companion
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
              text="continue_with"
              width="336"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="text-teal-700 hover:text-teal-900 font-semibold"
            >
              Sign in with custom Google details
            </button>
            <button
              type="button"
              onClick={() => setShowClientIdConfig(!showClientIdConfig)}
              className="text-slate-400 hover:text-slate-600"
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
              className="w-full py-1.5 bg-teal-700 text-white rounded-lg font-semibold text-xs"
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-hidden focus:border-teal-600"
              placeholder="name@mietjammu.in"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-xs" />
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-hidden focus:border-teal-600"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#1a3b47] hover:bg-[#224d5d] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 mt-1"
          >
            <FontAwesomeIcon icon={faRightToBracket} />
            <span>{loading ? "Signing in..." : "Sign in"}</span>
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Testing?</span>
          <button
            type="button"
            onClick={() => {
              setEmail("parth.cse@mietjammu.in");
              setPassword("parth123");
            }}
            className="text-teal-700 hover:text-teal-900 font-semibold"
          >
            Fill Demo Account
          </button>
        </div>

        <div className="mt-5 text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-teal-700 hover:text-teal-900 font-semibold"
          >
            Register
          </Link>
        </div>
      </div>

      {/* Manual Google Profile Dialog */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img src={googleIcon} alt="Google" className="w-5 h-5 object-contain" />
                <h3 className="font-bold text-slate-900 text-sm">Sign in with Google Details</h3>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="space-y-3 mb-4 text-xs">
              <div>
                <label className="text-slate-500 font-medium block mb-1">
                  Google Full Name
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="e.g. Parth Sharma"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-slate-500 font-medium block mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-slate-500 font-medium block mb-1">
                  Profile Photo URL (Male portrait)
                </label>
                <input
                  type="url"
                  value={googleAvatarUrl}
                  onChange={(e) => setGoogleAvatarUrl(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-[11px]"
                />
              </div>

              <button
                type="button"
                onClick={() => handleManualGoogleLogin()}
                className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs"
              >
                Sign in with this Google Account
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="w-full py-1 text-center text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
