// components/QueryBox.tsx
'use client';

import { useState } from 'react';
import { queryMealRecommendation } from '@/lib/api';
import { MOCK_USER, MOCK_DINING_HALLS } from '@/lib/mockData';

export default function QueryBox() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const result = await queryMealRecommendation(
      query,
      MOCK_USER,
      MOCK_DINING_HALLS
    );
    setResponse(result);
    setLoading(false);
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg p-6">
      <h2 className="text-white text-xl font-bold mb-3">🤖 Ask AI Anything</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., I want something healthy and fast"
            className="flex-1 px-4 py-3 rounded-lg"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>
        
        {response && (
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-white">{response}</p>
          </div>
        )}
      </form>
    </div>
  );
}