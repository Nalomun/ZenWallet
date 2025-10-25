import { UserData, SpendingAnalysis } from '@/lib/types';
import StatCard from './StatCard';
import SpendingChart from './SpendingChart';

interface DashboardProps {
  user: UserData;
  analysis: SpendingAnalysis;
}

export default function Dashboard({ user, analysis }: DashboardProps) {
  // Calculate percentages
  const spentPercent = Math.round((user.currentSpent / user.totalPlan) * 100);
  const swipesPercent = Math.round((user.currentSwipes / user.totalSwipes) * 100);
  const timePercent = Math.round((user.weeksIntoSemester / 16) * 100);
  
  // Determine if they're on track
  const isOverspending = spentPercent > timePercent;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome back, {user.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Week {user.weeksIntoSemester} of 16 • {user.currentSwipes}/{user.totalSwipes} swipes used
        </p>
      </div>

      {/* Alert Banner if overspending */}
      {isOverspending && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">
                {analysis.assessment}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Spent"
          value={`$${user.currentSpent}`}
          subtitle={`${spentPercent}% of plan`}
          trend={isOverspending ? "up" : "neutral"}
        />
        <StatCard
          title="Swipes Remaining"
          value={user.totalSwipes - user.currentSwipes}
          subtitle={`${swipesPercent}% used`}
          trend="neutral"
        />
        <StatCard
          title="Flex Dollars"
          value={`$${user.flexDollars}`}
          subtitle="Available now"
          trend="neutral"
        />
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          💡 AI Insights
        </h2>
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Biggest Money Waste</h3>
            <p className="text-purple-800">{analysis.biggestWaste}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Potential Savings</h3>
            <p className="text-green-800 text-xl font-bold">{analysis.projectedSavings}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Spending Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Spending Over Time
        </h2>
        <SpendingChart />
      </div>
    </div>
  );
}