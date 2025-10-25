// lib/mockData.ts - Using swipe_ignorer profile (shows clear waste pattern)
export const MOCK_USER = {
  name: "Sarah Chen",
  total_budget: 3175.0,
  total_spent: 4288.62,  // WAY OVERSPENDING!
  total_swipes: 161,
  swipes_used: 105,  // Not using enough swipes
  swipes_remaining: 56,
  total_flex: 800.0,
  flex_spent: 680.0,
  flex_remaining: 120.0,
  weeks_remaining: 8,
  preferences: {
    dietary: ["vegetarian"],
    favorite_cuisines: ["American", "Mexican"],
    priorities: ["healthy", "social"]
  }
};

export const MOCK_TRANSACTIONS = [
  // Recent Week - Starbucks addiction while ignoring meal swipes!
  {
    merchant: "Starbucks",
    amount: 12.89,
    type: "flex",
    timestamp: "2025-10-24T08:47:22Z"
  },
  {
    merchant: "Starbucks",
    amount: 14.02,
    type: "flex",
    timestamp: "2025-10-24T09:15:22Z"
  },
  {
    merchant: "Smoothie Shack",
    amount: 8.55,
    type: "flex",
    timestamp: "2025-10-24T12:30:22Z"
  },
  {
    merchant: "Starbucks",
    amount: 11.77,
    type: "flex",
    timestamp: "2025-10-23T08:20:22Z"
  },
  {
    merchant: "Off-Campus Grill",
    amount: 13.56,
    type: "flex",
    timestamp: "2025-10-23T19:00:22Z"
  },
  {
    merchant: "Starbucks",
    amount: 13.87,
    type: "flex",
    timestamp: "2025-10-20T08:15:22Z"
  },
  {
    merchant: "Off-Campus Grill",
    amount: 8.06,
    type: "swipe",
    timestamp: "2025-10-20T12:30:22Z"
  },
  {
    merchant: "Starbucks",
    amount: 14.81,
    type: "flex",
    timestamp: "2025-10-19T08:10:22Z"
  },
  
  // Previous weeks - pattern continues
  {
    merchant: "Smoothie Shack",
    amount: 11.43,
    type: "flex",
    timestamp: "2025-10-17T12:00:22Z"
  },
  {
    merchant: "Off-Campus Grill",
    amount: 9.28,
    type: "flex",
    timestamp: "2025-10-16T19:30:22Z"
  },
  {
    merchant: "Starbucks",
    amount: 12.10,
    type: "flex",
    timestamp: "2025-10-15T08:15:22Z"
  },
  {
    merchant: "Starbucks",
    amount: 12.67,
    type: "flex",
    timestamp: "2025-10-14T08:20:22Z"
  },
  {
    merchant: "Smoothie Shack",
    amount: 14.07,
    type: "flex",
    timestamp: "2025-10-13T12:30:22Z"
  },
  {
    merchant: "Starbucks",
    amount: 12.46,
    type: "flex",
    timestamp: "2025-10-10T08:15:22Z"
  },
  {
    merchant: "Off-Campus Grill",
    amount: 7.56,
    type: "flex",
    timestamp: "2025-10-09T19:00:22Z"
  },
  {
    merchant: "Starbucks",
    amount: 11.36,
    type: "flex",
    timestamp: "2025-10-08T08:15:22Z"
  },
  {
    merchant: "Smoothie Shack",
    amount: 10.42,
    type: "flex",
    timestamp: "2025-10-07T12:00:22Z"
  },
  {
    merchant: "Starbucks",
    amount: 7.33,
    type: "flex",
    timestamp: "2025-10-03T08:20:22Z"
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
    name: "North Commons",
    current_menu: ["Grain bowls", "Smoothie station", "Soup corner"],
    wait_time: 3,
    crowd_level: "low",
    accepts_swipes: true,
    distance: "5 min walk"
  },
  {
    name: "Campus Café",
    current_menu: ["Coffee", "Bagels", "Wraps"],
    wait_time: 7,
    crowd_level: "high",
    accepts_swipes: false,
    distance: "1 min walk"
  }
];