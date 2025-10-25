'use client';

import { useState, useEffect } from 'react';
import { analyzeSpending } from '@/lib/api';
import { MOCK_TRANSACTIONS } from '@/lib/mockData';
import StatCard from './StatCard';
import WeeklyCuisineChart from './WeeklyCuisineChart';
import SpendingProgress from './SpendingProgress';
import SpendingTrends from './SpendingTrends';

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trendView, setTrendView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // 👥 Example student dataset
  const USERS = [
    { name: 'Marcus Johnson', total_spent: 3980, total_budget: 3175 },
    { name: 'Sarah Chen', total_spent: 4288.62, total_budget: 3175 },
    { name: 'Emma Rodriguez', total_spent: 2100, total_budget: 3175 },
    { name: 'Alex Kim', total_spent: 4850, total_budget: 3175 },
  ];

  // For now, pick one logged-in user (replace this with real auth later)
  const [activeUser, setActiveUser] = useState(USERS[0]);

  // 🔍 Fetch AI analysis (mocked)
  useEffect(() => {
    async function fetchAnalysis() {
      setLoading(true);
      const result = await analyzeSpending(activeUser, MOCK_TRANSACTIONS);
      setAnalysis(result);
      setLoading(false);
    }
    fetchAnalysis();
  }, [activeUser]);

  const spentPercent = Math.round((activeUser.total_spent / activeUser.total_budget) * 100);
  const budgetDiff = activeUser.total_budget - activeUser.total_spent;
  const isOverBudget = budgetDiff < 0;
  const diffAmount = Math.abs(budgetDiff).toFixed(2);

  const weeksRemaining = 10;
  const weeksIntoSemester = 16 - weeksRemaining;

  return (
    <div className="space-y-8">
      {/* Header with User Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome back, {activeUser.name} 👋
          </h1>
          <p className="text-gray-600 mt-2">Week {weeksIntoSemester} of 16</p>
        </div>

        <select
          value={activeUser.name}
          onChange={(e) =>
            setActiveUser(USERS.find((u) => u.name === e.target.value)!)
          }
          className="mt-4 sm:mt-0 border rounded-lg px-3 py-2 bg-white shadow"
        >
          {USERS.map((user) => (
            <option key={user.name} value={user.name}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {/* Spending Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Spending Overview</h2>
        <SpendingProgress />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Spent"
          value={`$${activeUser.total_spent.toFixed(2)}`}
          subtitle={`${spentPercent}% of budget`}
          trend={isOverBudget ? 'up' : 'down'}
          icon="💰"
        />
        <StatCard
          title={isOverBudget ? 'Over Budget' : 'Remaining Budget'}
          value={`$${diffAmount}`}
          subtitle={isOverBudget ? 'Overspending detected' : 'You’re on track'}
          trend={isOverBudget ? 'up' : 'down'}
          icon={isOverBudget ? '⚠️' : '✅'}
        />
        <StatCard
          title="Total Budget"
          value={`$${activeUser.total_budget.toFixed(2)}`}
          subtitle="Planned spending limit"
          trend="neutral"
          icon="📊"
        />
      </div>

      {/* Weekly Cuisine Ranking */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Weekly Cuisine Ranking</h2>
        <WeeklyCuisineChart />
      </div>

      {/* Spending Trends (Daily / Weekly / Monthly) */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Spending Trends</h2>

        {/* View Selector */}
        <div className="flex gap-3 mb-4">
          {['daily', 'weekly', 'monthly'].map((view) => (
            <button
              key={view}
              className={`px-4 py-2 rounded-lg ${
                trendView === view ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setTrendView(view as any)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>

        <SpendingTrends
          view={trendView}
          activeUser={activeUser}
          allUsers={USERS}
          transactions={MOCK_TRANSACTIONS}
        />
      </div>

      {/* AI Insights Section */}
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
    </div>
  );
}
