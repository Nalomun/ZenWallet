// app/feed/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { generateDailyFeed } from '@/lib/api';
import { MOCK_USER, MOCK_DINING_HALLS } from '@/lib/mockData';
import FeedCard from '@/components/FeedCard';

export default function FeedPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      const results = await generateDailyFeed(
        MOCK_USER,
        MOCK_DINING_HALLS,
        new Date()
      );
      setRecommendations(results);
      setLoading(false);
    }
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <h3 className="text-2xl font-bold">{rec.emoji} {rec.dining_hall}</h3>
          <p className="text-purple-600 font-medium mt-1">{rec.meal}</p>
          <p className="text-gray-700 mt-2">{rec.reasoning}</p>
          <div className="mt-4 flex gap-3">
            {rec.use_swipe && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                🎫 Use Meal Swipe
              </span>
            )}
            <span className="text-green-600 font-semibold">
              Save ${rec.savings_amount}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}