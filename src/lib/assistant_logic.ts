import { nustData, Program, EligibilityRule, TestInfo, Deadline, GeneralInfo } from "../data/nust_data";

export type Intent = "ELIGIBILITY" | "FEES" | "DEADLINES" | "PROGRAMS" | "TESTS" | "MERIT" | "GENERAL" | "UNKNOWN";

export interface AssistantResponse {
  directAnswer: string;
  supportingDetail: string;
  confidence: "High" | "Medium" | "Low";
  source: string;
}

export class AssistantLogic {
  private static STORAGE_KEY = "nust_assistant_updates";

  private static getDynamicUpdates() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  private static normalize(text: string): string {
    return text.toLowerCase().trim().replace(/[^\w\s]/g, "");
  }

  private static classifyIntent(query: string): Intent {
    const normalized = this.normalize(query);
    
    // Check for merit calculation patterns first
    if (normalized.includes("calculate") || normalized.includes("aggregate") || normalized.includes("merit")) {
      return "MERIT";
    }

    const keywords: Record<Intent, string[]> = {
      MERIT: ["merit", "calculate", "formula", "aggregate", "closing merit", "percentage calculation", "weightage"],
      ELIGIBILITY: ["eligible", "eligibility", "percentage", "marks", "criteria", "minimum", "can i apply", "apply", "requirement", "equivalence", "mapping", "ibcc", "a-level", "o-level"],
      FEES: ["fee", "cost", "charges", "tuition", "hostel fee", "admission fee", "security deposit", "payment", "refund", "defer", "makeup", "retake", "bench fee"],
      DEADLINES: ["date", "deadline", "when", "last date", "schedule", "series", "registration", "upcoming"],
      PROGRAMS: ["programs", "courses", "degrees", "majors", "offered", "departments", "engineering", "computing", "business"],
      TESTS: ["net", "test", "sat", "entry test", "exam", "subjects", "weightage", "series"],
      GENERAL: ["hostel", "scholarship", "accommodation", "financial aid", "campus", "location", "sports", "clubs", "facilities", "life"],
      UNKNOWN: []
    };

    for (const [intent, words] of Object.entries(keywords)) {
      if (words.some(word => normalized.includes(word))) {
        return intent as Intent;
      }
    }

    return "UNKNOWN";
  }

  public static processQuery(query: string): AssistantResponse {
    const normalized = this.normalize(query);

    // Handle very short queries
    if (normalized.length < 3) {
      return {
        directAnswer: "Could you please provide more details?",
        supportingDetail: "I need a more specific question to provide accurate admission information.",
        confidence: "Low",
        source: "NUST Offline Assistant"
      };
    }

    // Handle comparison queries
    if (normalized.includes("compare") || normalized.includes("vs") || normalized.includes("better than")) {
      return {
        directAnswer: "I don’t have verified offline data to compare NUST with other institutions.",
        supportingDetail: "My data is strictly focused on NUST Islamabad admissions. Comparing universities involves subjective factors and external data I don't possess.",
        confidence: "Low",
        source: "NUST Offline Assistant"
      };
    }

    // Handle emotional queries
    if (normalized.includes("stress") || normalized.includes("worry") || normalized.includes("scared") || normalized.includes("will i get in")) {
      return {
        directAnswer: "Admission is based strictly on merit (NET score + academic record).",
        supportingDetail: "I understand the process can be stressful. Focus on preparing for the NET, as it carries 75% weightage. Your aggregate score is the only factor in admission.",
        confidence: "Medium",
        source: "NUST Merit Policy"
      };
    }

    const intent = this.classifyIntent(query);

    switch (intent) {
      case "ELIGIBILITY":
        return this.handleEligibility(normalized);
      case "FEES":
        return this.handleFees(normalized);
      case "DEADLINES":
        return this.handleDeadlines(normalized);
      case "PROGRAMS":
        return this.handlePrograms(normalized);
      case "TESTS":
        return this.handleTests(normalized);
      case "MERIT":
        return this.handleMerit(normalized);
      case "GENERAL":
        return this.handleGeneral(normalized);
      default:
        return {
          directAnswer: "I don’t have verified offline data for this question.",
          supportingDetail: "I am trained on specific NUST admission data. Please try rephrasing or check the official NUST website.",
          confidence: "Low",
          source: "NUST Offline Assistant"
        };
    }
  }

