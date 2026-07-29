import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white text-[#111c2c] font-['Plus_Jakarta_Sans'] overflow-x-hidden">
      {/* Hero Section */}
      <section
        id="secOne"
        className="min-h-[85vh] px-6 md:px-16 flex flex-col items-start justify-center gap-6 bg-gradient-to-br from-white via-[#f0f3ff] to-[#e7eeff] relative overflow-hidden"
      >
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#acecdc] opacity-20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-4 z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#002531] font-['Manrope'] leading-tight tracking-tight">
            Unlock your Potential
          </h1>
          <p className="text-xl md:text-2xl text-[#41484b] font-normal leading-relaxed">
            Discover the power of education with Mind-Guide.
            <br />
            Transform your future and achieve your goals.
          </p>
          <div className="pt-4">
            <button
              className="bg-[#002531] hover:bg-[#1a3b47] text-white text-lg font-semibold px-8 py-4 rounded-full shadow-lg transition-all duration-300 active:scale-95 font-['Manrope']"
              onClick={() => navigate("/counselors")}
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Section 1: Hero / About Us */}
      <section className="py-20 px-6 md:px-16 bg-white" id="secTwo">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#002531] font-['Manrope'] leading-tight">
              About us
            </h2>
            <div className="space-y-4 text-[#41484b] leading-relaxed">
              <p className="text-lg md:text-xl leading-relaxed">
                Welcome to our Mind Guide App, where we empower students on their
                educational journey by harnessing the power of AI. Our mission is to
                provide students with personalized guidance and counseling across a
                multitude of fields, helping them navigate the complexities of
                academia and career choices.
              </p>
              <p className="text-base md:text-lg leading-relaxed">
                Whether you&#39;re seeking advice in the realms of science, art,
                business, or any other area, our AI-driven platform connects you
                with expert counselors who can offer tailored insights and support. We
                believe that by leveraging cutting-edge technology, we can offer a
                comprehensive, dynamic, and inclusive approach to counseling,
                ensuring that every student has the opportunity to reach their full
                potential. Your aspirations are our priority, and we&#39;re here to
                guide you every step of the way.
              </p>
            </div>
            <div className="pt-2">
              <button
                className="bg-[#002531] text-white px-8 py-3.5 rounded-full font-semibold font-['Manrope'] transition-all hover:scale-105 active:scale-95 shadow-md"
                onClick={() => navigate("/counselors")}
              >
                Enroll Now
              </button>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-[32px] overflow-hidden shadow-xl border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1573495804664-b1c0849525af?q=80&w=2069&auto=format&fit=crop"
                alt="About Mind Guide"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Services */}
      <section className="py-20 px-6 md:px-16 bg-[#f9f9ff]" id="services">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#002531] font-['Manrope'] mb-3">
              Services
            </h2>
            <div className="h-1.5 w-16 bg-[#28695c] rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-[#c1c7cb]/30 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1864&auto=format&fit=crop"
                  alt="Career Counseling"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#002531] font-['Manrope'] mb-2">
                    Career Counseling
                  </h3>
                  <p className="text-[#41484b] text-base leading-relaxed">
                    Our AI-powered career counseling offers students tailored advice by
                    analyzing their profiles and matching them with ideal career
                    options, ensuring they embark on a fulfilling professional journey.
                  </p>
                </div>
                <a
                  href="/counselors"
                  className="mt-4 text-[#28695c] font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all font-['Manrope']"
                >
                  Learn more{" "}
                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </a>
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-[#c1c7cb]/30 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src="https://img.freepik.com/free-photo/collage-customer-experience-concept_23-2149367121.jpg?w=1380"
                  alt="Sentiment Analysis Tools"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#002531] font-['Manrope'] mb-2">
                    Sentiment Analysis Tools
                  </h3>
                  <p className="text-[#41484b] text-base leading-relaxed">
                    Using cutting-edge AI, our sentiment analysis tools monitor
                    students&#39; well-being, alerting them to potential issues and
                    enhancing overall emotional support by assessing sentiment in
                    feedback and interactions.
                  </p>
                </div>
                <a
                  href="/tools"
                  className="mt-4 text-[#28695c] font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all font-['Manrope']"
                >
                  View tools{" "}
                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </a>
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-[#c1c7cb]/30 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1506784881475-0e408bbca849?q=80&w=2068&auto=format&fit=crop"
                  alt="Academic Planning"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#002531] font-['Manrope'] mb-2">
                    Academic Planning
                  </h3>
                  <p className="text-[#41484b] text-base leading-relaxed">
                    Our AI constructs personalized academic roadmaps for students,
                    considering their unique learning styles and progress, while also
                    generating detailed student reports to provide insights into
                    academic performance.
                  </p>
                </div>
                <a
                  href="/account/dashboard"
                  className="mt-4 text-[#28695c] font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all font-['Manrope']"
                >
                  Start planning{" "}
                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Contact Us */}
      <section
        className="py-16 px-6 md:px-16 bg-white"
        id="contact"
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 md:p-12 rounded-[28px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-slate-100/80">
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#002531] font-['Manrope'] tracking-tight">
                  Contact Us
                </h2>
                <p className="text-[#41484b] text-sm md:text-base leading-relaxed max-w-sm">
                  Reach out to us using the contact form. We are here to help and
                  answer any questions you may have. We look forward to hearing from
                  you!
                </p>
              </div>

              <div className="space-y-3 pt-6">
                <div className="flex items-center gap-3 text-[#002531]">
                  <span className="material-symbols-outlined text-[#28695c] text-xl">
                    mail
                  </span>
                  <span className="font-semibold text-sm">
                    2020a1r062@mietjammu.in
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#002531]">
                  <span className="material-symbols-outlined text-[#28695c] text-xl">
                    location_on
                  </span>
                  <span className="font-semibold text-sm">Jammu, India</span>
                </div>
              </div>
            </div>

            <form
              action="mailto:2020a1r062@mietjammu.in"
              method="post"
              encType="text/plain"
              className="space-y-4"
            >
              <div className="space-y-1">
                <label
                  className="font-semibold text-xs text-[#002531] block font-['Manrope']"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-[#28695c] focus:ring-2 focus:ring-[#acecdc]/40 outline-none transition-all placeholder:text-slate-400"
                  id="name"
                  placeholder="Enter Name"
                  type="text"
                />
              </div>

              <div className="space-y-1">
                <label
                  className="font-semibold text-xs text-[#002531] block font-['Manrope']"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-[#28695c] focus:ring-2 focus:ring-[#acecdc]/40 outline-none transition-all placeholder:text-slate-400"
                  id="email"
                  placeholder="Enter Email"
                  type="email"
                />
              </div>

              <div className="space-y-1">
                <label
                  className="font-semibold text-xs text-[#002531] block font-['Manrope']"
                  htmlFor="message"
                >
                  Your Message
                </label>
                <textarea
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm resize-none focus:border-[#28695c] focus:ring-2 focus:ring-[#acecdc]/40 outline-none transition-all placeholder:text-slate-400"
                  id="message"
                  placeholder="Your Message..."
                  rows={3}
                ></textarea>
              </div>

              <button
                className="w-full bg-[#002531] hover:bg-[#1a3b47] text-white py-3.5 rounded-xl font-bold font-['Manrope'] transition-all active:scale-[0.98] mt-2 shadow-md"
                type="submit"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
