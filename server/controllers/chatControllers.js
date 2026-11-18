const asyncHandler = require("express-async-handler");
const User = require("../model/User");
const ChatSession = require("../model/ChatSession");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const axios = require("axios");
const { callGatewayLLM } = require("../config/llmService");

let messages = [];
function updateChat(messages, role, content) {
  messages.push({ role, content });
  return messages;
}

async function getChatGPTResponse(messages) {
  return await callGatewayLLM(messages);
}

// Reusable helper to build personalized companion messages for life, mental health, relationships & youth guidance
async function buildInitialCounselorMessages(user, counselorType) {
  const name = user?.name || "Friend";

  const guidePrompt = `You are Saarthi.ai (सारथी - your trusted companion and personal guide), developed by MIET.
Active Companion Persona: ${counselorType}.
You are speaking with ${name}.
Your mission is to provide an open, non-judgmental, psychologically safe, and supportive space for:
- Open "Ask Me Anything" on any question, curiosities, everyday situations, learning, and life decisions.
- Thoughtful advice, perspective, clarity, and personal growth.

GUIDELINES:
1. Speak with genuine warmth, clarity, emotional intelligence, and sincere attentiveness.
2. Validate the user's thoughts and feelings without judgment or preaching.
3. Provide grounded, insightful, and practical answers to whatever they ask.
4. Keep the conversation open, versatile, and supportive.`;

  return [
    {
      role: "system",
      content: guidePrompt,
    },
    {
      role: "assistant",
      content: `Hello ${name}! I'm your Saarthi companion. I'm here to listen, answer your questions, and explore whatever is on your mind. How can I help you today?`,
    },
  ];
}

const getChat = asyncHandler(async (req, res) => {
  const counselorType = req.params.counselorType;
  try {
    const user = await User.findById(req.user._id);
    const initialMessages = await buildInitialCounselorMessages(user, counselorType);

    // Create a new persistent chat session in MongoDB
    const session = await ChatSession.create({
      user: user._id,
      counselorType,
      title: `New ${counselorType.charAt(0).toUpperCase() + counselorType.slice(1)} Session`,
      messages: initialMessages,
      lastActivity: new Date(),
    });

    if (user) {
      user.sessionHistory.push({ date: new Date(), status: "started" });
      await user.save();
    }

    res.setHeader("X-Session-Id", session._id.toString());
    const responseData = initialMessages.map(m => ({ role: m.role, content: m.content }));
    res.status(200).json(Object.assign(responseData, { sessionId: session._id.toString() }));
  } catch (err) {
    console.error("Error in getting chat", err);
    res.status(500).send("Internal Server Error");
  }
});

