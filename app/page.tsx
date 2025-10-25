import Dashboard from '@/components/Dashboard';

// Temporary hardcoded data - will replace with real mock data later
const TEMP_USER = {
  id: "1",
  name: "Sarah Chen",
  totalPlan: 2800,
  totalSwipes: 160,
  currentSpent: 1820,
  currentSwipes: 95,
  flexDollars: 180,
  weeksIntoSemester: 6,
  preferences: {
    dietaryRestrictions: ["vegetarian"],
    favoriteCuisines: ["italian"],
    dislikes: [],
    priorities: ["healthy"],
    favoriteDiningHalls: []
  }
};

const TEMP_ANALYSIS = {
  assessment: "You're on track to overspend by $280 this semester",
  biggestWaste: "Buying coffee off-campus while breakfast swipes go unused",
  projectedSavings: "$380 this semester",
  weeklyBurnRate: 113,
  recommendations: [
    "Use breakfast swipes instead of buying coffee",
    "Reduce off-campus meals by 1 per week"
  ]
};

export default function Home() {
  return <Dashboard user={TEMP_USER} analysis={TEMP_ANALYSIS} />;
}