const express = require("express");
const {
  getChat,
  getUserChatSessions,
  getChatSessionById,
  createChatSession,
  appendChatSessionMessage,
  renameChatSession,
  deleteChatSession,
  handleSendChat,
  handleCreateReport,
  handleCreateRoadmap,
  handleRoadmapUpdation,
  handleTaskUpdate,
} = require("../controllers/chatControllers");
const { protect, protectCookie } = require("../middleware/authMiddleware");

const router = express.Router();

// ChatGPT-style Session Management (Must precede /:counselorType wildcard)
router.get("/sessions", protectCookie, getUserChatSessions);
router.post("/sessions", protectCookie, createChatSession);
router.get("/sessions/:id", protectCookie, getChatSessionById);
router.post("/sessions/:id/messages", protectCookie, appendChatSessionMessage);
router.patch("/sessions/:id", protectCookie, renameChatSession);
router.delete("/sessions/:id", protectCookie, deleteChatSession);

// Existing Counselor Routes
router.get("/:counselorType", protectCookie, getChat);
router.post("/", protectCookie, handleSendChat);
router.post("/report", protectCookie, handleCreateReport);
router
  .route("/roadmap")
  .post(protectCookie, handleCreateRoadmap)
  .put(protectCookie, handleTaskUpdate);
router.post("/updateroadmap", handleRoadmapUpdation);

module.exports = router;
