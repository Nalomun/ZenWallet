'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface SpendingProgressProps {
  userData: any;
}

export default function SpendingProgress({ userData }: SpendingProgressProps) {
  const totalSpent = userData.total_spent;
  const totalBudget = userData.total_budget;
  
  const percent = Math.min((totalSpent / totalBudget) * 100, 150);
  const overBudget = totalSpent > totalBudget;

  const color = overBudget
    ? '#EF4444' // red
    : percent > 90
    ? '#F59E0B' // orange
    : '#10B981'; // green

  const message = overBudget
    ? `⚠️ ${userData.name}, you've spent $${(totalSpent - totalBudget).toFixed(
        2
      )} over your budget!`
    : percent > 90
    ? `⚠️ Careful, ${userData.name} — only $${(totalBudget - totalSpent).toFixed(2)} left.`
    : `✅ Nice job, ${userData.name}! $${(totalBudget - totalSpent).toFixed(2)} remaining.`;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">💸 Spending Progress</h2>

      {/* Animated circular chart */}
      <div className="flex flex-col items-center">
        <motion.div
          className="relative flex items-center justify-center"
          animate={{
            scale: overBudget ? [1, 1.05, 1] : 1,
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
        <p
          className={`mt-6 text-lg font-semibold text-center ${
            overBudget ? 'text-red-600' : percent > 90 ? 'text-yellow-600' : 'text-green-600'
          }`}
        >
          {message}
        </p>

        {/* Summary */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg w-full max-w-md text-center">
          <p className="text-gray-700 text-md">
            Total Spent: <span className="font-bold text-gray-900">${totalSpent.toFixed(2)}</span> /{' '}
            ${totalBudget.toFixed(2)}
          </p>
          {overBudget && (
            <p className="text-red-600 font-medium mt-2">
              You're ${Math.abs(totalBudget - totalSpent).toFixed(2)} over budget.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}