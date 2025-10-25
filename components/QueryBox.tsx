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
    setResponse('');
    
    const result = await queryMealRecommendation(query, MOCK_USER, MOCK_DINING_HALLS);
    setResponse(result);
    setLoading(false);
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg p-6">
      <h2 className="text-white text-2xl font-bold mb-3">🤖 Ask AI Anything</h2>
      <p className="text-white/80 mb-4">Try: "I want something healthy and fast"</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to eat?"
            className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>
      </form>
      
      {loading && (
        <div className="mt-4 bg-white/20 backdrop-blur rounded-lg p-4 animate-pulse">
          <div className="h-4 bg-white/40 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-white/40 rounded w-1/2"></div>
        </div>
      )}

      {response && !loading && (
        <div className="mt-4 bg-white rounded-lg p-5 shadow-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <p className="text-gray-800 text-lg flex-1">{response}</p>
          </div>
        </div>
      )}
    </div>
  );
}