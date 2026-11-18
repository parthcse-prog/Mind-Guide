import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ChatApp from "./pages/ChatApp";
import Tools from "./pages/Tools";
import ScrollToTop from "./components/ScrollToTop";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import ProtectRoute from "./components/ProtectRoute";
import VisualRoadmap from "./pages/VisualRoadmap";
import Dashboard from "./pages/Dashboard.jsx";
import GetAllReports from "./components/Dashboard/GetAllReports.jsx";
import GetRoadmap from "./components/Dashboard/GetRoadmap.jsx";
import Profile from "./components/Dashboard/Profile.jsx";
import HeroDashBoard from "./components/Dashboard/HeroDashBoard.jsx";
import { ThemeProvider } from "./context/ThemeContext";

axios.defaults.baseURL = "http://localhost:3001";
axios.defaults.withCredentials = true;
function App() {
  const userInfo = useSelector((state) => state.mindGuide.userInfo);
  console.log("userInfo ", userInfo);
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route element={<ProtectRoute userInfo={userInfo} />}>
              <Route index element={<Home />} />
              <Route path="about" element={<Home />} />
              <Route path="overview" element={<Home />} />
              <Route path="chat" element={<ChatApp />} />
              <Route path="counselors" element={<Navigate to="/chat" replace />} />
              <Route path="counselors/chat/:type" element={<ChatApp />} />
              <Route path="tools" element={<Tools />} />
              <Route path="profile" element={<Navigate to="/account/dashboard/profile" replace />} />
              <Route path="account/dashboard" element={<Dashboard />}>
                <Route index element={<HeroDashBoard />} />
                <Route path="reports" element={<GetAllReports />} />
                <Route path="getRoadmap" element={<GetRoadmap />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
          <Route path="visualRoadmap" element={<VisualRoadmap />} />
        </Routes>
      </Router>
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;
