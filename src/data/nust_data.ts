export interface NustData {
  programs: Program[];
  eligibility: EligibilityRule[];
  tests: TestInfo[];
  fees: FeeStructure;
  deadlines: Deadline[];
  merit: MeritCalculation;
  general: GeneralInfo[];
}

export interface Program {
  id: string;
  name: string;
  category: "Engineering" | "Computing" | "Social Sciences" | "Business" | "Applied Sciences";
  description: string;
  campus: string[];
  minMarks: number; // Percentage
}

export interface EligibilityRule {
  id: string;
  title: string;
  criteria: string;
  minPercentage: number;
  subjectsRequired: string[];
  source: string;
}

export interface TestInfo {
  name: string;
  description: string;
  weightage: number;
  subjects: string[];
  source: string;
}

export interface FeeStructure {
  admissionFee: {
    national: string;
    international: string;
  };
  securityDeposit: {
    national: string;
    international: string;
  };
  tuitionFeePerSemester: {
    engineeringComputing: string;
    socialSciencesBusiness: string;
    international: string;
  };
  miscCharges: string;
  hbsLicensingFee: string;
  repeatCourseFee: string;
  makeupExamFee: string;
  defermentFee: string;
  source: string;
}

export interface Deadline {
  event: string;
  date: string;
  status: "Upcoming" | "Closed" | "TBA";
  source: string;
}

export interface MeritCalculation {
  formula: string;
  components: {
    name: string;
    percentage: number;
  }[];
  source: string;
}

export interface GeneralInfo {
  topic: string;
  info: string;
  keywords: string[];
  source: string;
}

