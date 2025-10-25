"""
AI Agent Logic - Routes all Claude requests through Lava Payments
NOW WITH PREFERENCES SUPPORT!
"""

import os
import json
import requests
from dotenv import load_dotenv
from datetime import datetime

from src.models import (
    UserProfile, 
    Transaction, 
    DiningHall, 
    SpendingAnalysis, 
    Recommendation
)
from src.prompts import ANALYZER_PROMPT, CHATBOT_PROMPT

load_dotenv()

LAVA_FORWARD_TOKEN = os.getenv("LAVA_FORWARD_TOKEN")
LAVA_BASE_URL = os.getenv("LAVA_BASE_URL")

# ENHANCED RECOMMENDER PROMPT WITH PREFERENCES
RECOMMENDER_PROMPT = """You are a college dining recommendation engine. Generate personalized meal suggestions based on context AND user preferences.

Consider:
- Time of day (breakfast/lunch/dinner timing)
- Meal swipe vs flex dollar efficiency
- User dietary restrictions (STRICTLY enforce these)
- Wait times and convenience
- Expiring swipes (prioritize using them)
- **User priority weights (0-100 scale):**
  - Speed: How much they value quick service
  - Budget: How much they want to save money
  - Health: Preference for nutritious options
  - Social: Preference for busy vs quiet dining halls
- **Cuisine ratings (1-5 stars):**
  - Prioritize cuisines with 4-5 stars
  - Avoid cuisines with 1-2 stars unless no other options
- **Ingredients to avoid:** Never suggest meals with these ingredients

**CRITICAL DIETARY RULES:**
1. PESCATARIAN means: Fish and seafood ARE allowed, but NO beef, pork, or chicken
   - Suggest: Salmon, tuna, shrimp, fish tacos, poke bowls
   - DO NOT suggest: Just vegetarian options without fish
2. VEGETARIAN means: NO meat or fish at all (dairy and eggs OK)
3. VEGAN means: NO animal products whatsoever
4. If speed priority > 70: Only suggest options with wait time < 10 min
5. If budget priority > 70: Strongly emphasize savings and swipe usage
6. If health priority > 70: Focus on salads, grain bowls, lean proteins
7. Match cuisine preferences - suggest 4-5 star cuisines first
8. NEVER suggest foods with restricted ingredients

Format each recommendation as JSON array of 3 recommendations:
[
  {
    "dining_hall": "Name",
    "meal": "Specific dish to order",
    "reasoning": "Why this matches their priorities and preferences (mention specific priority matches)",
    "emoji": "One relevant emoji",
    "savings_amount": 12.50,
    "use_swipe": true
  }
]

CRITICAL: Return ONLY the JSON array, no other text."""

def clean_json_response(response: str) -> str:
    """Clean Claude's response to extract pure JSON"""
    response = response.strip()
    
    if response.startswith('```json'):
        response = response[7:]
    elif response.startswith('```'):
        response = response[3:]
    
    if response.endswith('```'):
        response = response[:-3]
    
    return response.strip()

