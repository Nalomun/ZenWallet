'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';

interface ForecastChartProps {
  forecastData: Array<{
    date: string;
    predicted_amount: number;
    lower_bound: number;
    upper_bound: number;
  }>;
}

export default function ForecastChart({ forecastData }: ForecastChartProps) {
  const chartData = forecastData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    predicted: item.predicted_amount,
    lower: item.lower_bound,
    upper: item.upper_bound,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#9333ea" stopOpacity={0.05}/>
          </linearGradient>
          <linearGradient id="colorUncertainty" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
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
            padding: '12px',
            fontWeight: 600
          }}
          formatter={(value: number, name: string) => {
            const labels: { [key: string]: string } = {
              predicted: 'Predicted',
              upper: 'Upper Bound',
              lower: 'Lower Bound'
            };
            return [`$${value.toFixed(2)}`, labels[name] || name];
          }}
        />
        
        {/* Uncertainty band */}
        <Area 
          type="monotone" 
          dataKey="upper" 
          stroke="none"
          fill="url(#colorUncertainty)"
        />
        
        {/* Main prediction line */}
        <Line 
          type="monotone" 
          dataKey="predicted" 
          stroke="#9333ea" 
          strokeWidth={3}
          dot={{ fill: '#9333ea', r: 5, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 7 }}
        />
        
        {/* Lower bound */}
        <Area 
          type="monotone" 
          dataKey="lower" 
          stroke="none"
          fill="rgba(255, 255, 255, 0.5)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}