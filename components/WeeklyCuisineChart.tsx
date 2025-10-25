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

const WEEKLY_DATA = [
  { cuisine: 'American', week1: 5, week2: 2, week3: 3, week4: 1, week5: 4, week6: 3 },
  { cuisine: 'Mexican', week1: 5, week2: 3, week3: 4, week4: 2, week5: 5, week6: 4 },
  { cuisine: 'Thai', week1: 3, week2: 8, week3: 6, week4: 5, week5: 2, week6: 1 },
  { cuisine: 'Korean', week1: 2, week2: 1, week3: 3, week4: 4, week5: 6, week6: 9 },
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
    { cuisine: 'Thai', emoji: '🛕', color: '#34D399' },
    { cuisine: 'Korean', emoji: '🍙', color: '#60A5FA' },
  ]);

  const chartData = WEEKLY_DATA.map((c) => {
    const cfg = cuisineConfig.find((x) => x.cuisine === c.cuisine)!;
    return {
      cuisine: c.cuisine,
      emoji: cfg.emoji,
      color: cfg.color,
      label: `${cfg.emoji} ${c.cuisine}`,
      times: c[`week${week}` as keyof typeof c] as number,
    };
  }).sort((a, b) => b.times - a.times);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Weekly Cuisine Ranking
      </h2>

      {/* Week Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6].map((w) => (
          <button
            key={w}
            onClick={() => setWeek(w)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              week === w
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-110'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:scale-105'
            }`}
          >
            Week {w}
          </button>
        ))}
      </div>

      {/* Emoji & Color Customization */}
      <div className="flex flex-wrap gap-3 mb-6">
        {cuisineConfig.map((cfg, idx) => (
          <div
            key={cfg.cuisine}
            className="flex flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:scale-105 transition-all duration-300"
          >
            <span className="font-bold text-gray-800 text-sm">{cfg.cuisine}</span>
            <input
              type="text"
              value={cfg.emoji}
              onChange={(e) => {
                const newConfig = [...cuisineConfig];
                newConfig[idx].emoji = e.target.value;
                setCuisineConfig(newConfig);
              }}
              className="w-14 text-center text-2xl mt-1 border rounded bg-white hover:border-purple-400 focus:border-purple-600 focus:outline-none transition-colors"
            />
            <input
              type="color"
              value={cfg.color}
              onChange={(e) => {
                const newConfig = [...cuisineConfig];
                newConfig[idx].color = e.target.value;
                setCuisineConfig(newConfig);
              }}
              className="mt-2 w-12 h-7 border-none rounded cursor-pointer hover:scale-110 transition-transform"
            />
          </div>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
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
            tick={{ fontSize: 14, fontWeight: 'bold' }}
          />
          <Tooltip
            formatter={(value: number) => [`${value} times`, 'Visited']}
            cursor={{ fill: 'rgba(147, 51, 234, 0.1)' }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid #9333ea',
              borderRadius: '12px',
              padding: '8px 12px'
            }}
          />
          <Bar dataKey="times" radius={[8, 8, 8, 8]}>
            {chartData.map((entry) => (
              <Cell key={entry.cuisine} fill={entry.color} />
            ))}
            <LabelList
              dataKey="times"
              position="right"
              style={{ fontWeight: 'bold', fill: '#374151', fontSize: '14px' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}