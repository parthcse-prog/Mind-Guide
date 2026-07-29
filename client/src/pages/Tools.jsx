import toneAnalyzer from "../assets/tone-detector.jpeg";

const Tools = () => {
  return (
    <div className="bg-[#f9f9ff] min-h-screen font-['Manrope'] text-[#1a3b47] py-12 px-6 md:px-12">
      {/* Section Heading */}
      <div className="mb-12 max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-[#1a3b47] mb-3 tracking-tight">
          Analysis &amp; Assessment Tools
        </h1>
        <p className="text-slate-500 text-base md:text-lg leading-relaxed">
          Discover professional tools designed to help you understand yourself better and improve your daily communication.
        </p>
      </div>

      {/* Tool Cards Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Card 1: Text Tone Analyzer (Coming Soon) */}
        <article className="bg-white rounded-lg border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-full relative group">
          <div className="relative aspect-video overflow-hidden bg-[#eef2ff]">
            <img
              src={toneAnalyzer}
              alt="Text Tone Analyzer UI Preview"
              className="w-full h-full object-cover grayscale-[0.4]"
            />
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-[#1a3b47]/70 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-white text-2xl font-black uppercase tracking-[0.2em] transform -rotate-12 border-4 border-white px-6 py-2">
                Coming Soon
              </span>
            </div>
            {/* Icon Overlay */}
            <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow-md">
              <svg
                className="h-6 w-6 text-[#1a3b47]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
          </div>

          <div className="p-8 flex flex-col flex-grow justify-between opacity-60">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-[#1a3b47]">
                  Text Tone Analyzer
                </h3>
                <svg
                  className="h-5 w-5 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
              </div>
              <p className="text-slate-600 mb-8 text-base leading-relaxed">
                Evaluate the emotional impact of your writing. Identify tone, sentiment, and confidence levels in your messages.
              </p>
            </div>

            <button
              className="w-full bg-slate-300 text-slate-500 font-bold py-4 rounded-lg cursor-not-allowed uppercase tracking-wide text-sm"
              disabled
            >
              Not Available
            </button>
          </div>
        </article>

        {/* Card 2: Personality Test (Coming Soon) */}
        <article className="bg-white rounded-lg border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-full relative group">
          <div className="relative aspect-video overflow-hidden bg-[#f0f3ff]">
            <img
              src="https://img.freepik.com/free-vector/sad-corporate-man-worried-about-failure-decreasing-business-leadership-success-career-progress-concept-flat-illustration-business-man_1150-37432.jpg?w=740"
              alt="Personality Test Preview"
              className="w-full h-full object-cover grayscale-[0.4]"
            />
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-[#1a3b47]/70 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-white text-2xl font-black uppercase tracking-[0.2em] transform -rotate-12 border-4 border-white px-6 py-2">
                Coming Soon
              </span>
            </div>
            {/* Icon Overlay */}
            <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow-md">
              <svg
                className="h-6 w-6 text-[#1a3b47]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
          </div>

          <div className="p-8 flex flex-col flex-grow justify-between opacity-60">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-[#1a3b47]">
                  Personality Test
                </h3>
                <svg
                  className="h-5 w-5 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
              </div>
              <p className="text-slate-600 mb-8 text-base leading-relaxed">
                Gain deeper insights into your behavioral patterns and personality traits with our scientifically-backed assessment.
              </p>
            </div>

            <button
              className="w-full bg-slate-300 text-slate-500 font-bold py-4 rounded-lg cursor-not-allowed uppercase tracking-wide text-sm"
              disabled
            >
              Not Available
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};

export default Tools;
