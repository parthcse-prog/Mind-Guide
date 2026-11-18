import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faUserGroup,
  faTableColumns,
  faArrowRight,
  faCircleQuestion,
  faSpa,
  faCompass,
  faEnvelope,
  faLocationDot,
  faPaperPlane,
  faShieldHalved,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import logo2d from "../assets/MIET Logos/2d-logo-miet-comp.png";

const Home = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.mindGuide.userInfo);

  const pillars = [
    {
      title: "Ask Me Anything",
      desc: "Inquire about anything on your mind — from life questions and decision-making to everyday curiosities and personal growth.",
      icon: faCircleQuestion,
      action: () => navigate("/chat"),
      actionText: "Ask Saarthi",
      color: "text-teal-700 bg-teal-50",
    },
    {
      title: "Well-Being & Clarity",
      desc: "A judgment-free, confidential space to decompress, sort through your thoughts, and find calm whenever you need it.",
      icon: faSpa,
      action: () => navigate("/chat"),
      actionText: "Chat with Companion",
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      title: "Guidance & Direction",
      desc: "Explore perspectives, build productive routines, and talk through next steps with supportive companion personas.",
      icon: faCompass,
      action: () => navigate("/chat"),
      actionText: "Explore Guidance",
      color: "text-indigo-700 bg-indigo-50",
    },
  ];

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
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate("/chat")}
              className="flex items-center justify-between p-4 bg-teal-800 hover:bg-teal-900 text-white rounded-xl shadow-xs hover:shadow-md transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-700/60 flex items-center justify-center text-teal-200">
                  <FontAwesomeIcon icon={faComments} className="text-lg" />
                </div>
                <div>
                  <span className="block text-sm font-bold">Start Chat</span>
                  <span className="text-xs text-teal-200">Talk to Saarthi companions</span>
                </div>
              </div>
              <FontAwesomeIcon
                icon={faArrowRight}
                className="text-xs text-teal-300 group-hover:translate-x-1 transition-transform"
              />
            </button>

            <button
              onClick={() => navigate("/counselors")}
              className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 text-slate-800 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <FontAwesomeIcon icon={faUserGroup} className="text-base" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-900">Explore Guides</span>
                  <span className="text-xs text-slate-500">Choose your companion</span>
                </div>
              </div>
              <FontAwesomeIcon
                icon={faArrowRight}
                className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform"
              />
            </button>

            <button
              onClick={() => navigate("/account/dashboard/profile")}
              className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 text-slate-800 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <FontAwesomeIcon icon={faTableColumns} className="text-base" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-900">Google Profile</span>
                  <span className="text-xs text-slate-500">View account & settings</span>
                </div>
              </div>
              <FontAwesomeIcon
                icon={faArrowRight}
                className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform"
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

            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                onClick={() => navigate("/chat")}
                className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <FontAwesomeIcon icon={faComments} />
                <span>Open Chat Session</span>
              </button>
              <button
                onClick={() => navigate("/counselors")}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <FontAwesomeIcon icon={faUserGroup} />
                <span>Meet the Companions</span>
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

      {/* Section 2: What You Can Ask */}
      <section className="py-14 px-6 md:px-16 bg-white border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-1">
              Versatile Guidance
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Ask Me Anything: Versatile Support
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-xl">
              Ask about anything without restrictions. Get thoughtful perspectives, constructive feedback, and supportive conversation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${pillar.color}`}>
                    <FontAwesomeIcon icon={pillar.icon} className="text-base" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
                <button
                  onClick={pillar.action}
                  className="mt-4 text-xs font-semibold text-teal-800 hover:text-teal-950 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{pillar.actionText}</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Contact & MIET Support */}
      <section className="py-14 px-6 md:px-16 bg-slate-50" id="contact">
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