def call_claude_via_lava(system_prompt: str, user_prompt: str, temperature: float = 0.7) -> str:
    """Call Claude API through Lava Payments proxy"""
    
    if not LAVA_FORWARD_TOKEN or not LAVA_BASE_URL:
        raise ValueError("LAVA_FORWARD_TOKEN and LAVA_BASE_URL must be set in .env file")
    
    url = f"{LAVA_BASE_URL}/forward?u=https://api.anthropic.com/v1/messages"
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {LAVA_FORWARD_TOKEN}',
        'anthropic-version': '2023-06-01'
    }
    
    request_body = {
        "model": "claude-sonnet-4-5-20250929",
        "max_tokens": 1024,
        "temperature": temperature,
        "system": system_prompt,
        "messages": [
            {
                "role": "user",
                "content": user_prompt
            }
        ]
    }
    
    try:
        response = requests.post(url, headers=headers, json=request_body, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        lava_request_id = response.headers.get('x-lava-request-id')
        
        print(f"✅ Lava Request ID: {lava_request_id}")
        
        return data['content'][0]['text']
        
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            raise Exception("Invalid Lava forward token - check your .env file")
        elif e.response.status_code == 402:
            raise Exception("Insufficient Lava wallet balance - add credits to continue")
        elif e.response.status_code == 403:
            raise Exception("Forbidden - check Lava token permissions")
        else:
            print(f"HTTP Error: {e.response.status_code}")
            print(f"Response: {e.response.text}")
            raise Exception(f"Lava API error: {e.response.status_code}")
            
    except requests.exceptions.Timeout:
        raise Exception("Request timed out - try again")
        
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        raise Exception(f"Failed to connect to Lava API: {e}")

def analyze_spending(user_data: UserProfile, transactions: list[Transaction]) -> SpendingAnalysis:
    """Analyze spending patterns and identify waste"""
    
    print("\n📊 Analyzing spending patterns...")
    
    transaction_summary = "\n".join([
        f"- {t.merchant}: ${t.amount:.2f} ({'Meal Swipe' if t.type == 'swipe' else 'Flex/Cash'})"
        for t in transactions[:20]
    ])
    
    spent_percentage = round((user_data.total_spent / user_data.total_budget) * 100)
    swipes_percentage = round((user_data.swipes_used / user_data.total_swipes) * 100)
    
    user_prompt = f"""
Analyze this student's meal plan spending:

MEAL PLAN STATUS:
- Total budget: ${user_data.total_budget:.2f}
- Spent so far: ${user_data.total_spent:.2f} ({spent_percentage}%)
- Meal swipes: {user_data.swipes_used}/{user_data.total_swipes} used ({swipes_percentage}%)
- Flex dollars: ${user_data.flex_spent:.2f}/${user_data.total_flex:.2f} spent
- Weeks remaining: {user_data.weeks_remaining}

RECENT TRANSACTIONS:
{transaction_summary}

CONTEXT:
- Average meal swipe value: $12
- Student preferences: {', '.join(user_data.preferences.get('dietary', []))}

Identify the BIGGEST waste and quantify exactly how much money is being lost.
Focus on the mismatch between swipe usage and flex spending.
"""
    
    response = call_claude_via_lava(ANALYZER_PROMPT, user_prompt, temperature=0.5)
    
    try:
        cleaned_response = clean_json_response(response)
        data = json.loads(cleaned_response)
        return SpendingAnalysis(**data)
    except json.JSONDecodeError as e:
        print(f"❌ JSON parse error: {e}")
        print(f"Response was: {response}")
        raise Exception("Failed to parse AI response - invalid JSON")

def generate_recommendations(
    user_data: UserProfile, 
    dining_halls: list[DiningHall],
    current_time: str,
    user_preferences: dict = None
) -> list[Recommendation]:
    """Generate personalized meal recommendations WITH PREFERENCES"""
    
    print("\n🍽️ Generating meal recommendations with preferences...")
    
    time_obj = datetime.fromisoformat(current_time)
    hour = time_obj.hour
    meal_time = 'breakfast' if hour < 11 else 'lunch' if hour < 15 else 'dinner'
    
    dining_summary = "\n".join([
        f"""
{hall.name}:
- Menu: {', '.join(hall.current_menu)}
- Wait time: {hall.wait_time} min
- Crowd level: {hall.crowd_level}
- Accepts: {'Meal swipes ✓' if hall.accepts_swipes else 'Flex only'}
- Distance: {hall.distance}
"""
        for hall in dining_halls
    ])
    
    prefs = user_data.preferences
    dietary = ', '.join(prefs.get('dietary', []))
    cuisines = ', '.join(prefs.get('favorite_cuisines', []))
    priorities = ', '.join(prefs.get('priorities', []))
    
    # NEW: Include user preferences from Supabase
    pref_section = ""
    if user_preferences:
        priorities_data = user_preferences.get('priorities', {})
        cuisine_ratings = user_preferences.get('cuisine_ratings', {})
        dietary_restrictions = user_preferences.get('dietary_restrictions', [])
        avoid_ingredients = user_preferences.get('avoid_ingredients', [])
        
        # Format dietary restrictions with clear definitions
        dietary_definitions = {
            'Vegetarian': 'No meat (beef, pork, chicken, fish, seafood) - dairy and eggs OK',
            'Vegan': 'No animal products at all (no meat, dairy, eggs, honey)',
            'Pescatarian': 'Fish and seafood OK - but NO other meat (no beef, pork, chicken)',
            'Gluten-Free': 'No wheat, barley, rye, or gluten-containing grains',
            'Dairy-Free': 'No milk, cheese, yogurt, butter, or dairy products',
            'Nut Allergy': 'AVOID all nuts and nut products (life-threatening)'
        }
        
        dietary_explanations = []
        for restriction in dietary_restrictions:
            if restriction in dietary_definitions:
                dietary_explanations.append(f"{restriction}: {dietary_definitions[restriction]}")
        
        # Format priorities
        pref_section = f"""
USER PREFERENCES (IMPORTANT - MATCH THESE!):

Priorities (0-100 scale):
- Speed: {priorities_data.get('speed', 50)}/100 {"⚡ HIGH PRIORITY" if priorities_data.get('speed', 50) > 70 else ""}
- Budget: {priorities_data.get('budget', 50)}/100 {"💰 HIGH PRIORITY" if priorities_data.get('budget', 50) > 70 else ""}
- Health: {priorities_data.get('health', 50)}/100 {"🥗 HIGH PRIORITY" if priorities_data.get('health', 50) > 70 else ""}
- Social: {priorities_data.get('social', 50)}/100 {"👥 HIGH PRIORITY" if priorities_data.get('social', 50) > 70 else ""}

Cuisine Preferences (1-5 stars):
{chr(10).join([f"- {cuisine}: {'★' * rating}{'☆' * (5-rating)} ({rating}/5)" + (" - HIGHLY PREFERRED" if rating >= 4 else " - AVOID" if rating <= 2 else "") for cuisine, rating in cuisine_ratings.items()])}

Dietary Restrictions (STRICT - MUST FOLLOW):
{chr(10).join(dietary_explanations) if dietary_explanations else 'None'}

Ingredients to AVOID:
{', '.join(avoid_ingredients) if avoid_ingredients else 'None'}

CRITICAL RULES:
- If user is Pescatarian: Suggest fish/seafood dishes, NOT just vegetarian options
- If user is Vegetarian: NO meat or fish at all
- If user is Vegan: NO animal products whatsoever
"""
    
    user_prompt = f"""
Generate 3 meal recommendations for RIGHT NOW.

USER CONTEXT:
- Time: {time_obj.strftime('%I:%M %p')} ({meal_time})
- Meal swipes left: {user_data.swipes_remaining} ({user_data.total_swipes - user_data.swipes_used} unused this week)
- Flex dollars left: ${user_data.flex_remaining:.2f}
- Dietary restrictions: {dietary}
- Favorite cuisines: {cuisines}
- Priorities: {priorities}

{pref_section}

AVAILABLE DINING HALLS:
{dining_summary}

IMPORTANT RULES:
1. If swipes are expiring soon, STRONGLY prioritize using them
2. Show exact savings compared to alternatives
3. Match user's preferences and priorities
4. Consider wait times based on speed priority
5. Each recommendation should be unique and compelling
6. STRICTLY honor dietary restrictions and avoided ingredients

Generate 3 diverse recommendations as a JSON array.
"""
    
    response = call_claude_via_lava(RECOMMENDER_PROMPT, user_prompt, temperature=0.7)
    
    try:
        cleaned_response = clean_json_response(response)
        data = json.loads(cleaned_response)
        return [Recommendation(**rec) for rec in data]
    except json.JSONDecodeError as e:
        print(f"❌ JSON parse error: {e}")
        print(f"Response was: {response}")
        raise Exception("Failed to parse AI response - invalid JSON")

def handle_query(
    query: str,
    user_data: UserProfile,
    dining_halls: list[DiningHall],
    current_time: str,
    user_preferences: dict = None
) -> str:
    """Handle natural language queries WITH PREFERENCES"""
    
    print(f"\n💬 Processing query: '{query}'")
    
    time_obj = datetime.fromisoformat(current_time)
    hour = time_obj.hour
    meal_time = 'breakfast' if hour < 11 else 'lunch' if hour < 15 else 'dinner'
    
    dining_options = "\n".join([
        f"""
{hall.name} ({hall.wait_time} min wait):
Menu: {', '.join(hall.current_menu[:3])}
{'✓ Accepts meal swipes' if hall.accepts_swipes else '✗ Flex only'}
"""
        for hall in dining_halls
    ])
    
    prefs = user_data.preferences
    dietary = ', '.join(prefs.get('dietary', []))
    cuisines = ' & '.join(prefs.get('favorite_cuisines', []))
    
    # NEW: Include preferences in query
    pref_context = ""
    if user_preferences:
        priorities = user_preferences.get('priorities', {})
        cuisine_ratings = user_preferences.get('cuisine_ratings', {})
        dietary_restrictions = user_preferences.get('dietary_restrictions', [])
        
        top_cuisines = sorted(cuisine_ratings.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # Add dietary explanations
        dietary_info = []
        if 'Pescatarian' in dietary_restrictions:
            dietary_info.append("Pescatarian (fish/seafood OK, no other meat)")
        if 'Vegetarian' in dietary_restrictions:
            dietary_info.append("Vegetarian (no meat or fish)")
        if 'Vegan' in dietary_restrictions:
            dietary_info.append("Vegan (no animal products)")
        
        pref_context = f"""
User Priorities:
- Speed importance: {priorities.get('speed', 50)}/100
- Budget importance: {priorities.get('budget', 50)}/100
- Health importance: {priorities.get('health', 50)}/100

Top Cuisine Preferences: {', '.join([f"{c} ({r}★)" for c, r in top_cuisines])}
Dietary Restrictions: {', '.join(dietary_info) if dietary_info else 'None'}

IMPORTANT: If user is Pescatarian, suggest fish/seafood dishes, not just vegetarian!
"""
    
    user_prompt = f"""
User asked: "{query}"

CONTEXT:
- Current time: {time_obj.strftime('%I:%M %p')} ({meal_time})
- Meal swipes remaining: {user_data.swipes_remaining}
- Flex dollars remaining: ${user_data.flex_remaining:.2f}
- Dietary preferences: {dietary}
- Favorite cuisines: {cuisines}

{pref_context}

DINING OPTIONS RIGHT NOW:
{dining_options}

Give ONE perfect recommendation that:
1. Directly answers their query
2. Mentions a specific dining hall and dish
3. Explains why it's smart (savings, swipes, matches their preferences and priorities)
4. Includes dollar amount saved if relevant
5. Feels natural and friendly

Be conversational and enthusiastic. 2-3 sentences max.
"""
    
    response = call_claude_via_lava(CHATBOT_PROMPT, user_prompt, temperature=0.8)
    return response.strip()