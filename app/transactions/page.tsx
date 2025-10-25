'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MOCK_TRANSACTIONS } from '@/lib/mockData';
import { DEMO_PROFILES } from '@/lib/demoProfiles';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'swipe' | 'flex' | 'external'>('all');
  const [newTransaction, setNewTransaction] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter(t => t.type === filter));
    }
  }, [filter, transactions]);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    
    let data = DEMO_PROFILES.swipe_ignorer.data;
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_profile')
        .eq('id', user.id)
        .single();

      const profileKey = profile?.selected_profile || 'swipe_ignorer';
      data = DEMO_PROFILES[profileKey as keyof typeof DEMO_PROFILES].data;
    }
    
    setUserData(data);
    setTransactions(MOCK_TRANSACTIONS);
    setFilteredTransactions(MOCK_TRANSACTIONS);
  }

  async function handleAddTransaction() {
    if (!newTransaction.trim()) return;
    
    setLoading(true);
    
    // Simulate AI parsing (in real version, would call Claude to parse)
    // For demo, just add a manual entry
    const parsed = parseTransactionNaturally(newTransaction);
    
    const newTx = {
      merchant: parsed.merchant,
      amount: parsed.amount,
      type: parsed.type,
      timestamp: new Date().toISOString()
    };
    
    setTransactions([newTx, ...transactions]);
    setNewTransaction('');
    setLoading(false);
  }

  function parseTransactionNaturally(text: string): any {
    // Simple parsing for demo - in production would use Claude
    const amountMatch = text.match(/\$?(\d+\.?\d*)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 10;
    
    const lowerText = text.toLowerCase();
    let type = 'flex';
    
    if (lowerText.includes('swipe') || lowerText.includes('dining hall')) {
      type = 'swipe';
    }
    
    // Extract merchant (simple approach)
    const words = text.split(' ');
    const merchant = words.find(w => 
      w.length > 3 && 
      !['bought', 'got', 'from', 'at', 'the'].includes(w.toLowerCase())
    ) || 'Restaurant';
    
    return { merchant: merchant.charAt(0).toUpperCase() + merchant.slice(1), amount, type };
  }

  const totalSpent = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const swipeCount = transactions.filter(t => t.type === 'swipe').length;
  const flexCount = transactions.filter(t => t.type === 'flex').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            💳 Transaction History
          </h1>
          <p className="text-gray-600 font-medium">
            Track your meal plan purchases and spending patterns
          </p>
        </div>

        {/* Add Transaction - Natural Language */}
        <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-blue-600 rounded-2xl shadow-2xl p-6 border-2 border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🤖</span>
            <h2 className="text-white text-2xl font-bold">Add Purchase (Tell AI)</h2>
          </div>
          <p className="text-white/90 mb-5 font-medium">
            Just describe what you bought: "Got a $12 burrito at Chipotle" or "Used swipe at Central Dining"
          </p>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={newTransaction}
              onChange={(e) => setNewTransaction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading && newTransaction.trim()) {
                  handleAddTransaction();
                }
              }}
              placeholder="e.g., Spent $8.50 at Starbucks this morning"
              className="flex-1 px-5 py-4 rounded-xl text-gray-900 font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-white/50 transition-all"
              disabled={loading}
            />
            <button
              onClick={handleAddTransaction}
              disabled={loading || !newTransaction.trim()}
              className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 hover:scale-105 transition-all duration-300 disabled:opacity-50 shadow-lg"
            >
              {loading ? '🤔' : '➕ Add'}
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-5 border border-white/20">
            <p className="text-sm text-gray-600 font-semibold mb-1">Total Transactions</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {transactions.length}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-5 border border-white/20">
            <p className="text-sm text-gray-600 font-semibold mb-1">Meal Swipes Used</p>
            <p className="text-3xl font-bold text-purple-600">{swipeCount}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-5 border border-white/20">
            <p className="text-sm text-gray-600 font-semibold mb-1">Flex Purchases</p>
            <p className="text-3xl font-bold text-blue-600">{flexCount}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilter('swipe')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filter === 'swipe'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎫 Swipes ({swipeCount})
            </button>
            <button
              onClick={() => setFilter('flex')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filter === 'flex'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              💳 Flex ({flexCount})
            </button>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl mb-6">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">
                {filter === 'all' ? 'Total Spent' : filter === 'swipe' ? 'Swipe Total' : 'Flex Total'}
              </span>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ${totalSpent.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📝</span>
                <p className="text-gray-600">No transactions yet</p>
              </div>
            ) : (
              filteredTransactions.map((transaction, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{transaction.merchant}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${transaction.amount.toFixed(2)}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        transaction.type === 'swipe' 
                          ? 'bg-purple-100 text-purple-700'
                          : transaction.type === 'flex'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {transaction.type === 'swipe' ? '🎫 Swipe' : transaction.type === 'flex' ? '💳 Flex' : '💵 Cash'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}