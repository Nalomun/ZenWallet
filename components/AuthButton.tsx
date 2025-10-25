'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { DEMO_PROFILES } from '@/lib/demoProfiles';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentProfile, setCurrentProfile] = useState('swipe_ignorer');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadCurrentProfile(session.user.id);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) await loadCurrentProfile(user.id);
    setLoading(false);
  }

  async function loadCurrentProfile(userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('selected_profile')
      .eq('id', userId)
      .single();
    
    if (profile?.selected_profile) {
      setCurrentProfile(profile.selected_profile);
    }
  }

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const switchProfile = async (profileId: string) => {
    if (!user) return;
    
    setShowDropdown(false);
    
    const { error } = await supabase
      .from('profiles')
      .update({ selected_profile: profileId, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      setCurrentProfile(profileId);
      // Force reload to update all data
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gradient-to-r from-purple-200 to-blue-200 h-10 w-28 rounded-xl" />
    );
  }

  if (user) {
    const profile = DEMO_PROFILES[currentProfile as keyof typeof DEMO_PROFILES];
    
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-4 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/40 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-purple-400"
            />
          )}
          <div className="text-left">
            <p className="text-xs text-gray-500 font-medium">Playing as</p>
            <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span>{profile.emoji}</span>
              <span>{profile.name}</span>
              <span className="text-gray-400">▼</span>
            </p>
          </div>
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border-2 border-purple-200 p-4 z-50 animate-slide-up">
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Switch Demo Profile</p>
              <p className="text-sm text-gray-600">Choose a different spending persona</p>
            </div>

            <div className="space-y-2 mb-4">
              {Object.entries(DEMO_PROFILES).map(([key, prof]) => (
                <button
                  key={key}
                  onClick={() => switchProfile(key)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                    currentProfile === key
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{prof.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold">{prof.name}</p>
                      <p className={`text-xs ${currentProfile === key ? 'text-white/80' : 'text-gray-600'}`}>
                        {prof.problem}
                      </p>
                    </div>
                    {currentProfile === key && (
                      <span className="text-lg">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 hover:scale-105 transition-all duration-300 font-semibold shadow-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg"
    >
      Sign in with Google
    </button>
  );
}