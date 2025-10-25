'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const CUISINES = ['American', 'Mexican', 'Thai', 'Korean', 'Asian', 'Mediterranean', 'Italian', 'Indian'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Dairy-Free', 'Nut Allergy'];

interface Preferences {
  priorities: {
    speed: number;
    budget: number;
    health: number;
    social: number;
  };
  cuisine_ratings: { [key: string]: number };
  dietary_restrictions: string[];
  meal_times: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  avoid_ingredients: string[];
}

const DEFAULT_PREFERENCES: Preferences = {
  priorities: { speed: 50, budget: 50, health: 50, social: 50 },
  cuisine_ratings: Object.fromEntries(CUISINES.map(c => [c, 3])),
  dietary_restrictions: [],
  meal_times: { breakfast: '08:00', lunch: '12:30', dinner: '18:00' },
  avoid_ingredients: []
};

export default function PreferencesPage() {
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/');
      return;
    }

    setUser(user);

    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    if (profile?.preferences) {
      setPreferences(profile.preferences as Preferences);
    }

    setLoading(false);
  }

  async function savePreferences() {
    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from('profiles')
      .update({ preferences, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  }

  function randomizePreferences() {
    setPreferences({
      priorities: {
        speed: Math.floor(Math.random() * 100),
        budget: Math.floor(Math.random() * 100),
        health: Math.floor(Math.random() * 100),
        social: Math.floor(Math.random() * 100),
      },
      cuisine_ratings: Object.fromEntries(
        CUISINES.map(c => [c, Math.floor(Math.random() * 5) + 1])
      ),
      dietary_restrictions: DIETARY_OPTIONS.filter(() => Math.random() > 0.7),
      meal_times: preferences.meal_times,
      avoid_ingredients: preferences.avoid_ingredients
    });
  }

  function updatePriority(key: string, value: number) {
    setPreferences({
      ...preferences,
      priorities: { ...preferences.priorities, [key]: value }
    });
  }

  function updateCuisineRating(cuisine: string, rating: number) {
    setPreferences({
      ...preferences,
      cuisine_ratings: { ...preferences.cuisine_ratings, [cuisine]: rating }
    });
  }

  function toggleDietary(option: string) {
    const current = preferences.dietary_restrictions;
    const updated = current.includes(option)
      ? current.filter(d => d !== option)
      : [...current, option];
    setPreferences({ ...preferences, dietary_restrictions: updated });
  }

  function updateMealTime(meal: string, time: string) {
    setPreferences({
      ...preferences,
      meal_times: { ...preferences.meal_times, [meal]: time }
    });
  }

  function addIngredient() {
    if (newIngredient.trim()) {
      setPreferences({
        ...preferences,
        avoid_ingredients: [...preferences.avoid_ingredients, newIngredient.trim()]
      });
      setNewIngredient('');
    }
  }

  function removeIngredient(ingredient: string) {
    setPreferences({
      ...preferences,
      avoid_ingredients: preferences.avoid_ingredients.filter(i => i !== ingredient)
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
          Loading preferences...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                ⚙️ Your Preferences
              </h1>
              <p className="text-gray-600 font-medium">
                Customize your meal recommendations to match your lifestyle
              </p>
            </div>
            <button
              onClick={randomizePreferences}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg"
            >
              🎲 Surprise Me
            </button>
          </div>
        </div>

        {/* Priorities Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎯 Your Priorities
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { key: 'speed', icon: '⚡', label: 'Speed', desc: 'How quickly you want your food', low: 'Patient', high: 'Quick!' },
              { key: 'budget', icon: '💰', label: 'Budget', desc: 'Prefer cheaper options', low: 'Splurge OK', high: 'Save Money' },
              { key: 'health', icon: '🥗', label: 'Health', desc: 'Nutritious over comfort food', low: 'Comfort Food', high: 'Healthy' },
              { key: 'social', icon: '👥', label: 'Social', desc: 'Busy dining halls vs quiet spots', low: 'Quiet', high: 'Busy/Social' }
            ].map(({ key, icon, label, desc, low, high }) => (
              <div key={key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{icon}</span>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{label}</p>
                      <p className="text-sm text-gray-600">{desc}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {preferences.priorities[key as keyof typeof preferences.priorities]}%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.priorities[key as keyof typeof preferences.priorities]}
                    onChange={(e) => updatePriority(key, parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-500 font-semibold">{low}</span>
                    <span className="text-xs text-gray-500 font-semibold">{high}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cuisine Ratings */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🌮 Cuisine Preferences
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {CUISINES.map(cuisine => (
              <div key={cuisine} className="bg-gradient-to-br from-purple-50 to-blue-50 p-5 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-800 text-lg">{cuisine}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => updateCuisineRating(cuisine, star)}
                        className={`text-2xl transition-all duration-200 ${
                          star <= preferences.cuisine_ratings[cuisine]
                            ? 'text-yellow-400 scale-110'
                            : 'text-gray-300'
                        } hover:scale-125`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${(preferences.cuisine_ratings[cuisine] / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🥗 Dietary Restrictions
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {DIETARY_OPTIONS.map(option => {
              const isSelected = preferences.dietary_restrictions.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => toggleDietary(option)}
                  className={`p-4 rounded-xl font-semibold transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {isSelected ? '✓ ' : ''}{option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meal Times */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            ⏰ Typical Meal Times
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { key: 'breakfast', icon: '☕', label: 'Breakfast' },
              { key: 'lunch', icon: '🍱', label: 'Lunch' },
              { key: 'dinner', icon: '🍽️', label: 'Dinner' }
            ].map(({ key, icon, label }) => (
              <div key={key} className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{icon}</span>
                  <span className="font-bold text-gray-800 text-lg">{label}</span>
                </div>
                <input
                  type="time"
                  value={preferences.meal_times[key as keyof typeof preferences.meal_times]}
                  onChange={(e) => updateMealTime(key, e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-lg font-semibold text-gray-800 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Avoid Ingredients */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🚫 Ingredients to Avoid
          </h2>
          
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
              placeholder="e.g., mushrooms, cilantro..."
              className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
            />
            <button
              onClick={addIngredient}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold hover:scale-105 transition-all duration-300 shadow-lg"
            >
              + Add
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {preferences.avoid_ingredients.length === 0 ? (
              <p className="text-gray-500 italic">No ingredients to avoid yet</p>
            ) : (
              preferences.avoid_ingredients.map(ingredient => (
                <div
                  key={ingredient}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full font-semibold border-2 border-red-200"
                >
                  <span>{ingredient}</span>
                  <button
                    onClick={() => removeIngredient(ingredient)}
                    className="text-red-600 hover:text-red-800 font-bold text-lg"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Preview - What This Means */}
        <div className="bg-gradient-to-br from-purple-100 via-blue-100 to-purple-100 rounded-2xl shadow-xl p-8 border-2 border-purple-300">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🎯</span>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              What This Means For You
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Speed Impact */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">⚡</span>
                <h3 className="text-xl font-bold text-gray-800">Speed Priority</h3>
              </div>
              <p className="text-gray-700 mb-2">
                {preferences.priorities.speed > 70 
                  ? "🔥 HIGH - You'll only see options under 10 minutes wait time"
                  : preferences.priorities.speed > 40
                  ? "👌 MEDIUM - Balanced between speed and other factors"
                  : "🐌 LOW - You don't mind waiting for the perfect meal"}
              </p>
            </div>

            {/* Budget Impact */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">💰</span>
                <h3 className="text-xl font-bold text-gray-800">Budget Priority</h3>
              </div>
              <p className="text-gray-700 mb-2">
                {preferences.priorities.budget > 70 
                  ? "🔥 HIGH - AI will heavily emphasize meal swipes and savings"
                  : preferences.priorities.budget > 40
                  ? "👌 MEDIUM - Balanced approach to spending"
                  : "💎 LOW - You're willing to splurge for quality"}
              </p>
            </div>

            {/* Health Impact */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🥗</span>
                <h3 className="text-xl font-bold text-gray-800">Health Priority</h3>
              </div>
              <p className="text-gray-700 mb-2">
                {preferences.priorities.health > 70 
                  ? "🔥 HIGH - Expect salads, grain bowls, and lean proteins"
                  : preferences.priorities.health > 40
                  ? "👌 MEDIUM - Mix of healthy and comfort food"
                  : "🍕 LOW - Comfort food is totally fine!"}
              </p>
            </div>

            {/* Cuisine Impact */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🌮</span>
                <h3 className="text-xl font-bold text-gray-800">Cuisine Preferences</h3>
              </div>
              <p className="text-gray-700 mb-2">
                Top picks: {Object.entries(preferences.cuisine_ratings)
                  .filter(([_, rating]) => rating >= 4)
                  .map(([cuisine]) => cuisine)
                  .join(', ') || 'None yet'}
              </p>
              <p className="text-gray-600 text-sm">
                AI will prioritize your 4-5 star cuisines
              </p>
            </div>
          </div>

          {/* Dietary Summary */}
          {preferences.dietary_restrictions.length > 0 && (
            <div className="mt-6 p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-300">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🥗</span>
                <h3 className="text-lg font-bold text-green-900">Dietary Restrictions Active</h3>
              </div>
              <p className="text-green-800">
                AI will ONLY suggest: {preferences.dietary_restrictions.join(', ')} options
              </p>
              <p className="text-green-700 text-sm mt-1">
                (Non-{preferences.dietary_restrictions.join(', non-')} options will be excluded)
              </p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={async () => {
              await savePreferences();
              // Redirect to feed to see results
              setTimeout(() => router.push('/feed'), 1000);
            }}
            disabled={saving}
            className="flex-1 px-8 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 hover:scale-105 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '💾 Saving...' : saved ? '✅ Saved! Redirecting...' : '💾 Save & See My Recommendations'}
          </button>
          
          <button
            onClick={() => setPreferences(DEFAULT_PREFERENCES)}
            className="px-8 py-5 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-300 hover:scale-105 transition-all duration-300"
          >
            🔄 Reset to Defaults
          </button>
        </div>

        {saved && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-[2px] rounded-xl shadow-xl animate-slide-up">
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-4xl">🎉</span>
                <div className="flex-1">
                  <p className="text-green-800 font-bold text-lg mb-2">
                    ✅ Preferences saved successfully!
                  </p>
                  <p className="text-gray-700">
                    Your personalized recommendations are being generated. Taking you to your feed now...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}