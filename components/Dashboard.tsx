'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Mock components for demo
const StatCard = ({ title, value, subtitle, icon, trend }: any) => (
  <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group hover:scale-[1.02]">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
        <span className="text-3xl">{icon}</span>
      </div>
      {trend && (
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          trend === 'up' ? 'bg-green-500/20 text-green-400' : 
          trend === 'down' ? 'bg-red-500/20 text-red-400' : 
          'bg-slate-500/20 text-slate-400'
        }`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
        </div>
      )}
    </div>
    <h3 className="text-slate-400 text-sm font-medium mb-2">{title}</h3>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-slate-500 text-sm">{subtitle}</p>
  </div>
);

const SpendingProgress = ({ userData }: any) => {
  const percent = Math.min((userData.total_spent / userData.total_budget) * 100, 150);
  const overBudget = userData.total_spent > userData.total_budget;
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="text-3xl">💸</span>
        Spending Progress
      </h2>
      
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 mb-8">
          <svg className="transform -rotate-90" width="192" height="192" viewBox="0 0 192 192">
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="rgb(51 65 85)"
              strokeWidth="16"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke={overBudget ? "rgb(239 68 68)" : "url(#gradient)"}
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={2 * Math.PI * 80 * (1 - Math.min(percent, 100) / 100)}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(168 85 247)" />
                <stop offset="100%" stopColor="rgb(59 130 246)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {Math.round(percent)}%
            </p>
            <p className="text-slate-500 text-sm mt-1">of budget</p>
          </div>
        </div>

        <div className="w-full space-y-3">
          <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl">
            <span className="text-slate-400">Spent</span>
            <span className="text-white font-bold text-lg">${userData.total_spent.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl">
            <span className="text-slate-400">Budget</span>
            <span className="text-white font-bold text-lg">${userData.total_budget.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
            <span className="text-slate-300 font-medium">
              {overBudget ? 'Over by' : 'Remaining'}
            </span>
            <span className={`font-bold text-xl ${
              overBudget ? 'text-red-400' : 'text-green-400'
            }`}>
              ${Math.abs(userData.total_budget - userData.total_spent).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickStats = ({ userData }: any) => {
  const avgPerWeek = userData.total_spent / 8;
  const projectedTotal = avgPerWeek * 16;
  const swipeValue = userData.swipes_remaining * 12;
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="text-3xl">📊</span>
        Quick Stats
      </h2>

      <div className="space-y-4">
        <div className="p-5 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 cursor-pointer group">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm mb-1">Avg per Week</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                ${avgPerWeek.toFixed(2)}
              </p>
            </div>
            <span className="text-4xl group-hover:scale-110 transition-transform">📅</span>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 cursor-pointer group">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm mb-1">Projected Total</p>
              <p className="text-3xl font-bold text-orange-400">
                ${projectedTotal.toFixed(2)}
              </p>
            </div>
            <span className="text-4xl group-hover:scale-110 transition-transform">📈</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {projectedTotal > userData.total_budget 
              ? `$${(projectedTotal - userData.total_budget).toFixed(2)} over budget` 
              : `Within budget!`}
          </p>
        </div>

        <div className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 cursor-pointer group">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm mb-1">Unused Swipe Value</p>
              <p className="text-3xl font-bold text-green-400">
                ${swipeValue.toFixed(2)}
              </p>
            </div>
            <span className="text-4xl group-hover:scale-110 transition-transform">🎫</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {userData.swipes_remaining} swipes × $12 each
          </p>
        </div>
      </div>
    </div>
  );
};

export default function ModernDashboard() {
  const [trendView, setTrendView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  
  const userData = {
    name: 'Sarah',
    total_spent: 2540,
    total_budget: 3175,
    swipes_remaining: 45,
    swipes_used: 35,
    total_swipes: 80,
    flex_remaining: 285,
    flex_spent: 315,
    total_flex: 600,
    weeks_remaining: 8
  };

  const weeklyData = [
    { week: 'Week 1', spent: 280, budget: 198 },
    { week: 'Week 2', spent: 590, budget: 397 },
    { week: 'Week 3', spent: 920, budget: 595 },
    { week: 'Week 4', spent: 1240, budget: 794 },
    { week: 'Week 5', spent: 1550, budget: 992 },
    { week: 'Week 6', spent: 1820, budget: 1191 },
    { week: 'Week 7', spent: 2180, budget: 1389 },
    { week: 'Week 8', spent: 2540, budget: 1588 },
  ];

  const cuisineData = [
    { name: 'Mexican', value: 35 },
    { name: 'Asian', value: 25 },
    { name: 'American', value: 20 },
    { name: 'Italian', value: 12 },
    { name: 'Other', value: 8 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                Welcome back, {userData.name} 👋
              </h1>
              <p className="text-slate-400 text-lg">Week 8 of 16 • {userData.weeks_remaining} weeks remaining</p>
            </div>
            <div className="hidden md:block p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl border border-purple-500/30">
              <p className="text-slate-300 text-sm font-medium">Total Budget</p>
              <p className="text-3xl font-bold text-white">${userData.total_budget}</p>
            </div>
          </div>
        </div>

        {/* AI Alert */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-xl hover:border-amber-500/50 transition-all duration-300 cursor-pointer group">
          <div className="flex items-start gap-4">
            <span className="text-4xl group-hover:scale-110 transition-transform">💡</span>
            <div className="flex-1">
              <h3 className="font-bold text-amber-400 text-xl mb-2">Savings Opportunity</h3>
              <p className="text-slate-300 mb-2">You could save $450 this semester by using more meal swipes instead of flex dollars for dinner.</p>
              <p className="text-sm text-slate-400 mt-3 flex items-center gap-2 group-hover:gap-3 transition-all">
                <span>Click for detailed breakdown</span>
                <span>→</span>
              </p>
            </div>
          </div>
        </div>

        {/* Progress & Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingProgress userData={userData} />
          <QuickStats userData={userData} />
        </div>

        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Spent"
            value={`$${userData.total_spent.toFixed(2)}`}
            subtitle={`${Math.round((userData.total_spent / userData.total_budget) * 100)}% of budget`}
            trend="up"
            icon="💰"
          />
          <StatCard
            title="Meal Swipes"
            value={userData.swipes_remaining}
            subtitle={`${userData.swipes_used} used of ${userData.total_swipes}`}
            trend="down"
            icon="🎫"
          />
          <StatCard
            title="Flex Dollars"
            value={`$${userData.flex_remaining.toFixed(2)}`}
            subtitle={`$${userData.flex_spent.toFixed(2)} spent`}
            trend="down"
            icon="💳"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Trends */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">📈</span>
                Spending Trends
              </h2>
              <div className="flex gap-2">
                {['daily', 'weekly', 'monthly'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setTrendView(view as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      trendView === view
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  stroke="#475569"
                />
                <YAxis 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  stroke="#475569"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgb(71 85 105)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="budget" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#colorBudget)"
                />
                <Area 
                  type="monotone" 
                  dataKey="spent" 
                  stroke="#a855f7" 
                  strokeWidth={3}
                  fill="url(#colorSpent)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Cuisine Preferences */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🍽️</span>
              Top Cuisines
            </h2>
            
            <div className="space-y-4">
              {cuisineData.map((item, idx) => (
                <div key={item.name} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">{item.name}</span>
                    <span className="text-slate-400 text-sm">{item.value}%</span>
                  </div>
                  <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000 ease-out group-hover:scale-105"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🤖</span>
            <h2 className="text-2xl font-bold text-white">AI Insights</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6 rounded-xl border border-purple-500/20">
              <h3 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                <span>📊</span> Spending Pattern
              </h3>
              <p className="text-slate-300">You spend 40% more on weekends compared to weekdays. Consider meal prep to reduce weekend costs.</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-xl border border-green-500/20">
              <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                <span>💡</span> Smart Tip
              </h3>
              <p className="text-slate-300">You have 45 unused swipes worth $540. Use them for dinner this week to stay on budget!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}