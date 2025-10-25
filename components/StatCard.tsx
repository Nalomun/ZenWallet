'use client';

import { useState } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend: "up" | "down" | "neutral";
  icon?: string;
  details?: any;
}

export default function StatCard({ title, value, subtitle, trend, icon, details }: StatCardProps) {
  const [showModal, setShowModal] = useState(false);

  const trendColors = {
    up: "from-red-500 to-orange-500",
    down: "from-green-500 to-emerald-500",
    neutral: "from-purple-500 to-blue-500"
  };

  const trendBg = {
    up: "bg-red-50/50",
    down: "bg-green-50/50",
    neutral: "bg-purple-50/50"
  };

  return (
    <>
      <div 
        onClick={() => details && setShowModal(true)}
        className={`${trendBg[trend]} backdrop-blur-sm rounded-xl shadow-md p-5 border border-white/40 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
      >
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${trendColors[trend]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
            {icon && (
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                {icon}
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
            {value}
          </p>
          <p className="text-sm font-medium text-gray-600">{subtitle}</p>
          
          {details && (
            <div className="mt-3 text-xs text-purple-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>Click for details</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && details && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {icon && <span className="text-4xl">{icon}</span>}
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {title} Details
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl hover:rotate-90 transition-all duration-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {title === "Total Spent" && (
                <>
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <span className="font-medium text-gray-700">Budget</span>
                    <span className="font-bold text-xl text-gray-900">${details.budget.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                    <span className="font-medium text-gray-700">Spent</span>
                    <span className="font-bold text-xl text-red-600">${details.spent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="font-medium text-gray-700">Remaining</span>
                    <span className="font-bold text-xl text-green-600">
                      ${details.remaining > 0 ? details.remaining.toFixed(2) : `(${Math.abs(details.remaining).toFixed(2)})`}
                    </span>
                  </div>
                  <div className="mt-4 p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                    <p className="text-sm text-gray-700 font-medium">
                      {details.remaining < 0 
                        ? `You're over budget by $${Math.abs(details.remaining).toFixed(2)}` 
                        : `You have $${details.remaining.toFixed(2)} left for the semester`}
                    </p>
                  </div>
                </>
              )}

              {title === "Meal Swipes" && (
                <>
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <span className="font-medium text-gray-700">Total Swipes</span>
                    <span className="font-bold text-xl text-gray-900">{details.total}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="font-medium text-gray-700">Used</span>
                    <span className="font-bold text-xl text-blue-600">{details.used}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                    <span className="font-medium text-gray-700">Remaining</span>
                    <span className="font-bold text-xl text-orange-600">{details.remaining}</span>
                  </div>
                  <div className="mt-4 p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                    <p className="text-sm text-gray-700 font-medium">
                      Each swipe is worth ~${details.valuePerSwipe}. You have ${details.remaining * details.valuePerSwipe} in unused swipes!
                    </p>
                  </div>
                </>
              )}

              {title === "Flex Dollars" && (
                <>
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <span className="font-medium text-gray-700">Total Flex</span>
                    <span className="font-bold text-xl text-gray-900">${details.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                    <span className="font-medium text-gray-700">Spent</span>
                    <span className="font-bold text-xl text-red-600">${details.spent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="font-medium text-gray-700">Remaining</span>
                    <span className="font-bold text-xl text-green-600">${details.remaining.toFixed(2)}</span>
                  </div>
                  <div className="mt-4 p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                    <p className="text-sm text-gray-700 font-medium">
                      You've used {Math.round((details.spent / details.total) * 100)}% of your flex dollars
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}