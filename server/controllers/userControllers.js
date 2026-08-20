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

    // Extract text from PDF using Vision/OCR Model with pdf-parse fallback
    const FormData = require('form-data');
    const axios = require('axios');
    const pdfParse = require('pdf-parse');
    
    let resumeText = "";
    try {
      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype || 'application/pdf'
      });
      formData.append('format', 'markdown');
      formData.append('model', 'qwen2.5vl:7b');

      const ocrResponse = await axios.post("https://ai-services.mietjmu.in/gateway/ocr/extract", formData, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders()
        }
      });

      if (ocrResponse.data && ocrResponse.data.success) {
        resumeText = ocrResponse.data.text;
      } else {
        throw new Error("OCR extraction failed");
      }
    } catch (ocrErr) {
      console.warn("OCR Model rejected the request (likely because it expects an image, not a PDF). Falling back to pdf-parse...", ocrErr.message);
      try {
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text;
      } catch (pdfErr) {
        throw new Error("Both OCR and standard PDF text extraction failed.");
      }
    }

    const prompt = [
      {
        role: "system",
        content: `You are an expert ATS (Applicant Tracking System) and career coach. Your task is to analyze the provided Resume text against the provided Job Description.
Return ONLY a valid JSON object (no markdown, no explanations) with the following exact structure:
{
  "percentage": 85,
  "verdict": "Strong match. The candidate has most of the core skills but lacks X and Y.",
  "matching": ["React", "Node.js", "Python"],
  "missing": ["AWS", "Docker", "GraphQL"]
}`
      },
      {
        role: "user",
        content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME TEXT:\n${resumeText}`
      }
    ];

    const responseText = await callGatewayLLM(prompt, "qwen3:latest");
    
    // Clean up potential markdown formatting in case LLM disobeys
    const cleanedJSON = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(cleanedJSON);
    } catch (parseErr) {
      console.error("Failed to parse LLM JSON:", cleanedJSON);
      return res.status(500).json({ success: false, message: "Failed to parse AI response." });
    }

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
