const asyncHandler = require("express-async-handler");
const User = require("../model/User");
const ChatSession = require("../model/ChatSession");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const axios = require("axios");
const { callGatewayLLM } = require("../config/llmService");
const { retrieveCareerContext, formatRagContextForPrompt } = require("../services/ragService");

let messages = [];
function updateChat(messages, role, content) {
  messages.push({ role, content });
  return messages;
}

async function getChatGPTResponse(messages) {
  return await callGatewayLLM(messages);
}

function formatAcademicContextForPrompt(academicRecords) {
  if (!academicRecords || typeof academicRecords !== "object") return "";
  const lines = [];
  const isCommerce =
    String(academicRecords?.twelfth?.stream || "").toLowerCase().includes("commerce") ||
    String(academicRecords?.stream || "").toLowerCase().includes("commerce");

  if (academicRecords.tenth) {
    const t = academicRecords.tenth;
    const sub = (t.subjects || []).map((s) => `${s.name}: ${s.marks}/100${s.grade ? ` (${s.grade})` : ""}`).join(", ");
    lines.push(`- Class 10 (Secondary School - JKBOSE): ${t.percentage || "67.2%"} [School: ${t.school || "Alexander Memorial School, Jammu"}, Roll: ${t.rollNo || "160182011"}] | Subjects: ${sub || "N/A"}`);
  }
  if (academicRecords.twelfth) {
    const tw = academicRecords.twelfth;
    const sub = (tw.subjects || []).map((s) => `${s.name}: ${s.marks}/100${s.grade ? ` (${s.grade})` : ""}`).join(", ");
    lines.push(`- Class 12 (Higher Secondary - JKBOSE): ${tw.percentage || "61.0%"} Stream: ${tw.stream || "COMMERCE"} [School: ${tw.school || "Govt Girls Hr Sec School Mubarak Mandi, Jammu"}, Roll: ${tw.rollNo || "360007073"}] | Division: ${tw.division || "First Division"} | Subjects: ${sub || "N/A"}`);
  }
  if (academicRecords.aadhaar) {
    const a = academicRecords.aadhaar;
    lines.push(`- Identity & Location: Mehak (Female, DOB: ${a.dob || "01/08/2004"}), Resident of ${a.address || "Bahu Fort, Jammu, J&K"}, UIDAI Aadhaar KYC Verified`);
  }

  if (lines.length === 0) return "";

  const guidanceInstruction = `\nSTUDENT STATUS: RECENT 12TH PASS-OUT (COMMERCE STREAM).
CRITICAL GUIDELINE FOR CAREER COUNSELOR & AVATAR AGENTS:
The student, Mehak, has just completed Class 12th in the COMMERCE stream under JKBOSE (Roll: 360007073, First Division 61.0%, with highest marks in Typewriting/Shorthand 79/100, English 72/100, Accountancy 63/100; Class 10th 67.2% GPA 7.00).
She is seeking comprehensive, realistic, and inspiring career counseling and post-12th guidance.
Tailor ALL guidance, roadmaps, college admissions advice, and career answers specifically to someone who has just passed 12th Commerce:
1. Professional Credentials after 12th: CA Foundation (ICAI), Company Secretary Executive Entrance Test (CSEET - ICSI), CMA Foundation (ICMAI), and CFA Foundation roadmap.
2. Higher Education & Degree Programs: B.Com (Honours), B.Com, BBA, BMS, BA Economics, and Integrated 5-Year Law (BA LLB / BBA LLB).
3. Competitive Entrance Examinations: CUET UG (Central Universities admissions), IPMAT (IIM 5-Year Integrated Program in Management), CLAT (National Law Universities), Christ/NMIMS entrance exams.
4. Banking, Finance & Government Trajectories: Preparation roadmap towards Banking roles (IBPS/SBI PO), SSC CHSL (10+2 level government examinations), and foundation for Civil Services (UPSC CSE / JKPSC).
5. Immediate High-ROI Skills to Learn after 12th: Financial modeling in Excel, Tally Prime accounting, GST filing basics, Business Communication, and Personal Finance & Stock Markets.
DO NOT assume she is pursuing engineering, coding, or already attending college. Keep answers supportive, encouraging, practical, and highly personalized to her authentic marks.`;

  return `\n\nSTUDENT VERIFIED KYC & ACADEMIC TRANSCRIPT (From JKBOSE Marksheets & UIDAI Aadhaar):\n${lines.join("\n")}${guidanceInstruction}`;
}

