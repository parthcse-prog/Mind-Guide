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
          status: "Verified by DigiLocker",
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
          status: "Verified by DigiLocker",
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
    digiLocker: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        isLinked: true,
        digiLockerId: "DL-JAMMU-984210",
        lastSynced: "24 Nov 2026, 11:30 AM",
        fakeAadhaar: "7342 9180 4892",
        maskedAadhaar: "•••• •••• 4892",
        issuedDocuments: [
          {
            docType: "Aadhaar Card",
            issuer: "Unique Identification Authority of India (UIDAI)",
            verifiedDate: "14 Aug 2021",
            docId: "UIDAI-AADH-4892",
            uri: "in.gov.uidai.aadhaar",
          },
          {
            docType: "Class X Marksheet (93%)",
            issuer: "Central Board of Secondary Education (CBSE)",
            verifiedDate: "18 Jul 2020",
            docId: "CBSE-X-2020-1489204",
            uri: "in.gov.cbse.cert.x",
          },
          {
            docType: "Class XII Marksheet (90%)",
            issuer: "Central Board of Secondary Education (CBSE)",
            verifiedDate: "22 Jul 2022",
            docId: "CBSE-XII-2022-2489204",
            uri: "in.gov.cbse.cert.xii",
          },
          {
            docType: "College Enrollment & Bonafide",
            issuer: "MIET Jammu Academic Registry",
            verifiedDate: "05 Sep 2022",
            docId: "MIET-ENR-2022-CS041",
            uri: "in.edu.mietjammu.student",
          },
        ],
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
