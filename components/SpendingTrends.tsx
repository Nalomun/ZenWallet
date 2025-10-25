'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

type SpendingTrendsProps = {
  view: 'daily' | 'weekly' | 'monthly';
  user: { name: string };
  transactions?: any[];
};

export default function SpendingTrends({ view, user, transactions }: SpendingTrendsProps) {
  // Define all students and their budgets/spending
  const students = [
    { name: 'Marcus Johnson', total_spent: 3980, total_budget: 3175 },
    { name: 'Sarah Chen', total_spent: 4288.62, total_budget: 3175 },
    { name: 'Emma Rodriguez', total_spent: 2100, total_budget: 3175 },
    { name: 'Alex Kim', total_spent: 4850, total_budget: 3175 },
  ];

  // Get current user's data
  const currentUser = students.find(s => s.name === user?.name);

  if (!currentUser) {
    return (
      <div className="p-6 text-center text-gray-500">
        No data available for {user?.name || 'this user'}.
      </div>
    );
  }

  const { total_spent, total_budget } = currentUser;
  const difference = total_budget - total_spent;
  const status = difference >= 0 ? 'Remaining' : 'Over Budget';
  const displayValue = Math.abs(difference).toFixed(2);

  // Generate example trend data relative to user spending habits
  const base = total_spent / (view === 'daily' ? 7 : view === 'weekly' ? 4 : 1);
  let data: { date: string; amount: number }[] = [];

  if (view === 'daily') {
    data = [
      { date: 'Mon', amount: base * 0.15 },
      { date: 'Tue', amount: base * 0.18 },
      { date: 'Wed', amount: base * 0.12 },
      { date: 'Thu', amount: base * 0.20 },
      { date: 'Fri', amount: base * 0.14 },
      { date: 'Sat', amount: base * 0.11 },
      { date: 'Sun', amount: base * 0.10 },
    ];
  } else if (view === 'weekly') {
    data = [
      { date: 'Week 1', amount: base * 0.22 },
      { date: 'Week 2', amount: base * 0.26 },
      { date: 'Week 3', amount: base * 0.28 },
      { date: 'Week 4', amount: base * 0.24 },
    ];
  } else {
    data = [
      { date: 'Jan', amount: total_spent * 0.2 },
      { date: 'Feb', amount: total_spent * 0.25 },
      { date: 'Mar', amount: total_spent * 0.3 },
      { date: 'Apr', amount: total_spent * 0.25 },
    ];
  }

  const total = data.reduce((sum, d) => sum + d.amount, 0).toFixed(2);

  return (
    <div>
      {/* Summary Info */}
      <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
        <p className="text-sm text-gray-600 font-medium mb-1">
          {view === 'daily' && 'Total Spent Today'}
          {view === 'weekly' && 'Total Spent This Week'}
          {view === 'monthly' && 'Total Spent This Month'}
        </p>
        <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-1">
          ${total}
        </p>
        <p
          className={`text-sm font-semibold ${
            difference >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {status}: ${displayValue}
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
            stroke="#9ca3af"
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
            stroke="#9ca3af"
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid #9333ea',
              borderRadius: '12px',
              padding: '8px 12px',
              fontWeight: 600,
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#9333ea"
            strokeWidth={3}
            fill="url(#colorTrend)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