  private static handleEligibility(query: string): AssistantResponse {
    // Check for A-level specific query
    if (query.includes("a level") || query.includes("alevel") || query.includes("o level") || query.includes("olevel") || query.includes("equivalence") || query.includes("mapping")) {
      const mappingInfo = nustData.general.find(g => g.topic === "A-Level Merit Mapping");
      return {
        directAnswer: "A-level and O-level students require an IBCC Equivalence Certificate.",
        supportingDetail: `Equivalence is mandatory. ${mappingInfo ? mappingInfo.info : "Grades are converted to percentages by IBCC for merit calculation."}`,
        confidence: "High",
        source: "NUST Undergraduate Prospectus 2025"
      };
    }

    // Check for specific percentage mention
    const percentageMatch = query.match(/(\d+)%/);
    if (percentageMatch) {
      const percentage = parseInt(percentageMatch[1]);
      if (percentage < 60) {
        return {
          directAnswer: "You are likely not eligible for most undergraduate programs.",
          supportingDetail: `NUST requires a minimum of 60% in HSSC/Equivalent for Engineering, Computing, and Business programs. Since you have ${percentage}%, you fall below the strict eligibility threshold.`,
          confidence: "High",
          source: "NUST Undergraduate Prospectus 2025"
        };
      } else {
        return {
          directAnswer: `With ${percentage}%, you meet the minimum percentage requirement for most programs.`,
          supportingDetail: "The minimum requirement is 60% in HSSC/Equivalent. However, admission depends heavily on your NET score.",
          confidence: "High",
          source: "NUST Undergraduate Prospectus 2025"
        };
      }
    }

    // General eligibility info
    const rule = nustData.eligibility.find(r => 
      query.includes(r.title.toLowerCase().split(" ")[0]) || 
      (r.id === "alevel-eligibility" && (query.includes("a-level") || query.includes("o-level") || query.includes("ibcc")))
    );
    if (rule) {
      return {
        directAnswer: rule.criteria,
        supportingDetail: `Minimum marks required: ${rule.minPercentage}%. Subjects required: ${rule.subjectsRequired.join(", ")}.`,
        confidence: "High",
        source: rule.source
      };
    }

    return {
      directAnswer: "The general eligibility for NUST undergraduate programs is a minimum of 60% in HSSC or equivalent.",
      supportingDetail: "Specific requirements vary for Engineering, Computing, and Business programs. Engineering requires Pre-Engineering subjects.",
      confidence: "Medium",
      source: "NUST Undergraduate Prospectus 2025"
    };
  }