// Reusable helper to build personalized companion messages for life, mental health, relationships & youth guidance
async function buildInitialCounselorMessages(user, counselorType = "", language = "en") {
  const name = user?.name || "Friend";
  const norm = String(counselorType).toLowerCase();
  const isMaya = norm.includes("maya");
  const isHindi = language === "hi";
  const academicContext = formatAcademicContextForPrompt(user?.academicRecords);

  let greeting = "";
  if (isHindi) {
    if (isMaya) {
      greeting = `नमस्ते ${name}! मैं आपकी सारथी साथी हूँ। मैं आपकी बात सुनने, आपके सवालों के जवाब देने और आपके मन की हर बात समझने के लिए यहाँ हूँ। आज मैं आपकी क्या मदद कर सकती हूँ?`;
    } else {
      greeting = `नमस्ते ${name}! मैं आपका सारथी साथी हूँ। मैं आपकी बात सुनने, आपके सवालों के जवाब देने और आपके मन की हर बात समझने के लिए यहाँ हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?`;
    }
  } else {
    greeting = `Hello ${name}! I'm your Saarthi companion. I'm here to listen, answer your questions, and explore whatever is on your mind. How can I help you today?`;
  }

  const guidePrompt = isHindi
    ? `You are Saarthi.ai (सारथी - your trusted companion and personal guide), developed by MIET.
Active Companion Persona: ${counselorType}.
You are speaking with ${name}.
Language: Always respond in natural Hindi (हिन्दी) using Devanagari script.
${isMaya ? "You are a female guide (Maya Lin). ALWAYS use feminine Hindi grammar (e.g. मैं समझती हूँ, कर सकती हूँ, मदद करूंगी, बताऊंगी)." : "You are a male mentor. Use natural masculine Hindi grammar (e.g. मैं समझता हूँ, कर सकता हूँ, मदद करूंगा)."}
Your mission is to provide an open, non-judgmental, psychologically safe, and supportive space for:
- Open "Ask Me Anything" on any question, curiosities, everyday situations, learning, and life decisions.
- Thoughtful advice, perspective, clarity, and personal growth.

GUIDELINES:
1. Speak with genuine warmth, clarity, emotional intelligence, and sincere attentiveness.
2. Validate the user's thoughts and feelings without judgment or preaching.
3. Provide grounded, insightful, and practical answers to whatever they ask.
4. Keep the conversation open, versatile, and supportive.${academicContext}`
    : `You are Saarthi.ai (सारथी - your trusted companion and personal guide), developed by MIET.
Active Companion Persona: ${counselorType}.
You are speaking with ${name}.
Your mission is to provide an open, non-judgmental, psychologically safe, and supportive space for:
- Open "Ask Me Anything" on any question, curiosities, everyday situations, learning, and life decisions.
- Thoughtful advice, perspective, clarity, and personal growth.

GUIDELINES:
1. Speak with genuine warmth, clarity, emotional intelligence, and sincere attentiveness.
2. Validate the user's thoughts and feelings without judgment or preaching.
3. Provide grounded, insightful, and practical answers to whatever they ask.
4. Keep the conversation open, versatile, and supportive.${academicContext}`;

  return [
    {
      role: "system",
      content: guidePrompt,
    },
    {
      role: "assistant",
      content: greeting,
    },
  ];
}

