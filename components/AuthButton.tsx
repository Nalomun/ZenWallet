'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, []);

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
    router.push('/');
    router.refresh();
    // Force reload to clear all state
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gradient-to-r from-purple-200 to-blue-200 h-10 w-28 rounded-xl" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/40 shadow-md hover:shadow-lg transition-all duration-300">
        {user.user_metadata?.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-purple-400 hover:scale-110 transition-transform duration-300"
          />
        )}
        <span className="text-sm font-bold text-gray-800 max-w-[120px] truncate">
          {user.user_metadata?.name || user.email}
        </span>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 hover:scale-105 transition-all duration-300 font-semibold shadow-md"
        >
          Sign Out
        </button>
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