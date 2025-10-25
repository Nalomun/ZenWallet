// lib/api.ts
const API_BASE_URL = 'http://localhost:8000';
import { supabase } from './supabase';
import { DEMO_PROFILES } from './demoProfiles';

export async function analyzeSpending(userData: any, transactions: any[]) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_data: userData,  // ALREADY IN CORRECT FORMAT
        transactions: transactions  // ALREADY IN CORRECT FORMAT
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to analyze spending:', error);
    return {
      main_insight: "Unable to analyze at this time",
      dollar_amount: 0,
      patterns: ["Backend connection issue"],
      recommendation: "Please try again later"
    };
  }
}

export async function generateDailyFeed(userData: any, diningHalls: any[], currentTime: Date) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_data: userData,  // ALREADY IN CORRECT FORMAT
        dining_halls: diningHalls,  // ALREADY IN CORRECT FORMAT
        current_time: currentTime.toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return [];
  }
}

export async function queryMealRecommendation(query: string, userData: any, diningHalls: any[]) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query,
        user_data: userData,  // ALREADY IN CORRECT FORMAT
        dining_halls: diningHalls,  // ALREADY IN CORRECT FORMAT
        current_time: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Failed to process query:', error);
    return "Sorry, I couldn't process that request right now.";
  }
}

export async function getCurrentUserData(userEmail: string) {
  const { data: user } = await supabase
    .from('users')
    .select('selected_profile')
    .eq('email', userEmail)
    .single();

  if (!user || !user.selected_profile) {
    return DEMO_PROFILES.swipe_ignorer.data; // Default
  }

  return DEMO_PROFILES[user.selected_profile as keyof typeof DEMO_PROFILES].data;
}