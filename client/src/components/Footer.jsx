import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#1a3b47] text-white mt-auto pt-6 pb-4 border-t border-white/10 font-['Manrope']">
      <div className="max-w-[1366px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
        {/* Column 1: Brand Info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
              <svg
                className="h-4 w-4 text-teal-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              Mind Guide
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Empowering your mental well-being through professional analysis and guidance.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="font-bold mb-3 uppercase tracking-wider text-teal-300 text-xs">
            Quick Links
          </h4>
          <ul className="flex flex-col gap-1.5 text-slate-300 text-xs">
            <li>
              <a href="/#secTwo" className="hover:text-white transition-colors">
                About Us
              </a>
            </li>
            <li>
              <Link to="/counselors" className="hover:text-white transition-colors">
                Counselors
              </Link>
            </li>
            <li>
              <Link to="/tools" className="hover:text-white transition-colors">
                Tools
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact Details */}
        <div>
          <h4 className="font-bold mb-3 uppercase tracking-wider text-teal-300 text-xs">
            Contact
          </h4>
          <ul className="flex flex-col gap-1.5 text-slate-300 text-xs">
            <li className="flex items-start gap-1.5">
              <span className="font-medium text-white">Address:</span> Jammu
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-medium text-white">Email:</span>{" "}
              2020A1R062@mietjammu.in
            </li>
          </ul>
        </div>

        {/* Column 4: Social / Github */}
        <div>
          <h4 className="font-bold mb-3 uppercase tracking-wider text-teal-300 text-xs">
            Follow Us
          </h4>
          <a
            href="https://github.com/abhishekdogra19/Mind-Guide"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors text-xs"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
            </svg>
            Github
          </a>
        </div>
      </div>

      <div className="max-w-[1366px] mx-auto px-6 md:px-12 pt-3 border-t border-white/5 text-center text-slate-400 text-[11px]">
        <p>© 2023 Mind Guide. All professional assessments are for guidance purposes only.</p>
      </div>
    </footer>
  );
};

export default Footer;
