'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getSpendingForecast, convertTransactionsToProphetFormat } from '@/lib/forecastApi';
import { MOCK_TRANSACTIONS } from '@/lib/mockData';
import { DEMO_PROFILES } from '@/lib/demoProfiles';
import ForecastChart from '@/components/ForecastChart';

export default function ForecastPage() {
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [userData, setUserData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
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
  }

  async function generateForecast() {
    if (!userData) return;
    
    setLoading(true);
    
    // Convert transactions to Prophet format
    const prophetTransactions = convertTransactionsToProphetFormat(MOCK_TRANSACTIONS);
    
    const result = await getSpendingForecast({
      UserData: {
        name: userData.name,
        total_budget: userData.total_budget
      },
      Transactions: prophetTransactions,
      mode: mode
    });
    
    setForecast(result);
    setLoading(false);
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return '📈';
    if (trend === 'decreasing') return '📉';
    return '➡️';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'increasing') return 'text-red-600';
    if (trend === 'decreasing') return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                📈 ML Spending Forecast
              </h1>
              <p className="text-gray-600 font-medium">
                Predict your future spending using Facebook Prophet machine learning
              </p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-300">
              <p className="text-sm text-purple-700 font-semibold">Powered by Prophet ML</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Forecast Settings</h2>
              <p className="text-gray-600 text-sm">Select time range for prediction</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setMode('daily')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  mode === 'daily'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                }`}
              >
                📅 Next 7 Days
              </button>
              <button
                onClick={() => setMode('weekly')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  mode === 'weekly'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                }`}
              >
                📊 Next 4 Weeks
              </button>
              <button
                onClick={() => setMode('monthly')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  mode === 'monthly'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                }`}
              >
                📆 Next 3 Months
              </button>
            </div>
          </div>

          <button
            onClick={generateForecast}
            disabled={loading}
            className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 hover:scale-105 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🤖 Generating ML Forecast...' : '🚀 Generate Forecast'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-12 border border-white/20 text-center">
            <div className="text-6xl mb-4 animate-pulse">🤖</div>
            <p className="text-xl font-semibold text-gray-700 mb-2">Running Prophet ML Model...</p>
            <p className="text-gray-600">Analyzing {MOCK_TRANSACTIONS.length} transactions</p>
          </div>
        )}

        {/* Results */}
        {forecast && !loading && (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Total Forecasted */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">💰</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Forecasted</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      ${forecast.summary.total_forecasted.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Over next {forecast.summary.forecast_periods} {forecast.summary.mode} periods
                </p>
              </div>

              {/* Trend */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{getTrendIcon(forecast.summary.trend)}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Spending Trend</p>
                    <p className={`text-3xl font-bold ${getTrendColor(forecast.summary.trend)}`}>
                      {forecast.summary.trend.charAt(0).toUpperCase() + forecast.summary.trend.slice(1)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {forecast.summary.forecast_vs_historical_change} vs historical
                </p>
              </div>

              {/* Daily Average */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">📊</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Daily Average</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      ${forecast.summary.mean_daily_expenditure.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Historical: ${forecast.summary.historical_mean.toFixed(2)}/day
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Predicted Spending Pattern
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-600 rounded"></div>
                    <span className="text-gray-600">Prediction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-200 rounded"></div>
                    <span className="text-gray-600">Confidence Band</span>
                  </div>
                </div>
              </div>
              
              <ForecastChart forecastData={forecast.forecast} />
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl shadow-lg p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🤖</span>
                <h3 className="text-xl font-bold text-purple-900">AI Insights</h3>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white/70 p-4 rounded-xl">
                  <p className="text-gray-800">
                    <span className="font-bold">Model Confidence:</span> {forecast.summary.confidence_interval}
                  </p>
                </div>
                
                <div className="bg-white/70 p-4 rounded-xl">
                  <p className="text-gray-800">
                    <span className="font-bold">Data Points:</span> {forecast.metadata.historical_data_points} historical transactions analyzed
                  </p>
                </div>
                
                <div className="bg-white/70 p-4 rounded-xl">
                  <p className="text-gray-800">
                    <span className="font-bold">Date Range:</span> {new Date(forecast.metadata.historical_date_range.start).toLocaleDateString()} to {new Date(forecast.metadata.historical_date_range.end).toLocaleDateString()}
                  </p>
                </div>

                {forecast.summary.trend === 'increasing' && (
                  <div className="bg-red-100 p-4 rounded-xl border-l-4 border-red-500">
                    <p className="text-red-800 font-semibold">
                      ⚠️ Warning: Your spending is trending upward. Consider using more meal swipes to reduce costs.
                    </p>
                  </div>
                )}

                {forecast.summary.trend === 'decreasing' && (
                  <div className="bg-green-100 p-4 rounded-xl border-l-4 border-green-500">
                    <p className="text-green-800 font-semibold">
                      ✅ Great job! Your spending is trending downward. Keep up the good habits!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                🧠 How ML Forecasting Works
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-5 rounded-xl">
                  <h4 className="font-bold text-gray-800 mb-2">📊 Prophet Algorithm</h4>
                  <p className="text-gray-700 text-sm">
                    Facebook's Prophet analyzes your spending patterns, identifies trends, seasonality, and predicts future behavior with confidence intervals.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-xl">
                  <h4 className="font-bold text-gray-800 mb-2">🎯 Personalized Predictions</h4>
                  <p className="text-gray-700 text-sm">
                    The model learns from YOUR specific spending habits - meal swipes, flex dollars, and off-campus purchases - to give you accurate forecasts.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!forecast && !loading && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-12 text-center border border-white/20">
            <span className="text-7xl mb-4 block">🔮</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Predict Your Future Spending
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our machine learning model analyzes your transaction history to forecast future spending patterns. 
              Select a time range above and click "Generate Forecast" to see your predictions!
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-3xl mb-2">📅</p>
                <p className="font-semibold text-gray-800">Daily</p>
                <p className="text-sm text-gray-600">Next 7 days</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-3xl mb-2">📊</p>
                <p className="font-semibold text-gray-800">Weekly</p>
                <p className="text-sm text-gray-600">Next 4 weeks</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-3xl mb-2">📆</p>
                <p className="font-semibold text-gray-800">Monthly</p>
                <p className="text-sm text-gray-600">Next 3 months</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}