'use client';

import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { mockUsers, mockSpendingData } from './mockUserData';

export default function SpendingTrends() {
  // 👤 Step 1: choose which user
  const [currentUser, setCurrentUser] = useState(mockUsers[0]);
  // 📈 Step 2: choose view (daily / weekly / monthly)
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const data = mockSpendingData[currentUser.id][view];
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 w-full">
      {/* USER SELECTOR */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {currentUser.name}’s {view.charAt(0).toUpperCase() + view.slice(1)} Spending
        </h2>
        <select
          value={currentUser.id}
          onChange={(e) =>
            setCurrentUser(mockUsers.find((u) => u.id === e.target.value)!)
          }
          className="border rounded-lg p-2"
        >
          {mockUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* VIEW SELECTOR */}
      <div className="flex gap-2 mb-4">
        {(['daily', 'weekly', 'monthly'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === v ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* TOTAL SPENDING */}
      <p className="text-lg font-semibold mb-4">
        Total Spent: ${total}
      </p>

      {/* LINE CHART */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(v) => `$${v}`} />
          <Tooltip formatter={(v: number) => `$${v}`} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#8B5CF6"
            strokeWidth={3}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
