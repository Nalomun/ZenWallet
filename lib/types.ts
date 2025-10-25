// USER & MEAL PLAN DATA
export interface UserData {
  id: string;
  name: string;
  totalPlan: number;
  totalSwipes: number;
  currentSpent: number;
  currentSwipes: number;
  flexDollars: number;
  weeksIntoSemester: number;
  preferences: UserPreferences;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  favoriteCuisines: string[];
  dislikes: string[];
  priorities: string[];
  favoriteDiningHalls: string[];
}

// TRANSACTION DATA
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  location: string;
  type: "swipe" | "flex" | "external";
  category?: string;
}

// DINING HALL DATA
export interface DiningHall {
  id: string;
  name: string;
  hours: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  currentMenu: MenuItem[];
  distance: string;
  crowdLevel: "low" | "medium" | "high";
  acceptsSwipes: boolean;
  vibe: string;
}

export interface MenuItem {
  name: string;
  category: string;
  dietaryTags: string[];
}

// AI RESPONSE TYPES
export interface SpendingAnalysis {
  assessment: string;
  biggestWaste: string;
  projectedSavings: string;
  weeklyBurnRate: number;
  recommendations: string[];
}

export interface FeedRecommendation {
  id: string;
  diningHall: string;
  dishRecommendation: string;
  reasoning: string;
  paymentMethod: "swipe" | "flex" | "external";
  savingsImpact: string;
  urgency: "low" | "medium" | "high";
  estimatedWait: string;
  matchScore: number;
}