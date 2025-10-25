'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Example weekly data
const WEEKLY_DATA = [
  { cuisine: 'American', emoji: '🍔', week1: 5, week2: 2, week3: 3, week4: 4 },
  { cuisine: 'Mexican', emoji: '🌮', week1: 5, week2: 3, week3: 2, week4: 1 },
  { cuisine: 'Thai', emoji: '🍛', week1: 3, week2: 8, week3: 4, week4: 5 },
  { cuisine: 'Korean', emoji: '🍙', week1: 2, week2: 1, week3: 3, week4: 2 },
];

// Color mapping per cuisine
const CUISINE_COLORS: Record<string, string> = {
  American: '#F87171', // Red
  Mexican: '#FBBF24',  // Yellow
  Thai: '#34D399',     // Green
  Korean: '#60A5FA',   // Blue
};

// Custom tooltip to bold cuisine name
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
        <p className="font-bold text-gray-800">{payload[0].payload.cuisine}</p>
        <p className="text-gray-600">Times: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function WeeklyCuisineChart() {
  const [week, setWeek] = useState(1);
  const [data, setData] = useState(WEEKLY_DATA);

  // Simulate week changing every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWeek((prev) => (prev < 4 ? prev + 1 : 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Map data for the current week
  const chartData = data.map((cuisine) => ({
    ...cuisine,
    times: cuisine[`week${week}` as keyof typeof cuisine],
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 20, left: 40, bottom: 20 }}
        >
          <XAxis type="number" />
          <YAxis
            dataKey="emoji"
            type="category"
            width={50}
            tick={{ fontSize: 20 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="times"
            isAnimationActive={true}
            animationDuration={800}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.cuisine}
                fill={CUISINE_COLORS[entry.cuisine]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-gray-600 text-sm">
        Week {week} - Bars animate as counts change
      </p>
    </div>
  );
}
