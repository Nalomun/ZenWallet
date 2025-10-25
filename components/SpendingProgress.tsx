'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

// 🧾 Mock user and spending data
const MOCK_USER = {
  name: 'Sarah Chen',
  total_budget: 500,
  total_spent: 620, // 🔴 Overspent
  weekly_spending: [
    { week: 1, amount: 80 },
    { week: 2, amount: 95 },
    { week: 3, amount: 110 },
    { week: 4, amount: 120 },
    { week: 5, amount: 140 },
    { week: 6, amount: 75 },
  ],
};

export default function SpendingProgress() {
  const [selectedWeek, setSelectedWeek] = useState(MOCK_USER.weekly_spending.length);

  const totalSpent = MOCK_USER.weekly_spending
    .slice(0, selectedWeek)
    .reduce((sum, w) => sum + w.amount, 0);

  const percent = Math.min((totalSpent / MOCK_USER.total_budget) * 100, 150);
  const overBudget = totalSpent > MOCK_USER.total_budget;

  const color = overBudget
    ? '#EF4444' // red
    : percent > 90
    ? '#F59E0B' // orange
    : '#10B981'; // green

  const message = overBudget
    ? `⚠️ Sarah, you've spent $${(totalSpent - MOCK_USER.total_budget).toFixed(
        2
      )} over your budget!`
    : percent > 90
    ? `⚠️ Careful, Sarah — only $${(MOCK_USER.total_budget - totalSpent).toFixed(2)} left.`
    : `✅ Nice job, Sarah! $${(MOCK_USER.total_budget - totalSpent).toFixed(2)} remaining.`;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">💸 Spending Progress</h2>

      {/* Week selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {MOCK_USER.weekly_spending.map((w) => (
          <button
            key={w.week}
            onClick={() => setSelectedWeek(w.week)}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              selectedWeek === w.week
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Week {w.week}
          </button>
        ))}
      </div>

      {/* Animated circular chart */}
      <motion.div
        className="relative flex items-center justify-center"
        animate={{
          scale: overBudget ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: overBudget ? 0.6 : 0,
          repeat: overBudget ? Infinity : 0,
          repeatDelay: 1,
        }}
      >
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="85"
            stroke="#E5E7EB"
            strokeWidth="16"
            fill="none"
          />
          <motion.circle
            cx="100"
            cy="100"
            r="85"
            stroke={color}
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 85}
            strokeDashoffset={2 * Math.PI * 85 * (1 - Math.min(percent, 100) / 100)}
            initial={{ strokeDashoffset: 2 * Math.PI * 85 }}
            animate={{
              strokeDashoffset: 2 * Math.PI * 85 * (1 - Math.min(percent, 100) / 100),
            }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-3xl font-bold text-gray-800">{Math.round(percent)}%</p>
          <p className="text-gray-500 text-sm">of Budget Used</p>
        </div>
      </motion.div>

      {/* Message */}
      <motion.p
        className={`mt-5 text-lg font-semibold ${
          overBudget ? 'text-red-600' : percent > 90 ? 'text-yellow-600' : 'text-green-600'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.9, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.p>

      {/* Summary */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg w-full max-w-md text-center">
        <p className="text-gray-700 text-md">
          Total Spent: <span className="font-bold text-gray-900">${totalSpent.toFixed(2)}</span> /{' '}
          ${MOCK_USER.total_budget}
        </p>
        {overBudget && (
          <p className="text-red-600 font-medium mt-2">
            You’re ${Math.abs(MOCK_USER.total_budget - totalSpent).toFixed(2)} over budget.
          </p>
        )}
      </div>
    </div>
  );
}
