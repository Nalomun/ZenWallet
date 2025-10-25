'use client';

import { LineChart , Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Temporary mock data
const data = [
  { week: 'Week 1', spent: 280 },
  { week: 'Week 2', spent: 590 },
  { week: 'Week 3', spent: 920 },
  { week: 'Week 4', spent: 1240 },
  { week: 'Week 5', spent: 1550 },
  { week: 'Week 6', spent: 1820 },
];

export default function SpendingChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="spent" stroke="#9333ea" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}