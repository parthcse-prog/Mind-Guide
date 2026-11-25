const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');

async function seedAuthenticKYC() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  const collection = mongoose.connection.collection('users');

  const authenticRecords = {
    tenth: {
      standard: "Secondary School Examination (Class X)",
      board: "The Jammu and Kashmir Board of School Education (JKBOSE)",
      school: "Alexander Memorial School, Idd Gah, Residency Road, Jammu",
      year: "2021",
      rollNo: "160182011",
      regnNo: "1960010000060013",
      marks: "336 / 500",
      percentage: "67.2%",
      gpa: "7.00",
      division: "Qualified B2",
      marksheetId: "JKBOSE-X-2021-160182011",
      status: "KYC Verified (JKBOSE Authenticated)",
      marksheetUrl: "/SSCER_8468.pdf",
      subjects: [
        { name: "General English", marks: "68", grade: "B2", maxMarks: "100" },
        { name: "Mathematics", marks: "65", grade: "B2", maxMarks: "100" },
        { name: "Hindi", marks: "70", grade: "B2", maxMarks: "100" },
        { name: "Science", marks: "66", grade: "B2", maxMarks: "100" },
        { name: "Social Science", marks: "67", grade: "B2", maxMarks: "100" },
      ],
    },
    twelfth: {
      standard: "Higher Secondary Examination Part-II (Class XII)",
      stream: "Commerce",
      board: "The Jammu and Kashmir Board of School Education (JKBOSE)",
      school: "Govt Girls Hr Sec School Mubarak Mandi, Jammu",
      year: "2023",
      rollNo: "360007073",
      regnNo: "1960010000060013",
      marks: "305 / 500",
      percentage: "61.0%",
      division: "First Division",
      marksheetId: "JKBOSE-XII-2023-360007073",
      status: "KYC Verified (JKBOSE Authenticated)",
      marksheetUrl: "/HSCER_8468.pdf",
      subjects: [
        { name: "Typewriting / Shorthand", marks: "79", grade: "A2", maxMarks: "100" },
        { name: "General English", marks: "72", grade: "B1", maxMarks: "100" },
        { name: "Accountancy", marks: "63", grade: "B2", maxMarks: "100" },
        { name: "Economics", marks: "46", grade: "C2", maxMarks: "100" },
        { name: "Business Studies", marks: "45", grade: "C2", maxMarks: "100" },
      ],
    },
    aadhaar: {
      name: "Mehak",
      gender: "Female",
      dob: "01/08/2004",
      aadhaarNumber: "3901 5658 5688",
      maskedAadhaar: "XXXX XXXX 5688",
      address: "House no. 141, Ward no. 48, Gorkha Nagar Bahu Fort Jammu, Jammu City, Jammu, Jammu and Kashmir - 180006",
      issuer: "Unique Identification Authority of India (UIDAI)",
      status: "UIDAI Biometric & Demographic KYC Verified",
      documentUrl: "/ADHAR_8468.pdf",
    },
  };

  await collection.updateOne(
    { email: 'mehak@gmail.com' },
    {
      $set: {
        name: 'Mehak',
        program: 'Class 12th Passed (Commerce)',
        location: 'Jammu, Jammu and Kashmir',
        address: 'House no. 141, Ward no. 48, Gorkha Nagar Bahu Fort Jammu, Jammu City, Jammu, Jammu and Kashmir - 180006',
        dob: '01 August 2004',
        gender: 'Female',
        aadhaarNumber: '3901 5658 5688',
        kycStatus: 'Verified',
        pic: '/mehak-profile.jpg',
        academicRecords: authenticRecords,
      },
    }
  );

  const updated = await collection.findOne({ email: 'mehak@gmail.com' });
  console.log('Updated mehak@gmail.com with authentic KYC data:', {
    name: updated.name,
    email: updated.email,
    records: Object.keys(updated.academicRecords || {}),
    tenth: updated.academicRecords?.tenth?.percentage,
    twelfth: updated.academicRecords?.twelfth?.percentage,
  });

  process.exit(0);
}

seedAuthenticKYC().catch(console.error);
