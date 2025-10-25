import { FeedRecommendation } from '@/lib/types';

interface FeedCardProps {
  recommendation: FeedRecommendation;
}

export default function FeedCard({ recommendation }: FeedCardProps) {
  const urgencyColors = {
    high: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-gray-100 text-gray-800 border-gray-200"
  };

  const paymentBadgeColors = {
    swipe: "bg-purple-100 text-purple-800",
    flex: "bg-blue-100 text-blue-800",
    external: "bg-orange-100 text-orange-800"
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{recommendation.diningHall}</h3>
          <p className="text-purple-600 font-medium mt-1">{recommendation.dishRecommendation}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${urgencyColors[recommendation.urgency]}`}>
          {recommendation.urgency === 'high' ? '🔥 Best Now' : recommendation.urgency === 'medium' ? '👍 Good Option' : '⏰ Available'}
        </div>
      </div>

      <p className="text-gray-700 mb-4">{recommendation.reasoning}</p>

      <div className="flex flex-wrap gap-3 items-center">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentBadgeColors[recommendation.paymentMethod]}`}>
          {recommendation.paymentMethod === 'swipe' ? '🎫 Meal Swipe' : recommendation.paymentMethod === 'flex' ? '💳 Flex Dollars' : '💵 Cash'}
        </span>
        <span className="text-green-600 font-semibold">
          {recommendation.savingsImpact}
        </span>
        <span className="text-gray-500">
          ⏱️ {recommendation.estimatedWait}
        </span>
        <span className="text-purple-600 font-semibold ml-auto">
          {recommendation.matchScore}% match
        </span>
      </div>
    </div>
  );
}