  private static handleFees(query: string): AssistantResponse {
    const fees = nustData.fees;
    const dynamic = this.getDynamicUpdates();
    
    if (query.includes("refund") || query.includes("money back") || query.includes("return")) {
      const refund = nustData.general.find(g => g.topic === "Refund Policy");
      return {
        directAnswer: "NUST has a structured refund policy based on the timeline of class commencement.",
        supportingDetail: dynamic?.refundPolicy ? `${dynamic.refundPolicy}\n\n(Updated via Live Sync)` : (refund ? refund.info : "Refunds are available within the first 30 days of classes with varying percentages."),
        confidence: "High",
        source: dynamic?.refundPolicy ? "NUST Refund Policy (Live Sync)" : "NUST Refund Policy"
      };
    }

    if (query.includes("defer") || query.includes("suspension") || query.includes("delay") || query.includes("gap")) {
      return {
        directAnswer: `The fee for semester deferment or suspension is ${fees.defermentFee}.`,
        supportingDetail: "Note that deferring the 1st semester requires payment of 100% tuition fee.",
        confidence: "High",
        source: "NUST Fee Structure"
      };
    }

    if (query.includes("exam") || query.includes("makeup") || query.includes("retake") || query.includes("missed")) {
      return {
        directAnswer: `The fee for a make-up or retake exam (missed OHT/Mid/End) is ${fees.makeupExamFee}.`,
        supportingDetail: dynamic?.examFees ? `${dynamic.examFees}\n\n(Updated via Live Sync)` : "This applies per paper for missed exams.",
        confidence: "High",
        source: dynamic?.examFees ? "NUST Examination Policy (Live Sync)" : "NUST Examination Policy"
      };
    }

    if (query.includes("masters") || query.includes("ms") || query.includes("phd") || query.includes("postgraduate") || query.includes("grad")) {
      const pg = nustData.general.find(g => g.topic === "Postgraduate Fees (Masters/PhD)");
      return {
        directAnswer: "Postgraduate fee structures differ from undergraduate programs in terms of duration and bench fees.",
        supportingDetail: pg ? pg.info : "Masters students pay full tuition for 2 years, and PhD students for 3 years.",
        confidence: "High",
        source: "NUST Postgraduate Fee Structure"
      };
    }

    if (query.includes("adjustment") || query.includes("switch") || (query.includes("change") && query.includes("program")) || query.includes("transfer")) {
      const adj = nustData.general.find(g => g.topic === "Fee Adjustment & Program Switching");
      return {
        directAnswer: "Paid dues (including admission fee) are adjusted if you switch programs or SAT seats.",
        supportingDetail: adj ? adj.info : "Fees are transferable between programs if you are selected in another one later.",
        confidence: "High",
        source: "NUST Fee Policy"
      };
    }

    if (query.includes("emba")) {
      const emba = nustData.general.find(g => g.topic === "EMBA Fees");
      return {
        directAnswer: "EMBA students are charged per course rather than per semester.",
        supportingDetail: emba ? emba.info : "EMBA fees include per-course charges, project fees, and annual reading material fees.",
        confidence: "High",
        source: "NUST EMBA Fee Structure"
      };
    }

    if (query.includes("medical") || query.includes("mbbs") || query.includes("nshs")) {
      const mbbs = nustData.general.find(g => g.topic === "MBBS Fees (NSHS)");
      return {
        directAnswer: "MBBS fees at NSHS include annual administrative and registration charges.",
        supportingDetail: mbbs ? mbbs.info : "MBBS students pay annual University Administrative Charges and PM&DC Registration Fees.",
        confidence: "High",
        source: "NUST MBBS Fee Structure"
      };
    }

    if (query.includes("hostel")) {
      const hostel = nustData.general.find(g => g.topic === "Hostel Facility");
      return {
        directAnswer: "Hostel fees are separate from tuition fees.",
        supportingDetail: hostel ? hostel.info : "Hostel accommodation is available but requires separate application and fees.",
        confidence: "Medium",
        source: "NUST Student Affairs"
      };
    }

    if (dynamic?.fees) {
      let details = `One-time Admission Fee: ${fees.admissionFee.national}. Security Deposit: ${fees.securityDeposit.national}.`;
      
      if (dynamic.fees.departmentalVariations) {
        const variations = dynamic.fees.departmentalVariations.map(v => `${v.dept}: ${v.fee}`).join(", ");
        details += `\n\nDepartmental Variations: ${variations}.`;
      }
      
      if (dynamic.fees.hostel) {
        details += `\n\nHostel/Mess: ${dynamic.fees.hostel}.`;
      }

      if (dynamic.fees.miscCharges) {
        details += `\n\nMisc Charges: ${dynamic.fees.miscCharges}.`;
      }

      if (dynamic.fees.hbsLicensingFee) {
        details += `\n\nHBS Licensing Fee: ${dynamic.fees.hbsLicensingFee}.`;
      }

      if (dynamic.fees.repeatCourseFee) {
        details += `\n\nRepeat/Improvement: ${dynamic.fees.repeatCourseFee}.`;
      }

      return {
        directAnswer: `Tuition fee per semester is approximately ${dynamic.fees.tuition}.`,
        supportingDetail: `${details} (Updated via Live Sync)`,
        confidence: "High",
        source: dynamic.fees.source || fees.source
      };
    }

    if (query.includes("international") || query.includes("usd") || query.includes("abroad")) {
      return {
        directAnswer: `Tuition fee for international students is ${fees.tuitionFeePerSemester.international}.`,
        supportingDetail: `Admission Fee: ${fees.admissionFee.international}. Security Deposit: ${fees.securityDeposit.international}. Health Facilities: USD 120/annum. HBS Licensing Fee: USD 50/year. Repeat/Improvement: USD 40/credit hour.`,
        confidence: "High",
        source: fees.source
      };
    }

    return {
      directAnswer: `Tuition fee per semester for Engineering/Computing is ${fees.tuitionFeePerSemester.engineeringComputing}, and for Social Sciences/Business is ${fees.tuitionFeePerSemester.socialSciencesBusiness}.`,
      supportingDetail: `One-time Admission Fee: ${fees.admissionFee.national}. Security Deposit: ${fees.securityDeposit.national}. Misc Charges: ${fees.miscCharges}. HBS Licensing Fee: ${fees.hbsLicensingFee}. Repeat/Improvement: ${fees.repeatCourseFee}.`,
      confidence: "High",
      source: fees.source
    };
  }

