'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

// Expanded data (weeks 1–6)
// Each cuisine’s “times” changes per week.
const WEEKLY_DATA = [
  { cuisine: 'American', week1: 5, week2: 2, week3: 3, week4: 1, week5: 4, week6: 3 },
  { cuisine: 'Mexican', week1: 5, week2: 3, week3: 4, week4: 2, week5: 5, week6: 4 },
  { cuisine: 'Thai', week1: 3, week2: 8, week3: 6, week4: 5, week5: 2, week6: 1 }, // Thai low in week6
  { cuisine: 'Korean', week1: 2, week2: 1, week3: 3, week4: 4, week5: 6, week6: 9 }, // Korean top in week6
];

interface CuisineConfig {
  cuisine: string;
  emoji: string;
  color: string;
}

export default function WeeklyCuisineChart() {
  const [week, setWeek] = useState(1);
  const [cuisineConfig, setCuisineConfig] = useState<CuisineConfig[]>([
    { cuisine: 'American', emoji: '🍔', color: '#F87171' },
    { cuisine: 'Mexican', emoji: '🌮', color: '#FBBF24' },
    { cuisine: 'Thai', emoji: '🍛', color: '#34D399' },
    { cuisine: 'Korean', emoji: '🍙', color: '#60A5FA' },
  ]);

  // Combine emoji, color, and week data, and sort dynamically
  const chartData = WEEKLY_DATA.map((c) => {
    const cfg = cuisineConfig.find((x) => x.cuisine === c.cuisine)!;
    return {
      cuisine: c.cuisine,
      emoji: cfg.emoji,
      color: cfg.color,
      label: `${cfg.emoji} ${c.cuisine}`,
      times: c[`week${week}` as keyof typeof c] as number,
    };
  }).sort((a, b) => b.times - a.times); // sort descending

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Weekly Cuisine Ranking</h2>

      {/* Week Selector (now 6 weeks) */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6].map((w) => (
          <button
            key={w}
            onClick={() => setWeek(w)}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              week === w
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Week {w}
          </button>
        ))}
      </div>

      {/* Emoji & Color Customization */}
      <div className="flex flex-wrap gap-4 mb-8">
        {cuisineConfig.map((cfg, idx) => (
          <div
            key={cfg.cuisine}
            className="flex flex-col items-center bg-gray-50 p-3 rounded-lg shadow-sm"
          >
            <span className="font-bold text-gray-800">{cfg.cuisine}</span>
            <input
              type="text"
              value={cfg.emoji}
              onChange={(e) => {
                const newConfig = [...cuisineConfig];
                newConfig[idx].emoji = e.target.value;
                setCuisineConfig(newConfig);
              }}
              className="w-12 text-center text-2xl mt-1 border rounded"
            />
            <input
              type="color"
              value={cfg.color}
              onChange={(e) => {
                const newConfig = [...cuisineConfig];
                newConfig[idx].color = e.target.value;
                setCuisineConfig(newConfig);
              }}
              className="mt-2 w-10 h-6 border-none"
            />
          </div>
        ))}
      </div>

      {/* Dynamic Bar Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
        >
          <XAxis type="number" />
          <YAxis
            dataKey="label"
            type="category"
            width={130}
            tick={{ fontSize: 16, fontWeight: 'bold' }}
          />
          <Tooltip
            formatter={(value: number) => [`${value} times`, 'Visited']}
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          />
          <Bar dataKey="times" radius={[8, 8, 8, 8]}>
            {chartData.map((entry) => (
              <Cell key={entry.cuisine} fill={entry.color} />
            ))}
            <LabelList
              dataKey="times"
              position="right"
              style={{ fontWeight: 'bold', fill: '#374151' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

