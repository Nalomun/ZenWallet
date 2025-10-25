// components/WeeklyCuisineChart.tsx
'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface CuisineData {
  cuisine: string;
  count: number;
}

// Example data: week-by-week cuisine visits
const WEEKLY_DATA: CuisineData[][] = [
  // Week 1
  [
    { cuisine: 'American', count: 5 },
    { cuisine: 'Mexican', count: 5 },
    { cuisine: 'Thai', count: 3 },
    { cuisine: 'Korean', count: 2 },
  ],
  // Week 2 (Thai 4x more than American)
  [
    { cuisine: 'American', count: 2 },
    { cuisine: 'Mexican', count: 3 },
    { cuisine: 'Thai', count: 8 },
    { cuisine: 'Korean', count: 1 },
  ],
  // Week 3 (example)
  [
    { cuisine: 'American', count: 4 },
    { cuisine: 'Mexican', count: 2 },
    { cuisine: 'Thai', count: 5 },
    { cuisine: 'Korean', count: 3 },
    { cuisine: 'Japanese', count: 2 },
  ],
  // Week 4 (example)
  [
    { cuisine: 'American', count: 3 },
    { cuisine: 'Mexican', count: 4 },
    { cuisine: 'Thai', count: 6 },
    { cuisine: 'Korean', count: 2 },
    { cuisine: 'Japanese', count: 3 },
  ],
];

const WeeklyCuisineChart: React.FC = () => {
  const [weekIndex, setWeekIndex] = useState(0);
  const [chartData, setChartData] = useState<CuisineData[]>([]);

  // Update chart data each week
  useEffect(() => {
    const updateData = () => {
      setChartData(WEEKLY_DATA[weekIndex].sort((a, b) => b.count - a.count));
      setWeekIndex(prev => (prev + 1) % WEEKLY_DATA.length);
    };

    // Initial render
    updateData();

    // Animate every 5 seconds to next week
    const interval = setInterval(updateData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg w-full">
      <h3 className="text-lg font-bold mb-4">Cuisines Ranked by Visits (Weekly)</h3>
      <ResponsiveContainer width="100%" height={chartData.length * 60}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
        >
          <XAxis type="number" />
          <YAxis type="category" dataKey="cuisine" width={120} />
          <Tooltip />
          <Bar dataKey="count" fill="#9333ea" animationDuration={700}>
            <LabelList dataKey="count" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-sm text-gray-500">Automatically updates to show next week's ranking every 5 seconds.</p>
    </div>
  );
};

export default WeeklyCuisineChart;
