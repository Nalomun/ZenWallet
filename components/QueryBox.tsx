'use client';

import { useState } from 'react';

export default function QueryBox() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Call AI function here (Person 2's work)
    // For now, just simulate loading
    setTimeout(() => {
      setIsLoading(false);
      alert(`Will search for: ${query}`);
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg p-6">
      <h2 className="text-white text-xl font-bold mb-3">🤖 Ask AI Anything</h2>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., I want something healthy and fast"
          className="flex-1 px-4 py-3 rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:border-white/40"
        />
        <button
          type="submit"
          disabled={isLoading || !query}
          className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Thinking...' : 'Search'}
        </button>
      </form>
    </div>
  );
}