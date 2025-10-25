// User Data Types
export interface UserData {
  name: string;
  total_budget: number;
  total_spent: number;
  total_swipes: number;
  swipes_used: number;
  swipes_remaining: number;
  total_flex: number;
  flex_spent: number;
  flex_remaining: number;
  weeks_remaining: number;
  preferences: {
    dietary: string[];
    favorite_cuisines: string[];
    priorities: string[];
  };
}

// Transaction Types
export interface Transaction {
  merchant: string;
  amount: number;
  type: 'flex' | 'swipe' | 'external';
  timestamp: string;
}

// Dining Hall Types
export interface DiningHall {
  name: string;
  current_menu: string[];
  wait_time: number;
  crowd_level: 'low' | 'medium' | 'high';
  accepts_swipes: boolean;
  distance: string;
}

// AI Response Types
export interface SpendingAnalysis {
  main_insight: string;
  dollar_amount: number;
  patterns: string[];
  recommendation: string;
}

export interface FeedRecommendation {
  diningHall: string;
  dishRecommendation: string;
  reasoning: string;
  urgency: 'high' | 'medium' | 'low';
  paymentMethod: 'swipe' | 'flex' | 'external';
  savingsImpact: string;
  estimatedWait: string;
  matchScore: number;
}

export interface QueryResponse {
  response: string;
}

// Demo Profile Types
export interface DemoProfile {
  id: string;
  name: string;
  emoji: string;
  description: string;
  problem: string;
  data: UserData;
}