const express = require("express");
const { protectCookie } = require("../middleware/authMiddleware");
const { callGatewayLLM } = require("../config/llmService");

const router = express.Router();

router.post("/", protectCookie, async (req, res) => {
  try {
    const { messages, model } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "Invalid messages format" });
    }

    // Clean messages for the gateway
    const cleanMessages = messages
      .filter((m) => m && m.role && m.content)
      .map((m) => ({ role: m.role, content: String(m.content).trim() }));

    const selectedModel = model || "llama3.1:8b";
    let responseContent;
    try {
      responseContent = await callGatewayLLM(cleanMessages, selectedModel);
    } catch (primaryErr) {
      console.warn(`Primary model ${selectedModel} failed, trying fallback gpt-oss:20b:`, primaryErr.message);
      responseContent = await callGatewayLLM(cleanMessages, "gpt-oss:20b");
    }
    
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
