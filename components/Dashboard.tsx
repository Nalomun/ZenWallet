'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { analyzeSpending } from '@/lib/api';
import { MOCK_USER, MOCK_TRANSACTIONS } from '@/lib/mockData';
import { DEMO_PROFILES } from '@/lib/demoProfiles';
import StatCard from './StatCard';
import SpendingChart from './SpendingChart';
import WeeklyCuisineChart from './WeeklyCuisineChart';
import SpendingProgress from './SpendingProgress'; // 👈 Import your new overspending chart

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 👤 Mock user adjustment for Sarah Chen
  const user = {
    ...MOCK_USER,
    name: 'Sarah Chen',
    total_budget: 1000,
    total_spent: 860,
    swipes_remaining: 12,
    flex_remaining: 140,
    weeks_remaining: 10,
  };

  useEffect(() => {
    async function loadData() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Not signed in - use default mock data
        setUserData(MOCK_USER);
        const analysisResult = await analyzeSpending(MOCK_USER, MOCK_TRANSACTIONS);
        setAnalysis(analysisResult);
        setLoading(false);
        return;
      }

      // Get user's selected profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_profile')
        .eq('id', user.id)
        .single();

      const profileKey = profile?.selected_profile || 'swipe_ignorer';
      const data = DEMO_PROFILES[profileKey as keyof typeof DEMO_PROFILES].data;
      
      setUserData(data);

      const analysisResult = await analyzeSpending(data, MOCK_TRANSACTIONS);
      setAnalysis(analysisResult);

      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 flex items-center justify-center">
        <div className="text-2xl font-semibold text-purple-600">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 flex items-center justify-center">
        <div className="text-2xl font-semibold">Please sign in</div>
      </div>
    );
  }

  const weeksIntoSemester = 8;
  const spentPercent = Math.round((userData.total_spent / userData.total_budget) * 100);

  return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Welcome back, {userData.name}</h1>
          <p className="text-gray-600 mt-2">Week {weeksIntoSemester} of 16</p>
        </div>
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Welcome back, {user.name} 👋</h1>
        <p className="text-gray-600 mt-2">Week {weeksIntoSemester} of 16</p>
      </div>

      {/* Spending Progress (Overspending Visualization) */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Spending Overview</h2>
        <SpendingProgress />
      </div>

        {!loading && analysis?.main_insight && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <p className="text-lg font-bold text-red-900">{analysis.main_insight}</p>
            <p className="text-red-700 text-xl">Wasting ${analysis.dollar_amount}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Spent"
            value={`$${userData.total_spent}`}
            subtitle={`${spentPercent}% of budget`}
            trend="up"
            icon="💰"
          />
          <StatCard
            title="Swipes Left"
            value={userData.swipes_remaining}
            subtitle="Use them!"
            trend="neutral"
            icon="🎫"
          />
          <StatCard
            title="Flex Dollars"
            value={`$${userData.flex_remaining}`}
            subtitle="Available"
            trend="neutral"
            icon="💳"
          />
        </div>

      {/* Weekly Cuisine Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Weekly Cuisine Ranking</h2>
        <WeeklyCuisineChart />
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">AI Insights</h2>

        {loading && (
          <div className="bg-gray-100 p-4 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        )}

        {!loading && analysis?.main_insight && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-4">
            <p className="text-lg font-bold text-red-900">{analysis.main_insight}</p>
            <p className="text-red-700 text-xl">Wasting ${analysis.dollar_amount}</p>
          </div>
        )}

        {!loading && analysis?.patterns && (
          <div className="bg-purple-50 p-5 rounded-lg mb-4">
            <h3 className="font-semibold text-purple-900 mb-3">Patterns</h3>
            <ul className="space-y-2">
              {analysis.patterns.map((pattern: string, idx: number) => (
                <li key={idx} className="text-purple-800">{pattern}</li>
              ))}
            </ul>
          </div>
        )}

          {analysis?.recommendation && (
            <div className="bg-green-50 p-5 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Recommendation</h3>
              <p className="text-green-800">{analysis.recommendation}</p>
            </div>
          )}
        </div>

      {/* Spending Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Spending Chart </h2>
          <SpendingChart />
        </div>
      </div>
    </div>
  );
}