// GET /api/v1/chat/sessions - Fetch all past chat sessions for current user
const getUserChatSessions = asyncHandler(async (req, res) => {
  try {
    const { counselorType } = req.query;
    const filter = { user: req.user._id, isArchived: { $ne: true } };
    if (counselorType) {
      filter.counselorType = new RegExp(`^${counselorType}$`, "i");
    }

    const sessions = await ChatSession.find(filter)
      .sort({ lastActivity: -1 })
      .select("_id title counselorType lastActivity createdAt messages")
      .lean();

    const formatted = sessions.map((s) => {
      const userMsgCount = s.messages.filter((m) => m.role === "user").length;
      const lastUserOrBotMsg = [...s.messages].reverse().find((m) => m.role !== "system");
      return {
        _id: s._id,
        title: s.title,
        counselorType: s.counselorType,
        lastActivity: s.lastActivity || s.createdAt,
        createdAt: s.createdAt,
        messageCount: userMsgCount,
        preview: lastUserOrBotMsg?.content ? lastUserOrBotMsg.content.substring(0, 85) : "",
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    console.error("Error fetching user chat sessions:", err);
    res.status(500).json({ success: false, message: "Failed to fetch chat sessions" });
  }
});

// GET /api/v1/chat/sessions/:id - Fetch full messages for a specific session
const getChatSessionById = asyncHandler(async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Chat session not found" });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err) {
    console.error("Error fetching chat session by id:", err);
    res.status(500).json({ success: false, message: "Failed to fetch chat session" });
  }
});

// POST /api/v1/chat/sessions - Start a new persistent session
const createChatSession = asyncHandler(async (req, res) => {
  try {
    const counselorType = req.body.counselorType || req.query.counselorType || "academic counselor";
    const user = await User.findById(req.user._id);
    const initialMessages = await buildInitialCounselorMessages(user, counselorType);

    const title = req.body.title || `New ${counselorType.charAt(0).toUpperCase() + counselorType.slice(1)} Session`;
    const session = await ChatSession.create({
      user: req.user._id,
      counselorType,
      title,
      messages: initialMessages,
      lastActivity: new Date(),
    });

    if (user) {
      user.sessionHistory.push({ date: new Date(), status: "started" });
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (err) {
    console.error("Error creating chat session:", err);
    res.status(500).json({ success: false, message: "Failed to create chat session" });
  }
});

// POST /api/v1/chat/sessions/:id/messages - Append user/assistant messages to session & auto-title
const appendChatSessionMessage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { userMessage, assistantMessage, messages } = req.body;

    const session = await ChatSession.findOne({ _id: id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: "Chat session not found" });
    }

    let messagesToAdd = [];
    if (Array.isArray(messages) && messages.length > 0) {
      messagesToAdd = messages;
    } else {
      if (userMessage) messagesToAdd.push(userMessage);
      if (assistantMessage) messagesToAdd.push(assistantMessage);
    }

    for (const m of messagesToAdd) {
      if (m && m.role && m.content) {
        session.messages.push({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp || new Date(),
        });
      }
    }

    // Auto-generate title if currently default
    if (session.title.startsWith("New ") || session.title.includes("Counseling Session")) {
      const firstUserMsg = session.messages.find((m) => m.role === "user");
      if (firstUserMsg && firstUserMsg.content) {
        const cleanPrompt = firstUserMsg.content.trim().replace(/[\r\n]+/g, " ");
        const words = cleanPrompt.split(" ");
        session.title = words.slice(0, 6).join(" ") + (words.length > 6 ? "..." : "");
      }
    }

    session.lastActivity = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      data: {
        _id: session._id,
        title: session.title,
        lastActivity: session.lastActivity,
        messages: session.messages,
      },
    });
  } catch (err) {
    console.error("Error appending message to session:", err);
    res.status(500).json({ success: false, message: "Failed to save message to session" });
  }
});

// PATCH /api/v1/chat/sessions/:id - Rename a session
const renameChatSession = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const session = await ChatSession.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { title: title.trim(), lastActivity: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: "Chat session not found" });
    }

    res.status(200).json({ success: true, data: session });
  } catch (err) {
    console.error("Error renaming chat session:", err);
    res.status(500).json({ success: false, message: "Failed to rename chat session" });
  }
});

// DELETE /api/v1/chat/sessions/:id - Delete a session
const deleteChatSession = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const session = await ChatSession.findOneAndDelete({ _id: id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: "Chat session not found" });
    }
    res.status(200).json({ success: true, message: "Session deleted successfully" });
  } catch (err) {
    console.error("Error deleting chat session:", err);
    res.status(500).json({ success: false, message: "Failed to delete chat session" });
  }
});
const handleSendChat = asyncHandler(async (req, res) => {
  try {
    const inputMessages = req.body?.messages;
    if (!inputMessages || !Array.isArray(inputMessages) || inputMessages.length === 0) {
      return res.status(400).json({ message: "Invalid or missing messages in request body" });
    }

    const modelResponse = await getChatGPTResponse(inputMessages);
    res.status(200).json(modelResponse);
  } catch (err) {
    const errorDetails = err?.response?.data || err?.message || err;
    console.error("Error processing chat request:", errorDetails);
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: errorDetails 
    });
  }
});

