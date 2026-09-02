const asyncHandler = require("express-async-handler");
const User = require("../model/User");
const { callGatewayLLM } = require("../config/llmService");
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const pdfParse = require("pdf-parse");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  const user = await User.create({
    name,
    email,
    pic,
    password,
  });
  if (user) {
    res.status(201).json(user);
  } else {
    res.status(400);
    throw new Error("Failed to create the user!!");
  }
});

const axios = require("axios");

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  try {
    let pi360LoginRes = null;

    // 1. Attempt JSON login payload to PI360 API
    try {
      pi360LoginRes = await axios.post(
        "https://pi360.net/site/api/api_login_user.php?institute_id=mietjammu",
        {
          username_1: email,
          password_1: password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (jsonErr) {
      console.warn("JSON payload failed, attempting URLSearchParams payload:", jsonErr.message);
      const params = new URLSearchParams();
      params.append("username_1", email);
      params.append("password_1", password);
      pi360LoginRes = await axios.post(
        "https://pi360.net/site/api/api_login_user.php?institute_id=mietjammu",
        params,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
    }

    const loginData = pi360LoginRes?.data;
    if (!loginData || (loginData.statusCode && loginData.statusCode !== 200) || (loginData.status === "error")) {
      res.status(400);
      throw new Error(loginData?.message || "Invalid PI360 Credentials");
    }

    const tokenFromLogin = loginData?.token || loginData?.jwt || loginData?.data?.token || loginData?.access_token;
    let profileData = null;

    // 2. Fetch full student profile using Bearer token
    if (tokenFromLogin) {
      try {
        const profileRes = await axios.get(
          "https://pi360.net/site/api/endpoints/api_student_profile.php?institute_id=mietjammu",
          {
            headers: {
              Authorization: `Bearer ${tokenFromLogin}`,
            },
          }
        );
        profileData = profileRes.data;
      } catch (profErr) {
        console.error("PI360 Student Profile Fetch Error:", profErr?.response?.data || profErr.message);
      }
    }

    // 3. Upsert / Sync user profile in MongoDB
    const studentInfo = profileData?.student?.[0] || profileData || {};
    const studentName = studentInfo.Name || studentInfo.student_name || loginData?.data?.name || email.split("@")[0];
    
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: studentName,
        email: email,
        password: password,
        pi360Data: profileData || loginData,
        pi360Token: tokenFromLogin,
      });
    } else {
      user.name = studentName || user.name;
      user.pi360Data = profileData || loginData;
      user.pi360Token = tokenFromLogin || user.pi360Token;
      await user.save();
    }

    const token = user.createJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 604800000),
    });

    return res.status(200).json({
      ...user._doc,
      pi360Profile: profileData,
      pi360Token: tokenFromLogin,
      createdAt: user._id.getTimestamp(),
      password: undefined,
    });
  } catch (error) {
    console.error("PI360 Authentication Error:", error?.response?.data || error.message);
    res.status(400);
    throw new Error(error?.response?.data?.message || error?.message || "PI360 Login Failed. Check credentials.");
  }
});
const getUserProfile = asyncHandler(async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (user) {
      return res.json({
        ...user._doc,
        password: undefined,
      });
    }
  }
  return res.status(200).json(null);
});
const handleLogout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

