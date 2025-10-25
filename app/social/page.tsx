'use client';

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            👥 Friends & Groups
          </h1>
          <p className="text-gray-600 font-medium">
            Connect with friends and share budget insights
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-12 border border-white/20 text-center">
          <div className="text-6xl mb-6">🚧</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Coming Soon!
          </h2>
          <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
            We're building exciting social features where you can connect with friends, 
            share meal plans, create budget groups, and compete on leaderboards.
          </p>
          
          {/* Feature Preview Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-xl border border-purple-200">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="font-bold text-gray-800 mb-2">Add Friends</h3>
              <p className="text-sm text-gray-600">
                Connect with classmates and share spending tips
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-xl border border-blue-200">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-bold text-gray-800 mb-2">Budget Groups</h3>
              <p className="text-sm text-gray-600">
                Create shared budgets with roommates
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-xl border border-purple-200">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-bold text-gray-800 mb-2">Leaderboards</h3>
              <p className="text-sm text-gray-600">
                Compete for the best savings in your dorm
              </p>
            </div>
          </div>

          <div className="mt-8">
            <a 
              href="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}