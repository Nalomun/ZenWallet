// components/SpendingTrends.tsx
import { useState } from 'react';
import {
  LineChart ,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Example mock data - replace with your real API/fetch data
const mockDailyData = [
  { date: '08:00', amount: 12 },
  { date: '12:00', amount: 20 },
  { date: '18:00', amount: 15 },
];

const mockWeeklyData = [
  { date: 'Mon', amount: 50 },
  { date: 'Tue', amount: 70 },
  { date: 'Wed', amount: 30 },
  { date: 'Thu', amount: 90 },
  { date: 'Fri', amount: 40 },
  { date: 'Sat', amount: 60 },
  { date: 'Sun', amount: 80 },
];

const mockMonthlyData = Array.from({ length: 30 }, (_, i) => ({
  date: `Oct ${i + 1}`,
  amount: Math.floor(Math.random() * 100),
}));

export default function SpendingTrends() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  let data = [];
  let total = 0;

  switch (period) {
    case 'daily':
      data = mockDailyData;
      total = mockDailyData.reduce((sum, d) => sum + d.amount, 0);
      break;
    case 'weekly':
      data = mockWeeklyData;
      total = mockWeeklyData.reduce((sum, d) => sum + d.amount, 0);
      break;
    case 'monthly':
      data = mockMonthlyData;
      total = mockMonthlyData.reduce((sum, d) => sum + d.amount, 0);
      break;
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      {/* Period selector */}
      <div className="flex gap-4 mb-4">
        {['daily', 'weekly', 'monthly'].map((p) => (
          <button
            key={p}
            className={`px-4 py-2 rounded-lg font-semibold ${
              period === p
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setPeriod(p as 'daily' | 'weekly' | 'monthly')}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Total spending */}
      <h3 className="text-lg font-bold mb-2">
        {period === 'daily' && `Total Spent Today: $${total}`}
        {period === 'weekly' && `Total Spent This Week: $${total}`}
        {period === 'monthly' && `Total Spent This Month: $${total}`}
      </h3>

      {/* Line chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value: number) => `$${value}`} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#9333ea"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