const getChat = asyncHandler(async (req, res) => {
  const counselorType = req.params.counselorType;
  const language = req.query.language || "en";
  try {
    const user = await User.findById(req.user._id);
    const initialMessages = await buildInitialCounselorMessages(user, counselorType, language);

    const title =
      language === "hi"
        ? "नई बातचीत"
        : `New ${counselorType.charAt(0).toUpperCase() + counselorType.slice(1)} Session`;

    // Create a new persistent chat session in MongoDB
    const session = await ChatSession.create({
      user: user._id,
      counselorType,
      language,
      title,
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
      .select("_id title counselorType language lastActivity createdAt messages")
      .lean();

    const formatted = sessions.map((s) => {
      const userMsgCount = s.messages.filter((m) => m.role === "user").length;
      const lastUserOrBotMsg = [...s.messages].reverse().find((m) => m.role !== "system");
      return {
        _id: s._id,
        title: s.title,
        counselorType: s.counselorType,
        language: s.language || "en",
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
    const language = req.body.language || req.query.language || "en";
    const user = await User.findById(req.user._id);
    const initialMessages = await buildInitialCounselorMessages(user, counselorType, language);

    const title =
      req.body.title ||
      (language === "hi"
        ? "नई बातचीत"
        : `New ${counselorType.charAt(0).toUpperCase() + counselorType.slice(1)} Session`);

    const session = await ChatSession.create({
      user: req.user._id,
      counselorType,
      language,
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
    if (session.title.startsWith("New ") || session.title.includes("Counseling Session") || session.title === "नई बातचीत") {
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

    // Hybrid RAG: retrieve relevant career knowledge for the latest user query
    const lastUserMsg = [...inputMessages].reverse().find((m) => m?.role === "user" && m?.content);
    let augmentedMessages = inputMessages;
    if (lastUserMsg) {
      const ragChunks = retrieveCareerContext(lastUserMsg.content, 3, req.user?.academicRecords || null);
      if (ragChunks.length > 0) {
        const ragBlock = formatRagContextForPrompt(ragChunks);
        const sysIdx = inputMessages.findIndex((m) => m?.role === "system");
        if (sysIdx !== -1) {
          augmentedMessages = inputMessages.map((m, idx) =>
            idx === sysIdx ? { ...m, content: `${m.content}${ragBlock}` } : m
          );
        } else {
          augmentedMessages = [{ role: "system", content: ragBlock.trim() }, ...inputMessages];
        }
      }
    }

    const modelResponse = await getChatGPTResponse(augmentedMessages);
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
  const { roadmap, chat, messages: reqMessages, language } = req.body;
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

    const hasHindi =
      language === "hi"
        ? true
        : language === "en"
        ? false
        : cleanChat.some((m) => m.role === "user" && /[\u0900-\u097F]/.test(m.content));

    const systemPrompt = hasHindi
      ? `You are Saarthi.ai's expert Career & Growth Mentor.
TASK: Analyze the student's conversation below and produce a structured, actionable growth roadmap in HINDI (हिन्दी).
STRICT INSTRUCTION: Output ONLY a valid JSON array of roadmap objects. All milestone Goal titles and recommendations must be in Hindi. Do NOT output any intro, outro, or conversational chit-chat.
Format:
[
  {
    "Goal": "लक्ष्य का स्पष्ट विवरण (e.g. अपने करियर की प्राथमिकताओं और रुचियों को समझना)",
    "timeline": "दिन 1 - दिन 3",
    "recommendations": [
      {
        "title": "संसाधन या अभ्यास कार्य",
        "link": "https://www.coursera.org"
      }
    ],
    "isCompleted": false
  }
]`
      : `You are Saarthi.ai's expert Growth and Development Mentor.
Based on the conversation and the user's goals, aspirations, challenges, and current situation, create a comprehensive, day-by-day structured action roadmap.
STRICT INSTRUCTION: The language MUST be strictly ENGLISH. Every goal, timeline, and recommendation title must be written in English. Return ONLY a valid JSON array of roadmap objects. Follow this exact schema with NO extra commentary or explanation:
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
]`;

    const conversationContext =
      (cleanChat.length > 0
        ? cleanChat.map((m) => `${m.role}: ${m.content}`).join("\n\n")
        : "General life, mental wellness, and career growth roadmap.") +
      (req.user?.academicRecords ? formatAcademicContextForPrompt(req.user.academicRecords) : "");

    const roadmapPrompt = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Here is the conversation history with the student:\n\n${conversationContext}\n\nNow generate the customized JSON roadmap array ${hasHindi ? "in Hindi (हिन्दी)" : "strictly in English"}. Output ONLY the JSON array starting with [ and ending with ].`,
      },
    ];

    let responseText = "";
    try {
      responseText = await callGatewayLLM(roadmapPrompt, "llama3.1:8b");
    } catch (llmErr) {
      console.warn("LLM roadmap call failed:", llmErr.message);
    }

    let roadmapData = [];
    if (responseText) {
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
    }

    // High quality default fallback if LLM formatting had an issue
    if (!Array.isArray(roadmapData) || roadmapData.length === 0) {
      if (hasHindi) {
        roadmapData = [
          {
            Goal: "अपने करियर के प्राथमिकताओं और मुख्य रुचियों को समझना",
            timeline: "दिन 1 - दिन 3",
            recommendations: [
              {
                title: "स्व-मूल्यांकन और कौशल विश्लेषण (Skill & Self-Assessment Guide)",
                link: "https://www.coursera.org/learn/career-planning",
              },
              {
                title: "अपनी प्राथमिकताओं और लक्ष्यों की सूची तैयार करना",
                link: "https://www.mindtools.com",
              },
            ],
            isCompleted: false,
          },
          {
            Goal: "व्यावसायिक और तकनीकी कौशल विकास योजना बनाना",
            timeline: "दिन 4 - दिन 7",
            recommendations: [
              {
                title: "कोर विषय अध्ययन और व्यावहारिक प्रोजेक्ट्स",
                link: "https://www.edx.org",
              },
              {
                title: "मार्गदर्शकों (Mentors) और पूर्व छात्रों से संपर्क",
                link: "https://www.linkedin.com",
              },
            ],
            isCompleted: false,
          },
          {
            Goal: "व्यावहारिक पोर्टफोलियो निर्माण और आत्मविश्वास सुदृढ़ीकरण",
            timeline: "दिन 8 - दिन 14",
            recommendations: [
              {
                title: "परियोजना प्रलेखन और रिज्यूमे समीक्षा",
                link: "https://github.com",
              },
              {
                title: "साक्षात्कार अभ्यास और लक्ष्य समीक्षा",
                link: "https://leetcode.com",
              },
            ],
            isCompleted: false,
          },
        ];
      } else {
        roadmapData = [
          {
            Goal: "Clarify career priorities and core interests",
            timeline: "Day 1 - Day 3",
            recommendations: [
              {
                title: "Self-assessment and personal strengths audit",
                link: "https://www.coursera.org/learn/career-planning",
              },
            ],
            isCompleted: false,
          },
          {
            Goal: "Strengthen foundational competencies and practical skills",
            timeline: "Day 4 - Day 7",
            recommendations: [
              {
                title: "Targeted skill training and practical assignments",
                link: "https://www.edx.org",
              },
            ],
            isCompleted: false,
          },
          {
            Goal: "Build portfolio projects and professional presence",
            timeline: "Day 8 - Day 14",
            recommendations: [
              {
                title: "Project documentation and resume alignment",
                link: "https://github.com",
              },
            ],
            isCompleted: false,
          },
        ];
      }
    }

    // Normalize roadmap objects to guarantee valid schema { Goal, timeline, recommendations, isCompleted }
    if (Array.isArray(roadmapData)) {
      roadmapData = roadmapData.map((item, idx) => {
        if (!item || typeof item !== "object") {
          return {
            Goal: String(item || `Step ${idx + 1}`),
            timeline: `Week ${idx + 1}`,
            recommendations: [],
            isCompleted: false,
          };
        }
        const goalText =
          item.Goal || item.goal || item.title || item.task || item.name || `Goal ${idx + 1}`;
        const timelineText =
          item.timeline || item.Timeline || item.duration || `Day ${idx * 3 + 1} - Day ${(idx + 1) * 3}`;

        let recs = [];
        if (Array.isArray(item.recommendations)) {
          recs = item.recommendations.map((r) => {
            if (typeof r === "string") {
              return { title: r, link: "https://www.coursera.org" };
            }
            return {
              title: r?.title || r?.name || "Recommended Learning Resource",
              link: r?.link || r?.url || "https://www.coursera.org",
            };
          });
        }

        return {
          Goal: String(goalText).trim(),
          timeline: String(timelineText).trim(),
          recommendations: recs,
          isCompleted: Boolean(item.isCompleted),
        };
      });
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
  try {
    const { roadmap } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { roadmap } },
      { new: true }
    );
    if (updatedUser) {
      return res.status(200).json({
        success: true,
        message: "Roadmap updated successfully",
        roadmap: updatedUser.roadmap,
      });
    }
    return res.status(404).json({ success: false, message: "User not found" });
  } catch (error) {
    console.error("Error updating user roadmap:", error);
    return res.status(500).json({ success: false, message: "Failed to update roadmap" });
  }
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
