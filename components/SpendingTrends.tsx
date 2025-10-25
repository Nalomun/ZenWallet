// components/SpendingTrends.tsx
'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

type SpendingTrendsProps = {
  view: 'daily' | 'weekly' | 'monthly';
  user: any; // replace with proper user type if you have one
  transactions: any[]; // replace with proper transaction type
};

export default function SpendingTrends({ view, user, transactions }: SpendingTrendsProps) {
  let data = [];
  let total = 0;

  // Mock data - replace with actual logic from transactions if you want
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

  switch (view) {
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
      <h3 className="text-lg font-bold mb-2">
        {view === 'daily' && `Total Spent Today: $${total}`}
        {view === 'weekly' && `Total Spent This Week: $${total}`}
        {view === 'monthly' && `Total Spent This Month: $${total}`}
      </h3>

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
