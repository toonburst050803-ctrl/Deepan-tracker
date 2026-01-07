
export enum Category {
  HOUSE_EXPENSE = 'HOUSE EXPENSE',
  BIKE_EXPENSE = 'BIKE EXPENSE',
  BIKE_PETROL = 'BIKE PETROL',
  FOOD = 'FOOD',
  SNACK = 'SNACK',
  PHONE_DUE = 'PHONE DUE',
  OFFERING = 'OFFERING',
  TRAVEL = 'TRAVEL',
  SHOPPING = 'SHOPPING',
  MEDICAL = 'MEDICAL',
  ENTERTAINMENT = 'ENTERTAINMENT',
  PERSONAL_EXPENSE = 'PERSONAL EXPENSE',
  OTHERS = 'OTHERS'
}

export interface Expense {
  id: string;
  date: string;
  vendor: string;
  category: Category;
  subCategory?: string;
  amount: number;
  paymentMode: string;
  notes?: string;
}

export interface IncomeEntry {
  id: string;
  date: string;
  source: string;
  amount: number;
}

export interface MonthlySummary {
  totalExpense: number;
  categoryTotals: Record<Category, number>;
  topCategories: { category: Category; total: number }[];
  averageDaily: number;
  spendingPatterns: string;
}

export interface SavingsInsight {
  suggestions: string[];
  avoidableExpenses: string;
  estimatedSavings: number;
}
