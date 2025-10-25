'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          {/* Hero Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center border border-white/20">
            {/* Logo/Icon */}
            <div className="text-7xl mb-6 animate-bounce">💰</div>
            
            {/* Heading */}
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Welcome to ZenWallet
            </h1>
            
            {/* Tagline */}
            <p className="text-xl text-gray-600 mb-8 font-medium">
              Stop wasting money on your meal plan
            </p>

            {/* Value Props */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="font-bold text-gray-800 mb-2">AI-Powered</h3>
                <p className="text-sm text-gray-600">Smart insights using Claude AI</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
                <div className="text-4xl mb-3">💵</div>
                <h3 className="font-bold text-gray-800 mb-2">Save Money</h3>
                <p className="text-sm text-gray-600">Track unused swipes & flex</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                <div className="text-4xl mb-3">🍽️</div>
                <h3 className="font-bold text-gray-800 mb-2">Smart Meals</h3>
                <p className="text-sm text-gray-600">Personalized recommendations</p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleSignIn}
              className="w-full px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Sign in with Google to Get Started
            </button>

            {/* Stats */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                College students waste an average of <span className="font-bold text-purple-600">$500+ per semester</span> on unused meal plans
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}