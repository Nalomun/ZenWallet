'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { analyzeSpending } from '@/lib/api';
import { MOCK_USER, MOCK_TRANSACTIONS } from '@/lib/mockData';
import { DEMO_PROFILES } from '@/lib/demoProfiles';
import { getMockAnalysis } from '@/lib/mockApiResponses';
import StatCard from './StatCard';
import WeeklyCuisineChart from './WeeklyCuisineChart';
import SpendingProgress from './SpendingProgress';
import QuickStats from './QuickStats';
import SpendingTrends from './SpendingTrends';

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trendView, setTrendView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
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
      
      // Try backend first, fallback to mock
      try {
        const analysisResult = await analyzeSpending(data, MOCK_TRANSACTIONS);
        if (analysisResult.main_insight === "Unable to analyze at this time") {
          setAnalysis(getMockAnalysis(data));
        } else {
          setAnalysis(analysisResult);
        }
      } catch (error) {
        setAnalysis(getMockAnalysis(data));
      }
      
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

        {/* AI Alert - Now Clickable */}
        {analysis?.main_insight && analysis.dollar_amount > 100 && (
          <div 
            onClick={() => setShowSavingsModal(true)}
            className="bg-gradient-to-r from-orange-100 to-amber-100 border-l-4 border-orange-400 rounded-xl p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl group-hover:scale-110 transition-transform">💡</span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-2">Savings Opportunity</h3>
                <p className="text-gray-800 mb-1">{analysis.main_insight}</p>
                <p className="text-sm text-gray-600 mt-2">
                  We found ways you could save money this semester!
                </p>
                <p className="text-xs text-orange-600 font-semibold mt-3 flex items-center gap-1 group-hover:gap-2 transition-all">
                  <span>Click for detailed breakdown</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </p>
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

          {/* Spending Trends - With View Selector */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Spending Trends
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setTrendView('daily')}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                    trendView === 'daily'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setTrendView('weekly')}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                    trendView === 'weekly'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTrendView('monthly')}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                    trendView === 'monthly'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <SpendingTrends view={trendView} user={userData} transactions={MOCK_TRANSACTIONS} />
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

      {/* Savings Modal */}
      {showSavingsModal && analysis && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
          onClick={() => setShowSavingsModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 p-8 animate-slide-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-5xl">💰</span>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                    Savings Breakdown
                  </h3>
                  <p className="text-gray-600 mt-1">How you can save ${analysis.dollar_amount.toFixed(0)} this semester</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSavingsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl hover:rotate-90 transition-all duration-300"
              >
                ×
              </button>
            </div>

            {/* Main Insight */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border-2 border-orange-300 mb-6">
              <p className="text-xl font-bold text-gray-900 mb-2">{analysis.main_insight}</p>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex-1 bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Potential Savings</p>
                  <p className="text-3xl font-bold text-orange-600">${analysis.dollar_amount.toFixed(0)}</p>
                </div>
                <div className="flex-1 bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Per Week</p>
                  <p className="text-3xl font-bold text-orange-600">${(analysis.dollar_amount / userData.weeks_remaining).toFixed(0)}</p>
                </div>
              </div>
            </div>

            {/* Patterns */}
            {analysis.patterns && (
              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📊</span> What We Found
                </h4>
                <div className="space-y-2">
                  {analysis.patterns.map((pattern: string, idx: number) => (
                    <div key={idx} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-purple-900 font-medium">{pattern}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Plan */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-300">
              <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <span>✅</span> Action Plan
              </h4>
              <p className="text-green-800 font-medium mb-4">{analysis.recommendation}</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSavingsModal(false);
                    window.location.href = '/feed';
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold hover:scale-105 transition-all duration-300"
                >
                  See Meal Recommendations
                </button>
                <button
                  onClick={() => setShowSavingsModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}