const express = require("express");
const { protectCookie } = require("../middleware/authMiddleware");
const { callGatewayLLM } = require("../config/llmService");

const router = express.Router();

router.post("/", protectCookie, async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "Invalid messages format" });
    }

    const responseContent = await callGatewayLLM(messages, "qwen3:latest");
    
    res.json({
      success: true,
      data: {
        response: responseContent
      }
    });
  } catch (error) {
    console.error("AI Chat Route Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate AI response" });
  }
});

module.exports = router;
