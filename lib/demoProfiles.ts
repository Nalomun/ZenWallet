export const DEMO_PROFILES = {
  swipe_ignorer: {
    id: 'swipe_ignorer',
    name: 'Quinn',
    description: 'Constantly buying food off-campus while meal swipes expire',
    emoji: '🛍️',
    problem: 'Wasting $672 in unused swipes',
    data: {
      name: "Quinn",
      total_budget: 3175.0,
      total_spent: 4288.62,
      total_swipes: 161,
      swipes_used: 105,
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
    }
  },
  
  flex_abuser: {
    id: 'flex_abuser',
    name: 'Nafis',
    description: 'Burns through flex dollars at campus cafes',
    emoji: '💳',
    problem: 'Overspending $800 on flex dollars',
    data: {
      name: "Nafis",
      total_budget: 3175.0,
      total_spent: 3980.0,
      total_swipes: 161,
      swipes_used: 145,
      swipes_remaining: 16,
      total_flex: 800.0,
      flex_spent: 1600.0,
      flex_remaining: 0,
      weeks_remaining: 8,
      preferences: {
        dietary: ["pescatarian"],
        favorite_cuisines: ["Asian", "Mediterranean"],
        priorities: ["convenience", "quality"]
      }
    }
  },
  
  balanced_saver: {
    id: 'balanced_saver',
    name: 'Hyacinth',
    description: 'Smart spender who uses the app well',
    emoji: '✨',
    problem: 'On track to save $450 this semester',
    data: {
      name: "Hyacinth",
      total_budget: 3175.0,
      total_spent: 2100.0,
      total_swipes: 161,
      swipes_used: 140,
      swipes_remaining: 21,
      total_flex: 800.0,
      flex_spent: 450.0,
      flex_remaining: 350.0,
      weeks_remaining: 8,
      preferences: {
        dietary: ["vegetarian"],
        favorite_cuisines: ["Indian", "Mediterranean"],
        priorities: ["healthy", "budget"]
      }
    }
  },

  social_spender: {
    id: 'social_spender',
    name: 'THE BEAR',
    description: 'Always eating out with friends',
    emoji: '🐻',
    problem: 'Spending $900/month on social dining',
    data: {
      name: "THE BEAR",
      total_budget: 3175.0,
      total_spent: 4850.0,
      total_swipes: 161,
      swipes_used: 90,
      swipes_remaining: 71,
      total_flex: 800.0,
      flex_spent: 800.0,
      flex_remaining: 0,
      weeks_remaining: 8,
      preferences: {
        dietary: [],
        favorite_cuisines: ["American", "Asian", "Mexican"],
        priorities: ["social", "variety"]
      }
    }
  }
};