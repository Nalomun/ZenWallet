// lib/mockData.ts - Backend compatible format
export const MOCK_USER = {
  name: "Sarah Chen",
  total_budget: 2800.0,
  total_spent: 1820.0,
  total_swipes: 160,
  swipes_used: 95,
  swipes_remaining: 65,
  total_flex: 800.0,
  flex_spent: 520.0,
  flex_remaining: 280.0,
  weeks_remaining: 8,
  preferences: {
    dietary: ["vegetarian"],
    favorite_cuisines: ["Italian", "Asian"],
    priorities: ["healthy", "quick"]
  }
};

export const MOCK_TRANSACTIONS = [
  {
    merchant: "Starbucks",
    amount: 6.50,
    type: "flex",
    timestamp: "2025-10-24T12:30:00Z"
  },
  {
    merchant: "Central Dining",
    amount: 0,
    type: "swipe",
    timestamp: "2025-10-24T13:00:00Z"
  },
  {
    merchant: "Chipotle",
    amount: 18.50,
    type: "flex",
    timestamp: "2025-10-23T19:00:00Z"
  }
];

export const MOCK_DINING_HALLS = [
  {
    name: "Central Dining",
    current_menu: ["Pasta bar", "Salad bar", "Pizza"],
    wait_time: 5,
    crowd_level: "medium",
    accepts_swipes: true,
    distance: "2 min walk"
  },
  {
    name: "West Hall",
    current_menu: ["Stir-fry", "Sushi", "Noodles"],
    wait_time: 10,
    crowd_level: "high",
    accepts_swipes: true,
    distance: "5 min walk"
  }
];