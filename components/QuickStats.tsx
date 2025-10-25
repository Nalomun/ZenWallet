'use client';

interface QuickStatsProps {
  userData: any;
}

export default function QuickStats({ userData }: QuickStatsProps) {
  const avgPerWeek = userData.total_spent / (16 - userData.weeks_remaining);
  const projectedTotal = avgPerWeek * 16;
  const swipeValue = userData.swipes_remaining * 12;
  const totalRemaining = userData.flex_remaining + swipeValue;

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        📊 Quick Stats
      </h2>

      <div className="space-y-4">
        {/* Average per week */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200 hover:scale-105 transition-transform duration-300 cursor-pointer group">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Avg per Week
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ${avgPerWeek.toFixed(2)}
              </p>
            </div>
            <span className="text-3xl group-hover:scale-110 transition-transform">📅</span>
          </div>
        </div>

        {/* Projected total */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200 hover:scale-105 transition-transform duration-300 cursor-pointer group">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Projected Total
              </p>
              <p className="text-3xl font-bold text-orange-600">
                ${projectedTotal.toFixed(2)}
              </p>
            </div>
            <span className="text-3xl group-hover:scale-110 transition-transform">📈</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {projectedTotal > userData.total_budget 
              ? `$${(projectedTotal - userData.total_budget).toFixed(2)} over budget` 
              : `Within budget!`}
          </p>
        </div>

        {/* Swipe value */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 hover:scale-105 transition-transform duration-300 cursor-pointer group">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Unused Swipe Value
              </p>
              <p className="text-3xl font-bold text-green-600">
                ${swipeValue.toFixed(2)}
              </p>
            </div>
            <span className="text-3xl group-hover:scale-110 transition-transform">🎫</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {userData.swipes_remaining} swipes × $12 each
          </p>
        </div>

        {/* Total resources */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200 hover:scale-105 transition-transform duration-300 cursor-pointer group">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Total Resources Left
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${totalRemaining.toFixed(2)}
              </p>
            </div>
            <span className="text-3xl group-hover:scale-110 transition-transform">💎</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Flex + swipe value combined
          </p>
        </div>
      </div>
    </div>
  );
}