  private static handleDeadlines(query: string): AssistantResponse {
    const dynamic = this.getDynamicUpdates();
    const deadlines = dynamic?.deadlines || nustData.deadlines;
    const upcoming = deadlines.filter((d: any) => d.status === "Upcoming");
    
    if (upcoming.length > 0) {
      const list = upcoming.map((d: any) => `${d.event}: ${d.date}`).join(", ");
      return {
        directAnswer: `The next upcoming deadlines are: ${list}.`,
        supportingDetail: `NUST conducts four series of entry tests (NET). Series 3 and 4 are typically in April and June. ${dynamic ? "(Updated via Live Sync)" : ""}`,
        confidence: "High",
        source: dynamic ? "NUST Admissions Portal (Live Sync)" : "NUST Admissions Schedule"
      };
    }
    return {
      directAnswer: "Most registration deadlines for the current series have passed or are yet to be announced.",
      supportingDetail: "Check the official portal for Series 4 registration which usually opens in May/June.",
      confidence: "Medium",
      source: "NUST Admissions Schedule"
    };
  }

  private static handlePrograms(query: string): AssistantResponse {
    const categoryMatch = nustData.programs.filter(p => query.includes(p.category.toLowerCase()));
    if (categoryMatch.length > 0) {
      const list = categoryMatch.map(p => p.name).join(", ");
      return {
        directAnswer: `NUST offers several programs in this category: ${list}.`,
        supportingDetail: `These programs are offered at various campuses including ${categoryMatch[0].campus.join(", ")}.`,
        confidence: "High",
        source: "NUST Undergraduate Prospectus 2025"
      };
    }

    const specificProgram = nustData.programs.find(p => query.includes(p.name.toLowerCase()) || query.includes(p.id));
    if (specificProgram) {
      return {
        directAnswer: `${specificProgram.name} is offered at ${specificProgram.campus.join(", ")}.`,
        supportingDetail: specificProgram.description,
        confidence: "High",
        source: "NUST Undergraduate Prospectus 2025"
      };
    }

    return {
      directAnswer: "NUST offers programs in Engineering, Computing, Business, Social Sciences, and Applied Sciences.",
      supportingDetail: "Popular programs include Software Engineering, Computer Science, and BBA.",
      confidence: "Medium",
      source: "NUST Undergraduate Prospectus 2025"
    };
  }

  private static handleTests(query: string): AssistantResponse {
    const net = nustData.tests[0];
    return {
      directAnswer: `${net.name} is the primary entry test for NUST.`,
      supportingDetail: `It covers ${net.subjects.join(", ")} and carries a ${net.weightage}% weightage in the final merit calculation.`,
      confidence: "High",
      source: net.source
    };
  }

  private static handleMerit(query: string): AssistantResponse {
    const merit = nustData.merit;
    const dynamic = this.getDynamicUpdates();
    
    // Helper to find scores in the query
    const findBestScore = (keywords: string[], max: number) => {
      const normalizedKeywords = keywords.map(k => k.toLowerCase().replace(/[^\w\s]/g, ""));
      const scores: number[] = [];
      
      for (const keyword of normalizedKeywords) {
        // Forward: "NET 150", "NET: 150", "NET is 150", "NET series 1 140"
        const forwardPattern = new RegExp(`${keyword}\\s*(?:series\\s*[1-4]\\s*)?[\\s:=-]*(?:is|of|score|marks)?\\s*(\\d+)`, 'gi');
        let match;
        while ((match = forwardPattern.exec(query)) !== null) {
          scores.push(parseInt(match[1]));
        }
        
        // Backward: "150 in NET", "150 marks in NET"
        const backwardPattern = new RegExp(`(\\d+)\\s*(?:in|marks in|score in|of|is)?\\s*${keyword}`, 'gi');
        while ((match = backwardPattern.exec(query)) !== null) {
          scores.push(parseInt(match[1]));
        }
      }
      
      // Filter realistic scores and take the best
      const validScores = scores.filter(s => s > 0 && s <= max);
      return validScores.length > 0 ? Math.max(...validScores) : null;
    };

    let net = findBestScore(['net'], 200);
    let hssc = findBestScore(['fsc', 'hssc', 'inter', 'alevel', 'a-level'], 1100);
    let ssc = findBestScore(['matric', 'ssc', 'olevel', 'o-level'], 1100);

    // Fallback: If it's a merit query and we have 3 numbers, try to assign them by range
    if ((net === null || hssc === null || ssc === null) && (query.includes("aggregate") || query.includes("calculate") || query.includes("merit"))) {
      const allNumbers = query.match(/\d+/g)?.map(Number) || [];
      if (allNumbers.length >= 3) {
        if (net === null) net = allNumbers.find(n => n > 0 && n <= 200) || null;
        if (hssc === null) hssc = allNumbers.find(n => n > 700 && n <= 1100 && n !== ssc) || null;
        if (ssc === null) ssc = allNumbers.find(n => n > 700 && n <= 1100 && n !== hssc) || null;
      }
    }

    // If all values are present, calculate
    if (net !== null && hssc !== null && ssc !== null) {
      const aggregate = ((net / 200) * 75) + ((hssc / 1100) * 15) + ((ssc / 1100) * 10);
      
      return {
        directAnswer: `Your estimated aggregate is ${aggregate.toFixed(2)}%.`,
        supportingDetail: `Based on your scores: NET (${net}/200), FSc (${hssc}/1100), and Matric (${ssc}/1100). Formula: (75% NET) + (15% FSc) + (10% Matric). This is an unofficial estimate.`,
        confidence: "High",
        source: "NUST Merit Policy"
      };
    }

    // If some values are missing, but it's clearly a merit query, ask for them
    const isMeritQuery = query.includes("calculate") || 
                        query.includes("merit") || 
                        query.includes("aggregate") ||
                        net !== null || hssc !== null || ssc !== null;

    if (isMeritQuery) {
      const missing = [];
      if (net === null) missing.push("NET score (out of 200)");
      if (hssc === null) missing.push("FSc/HSSC marks (out of 1100)");
      if (ssc === null) missing.push("Matric/SSC marks (out of 1100)");

      if (missing.length > 0) {
        return {
          directAnswer: `I can calculate your aggregate, but I'm missing: ${missing.join(", ")}.`,
          supportingDetail: "Please provide the missing values (e.g., 'My NET is 150, FSc 980, Matric 1020'). I'll use the 75-15-10 weightage formula.",
          confidence: "Medium",
          source: "NUST Merit Formula"
        };
      }
    }

    return {
      directAnswer: `Merit is calculated as: ${merit.formula}.`,
      supportingDetail: `The Entry Test (NET) is 75%, FSc is 15%, and Matric is 10%. ${dynamic?.meritNotes ? `\n\nLive Trend Note: ${dynamic.meritNotes}` : ""}`,
      confidence: "High",
      source: merit.source
    };
  }

