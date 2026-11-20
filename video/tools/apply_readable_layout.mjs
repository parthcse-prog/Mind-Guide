import fs from 'fs';
import path from 'path';

const indexPath = path.resolve('index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Replace scenes HTML (from <section class="scene" id="sc0"> through </section> of sc7)
const startMarker = '        <!-- ==========================================\n             SCENE 0: IDENTITY & HERO INTRO (S0)\n        =========================================== -->';
const endMarker = '      </div>\n    </div>\n  </div>\n</div>\n\n<!-- Sticky Full-Width Media Player';

const scenesNewHtml = `        <!-- ==========================================
             SCENE 0: IDENTITY & HERO INTRO (S0)
        =========================================== -->
        <section class="scene" id="sc0">
          <div class="out" id="out0">
            <div class="ct">
              <!-- Left: Typography & Logo -->
              <div class="narrative-col">
                <div class="eyebrow" id="sc0-eyebrow">
                  <span class="eyebrow-dot"></span>
                  <span>MIET Jammu · Safe &amp; Confidential</span>
                </div>

                <!-- Animated SVG Logo -->
                <div id="sc0-logo-box" style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
                  <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="44" stroke="#0f766e" stroke-width="3" stroke-dasharray="1" stroke-dashoffset="1" pathLength="1" id="sc0-svg-circle" />
                    <path d="M50 22 C34 22 24 34 24 48 C24 60 32 70 42 74 L42 82 L58 82 L58 74 C68 70 76 60 76 48 C76 34 66 22 50 22 Z" 
                          stroke="#14b8a6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                          stroke-dasharray="1" stroke-dashoffset="1" pathLength="1" id="sc0-svg-brain" />
                    <circle cx="50" cy="40" r="5" fill="#0f766e" id="sc0-svg-n1" />
                    <circle cx="38" cy="52" r="4" fill="#0284c7" id="sc0-svg-n2" />
                    <circle cx="62" cy="52" r="4" fill="#0284c7" id="sc0-svg-n3" />
                    <path d="M50 40 L38 52 M50 40 L62 52 M38 52 L62 52" stroke="#0f766e" stroke-width="2" stroke-linecap="round"
                          stroke-dasharray="1" stroke-dashoffset="1" pathLength="1" id="sc0-svg-synapses" />
                  </svg>
                  <div>
                    <h2 style="font-size: 28px; font-weight: 800; letter-spacing: -0.02em; color: var(--sec); line-height: 1;">Saarthi.ai</h2>
                    <p style="font-size: 12px; font-weight: 700; color: var(--accent); letter-spacing: 0.08em; text-transform: uppercase; margin-top: 3px;">Mind-Guide Platform</p>
                  </div>
                </div>

                <div class="h1" id="sc0-headline">
                  Welcome to <span class="gradient-text">Saarthi.ai</span>, your personal guide.
                </div>

                <p class="lead" id="sc0-subtext" style="margin-bottom: 24px;">
                  Your personalized AI companion for life choices, personal growth, and career mentorship.
                </p>

                <!-- 3 Pillars -->
                <div id="sc0-pillars" style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <div class="badge-pill active" style="font-size: 13px; padding: 7px 14px;">
                    <span style="font-size: 15px;">🌱</span>
                    <span>Life Choices</span>
                  </div>
                  <div class="badge-pill" style="font-size: 13px; padding: 7px 14px;">
                    <span style="font-size: 15px;">🧠</span>
                    <span>Personal Growth</span>
                  </div>
                  <div class="badge-pill" style="font-size: 13px; padding: 7px 14px;">
                    <span style="font-size: 15px;">🚀</span>
                    <span>Career Mentorship</span>
                  </div>
                </div>
              </div>

              <!-- Right: Hero Screenshot in Desktop Browser Frame -->
              <div class="showcase-col">
                <div class="browser-frame" id="sc0-hero-shot">
                  <div class="browser-header">
                    <div class="browser-dots">
                      <span class="browser-dot dot-red"></span>
                      <span class="browser-dot dot-yellow"></span>
                      <span class="browser-dot dot-green"></span>
                    </div>
                    <div class="browser-url">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      <span>saarthi.ai/welcome</span>
                    </div>
                    <div class="browser-badge">MIET Gateway · 24/7</div>
                  </div>
                  <div class="browser-content">
                    <img src="shots/Saarthi.png" alt="Saarthi Welcome Interface">
                    <div class="pulse-ring" id="sc0-hero-ring" style="width: 130px; height: 130px; top: 62%; left: 24%;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ==========================================
             SCENE 1: 3D VIRTUAL MENTORS (S1)
        =========================================== -->
        <section class="scene" id="sc1">
          <div class="out" id="out1">
            <div class="ct">
              <!-- Left Column: Narrative -->
              <div class="narrative-col">
                <div class="eyebrow" id="sc1-eyebrow">
                  <span class="eyebrow-dot"></span>
                  <span>Empathetic Intelligence · 24/7 Availability</span>
                </div>

                <div class="h2" id="sc1-headline">
                  A Safe, Judgment-Free Space to <span class="gradient-text">Converse &amp; Grow</span>.
                </div>

                <p class="lead" id="sc1-subtext" style="margin-bottom: 22px;">
                  Whenever you need guidance, specialized 3D virtual mentors listen, speak, and adapt to your unique journey.
                </p>

                <!-- Highlights feature list -->
                <div id="sc1-features" style="display: flex; flex-direction: column; gap: 10px;">
                  <div class="card" style="padding: 12px 18px; display: flex; align-items: center; gap: 12px; border-radius: 14px;">
                    <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(15, 118, 110, 0.12); display: flex; align-items: center; justify-content: center; font-size: 18px; color: var(--accent);">🎙️</div>
                    <div>
                      <h4 style="font-size: 14px; font-weight: 700; color: var(--sec);">Real-Time Voice &amp; Lip Sync</h4>
                      <p style="font-size: 11px; color: var(--muted);">Low-latency neural Kokoro TTS with dynamic speech frequencies.</p>
                    </div>
                  </div>

                  <div class="card" style="padding: 12px 18px; display: flex; align-items: center; gap: 12px; border-radius: 14px;">
                    <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(2, 132, 199, 0.12); display: flex; align-items: center; justify-content: center; font-size: 18px; color: var(--hi);">🛡️</div>
                    <div>
                      <h4 style="font-size: 14px; font-weight: 700; color: var(--sec);">Empathetic 3D Gestures</h4>
                      <p style="font-size: 11px; color: var(--muted);">Steady forward gaze with subtle head gestures for student comfort.</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: 3D Mentor & Conversation Showcase -->
              <div class="showcase-col">
                <div class="browser-frame" id="sc1-shot-front">
                  <div class="browser-header">
                    <div class="browser-dots">
                      <span class="browser-dot dot-red"></span>
                      <span class="browser-dot dot-yellow"></span>
                      <span class="browser-dot dot-green"></span>
                    </div>
                    <div class="browser-url">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      <span>saarthi.ai/counselor/dr-alex</span>
                    </div>
                    <div class="browser-badge">Live Interactive Session</div>
                  </div>
                  <div class="browser-content">
                    <img src="shots/Agent.png" alt="Dr. Alex 3D Virtual Mentor">
                    <!-- Overlay conversation dialog that cross-fades at W(1, 'adapt') -->
                    <div id="sc1-shot-back" style="position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; pointer-events: none;">
                      <img src="shots/Agent 2.png" alt="Active Chat Dialogue Transcript" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="pulse-ring" id="sc1-wave-ring" style="width: 130px; height: 130px; top: 58%; left: 45%;"></div>
                    <div class="hl-box" id="sc1-hl-box" style="top: 48%; left: 32%; width: 260px; height: 120px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ==========================================
             SCENE 2: COUNSELOR DOMAINS & MEMORY (S2)
        =========================================== -->
        <section class="scene" id="sc2">
          <div class="out" id="out2">
            <div class="ct">
              <!-- Left Column: Counseling Domains and Session Continuity -->
              <div class="narrative-col">
                <div class="eyebrow" id="sc2-eyebrow">
                  <span class="eyebrow-dot"></span>
                  <span>Four Dedicated Personas · Session Continuity</span>
                </div>

                <div class="h2" id="sc2-headline">
                  Mentors Who <span class="gradient-text">Remember</span> Past Sessions.
                </div>

                <p class="lead" id="sc2-subtext" style="margin-bottom: 20px;">
                  Covering emotional well-being, personal confidence, relationships, and career direction—continue right where you left off.
                </p>

                <!-- Floating Session Memory Card -->
                <div class="card heavy-shadow" id="sc2-memory-card" style="padding: 16px 18px; border-radius: 16px; border-left: 5px solid var(--emerald); margin-bottom: 16px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 14px;">🔄</span>
                      <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--emerald);">Continuous Context Memory</span>
                    </div>
                    <span style="font-size: 10px; font-family: 'JetBrains Mono', monospace; color: var(--muted);">SESSION #2488</span>
                  </div>
                  <p style="font-size: 13px; font-weight: 600; color: var(--sec); line-height: 1.4;">
                    "Welcome back, Parth. In our last chat with Dr. Alex, you resolved to practice mock interviews. Let's build upon that today."
                  </p>
                </div>

                <!-- 4 Domain Tags -->
                <div id="sc2-domains" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <div class="card" style="padding: 9px 12px; display: flex; align-items: center; gap: 8px; border-radius: 10px;">
                    <span style="color: #0d9488; font-size: 15px;">🌿</span>
                    <span style="font-size: 12px; font-weight: 700;">Emotional Well-Being</span>
                  </div>
                  <div class="card" style="padding: 9px 12px; display: flex; align-items: center; gap: 8px; border-radius: 10px;">
                    <span style="color: #f59e0b; font-size: 15px;">⚡</span>
                    <span style="font-size: 12px; font-weight: 700;">Personal Confidence</span>
                  </div>
                  <div class="card" style="padding: 9px 12px; display: flex; align-items: center; gap: 8px; border-radius: 10px;">
                    <span style="color: #f43f5e; font-size: 15px;">❤️</span>
                    <span style="font-size: 12px; font-weight: 700;">Relationships</span>
                  </div>
                  <div class="card" style="padding: 9px 12px; display: flex; align-items: center; gap: 8px; border-radius: 10px;">
                    <span style="color: #0284c7; font-size: 15px;">🎯</span>
                    <span style="font-size: 12px; font-weight: 700;">Career Direction</span>
                  </div>
                </div>
              </div>

              <!-- Right Column: Counselors Grid Screenshot in Browser Frame -->
              <div class="showcase-col">
                <div class="browser-frame" id="sc2-shot-counselors">
                  <div class="browser-header">
                    <div class="browser-dots">
                      <span class="browser-dot dot-red"></span>
                      <span class="browser-dot dot-yellow"></span>
                      <span class="browser-dot dot-green"></span>
                    </div>
                    <div class="browser-url">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      <span>saarthi.ai/counselors</span>
                    </div>
                    <div class="browser-badge">4 Specialized AI Guides</div>
                  </div>
                  <div class="browser-content">
                    <img src="shots/Councellors.png" alt="Counselors Selection Grid">
                    <div class="hl-box" id="sc2-hl-alex" style="top: 14%; left: 3%; width: 23%; height: 80%;"></div>
                    <div class="hl-box" id="sc2-hl-maya" style="top: 14%; left: 27%; width: 23%; height: 80%; border-color: var(--emerald);"></div>
                    <div class="hl-box" id="sc2-hl-ethan" style="top: 14%; left: 51%; width: 23%; height: 80%; border-color: var(--warm);"></div>
                    <div class="hl-box" id="sc2-hl-marcus" style="top: 14%; left: 74%; width: 23%; height: 80%; border-color: var(--amber);"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ==========================================
             SCENE 3: GUIDANCE REPORT & SWOT (S3)
        =========================================== -->
        <section class="scene" id="sc3">
          <div class="out" id="out3">
            <div class="ct">
              <!-- Left Column: Post-Session Analysis -->
              <div class="narrative-col">
                <div class="eyebrow" id="sc3-eyebrow">
                  <span class="eyebrow-dot"></span>
                  <span>Automated Synthesis · Instant PDF Export</span>
                </div>

                <div class="h2" id="sc3-headline">
                  Actionable <span class="gradient-text">Guidance Reports</span> &amp; SWOT Analysis.
                </div>

                <p class="lead" id="sc3-subtext" style="margin-bottom: 20px;">
                  After every conversation, Saarthi compiles your strengths, growth areas, and milestones into a clear downloadable report.
                </p>

                <!-- Rebuilt SWOT mini cards -->
                <div id="sc3-swot-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px;">
                  <div class="card" style="padding: 12px 14px; border-left: 4px solid #10b981; border-radius: 12px;">
                    <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.1em; color: #059669; text-transform: uppercase;">S · STRENGTHS</div>
                    <div style="font-size: 12px; font-weight: 600; color: var(--sec); margin-top: 3px;">Analytical rigor &amp; self-awareness</div>
                  </div>
                  <div class="card" style="padding: 12px 14px; border-left: 4px solid #f59e0b; border-radius: 12px;">
                    <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.1em; color: #d97706; text-transform: uppercase;">W · WEAKNESSES</div>
                    <div style="font-size: 12px; font-weight: 600; color: var(--sec); margin-top: 3px;">Perfectionist hesitation on deadlines</div>
                  </div>
                  <div class="card" style="padding: 12px 14px; border-left: 4px solid #0284c7; border-radius: 12px;">
                    <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.1em; color: #0284c7; text-transform: uppercase;">O · OPPORTUNITIES</div>
                    <div style="font-size: 12px; font-weight: 600; color: var(--sec); margin-top: 3px;">High affinity for tech leadership</div>
                  </div>
                  <div class="card" style="padding: 12px 14px; border-left: 4px solid #f43f5e; border-radius: 12px;">
                    <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.1em; color: #e11d48; text-transform: uppercase;">T · THREATS</div>
                    <div style="font-size: 12px; font-weight: 600; color: var(--sec); margin-top: 3px;">Academic burnout during finals</div>
                  </div>
                </div>

                <!-- Download PDF Button Badge -->
                <div class="card" id="sc3-pdf-btn" style="display: inline-flex; align-items: center; gap: 10px; padding: 10px 22px; border-radius: 999px; background: var(--g-a); color: #ffffff; box-shadow: 0 10px 25px rgba(15, 118, 110, 0.3); width: fit-content;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span style="font-size: 14px; font-weight: 700;">Download Report PDF</span>
                  <span style="font-size: 10px; background: rgba(255,255,255,0.22); padding: 2px 6px; border-radius: 4px;">Ready</span>
                </div>
              </div>

              <!-- Right Column: Full-Size Guidance Report Browser with Centered SWOT Modal -->
              <div class="showcase-col">
                <div class="browser-frame" id="sc3-shot-summary">
                  <div class="browser-header">
                    <div class="browser-dots">
                      <span class="browser-dot dot-red"></span>
                      <span class="browser-dot dot-yellow"></span>
                      <span class="browser-dot dot-green"></span>
                    </div>
                    <div class="browser-url">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      <span>saarthi.ai/reports/session-analysis</span>
                    </div>
                    <div class="browser-badge">Automated Synthesis</div>
                  </div>
                  <div class="browser-content">
                    <img src="shots/Session Report.png" alt="Guidance Report Overview">
                    
                    <!-- Centered, large, highly readable SWOT Modal that pops in at W(3, 'swot') -->
                    <div id="sc3-shot-modal" style="position: absolute; width: 880px; height: 530px; top: 35px; left: 135px; border-radius: 16px; overflow: hidden; box-shadow: 0 30px 80px rgba(15, 23, 42, 0.45); border: 2px solid #14b8a6; background: #ffffff; z-index: 5; opacity: 0; transform-origin: center center;">
                      <img src="shots/Report 1.png" alt="SWOT Analysis Report Detail" style="width: 100%; height: 100%; object-fit: contain; background: #ffffff;">
                      <div class="pulse-ring" id="sc3-swot-pulse" style="width: 120px; height: 120px; top: 46%; left: 50%;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ==========================================
             SCENE 4: VISUAL ROADMAP & BADGES (S4)
        =========================================== -->
        <section class="scene" id="sc4">
          <div class="out" id="out4">
            <div class="ct">
              <!-- Left Column: Narrative & Profile Badges -->
              <div class="narrative-col">
                <div class="eyebrow" id="sc4-eyebrow">
                  <span class="eyebrow-dot"></span>
                  <span>Goal Execution · MIET Verified Badges</span>
                </div>

                <div class="h2" id="sc4-headline">
                  Interactive <span class="gradient-text">Visual Roadmaps</span> to Earned Badges.
                </div>

                <p class="lead" id="sc4-subtext" style="margin-bottom: 20px;">
                  Turn insights into real progress with day-wise milestones, mapping every completed goal to verified competency badges.
                </p>

                <!-- Profile card with badge preview -->
                <div class="card heavy-shadow" id="sc4-profile-badge-card" style="padding: 16px 18px; border-radius: 18px; display: flex; align-items: center; gap: 16px; margin-bottom: 14px;">
                  <div style="width: 58px; height: 58px; border-radius: 14px; background: rgba(245, 158, 11, 0.12); display: flex; align-items: center; justify-content: center; border: 2px solid rgba(245, 158, 11, 0.3); flex-shrink: 0;">
                    <img src="shots/badge.png" alt="Competency Badge" style="width: 40px; height: 40px; object-fit: contain;">
                  </div>
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 14px; font-weight: 800; color: var(--sec);">MERN &amp; Cloud Arch</span>
                      <span style="font-size: 9px; font-weight: 700; color: #b45309; background: #fef3c7; padding: 2px 6px; border-radius: 4px;">VERIFIED</span>
                    </div>
                    <p style="font-size: 11px; color: var(--muted); margin-top: 3px;">Earned through completed Saarthi roadmap milestones &amp; verified by MIET.</p>
                  </div>
                </div>

                <!-- Milestone chip -->
                <div class="badge-pill" id="sc4-floating-milestone" style="font-size: 12px; padding: 8px 16px; width: fit-content;">
                  <span style="color: var(--accent); font-weight: 800;">✓</span>
                  <span>Day-Wise Execution · Curated Resources</span>
                </div>
              </div>

              <!-- Right Column: Visual Roadmap Browser Showcase -->
              <div class="showcase-col">
                <div class="browser-frame" id="sc4-shot-roadmap">
                  <div class="browser-header">
                    <div class="browser-dots">
                      <span class="browser-dot dot-red"></span>
                      <span class="browser-dot dot-yellow"></span>
                      <span class="browser-dot dot-green"></span>
                    </div>
                    <div class="browser-url">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      <span>saarthi.ai/roadmap/software-engineer</span>
                    </div>
                    <div class="browser-badge">Interactive Roadmap</div>
                  </div>
                  <div class="browser-content">
                    <img src="shots/Roadmap 2.png" alt="Day-Wise Interactive Roadmap">
                    <div class="hl-box" id="sc4-hl-day1" style="top: 14%; left: 6%; width: 44%; height: 68%;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ==========================================
             SCENE 5: ATS RESUME ANALYZER (S5)
        =========================================== -->
        <section class="scene" id="sc5">
          <div class="out" id="out5">
            <div class="ct">
              <!-- Left Column: ATS Score & Narrative -->
              <div class="narrative-col">
                <div class="eyebrow" id="sc5-eyebrow">
                  <span class="eyebrow-dot"></span>
                  <span>Target Role Alignment · Semantic Auditing</span>
                </div>

                <div class="h2" id="sc5-headline">
                  ATS Resume Analyzer &amp; <span class="gradient-text">Competency Radar</span>.
                </div>

                <p class="lead" id="sc5-subtext" style="margin-bottom: 20px;">
                  Test your resume against any target role with visual radar scoring, formatting audits, and high-impact bullet rewrites.
                </p>

                <!-- High Impact Bullet Point Rewrite comparison -->
                <div class="card" id="sc5-rewrite-card" style="padding: 14px 16px; border-radius: 16px; margin-bottom: 14px;">
                  <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: var(--muted); text-transform: uppercase; margin-bottom: 5px;">Bullet Point Optimization</div>
                  <div style="font-size: 11px; color: #94a3b8; text-decoration: line-through; margin-bottom: 4px;">
                    "Worked on backend APIs using Express and connected it with MongoDB."
                  </div>
                  <div style="font-size: 12px; font-weight: 700; color: var(--accent); display: flex; align-items: flex-start; gap: 6px;">
                    <span>⚡</span>
                    <span>"Architected 14+ RESTful endpoints in Node.js/MongoDB with JWT authentication, boosting query throughput by 42%."</span>
                  </div>
                </div>

                <!-- 3 Audit Pills -->
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <div class="badge-pill" style="font-size: 11px; padding: 5px 12px;">
                    <span style="color: #10b981;">✓</span>
                    <span>Quantified Impact</span>
                  </div>
                  <div class="badge-pill" style="font-size: 11px; padding: 5px 12px;">
                    <span style="color: #10b981;">✓</span>
                    <span>ATS Layout Safe</span>
                  </div>
                  <div class="badge-pill" style="font-size: 11px; padding: 5px 12px;">
                    <span style="color: #10b981;">✓</span>
                    <span>Role Keyword Match</span>
                  </div>
                </div>
              </div>

              <!-- Right Column: Staggered Resume Panels & Radar Chart -->
              <div class="showcase-col">
                <div class="browser-frame" id="sc5-shot-radar">
                  <div class="browser-header">
                    <div class="browser-dots">
                      <span class="browser-dot dot-red"></span>
                      <span class="browser-dot dot-yellow"></span>
                      <span class="browser-dot dot-green"></span>
                    </div>
                    <div class="browser-url">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      <span>saarthi.ai/resume/analyzer</span>
                    </div>
                    <div class="browser-badge">ATS Score &amp; Competency Radar</div>
                  </div>
                  <div class="browser-content">
                    <img src="shots/Resume 2.png" alt="Competency Radar Chart">
                    <div class="pulse-ring" id="sc5-radar-pulse" style="width: 130px; height: 130px; top: 48%; left: 38%;"></div>
                    
                    <!-- High-impact bullet rewrites audit detail card that slides in at W(5, 'rewrites') -->
                    <div id="sc5-shot-score" style="position: absolute; width: 440px; height: 280px; bottom: 20px; right: 25px; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.35); border: 1.5px solid rgba(226, 232, 240, 0.9); background: #ffffff; z-index: 4; opacity: 0;">
                      <img src="shots/Resume 3.png" alt="ATS Bullet Point Rewrites Audit" style="width: 100%; height: 100%; object-fit: contain; background: #ffffff;">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ==========================================
             SCENE 6: SMART JOB BOARD (S6)
        =========================================== -->
        <section class="scene" id="sc6">
          <div class="out" id="out6">
            <div class="ct">
              <!-- Left Column: Smart Placement Narrative -->
              <div class="narrative-col">
                <div class="eyebrow" id="sc6-eyebrow">
                  <span class="eyebrow-dot"></span>
                  <span>Intelligent Placement · Skill Matching</span>
                </div>

                <div class="h2" id="sc6-headline">
                  Smart Job Board Ranked by <span class="gradient-text">Match Percentage</span>.
                </div>

                <p class="lead" id="sc6-subtext" style="margin-bottom: 20px;">
                  Connect your verified skills directly with live career opportunities, ranked in real time by your personalized match score.
                </p>

                <!-- High Match Pill Banner -->
                <div class="card heavy-shadow" id="sc6-match-card" style="padding: 16px 18px; border-radius: 18px; margin-bottom: 16px; border-left: 5px solid var(--accent-light);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent);">Personalized Job Ranking</span>
                    <span style="font-size: 14px; font-weight: 800; color: #059669; background: #ecfdf5; padding: 3px 8px; border-radius: 6px;">94% MATCH</span>
                  </div>
                  <h3 style="font-size: 16px; font-weight: 800; color: var(--sec);">Full Stack Engineer · Cloud Platform</h3>
                  <p style="font-size: 11px; color: var(--muted); margin-top: 3px;">Direct skill alignment with your completed Saarthi milestones.</p>
                </div>

                <!-- Location & Types Tags -->
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <span class="badge-pill" style="font-size: 11px; padding: 5px 12px;">📍 Jammu / Delhi / Remote</span>
                  <span class="badge-pill" style="font-size: 11px; padding: 5px 12px;">💼 Full-time &amp; Internships</span>
                  <span class="badge-pill" style="font-size: 11px; padding: 5px 12px;">⚡ 1-Click Application</span>
                </div>
              </div>

              <!-- Right Column: Job Board Screenshot Browser Showcase -->
              <div class="showcase-col">
                <div class="browser-frame" id="sc6-shot-job">
                  <div class="browser-header">
                    <div class="browser-dots">
                      <span class="browser-dot dot-red"></span>
                      <span class="browser-dot dot-yellow"></span>
                      <span class="browser-dot dot-green"></span>
                    </div>
                    <div class="browser-url">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      <span>saarthi.ai/jobs/matches</span>
                    </div>
                    <div class="browser-badge">Smart Career Matching</div>
                  </div>
                  <div class="browser-content">
                    <img src="shots/Job.png" alt="Smart Job Board Live Opportunities">
                    <div class="pulse-ring" id="sc6-job-pulse" style="width: 130px; height: 130px; top: 38%; left: 78%;"></div>
                    <div class="hl-box" id="sc6-hl-job" style="top: 26%; left: 66%; width: 31%; height: 32%; border-color: var(--emerald);"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ==========================================
             SCENE 7: PAYOFF & LOGO LOCKUP (S7)
        =========================================== -->
        <section class="scene" id="sc7">
          <div class="out" id="out7">
            <div class="ct" style="justify-content: center; text-align: center;">
              <div style="max-width: 980px; z-index: 2; display: flex; flex-direction: column; align-items: center;">
                
                <div class="eyebrow" id="sc7-eyebrow">
                  <span class="eyebrow-dot"></span>
                  <span>Personal Clarity to Professional Placement</span>
                </div>

                <div class="h1" id="sc7-headline" style="font-size: 64px; line-height: 1.1; margin-bottom: 18px;">
                  Guidance for Every Step of <br><span class="gradient-text">Your Journey</span>.
                </div>

                <p class="lead" id="sc7-subtext" style="font-size: 22px; max-width: 800px; margin-bottom: 34px;">
                  Empathetic, confidential, and always available. <br>Saarthi.ai is your complete guide.
                </p>

                <!-- Grand Logo Lockup Box -->
                <div class="card heavy-shadow" id="sc7-lockup" style="padding: 22px 38px; border-radius: 999px; display: inline-flex; align-items: center; gap: 20px;">
                  <img src="shots/logo.png" alt="Saarthi Logo" style="height: 48px; object-fit: contain;">
                  <div style="text-align: left;">
                    <div style="font-size: 26px; font-weight: 800; color: var(--sec); line-height: 1;">Saarthi.ai</div>
                    <div style="font-size: 11px; font-weight: 700; color: var(--accent); letter-spacing: 0.12em; text-transform: uppercase; margin-top: 3px;">Powered by MIET AI Gateway</div>
                  </div>
                  <div style="width: 1px; height: 34px; background: rgba(0,0,0,0.1); margin: 0 4px;"></div>
                  <div style="display: flex; gap: 8px;">
                    <span class="badge-pill" style="font-size: 11px; padding: 5px 10px;">3D Mentors</span>
                    <span class="badge-pill" style="font-size: 11px; padding: 5px 10px;">SWOT Report</span>
                    <span class="badge-pill" style="font-size: 11px; padding: 5px 10px;">Visual Roadmap</span>
                    <span class="badge-pill" style="font-size: 11px; padding: 5px 10px;">Smart Jobs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>\n\n`;

const sIdx = html.indexOf(startMarker);
const eIdx = html.indexOf(endMarker);

if (sIdx === -1 || eIdx === -1) {
  console.error("Could not find markers for scenes HTML replacement!", sIdx, eIdx);
  process.exit(1);
}

html = html.slice(0, sIdx) + scenesNewHtml + html.slice(eIdx);

// 2. Replace the animation code in section 6
const animStartMarker = '/* =======================================================================\n   6. SCENE-SPECIFIC VISUAL BEATS AND WORD CUES\n======================================================================= */';
const animEndMarker = '/* =======================================================================\n   7. MASTER CLOCK, SEEK CONTROLLER & PREVIEW UI\n======================================================================= */';

const newAnimCode = `/* =======================================================================
   6. SCENE-SPECIFIC VISUAL BEATS AND WORD CUES
======================================================================= */

// SCENE 0 (S0)
DRAW(document.querySelector("#sc0-svg-circle"), W(0, "hello"), W(0, "welcome"));
DRAW(document.querySelector("#sc0-svg-brain"), W(0, "welcome"), W(0, "saarthi"));
DRAW(document.querySelector("#sc0-svg-synapses"), W(0, "saarthi"), W(0, "companion"));

IN(document.querySelector("#sc0-eyebrow"), 0.4, 0.6, { transform: "translateY(-20px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
const sc0Words = split(document.querySelector("#sc0-headline"));
const sc0WordTimes = sc0Words.map((_, i) => W(0, "welcome") + i * 0.16);
KIN(sc0Words, sc0WordTimes);

IN(document.querySelector("#sc0-subtext"), W(0, "personalized"), 0.7, { transform: "translateY(20px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
IN(document.querySelector("#sc0-pillars"), W(0, "mentorship"), 0.6, { transform: "translateY(24px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }, SPRING);

IN(document.querySelector("#sc0-hero-shot"), W(0, "companion"), 0.85, 
   { transform: "translateY(30px) scale(0.96)", opacity: 0 }, 
   { transform: "translateY(0px) scale(1.0)", opacity: 1 }, SPRING);
PULSE(document.querySelector("#sc0-hero-ring"), W(0, "mentorship"));

// SCENE 1 (S1)
IN(document.querySelector("#sc1-eyebrow"), W(1, "whenever"), 0.5, { transform: "translateY(-15px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
const sc1Words = split(document.querySelector("#sc1-headline"));
const sc1WordTimes = sc1Words.map((_, i) => W(1, "guidance") + i * 0.15);
KIN(sc1Words, sc1WordTimes);

IN(document.querySelector("#sc1-subtext"), W(1, "safe"), 0.6, { transform: "translateY(20px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
IN(document.querySelector("#sc1-features"), W(1, "converse"), 0.7, { transform: "translateY(20px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });

IN(document.querySelector("#sc1-shot-front"), W(1, "mentors"), 0.85,
   { transform: "translateY(30px) scale(0.96)", opacity: 0 },
   { transform: "translateY(0px) scale(1.0)", opacity: 1 }, SPRING);

IN(document.querySelector("#sc1-shot-back"), W(1, "adapt"), 0.8,
   { opacity: 0, transform: "scale(0.98)" },
   { opacity: 1, transform: "scale(1.0)" }, EOUT);

PULSE(document.querySelector("#sc1-wave-ring"), W(1, "listen"), 1.4);
IN(document.querySelector("#sc1-hl-box"), W(1, "speak"), 0.5, { opacity: 0, transform: "scale(0.95)" }, { opacity: 1, transform: "scale(1.0)" }, SPRING);

// SCENE 2 (S2)
IN(document.querySelector("#sc2-eyebrow"), W(2, "covering"), 0.5, { transform: "translateY(-15px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
const sc2Words = split(document.querySelector("#sc2-headline"));
const sc2WordTimes = sc2Words.map((_, i) => W(2, "covering") + i * 0.18);
KIN(sc2Words, sc2WordTimes);

IN(document.querySelector("#sc2-subtext"), W(2, "confidence"), 0.6, { transform: "translateY(20px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
IN(document.querySelector("#sc2-memory-card"), W(2, "remember"), 0.7, { transform: "translateX(-30px)", opacity: 0 }, { transform: "translateX(0)", opacity: 1 }, SPRING);
IN(document.querySelector("#sc2-domains"), W(2, "direction"), 0.6, { transform: "translateY(16px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });

IN(document.querySelector("#sc2-shot-counselors"), W(2, "covering"), 0.85,
   { transform: "translateY(30px) scale(0.96)", opacity: 0 },
   { transform: "translateY(0px) scale(1.0)", opacity: 1 }, SPRING);

IN(document.querySelector("#sc2-hl-alex"), W(2, "emotional"), 0.4, { opacity: 0 }, { opacity: 1 });
IN(document.querySelector("#sc2-hl-maya"), W(2, "confidence"), 0.4, { opacity: 0 }, { opacity: 1 });
IN(document.querySelector("#sc2-hl-ethan"), W(2, "relationships"), 0.4, { opacity: 0 }, { opacity: 1 });
IN(document.querySelector("#sc2-hl-marcus"), W(2, "direction"), 0.4, { opacity: 0 }, { opacity: 1 });

// SCENE 3 (S3)
IN(document.querySelector("#sc3-eyebrow"), W(3, "after"), 0.5, { transform: "translateY(-15px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
const sc3Words = split(document.querySelector("#sc3-headline"));
const sc3WordTimes = sc3Words.map((_, i) => W(3, "guidance") + i * 0.16);
KIN(sc3Words, sc3WordTimes);

IN(document.querySelector("#sc3-subtext"), W(3, "actionable"), 0.6, { transform: "translateY(20px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
IN(document.querySelector("#sc3-swot-grid"), W(3, "swot"), 0.7, { transform: "translateY(20px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }, SPRING);
IN(document.querySelector("#sc3-pdf-btn"), W(3, "downloadable"), 0.6, { transform: "scale(0.85)", opacity: 0 }, { transform: "scale(1.0)", opacity: 1 }, SPRING);

IN(document.querySelector("#sc3-shot-summary"), W(3, "after"), 0.85,
   { transform: "translateY(30px) scale(0.96)", opacity: 0 },
   { transform: "translateY(0px) scale(1.0)", opacity: 1 }, SPRING);

IN(document.querySelector("#sc3-shot-modal"), W(3, "swot"), 0.8,
   { transform: "scale(0.88) translateY(24px)", opacity: 0 },
   { transform: "scale(1.0) translateY(0px)", opacity: 1 }, SPRING);
PULSE(document.querySelector("#sc3-swot-pulse"), W(3, "pdf"));

// SCENE 4 (S4)
IN(document.querySelector("#sc4-eyebrow"), W(4, "turn"), 0.5, { transform: "translateY(-15px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
const sc4Words = split(document.querySelector("#sc4-headline"));
const sc4WordTimes = sc4Words.map((_, i) => W(4, "visual") + i * 0.16);
KIN(sc4Words, sc4WordTimes);

IN(document.querySelector("#sc4-subtext"), W(4, "milestones"), 0.6, { transform: "translateY(20px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
IN(document.querySelector("#sc4-profile-badge-card"), W(4, "badges"), 0.7, { transform: "translateX(-30px)", opacity: 0 }, { transform: "translateX(0)", opacity: 1 }, SPRING);
IN(document.querySelector("#sc4-floating-milestone"), W(4, "curated"), 0.6, { transform: "translateY(20px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }, SPRING);

IN(document.querySelector("#sc4-shot-roadmap"), W(4, "turn"), 0.85,
   { transform: "translateY(30px) scale(0.96)", opacity: 0 },
   { transform: "translateY(0px) scale(1.0)", opacity: 1 }, SPRING);
IN(document.querySelector("#sc4-hl-day1"), W(4, "milestones"), 0.5, { opacity: 0, transform: "scale(0.95)" }, { opacity: 1, transform: "scale(1.0)" }, SPRING);

// SCENE 5 (S5)
IN(document.querySelector("#sc5-eyebrow"), W(5, "ready"), 0.5, { transform: "translateY(-15px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
const sc5Words = split(document.querySelector("#sc5-headline"));
const sc5WordTimes = sc5Words.map((_, i) => W(5, "ats") + i * 0.16);
KIN(sc5Words, sc5WordTimes);

IN(document.querySelector("#sc5-subtext"), W(5, "tests"), 0.6, { transform: "translateY(20px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
IN(document.querySelector("#sc5-rewrite-card"), W(5, "rewrites"), 0.7, { transform: "translateY(20px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }, SPRING);

IN(document.querySelector("#sc5-shot-radar"), W(5, "ready"), 0.85,
   { transform: "translateY(30px) scale(0.96)", opacity: 0 },
   { transform: "translateY(0px) scale(1.0)", opacity: 1 }, SPRING);

IN(document.querySelector("#sc5-shot-score"), W(5, "rewrites"), 0.8,
   { transform: "translateY(30px) scale(0.92)", opacity: 0 },
   { transform: "translateY(0px) scale(1.0)", opacity: 1 }, SPRING);
PULSE(document.querySelector("#sc5-radar-pulse"), W(5, "radar"));

// SCENE 6 (S6)
IN(document.querySelector("#sc6-eyebrow"), W(6, "finally"), 0.5, { transform: "translateY(-15px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
const sc6Words = split(document.querySelector("#sc6-headline"));
const sc6WordTimes = sc6Words.map((_, i) => W(6, "smart") + i * 0.16);
KIN(sc6Words, sc6WordTimes);

IN(document.querySelector("#sc6-subtext"), W(6, "connects"), 0.6, { transform: "translateY(20px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
IN(document.querySelector("#sc6-match-card"), W(6, "ranked"), 0.7, { transform: "translateY(20px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }, SPRING);

IN(document.querySelector("#sc6-shot-job"), W(6, "finally"), 0.85,
   { transform: "translateY(30px) scale(0.96)", opacity: 0 },
   { transform: "translateY(0px) scale(1.0)", opacity: 1 }, SPRING);
PULSE(document.querySelector("#sc6-job-pulse"), W(6, "percentage"));
IN(document.querySelector("#sc6-hl-job"), W(6, "percentage"), 0.5, { opacity: 0 }, { opacity: 1 }, SPRING);

// SCENE 7 (S7)
IN(document.querySelector("#sc7-eyebrow"), W(7, "clarity"), 0.5, { transform: "translateY(-15px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
const sc7Words = split(document.querySelector("#sc7-headline"));
const sc7WordTimes = sc7Words.map((_, i) => W(7, "clarity") + i * 0.18);
KIN(sc7Words, sc7WordTimes);

IN(document.querySelector("#sc7-subtext"), W(7, "saarthi"), 0.7, { transform: "translateY(25px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 });
IN(document.querySelector("#sc7-lockup"), W(7, "complete"), 0.8, { transform: "scale(0.85) translateY(24px)", opacity: 0 }, { transform: "scale(1.0) translateY(0px)", opacity: 1 }, SPRING);
\n`;

const aStart = html.indexOf(animStartMarker);
const aEnd = html.indexOf(animEndMarker);

if (aStart === -1 || aEnd === -1) {
  console.error("Could not find markers for animation code replacement!", aStart, aEnd);
  process.exit(1);
}

html = html.slice(0, aStart) + newAnimCode + html.slice(aEnd);

fs.writeFileSync(indexPath, html);
console.log("Successfully applied readable layout HTML and WAAPI animations to index.html!");
