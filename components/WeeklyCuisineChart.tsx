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
  LabelList,
} from 'recharts';

// Weekly cuisine counts example
const WEEKLY_DATA = [
  { cuisine: 'American', emoji: '🍔', week1: 5, week2: 2, week3: 3, week4: 4 },
  { cuisine: 'Mexican', emoji: '🌮', week1: 5, week2: 3, week3: 2, week4: 1 },
  { cuisine: 'Thai', emoji: '🍛', week1: 3, week2: 8, week3: 4, week4: 5 },
  { cuisine: 'Korean', emoji: '🍙', week1: 2, week2: 1, week3: 3, week4: 2 },
];

// Color mapping
const CUISINE_COLORS: Record<string, string> = {
  American: '#F87171',
  Mexican: '#FBBF24',
  Thai: '#34D399',
  Korean: '#60A5FA',
};

// Tooltip with cuisine name bolded
const CustomTooltip = ({ active, payload }: any) => {
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

  // Cycle weeks every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWeek((prev) => (prev < 4 ? prev + 1 : 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Map data for current week
  const chartData = WEEKLY_DATA.map((cuisine) => ({
    ...cuisine,
    times: cuisine[`week${week}` as keyof typeof cuisine],
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 20, left: 60, bottom: 20 }}
        >
          <XAxis type="number" />
          <YAxis
            dataKey="emoji"
            type="category"
            width={50}
            tick={{ fontSize: 24 }}
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
            {/* Show cuisine names next to bars */}
            <LabelList
              dataKey="cuisine"
              position="right"
              offset={10}
              style={{ fontWeight: 'bold', fill: '#374151' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-gray-600 text-sm">
        Week {week} - Bars animate as counts change
      </p>
    </div>
  );
}
