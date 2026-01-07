
import { Category } from './types';

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.HOUSE_EXPENSE]: '#ef4444',
  [Category.BIKE_EXPENSE]: '#f97316',
  [Category.BIKE_PETROL]: '#f59e0b',
  [Category.FOOD]: '#10b981',
  [Category.SNACK]: '#3b82f6',
  [Category.PHONE_DUE]: '#6366f1',
  [Category.OFFERING]: '#8b5cf6',
  [Category.TRAVEL]: '#d946ef',
  [Category.SHOPPING]: '#ec4899',
  [Category.MEDICAL]: '#ef4444',
  [Category.ENTERTAINMENT]: '#64748b',
  [Category.PERSONAL_EXPENSE]: '#6366f1',
  [Category.OTHERS]: '#94a3b8',
};

// Hierarchy definition for UI expansion
export const CATEGORY_HIERARCHY: Partial<Record<Category, string[]>> = {
  [Category.HOUSE_EXPENSE]: ['House Rent', 'Water Bill', 'Electricity Bill', 'EB Bill', 'Maintenance'],
  [Category.BIKE_EXPENSE]: ['Bike EMI', 'Bike Service', 'Bike Spare Parts', 'Insurance'],
  [Category.BIKE_PETROL]: ['Petrol', 'Diesel'],
  [Category.SNACK]: ['Tea', 'Coffee', 'Biscuit', 'Chips', 'Juice', 'Samosa', 'Cool Drinks'],
  [Category.FOOD]: ['Lunch', 'Dinner', 'Breakfast', 'Biryani'],
  [Category.PERSONAL_EXPENSE]: ['Salon/Grooming', 'Gift', 'Self Care', 'Personal Gear'],
};

export const CATEGORY_KEYWORDS = {
  [Category.HOUSE_EXPENSE]: ['House Rent', 'Room Rent', 'Rent', 'Lease', 'Owner Payment', 'Rental', 'House Maintenance', 'Electricity Bill', 'EB', 'Water Bill', 'House Expense'],
  [Category.BIKE_EXPENSE]: ['Bike Service', 'Two Wheeler Service', 'Garage', 'Workshop', 'Oil Change', 'Chain Lube', 'Bike Spare Parts', 'Bike Due', 'Bike Expense', 'Maintenance', 'EMI'],
  [Category.BIKE_PETROL]: ['Petrol', 'Diesel', 'Fuel', 'HP', 'IOCL', 'BP', 'Bharat Petroleum'],
  [Category.FOOD]: ['Hotel', 'Restaurant', 'Meals', 'Lunch', 'Dinner', 'Biryani', 'Meals Bill'],
  [Category.SNACK]: ['Tea', 'Coffee', 'Snacks', 'Chips', 'Bakery', 'Juice', 'Cool Drinks', 'Snack', 'Samosa', 'Biscuit'],
  [Category.PHONE_DUE]: ['Mobile Bill', 'Phone Bill', 'Recharge', 'Airtel', 'Jio', 'VI', 'BSNL'],
  [Category.OFFERING]: ['Temple', 'Church', 'Mosque', 'Pooja', 'Archana', 'Abishekam', 'Hundial', 'Donation', 'Offering', 'Trust'],
  [Category.TRAVEL]: ['Bus', 'Train', 'Auto', 'Cab', 'Taxi'],
  [Category.SHOPPING]: ['Grocery', 'Clothes', 'Electronics', 'Accessories'],
  [Category.MEDICAL]: ['Hospital', 'Doctor', 'Clinic', 'Pharmacy', 'Medical Store'],
  [Category.ENTERTAINMENT]: ['Movie', 'Games', 'OTT', 'Subscription'],
  [Category.PERSONAL_EXPENSE]: ['Salon', 'Barber', 'Grooming', 'Gift', 'Personal', 'Deodorant', 'Perfume', 'Cosmetics', 'Self Care'],
  [Category.OTHERS]: []
};
