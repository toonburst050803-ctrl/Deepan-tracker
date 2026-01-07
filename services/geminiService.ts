
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Expense } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemPrompt = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return `
You are "Deepan Daily Expensive", a highly advanced professional expense tracking assistant.
The current date is ${dateStr} and the time is ${timeStr}.

CORE OBJECTIVE:
Extract detailed expense information from images (receipts, bills, or payment app screenshots like Google Pay, Paytm, PhonePe) or text input.

PAYMENT APP LOGIC (CRITICAL):
If the image is a screenshot from GPay, Paytm, or PhonePe:
1. LOOK FOR TRANSACTION DATE: Identify phrases like "Paid on", "Timestamp", "Completed at", or "Date". Use the date and time written in the screenshot as the source of truth for the 'date' field.
2. METADATA HINT: If you see a text tag starting with "FILE_CAPTURE_HINT:", this is the file's internal creation date. Use this if no date is visible in the image.
3. TRANSACTION ID: If a Transaction ID is visible, include it in the 'notes'.

EXTRACTION PROTOCOL:
1. VENDOR: Identity the shop name or the person paid.
2. PAYMENT MODE: Specifically identify "GPay", "Paytm", "PhonePe", "UPI", "Cash", "Card".
3. CATEGORY: Map to the 13 primary categories provided in the schema.

STRICT CATEGORIZATION RULES:
HOUSE EXPENSE, BIKE EXPENSE, BIKE PETROL, FOOD, SNACK, PHONE DUE, OFFERING, TRAVEL, SHOPPING, MEDICAL, ENTERTAINMENT, PERSONAL EXPENSE, OTHERS.

CRITICAL INSTRUCTIONS:
- Date MUST be in YYYY-MM-DD format.
- Do NOT default to today's date if a transaction date is visible in the screenshot.
- Use ₹ for currency in notes.
`;
};

export async function processExpenseInput(
  input: string | { data: string, mimeType: string },
  userText?: string
): Promise<Partial<Expense>> {
  const model = 'gemini-3-flash-preview';
  
  const parts: any[] = [];
  
  if (typeof input === 'string') {
    parts.push({ text: `Process this expense: "${input}"` });
  } else {
    parts.push({ inlineData: input });
    if (userText) {
      parts.push({ text: `Context/Metadata Hint: "${userText}"` });
    }
    parts.push({ text: "Perform a forensic scan of this screenshot/receipt. Locate the exact transaction timestamp/date written on the screen. Extract: Date (YYYY-MM-DD), Vendor, Category, Amount, Payment Mode, and Notes." });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      systemInstruction: getSystemPrompt(),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "YYYY-MM-DD format. Prioritize date shown in image text." },
          vendor: { type: Type.STRING, description: "Merchant/Shop/Person name." },
          category: { 
            type: Type.STRING, 
            description: "HOUSE EXPENSE, BIKE EXPENSE, BIKE PETROL, FOOD, SNACK, PHONE DUE, OFFERING, TRAVEL, SHOPPING, MEDICAL, ENTERTAINMENT, PERSONAL EXPENSE, or OTHERS."
          },
          subCategory: { type: Type.STRING, description: "Specific item type." },
          amount: { type: Type.NUMBER, description: "Numeric amount." },
          paymentMode: { type: Type.STRING, description: "e.g., UPI, GPay, Paytm, Cash." },
          notes: { type: Type.STRING, description: "Include transaction ID if visible." }
        },
        required: ["date", "vendor", "category", "amount"]
      }
    }
  });

  try {
    const text = response.text || "{}";
    const data = JSON.parse(text);
    return data;
  } catch (e) {
    console.error("Deepan AI Error:", e);
    return {};
  }
}

export async function generateSavingsInsights(expenses: Expense[]): Promise<any> {
  const model = 'gemini-3-flash-preview';
  const expenseSummary = expenses.slice(-50).map(e => `${e.date}: ${e.vendor} - ₹${e.amount}`).join('\n');

  const response = await ai.models.generateContent({
    model,
    contents: `Analyze these expenses:\n${expenseSummary}`,
    config: {
      systemInstruction: "You are an expert auditor. Provide 3 cost-cutting suggestions. Estimate monthly savings in ₹.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          avoidableExpenses: { type: Type.STRING },
          estimatedSavings: { type: Type.NUMBER }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
