const asyncHandler = require("express-async-handler");
const User = require("../model/User");
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

const getChat = asyncHandler(async (req, res) => {
  const counselorType = req.params.counselorType;
  try {
    const user = await User.findById(req.user._id);

    // Extract student profile data (PI360 info, education, skills, branch, etc.)
    const pi360 = user?.pi360Data?.student?.[0] || user?.pi360Data?.data || user?.pi360Data || {};
    const name = user?.name || pi360.Name || pi360.name || "Student";
    const rollNumber = pi360.RollNumber || "N/A";
    const branch = pi360.Branch || pi360.Program || pi360.Course || "Engineering";
    const batch = pi360.Batch || "N/A";
    const academicPercentage = pi360.OverallAcademicPercentage || "N/A";
    const skills = user?.skills?.map((s) => s.skill).join(", ") || "N/A";

    // Extract CV sections if available
    let cvSummary = "";
    try {
      const cvDrafts = pi360.cv_drafts || pi360.ResumeDrafts;
      if (Array.isArray(cvDrafts) && cvDrafts.length > 0) {
        const latest = cvDrafts[cvDrafts.length - 1];
        const content = typeof latest.Content === "string" ? JSON.parse(latest.Content) : latest.Content;
        if (content?.sections) {
          cvSummary = content.sections
            .map((s) => `${s.title}: ${s.items.map((i) => i.title || i.role || i.company).join("; ")}`)
            .join(" | ");
        }
      }
    } catch (e) {
      console.warn("Could not parse CV summary for counselor prompt:", e);
    }

    let personalityContext = "";
    if (user?.pi360Token) {
      try {
        const headers = { Authorization: `Bearer ${user.pi360Token}` };
        const reportRes = await axios.get(`https://pi360.net/site/api/endpoints/api_get_personality_report.php?institute_id=mietjammu&key=R0dqSDg3Njc2cC00NCNAaHg%3D&action=get_report`, { headers });
        const summaryRes = await axios.get(`https://pi360.net/site/api/endpoints/api_get_personality_report.php?institute_id=mietjammu&key=R0dqSDg3Njc2cC00NCNAaHg%3D&action=get_ai_summary`, { headers });
        
        const reportData = reportRes.data?.data || reportRes.data;
        const summaryData = summaryRes.data?.data || summaryRes.data;
        
        // Safely extract Big 5 Traits
        let extractedTraits = {};
        if (reportData?.key_metrics?.trait_scores) extractedTraits = reportData.key_metrics.trait_scores;
        else if (reportData?.trait_scores) extractedTraits = reportData.trait_scores;
        
        let traitStr = "";
        if (Object.keys(extractedTraits).length > 0) {
          traitStr = Object.entries(extractedTraits).map(([t, v]) => `${t}: ${typeof v === 'object' ? v.score : v}`).join(", ");
        }

        // Extract AI summary
        const aiSumText = typeof summaryData === 'string' ? summaryData : (summaryData?.ai_summary || summaryData?.summary || "");

        if (traitStr || aiSumText) {
          personalityContext = `\nSTUDENT PSYCHOLOGICAL PROFILE (PI360 Data):
${traitStr ? `- Big 5 Traits: ${traitStr}` : ""}
${aiSumText ? `- AI Personality Summary: ${aiSumText}` : ""}
`;
        }
      } catch (err) {
        console.warn("Could not fetch PI360 Personality data for counselor prompt:", err.message);
      }
    }

    const studentContextPrompt = `You are a personalized, expert ${counselorType} for student ${name}.
STUDENT PROFILE CONTEXT:
- Name: ${name}
- Roll Number: ${rollNumber}
- Branch/Program: ${branch} (Batch: ${batch})
- Academic Performance: ${academicPercentage}%
- Acquired Skills: ${skills}
${cvSummary ? `- Student Portfolio (Education, Projects, Internships, Certifications): ${cvSummary}` : ""}${personalityContext}
GUIDELINES:
1. Always tailor your advice specifically to ${name}'s academic background, branch (${branch}), skills, portfolio, and psychological personality traits.
2. Ask relevant, focused questions one by one.
3. Be supportive, practical, and highly targeted to help ${name} achieve optimal academic, career, and personal growth.`;

    messages = [
      {
        role: "system",
        content: studentContextPrompt,
      },
      {
        role: "assistant",
        content: `Hello ${name}! I am your ${counselorType}. I have reviewed your academic profile in ${branch} (Batch ${batch}). How can I assist you with your goals today?`,
      },
    ];

    if (user) {
      user.sessionHistory.push({ date: new Date(), status: "started" });
      await user.save();
    }

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error in getting chat", err);
    res.status(500).send("Internal Server Error");
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
  const { roadmap } = req.body;
  let roadmapPrompt = [];
  try {
    roadmapPrompt = [
      ...messages,
      {
        role: "system",
        content: `Pretend you are an expert helpful AI career counsellor.`,
      },
      {
        role: "system",
        content: `Create a precise list of all the specific goals associated with a definitive timeline such that the output gives us a detailed step by step recommendation of that goals and recommendations.
          You MUST link the student's Personality & AI Analysis data (from the STUDENT PROFILE CONTEXT earlier) to this roadmap. Transform it from a generic technical guide into a highly personalized development framework designed around how the student learns, collaborates, and performs under pressure based on their specific Big 5 traits and AI Summary.
          should contains all goals from the roadmap for days wise days tasks based on the user goal.
          Keep in mind to not include any explanations with specific entries and follow this format without any deviation. Also dont include a weekly based planner in the timeline. make sure to use a day-wise planner.
          dont give any explanation just provide the roadmap in the following format.
          [{
            "Goal": "goal to be done",
            "timeline": "timeline based on that goal",
            "recommendations": [{
              "title": "title of the recommendation course",
              "link" : "link of the recommended course"
            }],
            "isCompleted":false in boolean
          }]`,
      },
    ];
    const responseText = await callGatewayLLM(roadmapPrompt);

    console.log(responseText);
    const roadmapData = JSON.parse(responseText);
    console.log("roadmapGenerate: ", roadmapData);
    // Decode the JWT token to get the user's I
    console.log(req.user);
    User.findOneAndUpdate(
      { email: req.user.email }, // Replace with actual user email
      { $set: { roadmap: roadmapData } }, // Update the roadmap field
      { new: true } // To return the updated user object
    )
      .then((updatedUser) => {
        if (updatedUser) {
          console.log("User roadmap updated successfully:", updatedUser);
          const transporter = nodemailer.createTransport({
            // Configure your email service provider
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.Email,
              pass: process.env.PASS,
            },
            tls: {
              rejectUnauthorized: false,
            },
          });
          const mailOptions = {
            from: `${process.env.USERNAME}`,
            to: req.user.email,
            subject: "Mind Guide Session Report",
            html: `
            <!DOCTYPE html>
            <html lang="en">
      
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Download Your Mind Guide Session Report</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f0f0f0;
                        color: #333;
                    }
      
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        text-align: center;
                    }
      
                    h1 {
                        color: #2a5298;
                    }
      
                    p {
                        color: #666;
                        line-height: 1.5;
                        margin: 10px 0;
                    }
      
                    a {
                        display: inline-block;
                        padding: 10px 20px;
                        margin-top: 20px;
                        background-color: #007bff;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 5px;
                        transition: background-color 0.3s;
                    }
      
                    a:hover {
                        background-color: #0056b3;
                    }
      
                    .footer {
                        text-align: center;
                        font-size: 0.85em;
                        margin-top: 40px;
                        color: #777;
                    }
                </style>
            </head>
      
            <body>
                <div class="container">
                    <h1>Your Mind Guide Session Report</h1>
                    <p>Dear ${req.user.name},</p>
                    <p>Your latest session report is now available for download:</p>
                    <a href=#{} target="_blank">Download Report</a>
                    <p>If you encounter any issues, please do not hesitate to contact us.</p>
      
                    <div class="footer">
                        <p>Thank you for choosing Mind Guide.</p>
                        <p><a href="#">Visit our Website</a></p>
                    </div>
                </div>
            </body>
      
            </html>
                  `,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log("NodeMailer Error:", error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        } else {
          console.log("User not found.");
        }
      })
      .catch((error) => {
        console.error("Error updating user roadmap:", error);
      });

    return res.send(responseText);
  } catch (err) {
    console.error("Error Happened ", err);
    res.status(500).send("Internal Server Error ");
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
  handleSendChat,
  handleCreateReport,
  handleCreateRoadmap,
  handleRoadmapUpdation,
  handleTaskUpdate,
};
