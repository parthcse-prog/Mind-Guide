/**
 * Curated Post-12th Commerce & Career Knowledge Base for RAG retrieval.
 * Each document has an id, title, category, tags, and detailed content.
 */
const careerKnowledgeBase = [
  {
    id: "cuet-ug-bcom",
    title: "CUET-UG & B.Com / B.Com (Hons) Admissions",
    category: "Undergraduate Degrees",
    tags: ["cuet", "bcom", "b.com", "commerce", "college", "university", "jammu", "du", "admission", "cutoff"],
    content:
      "CUET-UG (Common University Entrance Test) is the primary gateway for B.Com and B.Com (Hons) across Central Universities like University of Delhi (DU), BHU, and Cluster University of Jammu / University of Jammu. Eligibility generally requires passing Class 12th with at least 50% aggregate (45% for reserved categories). For B.Com (Hons) at DU, Accountancy/Book Keeping or Mathematics/Applied Mathematics is mandatory along with English. State universities like University of Jammu also accept Class 12th merit or CUET scores for B.Com General.",
  },
  {
    id: "ca-foundation-icai",
    title: "Chartered Accountancy (CA) Pathway via ICAI",
    category: "Professional Certifications",
    tags: ["ca", "chartered accountant", "icai", "foundation", "accountancy", "audit", "tax", "finance"],
    content:
      "Students who have passed Class 12th in Commerce can register for CA Foundation with ICAI (Institute of Chartered Accountants of India). There is no minimum percentage barrier beyond passing 12th. CA Foundation consists of 4 papers: Accounting, Business Laws, Quantitative Aptitude, and Business Economics. After clearing Foundation and Intermediate (both groups), students complete 2 years of Articleship before appearing for CA Final. Average duration is 4.5 to 5 years.",
  },
  {
    id: "cs-cseet-icsi",
    title: "Company Secretary (CS) & CSEET Pathway",
    category: "Professional Certifications",
    tags: ["cs", "company secretary", "cseet", "icsi", "corporate law", "governance", "compliance"],
    content:
      "Company Secretary (CS) is a premier corporate governance and law qualification offered by ICSI. After Class 12th, students appear for CSEET (CS Executive Entrance Test), which tests Business Communication, Legal Aptitude, Economic & Business Environment, and Current Affairs. Unlike CA, CS focuses heavily on Corporate Law, SEBI regulations, and Board Governance, making it ideal for Commerce students who prefer theory and law over heavy math.",
  },
  {
    id: "cma-icmai",
    title: "Cost & Management Accountant (CMA)",
    category: "Professional Certifications",
    tags: ["cma", "cost accounting", "icmai", "management accounting", "finance", "manufacturing"],
    content:
      "CMA (offered by ICMAI) specializes in cost auditing, pricing strategy, and management accounting. Class 12th pass students can enroll in CMA Foundation. It has 3 levels: Foundation, Intermediate, and Final, with mandatory practical training. CMAs are in high demand in PSUs, manufacturing, and corporate finance.",
  },
  {
    id: "bba-ipmat-management",
    title: "BBA, BMS & Integrated MBA (IPMAT)",
    category: "Management",
    tags: ["bba", "bms", "ipmat", "mba", "iim", "management", "business", "marketing", "hr"],
    content:
      "BBA (Bachelor of Business Administration) and BMS (Bachelor of Management Studies) are 3-year/4-year undergraduate degrees focusing on Marketing, Finance, HR, and Operations. Top entrance exams include IPMAT (for 5-year Integrated MBA at IIM Indore, IIM Rohtak, IIM Ranchi), JIPMAT (IIM Jammu & IIM Bodh Gaya), SET (Symbiosis), and NPAT (NMIMS). IIM Jammu offers a 5-year Integrated Programme in Management (IPM) accessible right after 12th.",
  },
  {
    id: "ssc-stenographer-shorthand",
    title: "SSC Stenographer (Grade C & D) — Shorthand Career",
    category: "Government Jobs",
    tags: ["shorthand", "stenographer", "ssc", "government job", "steno", "typing", "skill"],
    content:
      "Students who studied Shorthand in Class 12th have a massive competitive advantage in SSC Stenographer Grade C & D exams. Eligibility is 12th pass from a recognized board (like JKBOSE). The exam has a Computer-Based Test (General Intelligence, General Awareness, English Language — NO Maths section!) followed by a Shorthand Skill Test (80 wpm for Grade D, 100 wpm for Grade C). It leads to prestigious central government ministry postings.",
  },
  {
    id: "ssc-chsl-banking",
    title: "SSC CHSL & Banking Sector Roadmap",
    category: "Government Jobs",
    tags: ["ssc", "chsl", "bank", "banking", "ibps", "sbi", "po", "clerk", "government"],
    content:
      "Right after Class 12th, students can appear for SSC CHSL (Combined Higher Secondary Level) for Lower Division Clerk (LDC) and Data Entry Operator (DEO) posts in Central Government offices. For Banking (IBPS PO/Clerk, SBI PO/Clerk, RBI Assistant), a bachelor's degree (like B.Com or BBA) is required, so students should pursue graduation while preparing for Quantitative Aptitude, Reasoning, and English.",
  },
  {
    id: "law-after-12th-clat",
    title: "5-Year Integrated Law (B.Com LL.B / BBA LL.B)",
    category: "Law",
    tags: ["law", "clat", "llb", "bcom llb", "bba llb", "lawyer", "legal", "corporate law"],
    content:
      "Commerce students can pursue a 5-year integrated B.Com LL.B or BBA LL.B right after Class 12th. Admission to National Law Universities (NLUs) is through CLAT or AILET, while University of Jammu and other state universities offer 5-year BA/B.Com LL.B programs. Minimum eligibility is 45% in Class 12th (40% for SC/ST). Great for careers in corporate law, taxation law, and litigation.",
  },
  {
    id: "jk-scholarships-pmsss",
    title: "J&K Scholarships & Financial Aid (NSP / PMSSS)",
    category: "Scholarships",
    tags: ["scholarship", "jammu", "kashmir", "jk", "jkbose", "pmsss", "nsp", "financial aid", "fee"],
    content:
      "Students from Jammu & Kashmir (domicile holders) can apply for Central Sector Schemes on the National Scholarship Portal (NSP) and J&K state-level post-matric scholarships. Additionally, AICTE's PMSSS (Prime Minister's Special Scholarship Scheme) supports J&K students pursuing general degree, professional, or engineering courses outside J&K with tuition fee waivers and maintenance allowance.",
  },
  {
    id: "tally-gst-fintech",
    title: "Job-Ready Accounting & Finance Skills (TallyPrime, GST, NISM)",
    category: "Skill Certifications",
    tags: ["tally", "gst", "excel", "nism", "finance", "accounting", "job", "skill", "certificate"],
    content:
      "Alongside B.Com or BBA, Commerce students can build immediate employability by learning TallyPrime with GST, Advanced Excel & Financial Modeling, and NISM (National Institute of Securities Markets) certifications for mutual funds and equity markets. These short-term certifications help land accounting, tax assistant, and financial analyst internships even during graduation.",
  },
];

module.exports = careerKnowledgeBase;
