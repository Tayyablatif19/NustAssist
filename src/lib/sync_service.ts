import { GoogleGenAI } from "@google/genai";
import { nustData } from "../data/nust_data";

export interface DataUpdate {
  deadlines?: { event: string; date: string; status: string }[];
  fees?: { 
    tuition: string; 
    departmentalVariations?: { dept: string; fee: string }[];
    hostel?: string;
    miscCharges?: string;
    hbsLicensingFee?: string;
    repeatCourseFee?: string;
    source: string;
  };
  scholarships?: { name: string; eligibility: string; details: string }[];
  campusLife?: { category: string; description: string }[];
  meritNotes?: string;
  refundPolicy?: string;
  examFees?: string;
  timestamp: string;
}

export class SyncService {
  private static STORAGE_KEY = "nust_assistant_updates";

  public static getStoredUpdates(): DataUpdate | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  public static async fetchLatestUpdates(): Promise<DataUpdate | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found. Sync disabled.");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });
    
    try {
      const prompt = `
        You are a NUST Admissions Data Sync tool. 
        Crawl the following URLs and the NUST subreddit (r/NUST) for the latest 2025/2026 admission data:
        1. Fee Structure: https://nust.edu.pk/admissions/fee-structure/
        2. Scholarships: https://nust.edu.pk/admissions/scholarships
        3. Campus Life: https://campuslife.nust.edu.pk/
        
        Focus on:
        1. Detailed Fee Schedules: Get tuition fees for ALL departments (Engineering, Computing, Business, Social Sciences, Architecture, Applied Sciences).
        2. Additional Charges: Find updated hostel fees, mess charges, and security deposits.
        3. Scholarships: List available scholarships, their eligibility criteria, and key details.
        4. Campus Life: Summarize key aspects of campus life (hostels, sports, clubs, facilities).
        5. Deadlines: Confirm exact dates for NET Series 3 and Series 4 (2025).
        6. Merit Trends: Look for recent closing merits or aggregate trends discussed on r/NUST.
        7. Refund Policy: Get the latest refund schedule and rules.
        8. Exam Fees: Find make-up/retake exam fees.
        
        Return the information in a structured JSON format with these keys:
        - deadlines: array of { event, date, status }
        - fees: object with { tuition, departmentalVariations: Array<{dept, fee}>, hostel, miscCharges, hbsLicensingFee, repeatCourseFee, source }
        - scholarships: array of { name, eligibility, details }
        - campusLife: array of { category, description }
        - meritNotes: a short summary of latest merit trends
        - refundPolicy: a summary of the refund schedule
        - examFees: details on make-up/retake exam charges
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        },
      });

      const update = JSON.parse(response.text) as DataUpdate;
      update.timestamp = new Date().toISOString();
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(update));
      return update;
    } catch (error) {
      console.error("Sync failed:", error);
      return null;
    }
  }
}
