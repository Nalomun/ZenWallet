from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv

# Import your AI agent functions
from src.agent import analyze_spending, generate_recommendations, handle_query
from src.models import UserProfile, Transaction, DiningHall, SpendingAnalysis, Recommendation
from src.mock_data import FALLBACK_ANALYSIS, FALLBACK_RECOMMENDATIONS, FALLBACK_QUERY_RESPONSE

load_dotenv()

app = FastAPI(
    title="ZenWallet API",
    description="AI-powered meal plan optimizer",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models (matching frontend)
class AnalyzeRequest(BaseModel):
    user_data: dict
    transactions: List[dict]

class RecommendationsRequest(BaseModel):
    user_data: dict
    dining_halls: List[dict]
    current_time: str

class QueryRequest(BaseModel):
    query: str
    user_data: dict
    dining_halls: List[dict]
    current_time: str

# Routes
@app.get("/")
async def root():
    return {
        "message": "ZenWallet API is running!", 
        "status": "healthy",
        "cors": "enabled",
        "ai": "Claude Sonnet 4.5 via Lava Payments"
    }

@app.get("/health")
async def health():
    lava_configured = bool(os.getenv("LAVA_FORWARD_TOKEN"))
    return {
        "status": "healthy", 
        "version": "1.0.0",
        "lava_configured": lava_configured
    }

@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    """Analyze spending patterns using Claude AI via Lava"""
    print(f"📊 Analyzing spending for {request.user_data['name']}")
    
    try:
        # Convert dicts to Pydantic models
        user_profile = UserProfile(**request.user_data)
        transactions = [Transaction(**t) for t in request.transactions]
        
        # Call Claude AI via Lava
        analysis = analyze_spending(user_profile, transactions)
        
        print(f"✅ AI Analysis complete: {analysis.main_insight}")
        
        # Return as dict for JSON serialization
        return {
            "main_insight": analysis.main_insight,
            "dollar_amount": analysis.dollar_amount,
            "patterns": analysis.patterns,
            "recommendation": analysis.recommendation
        }
        
    except Exception as e:
        print(f"❌ Error in analyze: {e}")
        # Fallback to mock data if AI fails
        return {
            "main_insight": FALLBACK_ANALYSIS.main_insight,
            "dollar_amount": FALLBACK_ANALYSIS.dollar_amount,
            "patterns": FALLBACK_ANALYSIS.patterns,
            "recommendation": FALLBACK_ANALYSIS.recommendation
        }

@app.post("/api/recommendations")
async def recommendations(request: RecommendationsRequest):
    """Generate meal recommendations using Claude AI via Lava"""
    print(f"🍽️ Generating recommendations for {request.user_data['name']}")
    
    try:
        # Convert dicts to Pydantic models
        user_profile = UserProfile(**request.user_data)
        dining_halls = [DiningHall(**d) for d in request.dining_halls]
        
        # Call Claude AI via Lava
        recs = generate_recommendations(user_profile, dining_halls, request.current_time)
        
        print(f"✅ Generated {len(recs)} AI recommendations")
        
        # Return as list of dicts
        return [
            {
                "dining_hall": rec.dining_hall,
                "meal": rec.meal,
                "reasoning": rec.reasoning,
                "emoji": rec.emoji,
                "savings_amount": rec.savings_amount,
                "use_swipe": rec.use_swipe
            }
            for rec in recs
        ]
        
    except Exception as e:
        print(f"❌ Error in recommendations: {e}")
        # Fallback to mock data if AI fails
        return [
            {
                "dining_hall": rec.dining_hall,
                "meal": rec.meal,
                "reasoning": rec.reasoning,
                "emoji": rec.emoji,
                "savings_amount": rec.savings_amount,
                "use_swipe": rec.use_swipe
            }
            for rec in FALLBACK_RECOMMENDATIONS
        ]

@app.post("/api/query")
async def query(request: QueryRequest):
    """Process natural language queries using Claude AI via Lava"""
    print(f"💬 Processing query: '{request.query}'")
    
    try:
        # Convert dicts to Pydantic models
        user_profile = UserProfile(**request.user_data)
        dining_halls = [DiningHall(**d) for d in request.dining_halls]
        
        # Call Claude AI via Lava - THIS IS THE WOW MOMENT
        response = handle_query(
            request.query,
            user_profile,
            dining_halls,
            request.current_time
        )
        
        print(f"✅ AI response: {response[:100]}...")
        
        return {"response": response}
        
    except Exception as e:
        print(f"❌ Error in query: {e}")
        # Fallback to mock response if AI fails
        return {"response": FALLBACK_QUERY_RESPONSE}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting ZenWallet API with Claude AI via Lava Payments...")
    
    # Check if Lava is configured
    if os.getenv("LAVA_FORWARD_TOKEN"):
        print("✅ Lava API configured - using real Claude AI")
    else:
        print("⚠️  Lava API not configured - will use fallback responses")
        print("   Add LAVA_FORWARD_TOKEN to .env to enable AI")
    
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)