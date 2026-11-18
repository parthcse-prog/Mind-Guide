import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faTableColumns,
  faArrowRight,
  faEnvelope,
  faLocationDot,
  faPaperPlane,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import logo2d from "../assets/MIET Logos/2d-logo-miet-comp.png";

const Home = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.mindGuide.userInfo);

  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen">
      {/* Hero Section */}
      <section className="border-b border-slate-200/80 bg-white py-14 px-6 md:px-16">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200/80 rounded-full text-xs font-semibold text-teal-800">
            <FontAwesomeIcon icon={faShieldHalved} className="text-teal-600" />
            <span>MIET Jammu · Safe & Confidential Companion</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {userInfo?.name ? `Welcome, ${userInfo.name}.` : "Welcome to Saarthi.ai."}
              <br />
              <span className="text-teal-800">
                Your Personalized Guide · Saarthi Ask Me Anything
              </span>
            </h1>
            <p className="text-slate-600 text-base md:text-lg max-w-2xl leading-relaxed">
              Ask anything without judgment. Your Saarthi companions are here 24/7 to listen, guide, and assist you with anything on your mind.
            </p>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/chat")}
              className="flex items-center justify-between p-5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl shadow-xs hover:shadow-md transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-teal-700/60 flex items-center justify-center text-teal-200">
                  <FontAwesomeIcon icon={faComments} className="text-xl" />
                </div>
                <div>
                  <span className="block text-base font-bold">Start Chat</span>
                  <span className="text-xs text-teal-200">Ask Dr. Alex, Maya, Ethan or Marcus</span>
                </div>
              </div>
              <FontAwesomeIcon
                icon={faArrowRight}
                className="text-sm text-teal-300 group-hover:translate-x-1.5 transition-transform"
              />
            </button>

            <button
              onClick={() => navigate("/account/dashboard/profile")}
              className="flex items-center justify-between p-5 bg-white hover:bg-slate-50 text-slate-800 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <FontAwesomeIcon icon={faTableColumns} className="text-lg" />
                </div>
                <div>
                  <span className="block text-base font-bold text-slate-900">View Profile</span>
                  <span className="text-xs text-slate-500">View account details & settings</span>
                </div>
              </div>
              <FontAwesomeIcon
                icon={faArrowRight}
                className="text-sm text-slate-400 group-hover:translate-x-1.5 transition-transform"
              />
            </button>
          </div>
        </div>
      </section>

      {/* Section 1: About Us */}
      <section className="py-16 px-6 md:px-16" id="about-us">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                About Saarthi.ai
              </h2>
              <img
                src={logo2d}
                alt="MIET"
                className="h-10 object-contain mix-blend-multiply opacity-85"
              />
            </div>

            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
              Saarthi.ai is an intelligent companion developed at Model Institute of Engineering and Technology (MIET), Jammu. Rooted in the timeless concept of a trusted guide and ally, Saarthi offers an accessible, judgment-free space for students and learners to discuss questions, seek perspectives, and find clarity.
            </p>

            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
              Whatever is on your mind, Saarthi serves as your versatile companion to explore ideas, reflect on decisions, and seek thoughtful guidance. Combining conversational companions with intelligent reasoning, Saarthi is here to support you at every turn.
            </p>

            <div className="pt-2">
              <button
                onClick={() => navigate("/chat")}
                className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <FontAwesomeIcon icon={faComments} />
                <span>Open Chat Session</span>
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-900 relative">
              <img
                src="https://images.unsplash.com/photo-1573495804664-b1c0849525af?q=80&w=2069&auto=format&fit=crop"
                alt="Saarthi Companion"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold">Saarthi Companion Online</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Natural conversation, speech synthesis, and empathetic active listening.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Contact & MIET Support */}
      <section className="py-14 px-6 md:px-16 bg-white border-t border-slate-200/80" id="contact">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-7 md:p-9 rounded-2xl border border-slate-200">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-1">
                  Connect With Us
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  MIET Jammu Support & Feedback
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Have feedback or inquiries? Reach out to the team at Model Institute of Engineering and Technology.
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faEnvelope} className="text-teal-700 w-4" />
                  <span>support@mietjammu.in</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faLocationDot} className="text-teal-700 w-4" />
                  <span>Kot Bhalwal, Jammu, J&K, India</span>
                </div>
              </div>
            </div>

            <form
              action="mailto:support@mietjammu.in"
              method="post"
              encType="text/plain"
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  defaultValue={userInfo?.name || ""}
                  placeholder="e.g. Parth Sharma"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-hidden focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  defaultValue={userInfo?.email || ""}
                  placeholder="e.g. name@mietjammu.in"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-hidden focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Feedback or Inquiry
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Share any feedback or questions..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-hidden focus:border-teal-700 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="text-[11px]" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;