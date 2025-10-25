// lib/mockApiResponses.ts
// Mock API responses for when backend isn't available

export function getMockAnalysis(userData: any) {
  const wastedSwipes = userData.swipes_remaining * 12;
  const overBudget = userData.total_spent - userData.total_budget;
  
  // Different responses based on profile
  if (userData.swipes_remaining > 50) {
    return {
      main_insight: `You're wasting $${wastedSwipes.toFixed(0)} by letting ${userData.swipes_remaining} meal swipes expire unused`,
      dollar_amount: wastedSwipes,
      patterns: [
        `Buying food off-campus while ${userData.swipes_remaining} swipes remain unused`,
        `Each unused swipe is worth $12 - that's $${wastedSwipes} going to waste`,
        `You've spent $${userData.total_spent.toFixed(2)} (${Math.round((userData.total_spent / userData.total_budget) * 100)}% of budget)`,
        `At this rate, you'll be $${Math.abs(overBudget).toFixed(0)} over budget by semester end`
      ],
      recommendation: `Start using meal swipes for breakfast and lunch - you could save $${(wastedSwipes * 0.7).toFixed(0)} by using them instead of buying off-campus`
    };
  } else if (userData.flex_spent > userData.total_flex) {
    return {
      main_insight: `You've overspent your flex dollars by $${(userData.flex_spent - userData.total_flex).toFixed(0)}`,
      dollar_amount: userData.flex_spent - userData.total_flex,
      patterns: [
        `Flex spending is at $${userData.flex_spent.toFixed(2)} (${Math.round((userData.flex_spent / userData.total_flex) * 100)}% of budget)`,
        `Frequent purchases at campus cafes adding up quickly`,
        `You've spent $${userData.total_spent.toFixed(2)} total (${Math.round((userData.total_spent / userData.total_budget) * 100)}% of budget)`
      ],
      recommendation: `Switch to meal swipes for regular meals - save flex dollars for snacks and coffee only`
    };
  } else if (overBudget > 500) {
    return {
      main_insight: `You're significantly over budget by $${Math.abs(overBudget).toFixed(0)}`,
      dollar_amount: Math.abs(overBudget),
      patterns: [
        `Total spending: $${userData.total_spent.toFixed(2)} vs budget: $${userData.total_budget.toFixed(2)}`,
        `${userData.swipes_remaining} unused swipes worth $${wastedSwipes}`,
        `High off-campus dining expenses`,
        `With ${userData.weeks_remaining} weeks left, this trend needs to change`
      ],
      recommendation: `Urgent: Use ALL your remaining ${userData.swipes_remaining} meal swipes and avoid off-campus purchases to get back on track`
    };
  } else {
    return {
      main_insight: `Great job! You're ${userData.total_spent < userData.total_budget ? 'under' : 'on track with'} budget`,
      dollar_amount: Math.abs(userData.total_budget - userData.total_spent),
      patterns: [
        `Balanced use of meal swipes (${userData.swipes_used} used)`,
        `Smart flex dollar management ($${userData.flex_spent.toFixed(2)} spent)`,
        `Total spending: $${userData.total_spent.toFixed(2)} of $${userData.total_budget.toFixed(2)} budget`,
        `With ${userData.weeks_remaining} weeks remaining, you're on a good trajectory`
      ],
      recommendation: `Keep up the good work! Continue using meal swipes for main meals and flex for occasional treats`
    };
  }
}

export function getMockRecommendations(userData: any) {
  const baseRecs = [
    {
      diningHall: "Central Dining",
      dishRecommendation: "Pasta bar with marinara sauce",
      reasoning: `Use your meal swipe here - you have ${userData.swipes_remaining} expiring. Saves $12 vs going off-campus, and they have great vegetarian options.`,
      urgency: "high" as const,
      paymentMethod: "swipe" as const,
      savingsImpact: "Save $12",
      estimatedWait: "5 min",
      matchScore: 95
    },
    {
      diningHall: "North Commons",
      dishRecommendation: "Build-your-own grain bowl",
      reasoning: "Perfect for healthy eating. Fresh ingredients, customizable, and uses a meal swipe instead of $11 at a restaurant.",
      urgency: "high" as const,
      paymentMethod: "swipe" as const,
      savingsImpact: "Save $11",
      estimatedWait: "3 min",
      matchScore: 92
    },
    {
      diningHall: "West Café",
      dishRecommendation: "Breakfast wrap with avocado",
      reasoning: "Great morning option. Use a swipe instead of spending $9 at Starbucks. Quick service during morning rush.",
      urgency: "medium" as const,
      paymentMethod: "swipe" as const,
      savingsImpact: "Save $9",
      estimatedWait: "7 min",
      matchScore: 88
    },
    {
      diningHall: "East Market",
      dishRecommendation: "Fresh poke bowl",
      reasoning: "Healthy lunch choice with customizable proteins. Meal swipe accepted, and it's only a 2-minute walk from your classes.",
      urgency: "medium" as const,
      paymentMethod: "swipe" as const,
      savingsImpact: "Save $13",
      estimatedWait: "10 min",
      matchScore: 85
    }
  ];

  // Prioritize swipe usage if user has many remaining
  if (userData.swipes_remaining > 40) {
    return baseRecs.map(rec => ({
      ...rec,
      urgency: "high" as const,
      reasoning: rec.reasoning + ` Critical: You have ${userData.swipes_remaining} swipes to use!`
    }));
  }

  return baseRecs;
}