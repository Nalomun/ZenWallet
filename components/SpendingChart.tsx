'use client';

import { LineChart , Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const data = [
  { week: 'Week 1', spent: 280, budget: 198 },
  { week: 'Week 2', spent: 590, budget: 397 },
  { week: 'Week 3', spent: 920, budget: 595 },
  { week: 'Week 4', spent: 1240, budget: 794 },
  { week: 'Week 5', spent: 1550, budget: 992 },
  { week: 'Week 6', spent: 1820, budget: 1191 },
  { week: 'Week 7', spent: 2180, budget: 1389 },
  { week: 'Week 8', spent: 2540, budget: 1588 },
];

export default function SpendingChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="week" 
          tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
          stroke="#9ca3af"
        />
        <YAxis 
          tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
          stroke="#9ca3af"
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid #9333ea',
            borderRadius: '12px',
            padding: '8px 12px',
            fontWeight: 600
          }}
          formatter={(value: number) => `$${value}`}
        />
        <Area 
          type="monotone" 
          dataKey="budget" 
          stroke="#10b981" 
          strokeWidth={2}
          fill="url(#colorBudget)"
          name="Budget Pace"
        />
        <Area 
          type="monotone" 
          dataKey="spent" 
          stroke="#9333ea" 
          strokeWidth={3}
          fill="url(#colorSpent)"
          name="Actual Spending"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}