import { FeedRecommendation } from '@/lib/types';

interface FeedCardProps {
  recommendation: FeedRecommendation;
}

export default function FeedCard({ recommendation }: FeedCardProps) {
  const urgencyColors = {
    high: "from-green-500 to-emerald-500",
    medium: "from-yellow-500 to-orange-500",
    low: "from-gray-500 to-slate-500"
  };

  const urgencyBg = {
    high: "bg-green-50/80",
    medium: "bg-yellow-50/80",
    low: "bg-gray-50/80"
  };

  const paymentBadgeColors = {
    swipe: "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
    flex: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    external: "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 cursor-pointer group">
      {/* Header with urgency badge */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
            {recommendation.diningHall}
          </h3>
          <p className="text-purple-600 font-semibold mt-1 text-lg">
            {recommendation.dishRecommendation}
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${urgencyBg[recommendation.urgency]} border-2 border-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
          <div className={`bg-gradient-to-r ${urgencyColors[recommendation.urgency]} bg-clip-text text-transparent`}>
            {recommendation.urgency === 'high' ? '🔥 Best Now' : recommendation.urgency === 'medium' ? '👍 Good' : '⏰ Available'}
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <p className="text-gray-700 mb-5 leading-relaxed">{recommendation.reasoning}</p>

      {/* Tags and info */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${paymentBadgeColors[recommendation.paymentMethod]} group-hover:scale-105 transition-transform duration-300`}>
          {recommendation.paymentMethod === 'swipe' ? '🎫 Meal Swipe' : recommendation.paymentMethod === 'flex' ? '💳 Flex Dollars' : '💵 Cash'}
        </span>
        
        <span className="px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md group-hover:scale-105 transition-transform duration-300">
          {recommendation.savingsImpact}
        </span>
        
        <span className="px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
          ⏱️ {recommendation.estimatedWait}
        </span>
        
        <span className="ml-auto px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-300 group-hover:scale-105 transition-transform duration-300">
          {recommendation.matchScore}% match
        </span>
      </div>

      {/* Hover indicator */}
      <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-xs text-purple-600 font-semibold">Click for more details</p>
      </div>
    </div>
  );
}