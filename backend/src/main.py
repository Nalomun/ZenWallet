from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

# Don't import agent functions - we're using mock responses
# from src.agent import analyze_spending_with_ai, generate_recommendations, process_natural_query

load_dotenv()

app = FastAPI(
    title="ZenWallet API",
    description="AI-powered meal plan optimizer",
    version="1.0.0"
)

# CORS Configuration - MUST be before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class UserPreferences(BaseModel):
    dietary: List[str]
    favorite_cuisines: List[str]
    priorities: List[str]

class UserData(BaseModel):
    name: str
    total_budget: float
    total_spent: float
    total_swipes: int
    swipes_used: int
    swipes_remaining: int
    total_flex: float
    flex_spent: float
    flex_remaining: float
    weeks_remaining: int
    preferences: UserPreferences

class Transaction(BaseModel):
    merchant: str
    amount: float
    type: str
    timestamp: str

class DiningHall(BaseModel):
    name: str
    current_menu: List[str]
    wait_time: int
    crowd_level: str
    accepts_swipes: bool
    distance: str

class AnalyzeRequest(BaseModel):
    user_data: UserData
    transactions: List[Transaction]

class RecommendationsRequest(BaseModel):
    user_data: UserData
    dining_halls: List[DiningHall]
    current_time: str

class QueryRequest(BaseModel):
    query: str
    user_data: UserData
    dining_halls: List[DiningHall]
    current_time: str

# Routes
@app.get("/")
async def root():
    return {
        "message": "ZenWallet API is running!", 
        "status": "healthy",
        "cors": "enabled"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    """Analyze spending patterns and identify waste"""
    print(f"📊 Analyzing spending for {request.user_data.name}")
    
    try:
        # Mock response for now (replace with your AI agent when ready)
        wastedSwipes = request.user_data.swipes_remaining * 12
        overBudget = request.user_data.total_spent - request.user_data.total_budget
        
        return {
            "main_insight": f"You're wasting ${wastedSwipes:.0f} by letting {request.user_data.swipes_remaining} meal swipes expire unused",
            "dollar_amount": wastedSwipes,
            "patterns": [
                f"Buying food off-campus while {request.user_data.swipes_remaining} swipes remain unused",
                f"Each unused swipe is worth $12 - that's ${wastedSwipes:.0f} going to waste",
                f"You've spent ${request.user_data.total_spent:.2f} ({(request.user_data.total_spent / request.user_data.total_budget * 100):.0f}% of budget)",
                f"At this rate, you'll be ${abs(overBudget):.0f} over budget by semester end"
            ],
            "recommendation": f"Start using meal swipes for breakfast and lunch - you could save ${(wastedSwipes * 0.7):.0f} by using them instead of buying off-campus"
        }
    except Exception as e:
        print(f"❌ Error in analyze: {e}")
        return {
            "main_insight": "Unable to analyze at this time",
            "dollar_amount": 0,
            "patterns": [str(e)],
            "recommendation": "Please try again later"
        }

@app.post("/api/recommendations")
async def recommendations(request: RecommendationsRequest):
    """Generate personalized meal recommendations"""
    print(f"🍽️ Generating recommendations for {request.user_data.name}")
    
    try:
        # Mock recommendations (replace with your AI agent when ready)
        return [
            {
                "dining_hall": "Central Dining",
                "meal": "Pasta bar with marinara sauce",
                "reasoning": f"Use your meal swipe here - you have {request.user_data.swipes_remaining} expiring. Saves $12 vs going off-campus.",
                "emoji": "🍝",
                "savings_amount": 12.0,
                "use_swipe": True
            },
            {
                "dining_hall": "North Commons",
                "meal": "Build-your-own grain bowl",
                "reasoning": "Perfect for healthy eating. Fresh ingredients, customizable, and uses a meal swipe.",
                "emoji": "🥗",
                "savings_amount": 11.0,
                "use_swipe": True
            }
        ]
    except Exception as e:
        print(f"❌ Error in recommendations: {e}")
        return []

@app.post("/api/query")
async def query(request: QueryRequest):
    """Process natural language queries"""
    print(f"💬 Processing query: {request.query}")
    
    try:
        # Mock response (replace with your AI agent when ready)
        return {
            "response": f"Based on your preferences and {request.user_data.swipes_remaining} remaining swipes, I recommend using Central Dining's pasta bar. It saves you $12 vs eating off-campus!"
        }
    except Exception as e:
        print(f"❌ Error in query: {e}")
        return {"response": "Sorry, I couldn't process that request right now."}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting ZenWallet API with CORS enabled...")
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)