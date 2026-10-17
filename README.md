# Mind-Guide 🎓🤖

Mind-Guide (Saarthi) is an AI-powered student counseling, career guidance, and academic mentorship platform. It combines realistic 3D interactive avatars, real-time voice and conversational intelligence, personality profiling, and semantic ATS resume analytics to support students throughout their educational and career journey.

---

## 🌟 Key Features

### 1. Interactive 3D AI Counselors
- **Specialized Mentors**: Dedicated virtual counselors tailored for different domains (e.g., Dr. Alex for Student Life, Marcus Cole for Career & Technical guidance, Ethan Rostova, and Maya Lin).
- **Procedural 3D Avatars (Three.js / React Three Fiber / VRM / Ready Player Me)**:
  - Real-time Web Audio API frequency analysis driving procedural lip-sync.
  - Natural resting posture (fingertips clasped at waist, steady forward gaze, eliminated unnatural arm movements).
  - Voice integration supporting low-latency Kokoro TTS synthesis.

### 2. Intelligent Multi-Model LLM Gateway
- **Interactive Chat Counseling**: Powered by `gpt-oss:20b` via the high-throughput MIET AI Gateway for responsive, empathetic, and context-aware student guidance.
- **Semantic ATS Resume Analyzer**: Powered by `gpt-oss:20b` for structured, actionable resume feedback, scoring, and keyword gap analysis.
- **Resume Deduplication**: Cryptographic SHA-256 buffer hashing to detect and notify users about duplicate resume uploads while maintaining past analysis history in MongoDB.

### 3. Personality & Academic Profiling
- **Big 5 Personality Assessment**: Integrated with PI360 metrics for detailed psychological and behavioral trait insights.
- **Historical Tracking (Time Travel)**: Automatic versioning and deduplicated history logging in MongoDB (`PersonalityLog`), allowing students to track their personal growth across assessments.

---

## 🏗️ Architecture & Tech Stack

### Frontend (`client/`)
- **Core**: React 18, Vite, React Router, Redux Toolkit, Redux Persist
- **3D Graphics & Animation**: Three.js, `@react-three/fiber`, `@react-three/drei`, Maath
- **Styling & UI**: Tailwind CSS, Framer Motion, React Icons, FontAwesome
- **Audio & Speech**: Web Audio API Analyzer, React Speech Recognition

### Backend (`server/`)
- **Runtime**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, HTTP cookies, Google OAuth 2.0, bcryptjs
- **File & Document Processing**: Multer, `pdf-parse`, `docx`
- **Integrations**: MIET AI Gateway (LLM, TTS, Voice Synthesis)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas connection URI
- Access to the AI Services Gateway / API credentials

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Mind-Guide
   ```

2. **Backend Setup**:
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in `server/` with the required configuration:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
   Start the development server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in `client/` if overriding default gateway endpoints:
   ```env
   VITE_OPENAI_API_KEY=your_gateway_token
   ```
   Start the frontend application:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
Mind-Guide/
├── client/                      # React + Vite frontend
│   ├── src/
│   │   ├── components/          # 3D Avatars (AssistantAvatar.jsx), Dashboard, Profile, etc.
│   │   ├── pages/               # ChatApp, Landing, Authentication
│   │   ├── services/            # LLM service (gpt-oss:20b gateway client), TTS & audio
│   │   └── ...
│   └── package.json
├── server/                      # Express.js backend
│   ├── controllers/             # User, resume analyzer, personality controllers
│   ├── model/                   # Mongoose schemas (User, ResumeLog, PersonalityLog, etc.)
│   ├── routes/                  # Express API routes
│   └── package.json
└── procedural-avatar-system/    # Procedural avatar animation assets & scripts
```

---

## 📄 License
This project is proprietary and developed for academic and career counseling. All rights reserved.