  private static handleGeneral(query: string): AssistantResponse {
    const dynamic = this.getDynamicUpdates();
    
    if (query.includes("scholarship") || query.includes("financial aid")) {
      if (dynamic?.scholarships && dynamic.scholarships.length > 0) {
        const list = dynamic.scholarships.map((s: any) => `${s.name}: ${s.details}`).join("\n\n");
        return {
          directAnswer: "NUST offers several scholarships for undergraduate students.",
          supportingDetail: `${list}\n\n(Updated via Live Sync)`,
          confidence: "High",
          source: "NUST Scholarships Portal (Live Sync)"
        };
      }
      const scholarshipInfo = nustData.general.find(g => g.topic === "Scholarships");
      return {
        directAnswer: scholarshipInfo ? scholarshipInfo.info : "NUST provides various need-based and merit-based scholarships.",
        supportingDetail: "Check the official NUST website for the latest scholarship announcements and eligibility criteria.",
        confidence: "Medium",
        source: "NUST Student Affairs"
      };
    }

    if (query.includes("campus life") || query.includes("sports") || query.includes("clubs") || query.includes("facilities") || query.includes("life")) {
      if (dynamic?.campusLife && dynamic.campusLife.length > 0) {
        const list = dynamic.campusLife.map((c: any) => `${c.category}: ${c.description}`).join("\n\n");
        return {
          directAnswer: "NUST has a vibrant campus life with numerous facilities and activities.",
          supportingDetail: `${list}\n\n(Updated via Live Sync)`,
          confidence: "High",
          source: "NUST Campus Life (Live Sync)"
        };
      }
      // Fallback to static if dynamic is empty
      const campusInfo = nustData.general.find(g => g.topic === "Campus Life");
      if (campusInfo) {
        return {
          directAnswer: campusInfo.info,
          supportingDetail: "NUST offers a wide range of extracurricular activities and world-class facilities.",
          confidence: "High",
          source: campusInfo.source
        };
      }
    }

    const info = nustData.general.find(g => g.keywords.some(k => query.includes(k)));
    if (info) {
      return {
        directAnswer: info.info,
        supportingDetail: `Topic: ${info.topic}.`,
        confidence: "High",
        source: info.source
      };
    }
    return {
      directAnswer: "I don’t have specific verified info on that general topic.",
      supportingDetail: "Please check the NUST website for the most accurate information on non-academic facilities.",
      confidence: "Low",
      source: "NUST Offline Assistant"
    };
  }
}
