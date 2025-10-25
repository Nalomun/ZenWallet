'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { DEMO_PROFILES } from '@/lib/demoProfiles';

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/');
      } else {
        setUser(user);
      }
    });
  }, []);

  const handleSelect = async () => {
    if (!selected || !user) return;

    setLoading(true);

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({ selected_profile: selected })
      .eq('id', user.id);

    if (!error) {
      router.push('/');
    } else {
      console.error('Error updating profile:', error);
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">
          Welcome, {user.user_metadata?.name}! 👋
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Choose a demo persona to see how ZenWallet helps different spending patterns
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {Object.values(DEMO_PROFILES).map((profile) => (
            <div
              key={profile.id}
              onClick={() => setSelected(profile.id)}
              className={`
                p-6 rounded-xl cursor-pointer transition-all
                ${selected === profile.id
                  ? 'bg-purple-600 text-white ring-4 ring-purple-300 scale-105'
                  : 'bg-white hover:shadow-lg hover:scale-102'
                }
              `}
            >
              <div className="text-4xl mb-3">{profile.emoji}</div>
              <h3 className="text-xl font-bold mb-2">{profile.name}</h3>
              <p className={`text-sm mb-3 ${selected === profile.id ? 'text-purple-100' : 'text-gray-600'}`}>
                {profile.description}
              </p>
              <div className={`
                px-3 py-1 rounded-full text-xs font-semibold inline-block
                ${selected === profile.id ? 'bg-purple-500' : 'bg-red-100 text-red-700'}
              `}>
                {profile.problem}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSelect}
          disabled={!selected || loading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
        >
          {loading ? 'Setting up your profile...' : 'Continue to Dashboard'}
        </button>
      </div>
    </div>
  );
}