export const nustData: NustData = {
  programs: [
    { id: "se", name: "Software Engineering", category: "Computing", description: "Focuses on software development and design.", campus: ["Islamabad (SEECS)"], minMarks: 60 },
    { id: "cs", name: "Computer Science", category: "Computing", description: "Theoretical and practical aspects of computing.", campus: ["Islamabad (SEECS)", "Quetta"], minMarks: 60 },
    { id: "ee", name: "Electrical Engineering", category: "Engineering", description: "Power, electronics, and telecommunications.", campus: ["Islamabad (SEECS)", "Risalpur"], minMarks: 60 },
    { id: "me", name: "Mechanical Engineering", category: "Engineering", description: "Design and manufacturing of mechanical systems.", campus: ["Islamabad (SMME)", "Taxila"], minMarks: 60 },
    { id: "bba", name: "BBA", category: "Business", description: "Business administration and management.", campus: ["Islamabad (NBS)"], minMarks: 60 },
    { id: "eco", name: "Economics", category: "Social Sciences", description: "Study of resource allocation and markets.", campus: ["Islamabad (S3H)"], minMarks: 60 }
  ],
  eligibility: [
    {
      id: "eng-eligibility",
      title: "Engineering Programs Eligibility",
      criteria: "FSc (Pre-Engineering) or equivalent with Physics, Chemistry, and Mathematics.",
      minPercentage: 60,
      subjectsRequired: ["Physics", "Chemistry", "Mathematics"],
      source: "NUST Undergraduate Prospectus 2025"
    },
    {
      id: "comp-eligibility",
      title: "Computing Programs Eligibility",
      criteria: "FSc (Pre-Engineering / ICS) or equivalent with Mathematics and Physics.",
      minPercentage: 60,
      subjectsRequired: ["Mathematics", "Physics"],
      source: "NUST Undergraduate Prospectus 2025"
    },
    {
      id: "business-eligibility",
      title: "Business/Social Sciences Eligibility",
      criteria: "HSSC or equivalent in any discipline.",
      minPercentage: 60,
      subjectsRequired: ["Any"],
      source: "NUST Undergraduate Prospectus 2025"
    },
    {
      id: "alevel-eligibility",
      title: "A-Level / O-Level & IBCC Equivalence",
      criteria: "Candidates with A-Level/O-Level must obtain an Equivalence Certificate from the Inter Board Committee of Chairmen (IBCC). A minimum of 60% marks in the equivalence is required. For Engineering/Computing, 3 A-Level subjects (Physics, Mathematics, and Chemistry/CS) are required. For Business/Social Sciences, any 3 subjects are acceptable. Merit mapping: O-Level equivalence marks contribute 10% and A-Level (or O-Level if A-Level result is awaited) contributes 15% to the final aggregate.",
      minPercentage: 60,
      subjectsRequired: ["Varies by program"],
      source: "IBCC / NUST Policy"
    }
  ],
  tests: [
    {
      name: "NET (NUST Entry Test)",
      description: "Computer-based test conducted in Islamabad and paper-based in other cities.",
      weightage: 75,
      subjects: ["Mathematics", "Physics", "Chemistry/CS", "English", "Intelligence"],
      source: "NUST Admissions Portal"
    },
    {
      name: "SAT",
      description: "International students can apply via SAT scores for specific seats.",
      weightage: 0, // Varies by seat type
      subjects: ["Math", "Reading", "Writing"],
      source: "NUST International Admissions"
    }
  ],
  fees: {
    admissionFee: {
      national: "PKR 35,000 (Non-Refundable)",
      international: "USD 600 (Non-Refundable)"
    },
    securityDeposit: {
      national: "PKR 10,000 (Refundable)",
      international: "USD 250 (Refundable)"
    },
    tuitionFeePerSemester: {
      engineeringComputing: "PKR 197,050",
      socialSciencesBusiness: "PKR 275,400",
      international: "USD 2,700 (approx. USD 5,400 per annum)"
    },
    miscCharges: "PKR 5,000 per semester (National) / USD 120 per annum (International)",
    hbsLicensingFee: "PKR 15,000 per year (BBA, A&F, Tourism) / USD 50 per year (International)",
    repeatCourseFee: "PKR 8,000 per credit hour (National) / USD 40 per credit hour (International)",
    makeupExamFee: "PKR 5,000 per paper",
    defermentFee: "25% of tuition fee (100% for 1st semester deferment)",
    source: "NUST Fee Structure 2025-26"
  },
  deadlines: [
    { event: "NET Series 1 Registration", date: "December 2024", status: "Closed", source: "NUST Schedule" },
    { event: "NET Series 2 Registration", date: "February 2025", status: "Closed", source: "NUST Schedule" },
    { event: "NET Series 3 Registration", date: "April 2025", status: "Upcoming", source: "NUST Schedule" },
    { event: "NET Series 4 Registration", date: "June 2025", status: "Upcoming", source: "NUST Schedule" }
  ],
  merit: {
    formula: "75% NET + 15% HSSC/A-Level + 10% SSC/O-Level",
    components: [
      { name: "NUST Entry Test (NET)", percentage: 75 },
      { name: "HSSC / A-Level / Equivalent", percentage: 15 },
      { name: "SSC / O-Level / Equivalent", percentage: 10 }
    ],
    source: "NUST Merit Policy"
  },
  general: [
    {
      topic: "Hostel Facility",
      info: "NUST provides on-campus hostel facilities for outstation students at H-12 Islamabad. Separate hostels for males and females are available with mess, laundry, and internet facilities.",
      keywords: ["hostel", "accommodation", "living", "stay", "mess", "laundry"],
      source: "NUST Student Affairs"
    },
    {
      topic: "Scholarships",
      info: "NUST offers several financial aid programs: 1. Need-Based Scholarships (covers tuition fee). 2. Merit-Based Scholarships (for top NET performers). 3. PEEF Scholarships. 4. External sponsorships from organizations like HEC and USAID.",
      keywords: ["scholarship", "financial aid", "funding", "help", "fee concession", "peef", "hec"],
      source: "NUST Financial Aid Office"
    },
    {
      topic: "Campus Life",
      info: "Campus life at NUST H-12 is vibrant with over 30 student-run clubs and societies (NUST Adventure Club, Debating Society, etc.). Facilities include a central library, sports complex (gym, swimming pool, courts), horse riding club, and various cafes (C1, C2).",
      keywords: ["campus life", "sports", "clubs", "facilities", "life", "societies", "gym", "swimming", "riding", "cafes"],
      source: "NUST Campus Life Portal"
    },
    {
      topic: "A-Level Merit Mapping",
      info: "A-Level and O-Level grades are converted to percentage marks by IBCC. These percentage marks are then used in NUST's merit formula: 15% for A-Level (HSSC equivalent) and 10% for O-Level (SSC equivalent). If A-Level results are awaited, O-Level equivalence is used for both components (25% total).",
      keywords: ["mapping", "equivalence", "grades", "ibcc", "conversion"],
      source: "NUST Merit Policy"
    },
    {
      topic: "IBCC Equivalence Process",
      info: "To apply for NUST, A-Level/O-Level students must get their grades converted to percentage marks by IBCC. O-Level equivalence is mandatory for application. If A-Level results are awaited, NUST uses O-Level equivalence for both HSSC (15%) and SSC (10%) components. Once A-Level results are out, the final equivalence must be submitted to confirm admission.",
      keywords: ["ibcc", "equivalence", "certificate", "conversion", "process", "a-level", "o-level"],
      source: "IBCC / NUST Admissions"
    },
    {
      topic: "Refund Policy",
      info: "NUST Refund Policy: 1. Admission processing fee is non-refundable. 2. 100% tuition refund up to 10th day of classes. 3. 80% refund up to 15th day. 4. 60% refund up to 20th day. 5. 50% refund up to 30th day. 6. No refund after 31st day. Security deposit is refundable within 3 years of completion/withdrawal.",
      keywords: ["refund", "money back", "withdraw", "cancel", "return", "policy"],
      source: "NUST Refund Policy"
    },
    {
      topic: "Fee Adjustment & Program Switching",
      info: "If a student switches programs (e.g., Engineering to Business/Medical) or SAT seats (National to International) after paying dues, all paid amounts, including the admission processing fee, are adjusted for the final program. Any difference in fee is charged or refunded accordingly.",
      keywords: ["adjustment", "change program", "switch", "transfer fee", "sat national", "sat international", "medical", "business", "engineering"],
      source: "NUST Fee Policy FAQ"
    },
    {
      topic: "EMBA Fees",
      info: "EMBA students are charged per course. Business projects (2 projects, 3 credits each) are charged as one course fee each. A mandatory annual reading material fee is charged in the Fall semester. Course fees are non-refundable if dropped after two weeks.",
      keywords: ["emba", "executive mba", "business project", "reading material", "per course"],
      source: "NUST Postgraduate Fee Structure"
    },
    {
      topic: "MBBS Fees (NSHS)",
      info: "MBBS students at NSHS pay annual University Administrative Charges and PM&DC Registration Fees in addition to tuition. Specific rates are available on the NUST website.",
      keywords: ["mbbs", "medical", "nshs", "pmdc", "administrative charges"],
      source: "NUST MBBS Fee Structure"
    },
    {
      topic: "Postgraduate Fees (Masters/PhD)",
      info: "Masters: Full tuition for 4 semesters (2 years). Bench fee + course fee applies after 2 years. PhD: Full tuition for 6 semesters (3 years). Bench fee applies thereafter until completion.",
      keywords: ["masters", "ms", "phd", "postgraduate", "bench fee", "duration"],
      source: "NUST Postgraduate Fee Structure"
    }
  ]
};
