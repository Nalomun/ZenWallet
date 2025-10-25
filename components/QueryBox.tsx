'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { queryMealRecommendation } from '@/lib/api';
import { getSmartQueryResponse } from '@/lib/smartMockResponses';
import { MOCK_USER, MOCK_DINING_HALLS } from '@/lib/mockData';
import { DEMO_PROFILES } from '@/lib/demoProfiles';

export default function QueryBox() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(MOCK_USER);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUserData();
  }, [router]); // Reload when route changes

  async function loadUserData() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_profile, preferences')
        .eq('id', user.id)
        .single();

      const profileKey = profile?.selected_profile || 'swipe_ignorer';
      let data = DEMO_PROFILES[profileKey as keyof typeof DEMO_PROFILES].data;
      
      // Add preferences to user data
      if (profile?.preferences) {
        data = { ...data, preferences: profile.preferences };
        console.log('🤖 QueryBox loaded preferences:', profile.preferences);
      }
      
      setUserData(data);
    }
  }

  async function handleSubmit(e: any) {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse('');
    
    // Reload user data BEFORE each query to get latest preferences
    const { data: { user } } = await supabase.auth.getUser();
    let freshUserData = MOCK_USER;
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_profile, preferences')
        .eq('id', user.id)
        .single();

      const profileKey = profile?.selected_profile || 'swipe_ignorer';
      freshUserData = DEMO_PROFILES[profileKey as keyof typeof DEMO_PROFILES].data;
      
      if (profile?.preferences) {
        freshUserData = { ...freshUserData, preferences: profile.preferences };
        console.log('💬 Query using fresh preferences:', profile.preferences);
      }
    }
    
    const result = await queryMealRecommendation(query, freshUserData, MOCK_DINING_HALLS);
    setResponse(result);
    setLoading(false);
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-blue-600 rounded-2xl shadow-2xl p-6 border-2 border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">🤖</span>
        <h2 className="text-white text-2xl font-bold">Ask AI Anything</h2>
      </div>
      <p className="text-white/90 mb-5 font-medium">
        Try: "I want something healthy and fast" or "Best dinner option under $10"
      </p>
      
      <div className="space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading && query.trim()) {
                handleSubmit(e as any);
              }
            }}
            placeholder="What do you want to eat?"
            className="flex-1 px-5 py-4 rounded-xl text-gray-900 font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-white/50 transition-all"
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !query.trim()}
            className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
          >
            {loading ? '🤔 Thinking...' : '✨ Ask'}
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="mt-5 bg-white/20 backdrop-blur-sm rounded-xl p-5 animate-pulse border border-white/30">
          <div className="h-4 bg-white/50 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-white/50 rounded w-1/2"></div>
        </div>
      )}

      {response && !loading && (
        <div className="mt-5 bg-white rounded-xl p-6 shadow-2xl border-2 border-white/50 animate-slide-up">
          <div className="flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">🤖</span>
            <div className="flex-1">
              <p className="text-gray-800 text-lg leading-relaxed font-medium">{response}</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-purple-600 font-semibold">
                  💡 Ask another question or check the recommendations below
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}