const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const skillTypes = ["technical", "nontechnical", "non-technical"];
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    skills: [
      {
        skill: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: skillTypes,
          default: "technical", // Default to technical if not provided
        },
      },
    ],
    roadmap: {
      type: [
        {
          Goal: String,
          timeline: String,
          recommendations: [
            {
              title: String,
              link: String,
            },
          ],
          isCompleted: Boolean,
        },
      ],
      default: [], // You may want to set a default value as an empty array
    },
    sessionHistory: [
      {
        date: { type: Date, default: Date.now },
      },
    ],
    reportHistory: [
      {
        date: { type: Date, default: Date.now },
        title: { type: String, default: "New Report" },
        filePath: { type: String, default: "" },
      },
    ],
    pi360Data: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    pi360Token: {
      type: String,
      default: "",
    },
    isGoogleAuth: {
      type: Boolean,
      default: false,
    },
    dob: {
      type: String,
      default: "15 August 2003",
    },
    googleId: {
      type: String,
      default: "",
    },
    locale: {
      type: String,
      default: "en-IN",
    },
    location: {
      type: String,
      default: "Jammu, Jammu and Kashmir",
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
    academicRecords: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        tenth: {
          standard: "10th Standard (Secondary)",
          percentage: "93%",
          board: "CBSE",
          school: "Delhi Public School, Jammu",
          year: "2020",
          rollNo: "1489204",
          marksheetId: "CBSE-X-2020-93821",
          status: "Verified Record",
        },
        twelfth: {
          standard: "12th Standard (Senior Secondary)",
          percentage: "90%",
          stream: "Science (PCM with Computer Science)",
          board: "CBSE",
          school: "Delhi Public School, Jammu",
          year: "2022",
          rollNo: "2489204",
          marksheetId: "CBSE-XII-2022-90142",
          status: "Verified Record",
        },
        college: {
          degree: "B.Tech Computer Science & Engineering",
          institution: "Model Institute of Engineering & Technology (MIET), Jammu",
          currentCgpa: "8.84 CGPA",
          semester: "7th Semester",
          enrollmentNo: "MIET/CSE/2022/041",
          status: "Active MIET Student",
        },
      }),
    },
  },

  {
    timeStamps: true,
  }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.createJWT = function () {
  return jwt.sign(
    {
      email: this.email,
      _id: this._id,
      name: this.name,
      pic: this.pic,
      createdAt: this._id.getTimestamp(),
      skills: this.skills,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};
const User = mongoose.model("User", userSchema);
module.exports = User;
