'use client';

import { motion } from 'framer-motion';

interface SpendingProgressProps {
  userData: any;
}

export default function SpendingProgress({ userData }: SpendingProgressProps) {
  const totalSpent = userData.total_spent;
  const totalBudget = userData.total_budget;
  
  const percent = Math.min((totalSpent / totalBudget) * 100, 150);
  const overBudget = totalSpent > totalBudget;

  const color = overBudget
    ? '#EF4444'
    : percent > 90
    ? '#F59E0B'
    : '#10B981';

  const message = overBudget
    ? `⚠️ You're over budget!`
    : percent > 90
    ? `⚠️ Careful with spending`
    : `✅ On track`;

  return (
    <div className ="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        💸 Spending Progress
      </h2>

      <div className="flex flex-col items-center">
        <motion.div
          className="relative flex items-center justify-center mb-6"
          animate={{
            scale: overBudget ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: overBudget ? 0.6 : 0,
            repeat: overBudget ? Infinity : 0,
            repeatDelay: 1,
          }}
        >
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Background circle */}
            <circle
              cx="90"
              cy="90"
              r="70"
              stroke="#E5E7EB"
              strokeWidth="14"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="90"
              cy="90"
              r="70"
              stroke={color}
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 70}
              strokeDashoffset={2 * Math.PI * 70 * (1 - Math.min(percent, 100) / 100)}
              initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 70 * (1 - Math.min(percent, 100) / 100),
              }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {Math.round(percent)}%
            </p>
            <p className="text-gray-500 text-xs font-medium mt-1">Budget Used</p>
          </div>
        </motion.div>

        <div className={`mb-4 px-4 py-2 rounded-full font-bold ${
          overBudget 
            ? 'bg-red-100 text-red-700' 
            : percent > 90 
            ? 'bg-yellow-100 text-yellow-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>

        <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 font-medium">Spent</span>
            <span className="font-bold text-gray-900 text-lg">${totalSpent.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 font-medium">Budget</span>
            <span className="font-bold text-gray-900 text-lg">${totalBudget.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-gray-300 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">
                {overBudget ? 'Over by' : 'Remaining'}
              </span>
              <span className={`font-bold text-lg ${
                overBudget ? 'text-red-600' : 'text-green-600'
              }`}>
                ${Math.abs(totalBudget - totalSpent).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}