'use client';

import { useState, useEffect } from 'react';
import { analyzeSpending } from '@/lib/api';
import { MOCK_USER, MOCK_TRANSACTIONS } from '@/lib/mockData';
import StatCard from './StatCard';
import SpendingChart from './SpendingChart';
import WeeklyCuisineChart from './WeeklyCuisineChart';
import SpendingProgress from './SpendingProgress'; // 👈 Import your new overspending chart

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 👤 Mock user adjustment for Sarah Chen
  const user = {
    ...MOCK_USER,
    name: 'Sarah Chen' ,
    total_budget: 1000,
    total_spent: 860,
    swipes_remaining: 12,
    flex_remaining: 140,
    weeks_remaining: 10,
  };

  useEffect(() => {
    async function fetchAnalysis() {
      setLoading(true);
      const result = await analyzeSpending(user, MOCK_TRANSACTIONS);
      setAnalysis(result);
      setLoading(false);
    }
    fetchAnalysis();
  }, []);

  const spentPercent = Math.round((user.total_spent / user.total_budget) * 100);
  const weeksIntoSemester = 16 - user.weeks_remaining;

  return (
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Spent"
          value={`$${user.total_spent}`}
          subtitle={`${spentPercent}% of budget`}
          trend={user.total_spent > user.total_budget ? 'up' : 'down'}
          icon="💰"
        />
        <StatCard
          title="Swipes Left"
          value={user.swipes_remaining}
          subtitle="Use them!"
          trend="neutral"
          icon="🎫"
        />
        <StatCard
          title="Flex Dollars"
          value={`$${user.flex_remaining}`}
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

        {!loading && analysis?.recommendation && (
          <div className="bg-green-50 p-5 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Recommendation</h3>
            <p className="text-green-800">{analysis.recommendation}</p>
          </div>
        )}
      </div>

      {/* Spending Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Spending Chart</h2>
        <SpendingChart />
      </div>
    </div>
  );
}