const handleCreateReport = asyncHandler(async (req, res) => {
  const { chat, userName, counsellorType } = req.body;
  console.log(chat);
  if (!chat || chat.length == 0) {
    res.status(400);
    throw new Error("Failed to create the report!!");
  }
  try {
    const gptReportPrompt = [
      ...chat,
      {
        role: "system",
        content: `I am ${userName} I want you to create a report from the above chat conversation for the user. compile a formal report with proper space and headings, including SWOT analysis, roadmap, tips, recommendation with proper roadmap, videos, books, blogs,news anything  and tricks to help user. To help user to understand more about him/her.`,
      },
    ];
    const report = await getChatGPTResponse(gptReportPrompt);
    console.log("req.user: ", req.user);
    const user = await User.findById(req.user._id);

    user.reportHistory.push({
      date: new Date(),
      title: `${counsellorType} Session Report`,
    });
    await user.save();

    return res.status(200).json(report);
  } catch (error) {
    res.status(500);
    throw new Error("Internal Server Error", error);
  }
});
const handleCreateRoadmap = asyncHandler(async (req, res) => {
  const { roadmap, chat, messages: reqMessages } = req.body;
  let chatHistory = reqMessages || chat || [];

  try {
    // If not passed in body, fetch user's most recent active conversation session
    if (!chatHistory || chatHistory.length === 0) {
      const latestSession = await ChatSession.findOne({ user: req.user._id })
        .sort({ lastActivity: -1 })
        .lean();
      if (latestSession && Array.isArray(latestSession.messages)) {
        chatHistory = latestSession.messages;
      }
    }

    const cleanChat = chatHistory
      .filter((m) => m && m.role && m.content)
      .map((m) => ({ role: m.role, content: String(m.content).trim() }));

    const roadmapPrompt = [
      ...cleanChat,
      {
        role: "system",
        content: `You are Saarthi.ai's expert Growth and Development Mentor.
Based on the conversation and the user's goals, aspirations, challenges, and current situation, create a comprehensive, day-by-day structured action roadmap.
Return a STRICT JSON array of roadmap objects. Follow this exact schema with NO extra commentary or explanation:
[
  {
    "Goal": "Actionable goal description (e.g. Master React fundamentals)",
    "timeline": "Day 1 - Day 3",
    "recommendations": [
      {
        "title": "Resource or practice module title",
        "link": "https://developer.mozilla.org"
      }
    ],
    "isCompleted": false
  }
]`,
      },
    ];

    const responseText = await callGatewayLLM(roadmapPrompt, "llama3.1:8b");

    let roadmapData = [];
    try {
      const match = responseText.match(/\[[\s\S]*\]/);
      if (match) {
        roadmapData = JSON.parse(match[0]);
      } else {
        roadmapData = JSON.parse(responseText);
      }
    } catch (parseErr) {
      console.warn("JSON parse fallback, trying cleanup:", parseErr.message);
      const cleaned = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        roadmapData = JSON.parse(match[0]);
      }
    }

    if (!Array.isArray(roadmapData) || roadmapData.length === 0) {
      return res.status(500).json({ success: false, message: "Could not structure roadmap items" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { roadmap: roadmapData } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Roadmap generated successfully",
      roadmap: roadmapData,
    });
  } catch (err) {
    console.error("Error creating roadmap:", err.message);
    return res.status(500).json({ success: false, message: err.message || "Failed to generate roadmap" });
  }
});

const handleTaskUpdate = asyncHandler(async (req, res) => {
  const { roadmap } = req.body;
  User.findOneAndUpdate(
    { email: req.user.email },
    { $set: { roadmap } },
    { new: true }
  )
    .then((updatedUser) => {
      if (updatedUser) {
        console.log("User roadmap updated successfully.");
        // Send report via email
      } else {
        console.log("User not found.");
      }
    })
    .catch((error) => {
      console.error("Error updating user roadmap:", error);
    });
});
const handleRoadmapUpdation = asyncHandler(async (req, res) => {
  console.log(messages);

  const { roadmap } = req.body;
  let updatedRoadmapPrompt = [];
  try {
    updatedRoadmapPrompt = [
      ...messages,
      {
        role: "system",
        content: `Pretend you are an expert helpful AI  career counsellor.`,
      },
      {
        role: "user",
        content: ` i am providing a roadmap document which i have completed  ${roadmap} containing all details of goals and recommendation,timeline and iscompleted . now i want you to provide me a new updated roadmap with next goal thing to do in reference with  the current goals . Continue the time for the task with reference to the given roadmap -Do not include any explanations  following this format without deviation.
          [{
            "Goal": "goal to be done",
            "timeline": "timeline based on that goal",
            "recommendations": [{
              "title": "title of the recommendation course",
              "link" : "link of the recommended course"
            }],
            "isCompleted":false(boolean)
          }].`,
      },
    ];
    const responseText = await callGatewayLLM(updatedRoadmapPrompt);

    console.log("HandleUpdateRoadmap ", responseText);
    return res.send(responseText);
  } catch (err) {
    console.error("Error Happened ", err);
    res.status(500).send("Internal Server Error ");
  }
});
module.exports = {
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
};
