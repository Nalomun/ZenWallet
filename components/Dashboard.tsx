'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { analyzeSpending } from '@/lib/api';
import { MOCK_USER, MOCK_TRANSACTIONS } from '@/lib/mockData';
import { DEMO_PROFILES } from '@/lib/demoProfiles';
import StatCard from './StatCard';
import SpendingChart from './SpendingChart';
import WeeklyCuisineChart from './WeeklyCuisineChart';
import SpendingProgress from './SpendingProgress';
import QuickStats from './QuickStats';

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserData(MOCK_USER);
        const analysisResult = await analyzeSpending(MOCK_USER, MOCK_TRANSACTIONS);
        setAnalysis(analysisResult);
        setLoading(false);
        return;
      }

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 py-12 px-4 flex items-center justify-center">
        <div className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
          Loading your insights...
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 py-12 px-4 flex items-center justify-center">
        <div className="text-2xl font-semibold">Please sign in</div>
      </div>
    );
  }

  const weeksIntoSemester = 8;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome back, {userData.name} 👋
          </h1>
          <p className="text-gray-600 mt-2 font-medium">Week {weeksIntoSemester} of 16 • {userData.weeks_remaining} weeks remaining</p>
        </div>

        {/* AI Alert */}
        {analysis?.main_insight && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-[2px] rounded-2xl shadow-xl animate-pulse">
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-4xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-lg font-bold text-gray-900 mb-1">{analysis.main_insight}</p>
                  <p className="text-2xl font-extrabold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    Wasting ${analysis.dollar_amount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spending Progress + Quick Stats Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingProgress userData={userData} />
          <QuickStats userData={userData} />
        </div>

        {/* Stat Cards - Compact and Interactive */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Spent"
            value={`$${userData.total_spent.toFixed(2)}`}
            subtitle={`${Math.round((userData.total_spent / userData.total_budget) * 100)}% of budget`}
            trend="up"
            icon="💰"
            details={{
              budget: userData.total_budget,
              spent: userData.total_spent,
              remaining: userData.total_budget - userData.total_spent
            }}
          />
          <StatCard
            title="Meal Swipes"
            value={userData.swipes_remaining}
            subtitle={`${userData.swipes_used} used of ${userData.total_swipes}`}
            trend={userData.swipes_remaining > 30 ? "neutral" : "down"}
            icon="🎫"
            details={{
              total: userData.total_swipes,
              used: userData.swipes_used,
              remaining: userData.swipes_remaining,
              valuePerSwipe: 12
            }}
          />
          <StatCard
            title="Flex Dollars"
            value={`$${userData.flex_remaining.toFixed(2)}`}
            subtitle={`$${userData.flex_spent.toFixed(2)} spent`}
            trend={userData.flex_remaining > 200 ? "neutral" : "down"}
            icon="💳"
            details={{
              total: userData.total_flex,
              spent: userData.flex_spent,
              remaining: userData.flex_remaining
            }}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Cuisine Chart */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
            <WeeklyCuisineChart />
          </div>

          {/* Spending Chart */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Spending Over Time
            </h2>
            <SpendingChart />
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🤖</span>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Insights
            </h2>
          </div>

          {analysis?.patterns && (
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-5 rounded-xl mb-4 border border-purple-200 hover:shadow-md transition-all duration-300">
              <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <span>📊</span> Spending Patterns
              </h3>
              <ul className="space-y-2">
                {analysis.patterns.map((pattern: string, idx: number) => (
                  <li key={idx} className="text-purple-800 flex items-start gap-2">
                    <span className="text-purple-500 font-bold mt-0.5">•</span>
                    <span>{pattern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis?.recommendation && (
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-5 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300">
              <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                <span>💡</span> Smart Recommendation
              </h3>
              <p className="text-green-800 font-medium">{analysis.recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}