const handleGetRoadmap = asyncHandler(async (req, res) => {
  console.log(req.user);
  try {
    // Assuming you're identifying the user somehow, such as through a JWT token
    const userId = req.user._id; // Replace with actual user identifier

    // Find the user by their ID
    const user = await User.findById(userId);

    // Check if the user exists and has a roadmap
    if (user && user.roadmap && user.roadmap.length > 0) {
      // If user has a roadmap, send it in the response
      return res.status(200).json({ roadmap: user.roadmap });
    } else {
      // If user does not have a roadmap, send a message indicating so
      return res.status(200).json({ roadmap: [] });
    }
  } catch (error) {
    // If an error occurs, send an error response
    console.error("Error fetching roadmap:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
const handleGetUserData = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (user) {
      return res.status(200).json({ user });
    } else {
      return res.status(200).json({ user: null });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
const handleReportUpload = asyncHandler(async (req, res) => {
  const { counsellorType } = req.params;
  const { email } = req.user;

  try {
    let fileUrl = "";

    if (process.env.S3_BUCKET_NAME) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `pdfs/${Date.now()}_${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: "application/pdf",
      };
      const data = await s3.upload(params).promise();
      fileUrl = data.Location;
    } else {
      // Fallback base64 data URI storage if S3 bucket is unconfigured
      const base64Data = req.file.buffer.toString("base64");
      fileUrl = `data:application/pdf;base64,${base64Data}`;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $push: {
          reportHistory: {
            title: `${counsellorType} Session Report`,
            filePath: fileUrl,
            date: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).send({
      message: "PDF uploaded and saved to report history successfully",
      url: fileUrl,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error in handleReportUpload:", err);
    res.status(500).send(err.message);
  }
});
const handleGetAllReports = asyncHandler(async (req, res) => {
  const { email } = req.user;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(200).json(user.reportHistory);
    }
    return res.status(200).json([]);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
const handleGetSkills = asyncHandler(async (req, res) => {
  // Make API request to fetch short heading based on the provided roadmap
  // Example:
  // console.log("heading started");
  // console.log("goalsss!!!!!!------------>");
  // const { email } = req.user;
  const { email } = req.user;
  const user = await User.findOne({ email });
  const getroadmap = user.roadmap;
  const goals = getroadmap.map((item) => item.Goal);
  console.log("goals: ", goals);
  // console.log(typeof getroadmap);
  // console.log(getroadmap);

  const Heading = [
    {
      role: "system",
      content: `given this is goals -> ${goals} go through this  goals   and split the goals into two categories one should have non technical skill that the goal is aiming to provide and in second category  out of it  provide me striclty   containing  techinal skill name  of  what this  goals is aiming to provide and strictly make sure to only add technical skills topic name strictly only and note that the tecnical skill name should  be in less bare minimum words.and if there is no technical skills then send me empty. The desired skill topic should reflect the main thing that  goals is trying to achieve and that technical skill name should be revelant in realm of development only and after splitting into two i want you to send me in strictly below format and dont add anything other than the format specified below very strictly. 
      [{
        "skill": "name of the skill",
        "type": "technical Or nontechnical",
      }] in json format only.
      `,
    },
  ];
  // console.log("Heading:", response.choices[0].message.content);
  // console.log(response.choices[0].message.content);
  try {
    let skill = await callGatewayLLM(Heading);

    skill = JSON.parse(skill);
    const user = await User.findOne({ email });
    skill.forEach((element) => {
      user.skills.push(element);
    });
    user.roadmap = [];
    await user.save();
    res.cookie("token", user.createJWT(), {
      expires: new Date(Date.now() + 604800000),
    });
    res.json(user);
  } catch (error) {
    console.log("error happened while saving skills", error);
    res.json("Error while saving User skills!!!");
  }
});

const { fetchRealtimeIndiaJobs } = require("../services/jobService");

const handleGetJobs = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const region = req.query.region || "All India";
  const userType = req.query.type || "all";

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const userSkills = (user.skills || []).map((s) => s.skill);

  const jobs = await fetchRealtimeIndiaJobs({
    userSkills,
    region,
    userType,
  });

  res.status(200).json({
    success: true,
    count: jobs.length,
    jobs,
    userSkills,
    region,
  });
});

const handleGetPersonality = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const dbToken = user ? user.pi360Token : null;
    const pi360Token = req.headers["x-pi360-token"] || dbToken;
    const headers = pi360Token ? { Authorization: `Bearer ${pi360Token}` } : {};

    const reportRes = await axios.get(`https://pi360.net/site/api/endpoints/api_get_personality_report.php?institute_id=mietjammu&key=R0dqSDg3Njc2cC00NCNAaHg%3D&action=get_report`, { headers });
    const summaryRes = await axios.get(`https://pi360.net/site/api/endpoints/api_get_personality_report.php?institute_id=mietjammu&key=R0dqSDg3Njc2cC00NCNAaHg%3D&action=get_ai_summary`, { headers });
    
    res.status(200).json({
      report: reportRes.data,
      summary: summaryRes.data
    });
  } catch (error) {
    console.error("Error fetching PI360 personality:", error.message);
    res.status(500);
    throw new Error("Failed to fetch personality data from PI360");
  }
});

const handleResumeAnalyze = asyncHandler(async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: "No resume PDF uploaded." });
    }
    const jobDescription = req.body.jobDescription;
    if (!jobDescription) {
      return res.status(400).json({ success: false, message: "Job description is required." });
    }

    // Hash the PDF buffer to check for duplicates
    const crypto = require("crypto");
    const ResumeLog = require("../model/ResumeLog");
    
    const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    
    // Check if THIS user has already analyzed THIS exact PDF
    const existingLog = await ResumeLog.findOne({ user: req.user._id, fileHash });
    if (existingLog) {
      return res.status(400).json({ 
        success: false, 
        message: "This exact resume was uploaded before. Please upload a new or updated file." 
      });
    }

    // Extract text from PDF using local pdf-parse
    const pdfParse = require('pdf-parse');
    let resumeText = "";
    try {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text.toLowerCase();
    } catch (pdfErr) {
      throw new Error("Failed to extract text from PDF: " + pdfErr.message);
    }

    const jdText = jobDescription.toLowerCase();

    // Fetch user profile and PI360 data to personalize the verdict
    const user = await User.findById(req.user._id);
    let personalityContext = "";
    if (user?.pi360Token) {
      try {
        const axios = require("axios");
        const headers = { Authorization: `Bearer ${user.pi360Token}` };
        const reportRes = await axios.get(`https://pi360.net/site/api/endpoints/api_get_personality_report.php?institute_id=mietjammu&key=R0dqSDg3Njc2cC00NCNAaHg%3D&action=get_report`, { headers });
        const summaryRes = await axios.get(`https://pi360.net/site/api/endpoints/api_get_personality_report.php?institute_id=mietjammu&key=R0dqSDg3Njc2cC00NCNAaHg%3D&action=get_ai_summary`, { headers });
        
        const reportData = reportRes.data?.data || reportRes.data;
        const summaryData = summaryRes.data?.data || summaryRes.data;
        
        let extractedTraits = {};
        if (reportData?.key_metrics?.trait_scores) extractedTraits = reportData.key_metrics.trait_scores;
        else if (reportData?.trait_scores) extractedTraits = reportData.trait_scores;
        
        let traitStr = "";
        if (Object.keys(extractedTraits).length > 0) {
          traitStr = Object.entries(extractedTraits).map(([t, v]) => `${t}: ${typeof v === 'object' ? v.score : v}`).join(", ");
        }

        const aiSumText = typeof summaryData === 'string' ? summaryData : (summaryData?.ai_summary || summaryData?.summary || "");

        if (traitStr || aiSumText) {
          personalityContext = `\nSTUDENT PSYCHOLOGICAL PROFILE (PI360 Data):\n${traitStr ? `- Big 5 Traits: ${traitStr}\n` : ""}${aiSumText ? `- AI Personality Summary: ${aiSumText}\n` : ""}`;
        }
      } catch (err) {
        console.warn("Could not fetch PI360 Personality data for resume analyzer:", err.message);
      }
    }

    const userSkills = user?.skills?.map(s => s.skill).join(", ") || "None listed";
    const userProfileStr = `
- Name: ${user.name}
- Branch: ${user.branch || "N/A"}
- Existing Profile Skills: ${userSkills}
${personalityContext}`;

    let analysisResult = {
      percentage: 0,
      verdict: "Analysis failed to parse context.",
      matching: [],
      missing: []
    };

    try {
      const prompt = [
        {
          role: "system",
          content: `You are an expert ATS (Applicant Tracking System) and career coach. Your task is to semantically analyze a student's resume against a job description. 
You must evaluate true semantic matches (e.g. "ReactJS" matches "React.js", "Managed team" matches "Leadership").

You must respond ONLY with a raw JSON object (no markdown formatting, no conversational text). 
Use this exact JSON schema:
{
  "percentage": <integer 0-100 indicating ATS confidence score>,
  "matching": ["skill1", "skill2", ... max 15],
  "missing": ["skill1", "skill2", ... max 15],
  "verdict": "<2-3 sentence highly personalized, encouraging verdict referencing their psychological traits/skills and evaluating the fit>"
}`
        },
        {
          role: "user",
          content: `STUDENT PROFILE:\n${userProfileStr}\n\nRESUME TEXT:\n${resumeText.substring(0, 15000)}\n\nJOB DESCRIPTION:\n${jdText.substring(0, 10000)}`
        }
      ];
      
      // Changed to use gpt-oss:20b specifically for this tool
      const rawVerdict = await callGatewayLLM(prompt, "gpt-oss:20b");
      
      // 1. Smart Extraction: Look for markdown blocks first, fallback to brace matching
      let jsonString = "";
      const match = rawVerdict.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      
      if (match && match[1]) {
        jsonString = match[1].trim();
      } else {
        const firstBrace = rawVerdict.indexOf('{');
        const lastBrace = rawVerdict.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          jsonString = rawVerdict.substring(firstBrace, lastBrace + 1);
        } else {
          throw new Error("No JSON object found in LLM response");
        }
      }
      
      // 2. Lenient Parsing prep: Fix common LLM mistakes like trailing commas
      jsonString = jsonString.replace(/,\s*([\]}])/g, '$1');
      const parsed = JSON.parse(jsonString);
      
      // 3. Schema Validation & Fallbacks (Vanilla JS Zod equivalent)
      analysisResult = {
        percentage: typeof parsed.percentage === 'number' ? parsed.percentage : (Number(parsed.percentage) || Number(parsed.score) || 0),
        matching: Array.isArray(parsed.matching) ? parsed.matching.slice(0, 15) : (Array.isArray(parsed.matched) ? parsed.matched.slice(0, 15) : []),
        missing: Array.isArray(parsed.missing) ? parsed.missing.slice(0, 15) : [],
        verdict: typeof parsed.verdict === 'string' ? parsed.verdict : (parsed.summary || "Analysis complete.")
      };
      
      // Ensure percentage is strictly bounded 0-100
      analysisResult.percentage = Math.min(100, Math.max(0, analysisResult.percentage));
      
    } catch (llmErr) {
      console.warn("LLM failed to generate or parse verdict, falling back:", llmErr.message);
      analysisResult.verdict = "Low match. Consider tailoring your resume to better highlight the specific skills mentioned in the job description.";
    }

    // Save to tracking table to prevent future duplicates
    await ResumeLog.create({
      user: req.user._id,
      fileHash,
      fileName: req.file.originalname || "resume.pdf"
    });

    res.status(200).json({ success: true, data: analysisResult });
  } catch (error) {
    const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error("Error in handleResumeAnalyze:", errorDetails);
    res.status(500).json({ success: false, message: "Internal server error during resume analysis: " + errorDetails });
  }
});

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  handleLogout,
  handleGetRoadmap,
  handleGetUserData,
  handleReportUpload,
  handleGetAllReports,
  handleGetSkills,
  handleGetJobs,
  handleGetPersonality,
  handleResumeAnalyze,
};
