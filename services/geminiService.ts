
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Expense } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemPrompt = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return `
You are "Deepan Daily Expensive", a highly advanced professional expense tracking assistant.
The current date is ${dateStr} and the time is ${timeStr}. Use this as the reference for "today".

Your primary job is to extract extremely accurate details from images (receipts/bills) or chat text.

EXTRACTION PROTOCOL:
1. VENDOR: Identify the shop name, merchant, or service provider accurately. If it's a person, use their name.
2. PAYMENT MODE: Look for keywords like "UPI", "GPay", "PhonePe", "Cash", "Card", "Visa", "Mastercard", "Debit", "Credit", "Net Banking". If not found on a receipt, default to "Unknown" or infer from "Paid via...".
3. CATEGORY & SUB-CATEGORY: Map the item to one of the 13 primary categories and determine a specific sub-category.

STRICT CATEGORIZATION RULES:
1. HOUSE EXPENSE (Rent, Water, Electricity/EB, Maintenance)
2. BIKE EXPENSE (EMI, Service, Spares, Repairs)
3. BIKE PETROL
4. FOOD (Hotel, Restaurant, Breakfast, Lunch, Dinner, Biryani)
5. SNACK (Tea, Coffee, Biscuit, Chips, Samosa, Juice, Bakery)
6. PHONE DUE (Mobile Recharge, Broadband)
7. OFFERING (Temple, Church, Mosque, Donations)
8. TRAVEL (Bus, Train, Auto, Cab, Taxi, Toll)
9. SHOPPING (Grocery, Clothes, Gadgets)
10. MEDICAL (Pharmacy, Hospital, Lab)
11. ENTERTAINMENT (Movies, OTT, Games)
12. PERSONAL EXPENSE (Salon, Grooming, Gifts for friends/family, Self-care, Personal items)
13. OTHERS

CRITICAL INSTRUCTIONS:
- Always return category in ALL CAPS exactly as listed.
- If it's a receipt for "Tea" at "Saravana Bhavan", category is "SNACK", subCategory is "Tea", vendor is "Saravana Bhavan".
- If it's for "Haircut", category is "PERSONAL EXPENSE", subCategory is "Salon".
- If a receipt shows "Paid via UPI", paymentMode should be "UPI".
- Date must be in YYYY-MM-DD format.
- Use the Indian Rupee symbol (₹) for all currency references in notes.
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
      parts.push({ text: `Context provided by user: "${userText}"` });
    }
    parts.push({ text: "Perform a deep scan of this image. Extract: Date (YYYY-MM-DD), Vendor name, Primary Category (from list), Sub-Category (item name), precise Amount, Payment Mode (UPI/Cash/Card/etc), and any useful Notes." });
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
          date: { type: Type.STRING, description: "YYYY-MM-DD format." },
          vendor: { type: Type.STRING, description: "Merchant/Shop name." },
          category: { 
            type: Type.STRING, 
            description: "Must be one of: HOUSE EXPENSE, BIKE EXPENSE, BIKE PETROL, FOOD, SNACK, PHONE DUE, OFFERING, TRAVEL, SHOPPING, MEDICAL, ENTERTAINMENT, PERSONAL EXPENSE, or OTHERS."
          },
          subCategory: { type: Type.STRING, description: "Specific item type, e.g., 'Tea', 'Biryani', 'EB Bill'." },
          amount: { type: Type.NUMBER, description: "Numeric amount only." },
          paymentMode: { type: Type.STRING, description: "e.g., UPI, GPay, Cash, Credit Card, Debit Card." },
          notes: { type: Type.STRING, description: "Any additional details like 'Paid for friend' or item list. Use ₹ for currency." }
        },
        required: ["date", "vendor", "category", "amount"]
      }
    }
  });

  try {
    // Correctly extract generated text output from GenerateContentResponse using .text property.
    const text = response.text || "{}";
    const data = JSON.parse(text);
    return data;
  } catch (e) {
    console.error("Deepan AI Error: Failed to parse extraction result", e);
    return {};
  }
}

export async function generateSavingsInsights(expenses: Expense[]): Promise<any> {
  const model = 'gemini-3-flash-preview';
  const expenseSummary = expenses.slice(-50).map(e => `${e.date}: ${e.vendor} - ${e.category}${e.subCategory ? ` (${e.subCategory})` : ''} - ₹${e.amount} [${e.paymentMode}]`).join('\n');

  const response = await ai.models.generateContent({
    model,
    contents: `Analyze these expenses and give savings advice:\n${expenseSummary}`,
    config: {
      systemInstruction: "You are an expert financial auditor. Provide 3 specific cost-cutting suggestions based on sub-categories and payment patterns. Estimate potential monthly savings in ₹.",
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

  // Correctly extract generated text output from GenerateContentResponse using .text property.
  return JSON.parse(response.text || "{}");
}
