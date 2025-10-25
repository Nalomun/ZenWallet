'use client';

import { useState, useEffect } from 'react';
import { analyzeSpending } from '@/lib/api';
import { MOCK_USER, MOCK_TRANSACTIONS } from '@/lib/mockData';
import StatCard from './StatCard';
import WeeklyCuisineChart from './WeeklyCuisineChart';
import SpendingProgress from './SpendingProgress';
import SpendingTrends from './SpendingTrends'; // New daily/weekly/monthly line chart

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

