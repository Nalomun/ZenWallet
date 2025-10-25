'use client';

import { useState, useEffect } from 'react';
import { generateDailyFeed } from '@/lib/api';
import { MOCK_USER, MOCK_DINING_HALLS } from '@/lib/mockData';
import QueryBox from '@/components/QueryBox';  // ADD THIS

export default function FeedPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      const results = await generateDailyFeed(MOCK_USER, MOCK_DINING_HALLS, new Date());
      setRecommendations(results);
      setLoading(false);
    }
    fetchRecommendations();
  }, []);


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Your Personalized Feed</h1>
        <p className="text-gray-600 mt-2">AI-powered meal recommendations based on your preferences</p>
      </div>
      <QueryBox />
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
          <p className="text-yellow-800">No recommendations available. Make sure backend is running.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-3xl">{rec.emoji || '🍽️'}</span>
                    {rec.dining_hall}
                  </h3>
                  <p className="text-purple-600 font-medium text-lg mt-1">{rec.meal}</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{rec.reasoning}</p>

              <div className="flex flex-wrap gap-3 items-center">
                {rec.use_swipe && (
                  <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                    🎫 Use Meal Swipe
                  </span>
                )}
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  💰 Save ${rec.savings_amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}