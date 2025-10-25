import FeedCard from '@/components/FeedCard';
import QueryBox from '@/components/QueryBox';

// Temporary hardcoded recommendations
const TEMP_RECOMMENDATIONS = [
  {
    id: "1",
    diningHall: "Central Dining",
    dishRecommendation: "Build-your-own pasta bar with marinara sauce",
    reasoning: "Matches your Italian preference and it's not crowded right now",
    paymentMethod: "swipe" as const,
    savingsImpact: "Uses 1 meal swipe (~$12 value)",
    urgency: "high" as const,
    estimatedWait: "5-10 min",
    matchScore: 95
  },
  {
    id: "2",
    diningHall: "West Hall",
    dishRecommendation: "Vegetarian stir-fry bowl",
    reasoning: "Healthy Asian option that fits your dietary needs",
    paymentMethod: "swipe" as const,
    savingsImpact: "Uses 1 meal swipe (~$12 value)",
    urgency: "medium" as const,
    estimatedWait: "10-15 min",
    matchScore: 88
  },
  {
    id: "3",
    diningHall: "Quick Bites Cafe",
    dishRecommendation: "Mediterranean wrap",
    reasoning: "Quick option if you're in a rush",
    paymentMethod: "flex" as const,
    savingsImpact: "$8.50 from flex dollars",
    urgency: "low" as const,
    estimatedWait: "2-5 min",
    matchScore: 75
  }
];

export default function FeedPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Your Personalized Feed</h1>
        <p className="text-gray-600 mt-2">AI-powered meal recommendations based on your preferences</p>
      </div>

      {/* Natural Language Query */}
      <QueryBox />

      {/* Recommendations */}
      <div className="space-y-4">
        {TEMP_RECOMMENDATIONS.map((rec) => (
          <FeedCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}