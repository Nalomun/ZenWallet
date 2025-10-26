'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateDailyFeed } from '@/lib/api';
import { MOCK_USER, MOCK_DINING_HALLS } from '@/lib/mockData';
import { DEMO_PROFILES } from '@/lib/demoProfiles';
import { getMockRecommendations } from '@/lib/mockApiResponses';
import FeedCard from '@/components/FeedCard';
import QueryBox from '@/components/QueryBox';
import VisaOffers from '@/components/VisaOffers';

export default function FeedPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const supabase = createClient();

    async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    let data = MOCK_USER;
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_profile, preferences')
        .eq('id', user.id)
        .single();

      const profileKey = profile?.selected_profile || 'swipe_ignorer';
      data = DEMO_PROFILES[profileKey as keyof typeof DEMO_PROFILES].data;
      
      // Add preferences to user data
      if (profile?.preferences) {
        data = { ...data, preferences: profile.preferences };
      }
    }
    
    setUserData(data);
    
    // Try to get AI recommendations with preferences
    try {
      const aiRecs = await generateDailyFeed(data, MOCK_DINING_HALLS, new Date());
      if (aiRecs && aiRecs.length > 0) {
        // Map AI response to FeedRecommendation format
        const formattedRecs = aiRecs.map((rec: any) => ({
          diningHall: rec.dining_hall || rec.diningHall,
          dishRecommendation: rec.meal || rec.dishRecommendation,
          reasoning: rec.reasoning,
          urgency: 'high' as const,
          paymentMethod: rec.use_swipe ? 'swipe' as const : 'flex' as const,
          savingsImpact: `Save ${rec.savings_amount}`,
          estimatedWait: '5-10 min',
          matchScore: 95
        }));
        setRecommendations(formattedRecs);
      } else {
        // Fallback to mock
        setRecommendations(getMockRecommendations(data));
      }
    } catch (error) {
      console.log('Using mock recommendations:', error);
      setRecommendations(getMockRecommendations(data));
    }
    
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 py-12 px-4 flex items-center justify-center">
        <div className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
          Finding your perfect meals...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                🍽️ Your Personalized Feed
              </h1>
              <p className="text-gray-600 font-medium">
                AI-powered meal recommendations based on your preferences and budget
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              {loading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {/* Query Box */}
        <div className="transform hover:scale-[1.02] transition-all duration-300">
          <QueryBox />
        </div>

        {/* Visa Offers */}
        <VisaOffers />

        {/* Recommendations */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Top Recommendations Right Now
            </h2>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold rounded-full animate-pulse">
              LIVE
            </span>
          </div>
          
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec, idx) => (
                <div 
                  key={idx}
                  className="animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <FeedCard recommendation={rec} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-12 text-center border border-white/20">
              <span className="text-6xl mb-4 block">🤔</span>
              <p className="text-xl font-semibold text-gray-700 mb-2">No recommendations yet</p>
              <p className="text-gray-600">Try asking the AI for meal suggestions above!</p>
            </div>
          )}
        </div>

        {/* Pro Tips */}
        <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl shadow-lg p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">💡</span>
            <h3 className="text-xl font-bold text-purple-900">Pro Tips</h3>
          </div>
          <ul className="space-y-2 text-purple-800">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold mt-1">•</span>
              <span>Use meal swipes during peak hours to maximize value</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold mt-1">•</span>
              <span>Check wait times - sometimes a 5-minute detour saves 15 minutes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold mt-1">•</span>
              <span>Ask the AI anything - "healthy and quick" or "comfort food under $10"</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}