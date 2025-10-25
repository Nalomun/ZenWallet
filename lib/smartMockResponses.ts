// lib/smartMockResponses.ts
// Enhanced mock responses that look like real AI

export function getSmartQueryResponse(query: string, userData: any): string {
  const lowerQuery = query.toLowerCase();
  const name = userData.name;
  const swipes = userData.swipes_remaining;
  
  // Parse preferences if available
  const prefs = userData.preferences || {};
  const dietary = prefs.dietary_restrictions || [];
  const isDietary = dietary.length > 0;
  const topCuisine = Object.entries(prefs.cuisine_ratings || {})
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'American';
  
  // Health-focused queries
  if (lowerQuery.includes('healthy') || lowerQuery.includes('nutritious') || lowerQuery.includes('salad')) {
    const dietaryNote = isDietary ? ` Perfect for your ${dietary.join(', ')} diet!` : '';
    return `Great choice, ${name}! For healthy options, try North Commons' build-your-own grain bowl with fresh veggies and quinoa. Use one of your ${swipes} meal swipes to save $11 vs off-campus salad bars.${dietaryNote} They also have a smoothie station! 🥗✨`;
  }
  
  // Speed-focused queries
  if (lowerQuery.includes('fast') || lowerQuery.includes('quick') || lowerQuery.includes('hurry')) {
    return `Need something quick, ${name}? West Café has the shortest wait right now - only 3 minutes! Their wraps are ready-made and you can use a meal swipe. Way faster than waiting at Starbucks, and saves you $9! ⚡🌯`;
  }
  
  // Budget queries
  if (lowerQuery.includes('cheap') || lowerQuery.includes('save') || lowerQuery.includes('budget')) {
    return `Smart thinking! With ${swipes} swipes left, definitely use them. Central Dining's all-you-can-eat option is your best value - one swipe gets unlimited food worth $15+. Go for the pasta bar! 💰🍝`;
  }
  
  // Cuisine-specific
  if (lowerQuery.includes('italian') || lowerQuery.includes('pasta') || lowerQuery.includes('pizza')) {
    return `Perfect timing for Italian! Central Dining just put out fresh pasta with marinara, alfredo, and pesto. Use a meal swipe and save $12 vs an Italian restaurant. The garlic bread is amazing! 🍝🇮🇹`;
  }
  
  if (lowerQuery.includes('mexican') || lowerQuery.includes('burrito') || lowerQuery.includes('taco')) {
    return `Craving Mexican, ${name}? South Hall has a burrito bowl station with rice, beans, grilled veggies, and fresh salsa. Build exactly what you want with one of your ${swipes} swipes - saves $13 vs Chipotle! 🌮🔥`;
  }
  
  if (lowerQuery.includes('asian') || lowerQuery.includes('chinese') || lowerQuery.includes('stir')) {
    const dietaryNote = dietary.includes('Vegetarian') ? ' with tofu' : dietary.includes('Pescatarian') ? ' with shrimp' : '';
    return `East Market has fresh stir fry${dietaryNote} today! Choose your veggies and they make it to order. Use a swipe and save $11 vs takeout. Only 7 min wait! 🥢✨`;
  }
  
  // Breakfast queries
  if (lowerQuery.includes('breakfast') || lowerQuery.includes('morning') || lowerQuery.includes('coffee')) {
    return `Morning fuel time! Instead of $8 at Starbucks, use a meal swipe at West Café - eggs, toast, AND coffee included. You have ${swipes} swipes left, so use them for breakfast and save $280/month! ☕🍳`;
  }
  
  // Protein queries
  if (lowerQuery.includes('protein')) {
    if (dietary.includes('Vegan')) {
      return `For vegan protein, ${name}, try the quinoa Buddha bowl with chickpeas, tofu, and edamame at North Commons! Packed with plant-based protein, uses a meal swipe, and saves you $11. 🥗💪`;
    } else if (dietary.includes('Vegetarian')) {
      return `For vegetarian protein, check out North Commons' Greek yogurt parfait bar or the bean & cheese burrito! Both use meal swipes and give you plenty of protein. 🥙💪`;
    } else if (dietary.includes('Pescatarian')) {
      return `Perfect! Coastal Kitchen just put out grilled salmon bowls and poke - both great protein sources for your pescatarian diet. Use a swipe and save $13! 🐟💪`;
    } else {
      return `For protein, Central Dining has grilled chicken, steak options, and a protein-packed burrito bar. Use a meal swipe and you'll save $12 vs eating off-campus! 🍖💪`;
    }
  }
  
  // Preference-based fallback
  if (topCuisine && Math.random() > 0.5) {
    return `Based on your love for ${topCuisine} food, ${name}, I recommend checking out the ${topCuisine} station at Central Dining! Use one of your ${swipes} remaining swipes to save money. 🍽️✨`;
  }
  
  // Generic fallback
  return `Hey ${name}! With ${swipes} meal swipes remaining, I recommend using Central Dining right now. They have great options and you'll save $12 vs eating off-campus! Use those swipes before they expire! 🍽️💡`;
}