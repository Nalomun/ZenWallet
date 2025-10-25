"""
AI Agent Logic - Routes all Claude requests through Lava Payments
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
from src.prompts import ANALYZER_PROMPT, RECOMMENDER_PROMPT, CHATBOT_PROMPT

load_dotenv()

LAVA_FORWARD_TOKEN = os.getenv("LAVA_FORWARD_TOKEN")
LAVA_BASE_URL = os.getenv("LAVA_BASE_URL")

def clean_json_response(response: str) -> str:
    """
    Clean Claude's response to extract pure JSON
    Claude sometimes wraps JSON in markdown code blocks
    """
    response = response.strip()
    
    # Remove markdown code blocks
    if response.startswith('```json'):
        response = response[7:]  # Remove ```json
    elif response.startswith('```'):
        response = response[3:]   # Remove ```
    
    if response.endswith('```'):
        response = response[:-3]  # Remove trailing ```
    
    return response.strip()

def call_claude_via_lava(system_prompt: str, user_prompt: str, temperature: float = 0.7) -> str:
    """
    Call Claude API through Lava Payments proxy
    This charges your Lava wallet credits instead of using Anthropic directly
    """
    
    if not LAVA_FORWARD_TOKEN or not LAVA_BASE_URL:
        raise ValueError("LAVA_FORWARD_TOKEN and LAVA_BASE_URL must be set in .env file")
    
    # Build the Lava forward URL - routes to Anthropic
    url = f"{LAVA_BASE_URL}/forward?u=https://api.anthropic.com/v1/messages"
    
    # Headers with Lava authentication
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {LAVA_FORWARD_TOKEN}',
        'anthropic-version': '2023-06-01'
    }
    
    # Standard Anthropic request body
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
        
        # Log the request for tracking
        print(f"✅ Lava Request ID: {lava_request_id}")
        
        # Extract Claude's text response
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

# ============================================
# 1. DASHBOARD ANALYSIS
# ============================================

def analyze_spending(user_data: UserProfile, transactions: list[Transaction]) -> SpendingAnalysis:
    """
    Analyze spending patterns and identify waste
    Returns AI-generated insights about meal plan usage
    """
    
    print("\n🔍 Analyzing spending patterns...")
    
    # Build transaction summary
    transaction_summary = "\n".join([
        f"- {t.merchant}: ${t.amount:.2f} ({'Meal Swipe' if t.type == 'swipe' else 'Flex/Cash'})"
        for t in transactions[:20]  # Limit to recent 20
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
    
    # Parse JSON response
    try:
        cleaned_response = clean_json_response(response)  # ← ADD THIS LINE
        data = json.loads(cleaned_response)  # ← CHANGE THIS LINE
        return SpendingAnalysis(**data)
    except json.JSONDecodeError as e:
        print(f"❌ JSON parse error: {e}")
        print(f"Response was: {response}")
        raise Exception("Failed to parse AI response - invalid JSON")

# ============================================
# 2. FEED RECOMMENDATIONS
# ============================================

def generate_recommendations(
    user_data: UserProfile, 
    dining_halls: list[DiningHall],
    current_time: str
) -> list[Recommendation]:
    """
    Generate 3 personalized meal recommendations
    Takes into account time, preferences, and budget optimization
    """
    
    print("\n🍽️ Generating meal recommendations...")
    
    # Parse time and determine meal period
    time_obj = datetime.fromisoformat(current_time)
    hour = time_obj.hour
    meal_time = 'breakfast' if hour < 11 else 'lunch' if hour < 15 else 'dinner'
    
    # Build dining hall summary
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
    
    user_prompt = f"""
Generate 3 meal recommendations for RIGHT NOW.

USER CONTEXT:
- Time: {time_obj.strftime('%I:%M %p')} ({meal_time})
- Meal swipes left: {user_data.swipes_remaining} ({user_data.total_swipes - user_data.swipes_used} unused this week)
- Flex dollars left: ${user_data.flex_remaining:.2f}
- Dietary restrictions: {dietary}
- Favorite cuisines: {cuisines}
- Priorities: {priorities}

AVAILABLE DINING HALLS:
{dining_summary}

IMPORTANT RULES:
1. If swipes are expiring soon, STRONGLY prioritize using them
2. Show exact savings compared to alternatives
3. Match user's dietary preferences and favorite cuisines
4. Consider wait times and convenience
5. Each recommendation should be unique and compelling

Generate 3 diverse recommendations as a JSON array.
"""
    
    response = call_claude_via_lava(RECOMMENDER_PROMPT, user_prompt, temperature=0.7)
    
    # Parse JSON response
    try:
        cleaned_response = clean_json_response(response)  # ← ADD THIS LINE
        data = json.loads(cleaned_response)  # ← CHANGE THIS LINE
        return [Recommendation(**rec) for rec in data]
    except json.JSONDecodeError as e:
        print(f"❌ JSON parse error: {e}")
        print(f"Response was: {response}")
        raise Exception("Failed to parse AI response - invalid JSON")

# ============================================
# 3. NATURAL LANGUAGE QUERY (WOW MOMENT)
# ============================================

def handle_query(
    query: str,
    user_data: UserProfile,
    dining_halls: list[DiningHall],
    current_time: str
) -> str:
    """
    Handle natural language queries from users
    This is the "wow moment" - conversational AI recommendations
    """
    
    print(f"\n💬 Processing query: '{query}'")
    
    time_obj = datetime.fromisoformat(current_time)
    hour = time_obj.hour
    meal_time = 'breakfast' if hour < 11 else 'lunch' if hour < 15 else 'dinner'
    
    # Build simplified dining options
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
    
    user_prompt = f"""
User asked: "{query}"

CONTEXT:
- Current time: {time_obj.strftime('%I:%M %p')} ({meal_time})
- Meal swipes remaining: {user_data.swipes_remaining}
- Flex dollars remaining: ${user_data.flex_remaining:.2f}
- Dietary preferences: {dietary}
- Favorite cuisines: {cuisines}

DINING OPTIONS RIGHT NOW:
{dining_options}

Give ONE perfect recommendation that:
1. Directly answers their query
2. Mentions a specific dining hall and dish
3. Explains why it's smart (savings, swipes, matches their preferences)
4. Includes dollar amount saved if relevant
5. Feels natural and friendly

Be conversational and enthusiastic. 2-3 sentences max.
"""
    
    response = call_claude_via_lava(CHATBOT_PROMPT, user_prompt, temperature=0.8)
    return response.strip()