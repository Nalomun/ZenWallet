'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { parseTransaction } from '@/lib/transactionApi';
import { searchMerchant } from '@/lib/visaApi';
import { MOCK_TRANSACTIONS } from '@/lib/mockData';
import { DEMO_PROFILES } from '@/lib/demoProfiles';

interface EnrichedTransaction {
  merchant: string;
  amount: number;
  type: string;
  timestamp: string;
  merchantData?: any;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<EnrichedTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<EnrichedTransaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'swipe' | 'flex' | 'external'>('all');
  const [newTransaction, setNewTransaction] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<EnrichedTransaction | null>(null);
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
    
    // Use AI to parse the transaction
    const parsed = await parseTransaction(newTransaction);
    
    if (parsed) {
      // Enrich with Visa Merchant Search
      const merchantData = await searchMerchant(parsed.merchant);
      
      const newTx: EnrichedTransaction = {
        merchant: parsed.merchant,
        amount: parsed.amount,
        type: parsed.type,
        timestamp: new Date().toISOString(),
        merchantData: merchantData
      };
      
      setTransactions([newTx, ...transactions]);
      setNewTransaction('');
    }
    
    setLoading(false);
  }

  function parseTransactionNaturally(text: string): any {
    // This is now just a fallback - not used if API works
    const amountMatch = text.match(/\$?(\d+\.?\d*)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 10;
    
    const lowerText = text.toLowerCase();
    let type = 'flex';
    
    if (lowerText.includes('swipe') || lowerText.includes('dining hall')) {
      type = 'swipe';
    }
    
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
                  onClick={() => setSelectedTransaction(transaction)}
                  className="bg-white p-5 rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      {transaction.merchantData?.logo_url && (
                        <img 
                          src={transaction.merchantData.logo_url} 
                          alt={transaction.merchant}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors">
                          {transaction.merchant}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                        {transaction.merchantData?.address && (
                          <p className="text-xs text-gray-400 mt-1">
                            📍 {transaction.merchantData.address}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${transaction.amount.toFixed(2)}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
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
                  <p className="text-xs text-purple-600 font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click for merchant details →
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transaction Detail Modal (Visa Enriched) */}
        {selectedTransaction && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
            onClick={() => setSelectedTransaction(null)}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-8 p-8 animate-slide-up max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  {selectedTransaction.merchantData?.logo_url && (
                    <img 
                      src={selectedTransaction.merchantData.logo_url} 
                      alt={selectedTransaction.merchant}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-purple-200"
                    />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedTransaction.merchant}
                    </h3>
                    <p className="text-purple-600 font-semibold">
                      ${selectedTransaction.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600 text-3xl hover:rotate-90 transition-all duration-300"
                >
                  ×
                </button>
              </div>

              {/* Visa Enriched Data */}
              {selectedTransaction.merchantData && (
                <div className="space-y-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span>🏪</span> Business Information
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Powered by Visa</span>
                    </h4>
                    
                    {selectedTransaction.merchantData.address && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-semibold text-gray-800">
                          {selectedTransaction.merchantData.address}
                        </p>
                        <p className="text-sm text-gray-700">
                          {selectedTransaction.merchantData.city}, {selectedTransaction.merchantData.state} {selectedTransaction.merchantData.zip}
                        </p>
                      </div>
                    )}
                    
                    {selectedTransaction.merchantData.phone && selectedTransaction.merchantData.phone !== 'N/A' && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-800">
                          {selectedTransaction.merchantData.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transaction Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-gray-700">Amount</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${selectedTransaction.amount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-gray-700">Payment Type</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    selectedTransaction.type === 'swipe'
                      ? 'bg-purple-600 text-white'
                      : selectedTransaction.type === 'flex'
                      ? 'bg-blue-600 text-white'
                      : 'bg-orange-600 text-white'
                  }`}>
                    {selectedTransaction.type === 'swipe' ? '🎫 Meal Swipe' : selectedTransaction.type === 'flex' ? '💳 Flex Dollars' : '💵 External'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-gray-700">Date & Time</span>
                  <span className="font-medium text-gray-800">
                    {new Date(selectedTransaction.timestamp).toLocaleString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                {selectedTransaction.merchantData?.latitude && (
                  <button
                    onClick={() => {
                      window.open(
                        `https://maps.google.com/?q=${selectedTransaction.merchantData.latitude},${selectedTransaction.merchantData.longitude}`,
                        '_blank'
                      );
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:scale-105 transition-all duration-300"
                  >
                    📍 View on Map
                  </button>
                )}
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}