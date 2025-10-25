from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv
from typing import List, Any, Dict,Optional,Literal
# Add these imports after your existing imports
from typing import cast
from src.prediction import (
    forecast_from_json,
    InputDataDict,
    ResultDict,
    ForecastMode,
    FilterType
)

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
        "lava_configured": lava_configured,
        "endpoints": {
            "analyze": "/api/analyze",
            "recommendations": "/api/recommendations",
            "query": "/api/query",
            "forecast": "/api/spending-forecast"
        }
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
        
        # Extract preferences from user_data if available
        user_preferences = request.user_data.get('preferences', None)
        
        # Call Claude AI via Lava WITH PREFERENCES
        recs = generate_recommendations(
            user_profile, 
            dining_halls, 
            request.current_time,
            user_preferences  # NEW: Pass preferences to AI
        )
        
        print(f"✅ Generated {len(recs)} AI recommendations with preferences")
        
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
    
@app.post("/api/spending-forecast")
async def spending_forecast(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    ML-based spending forecast using Prophet
    
    Request body:
    {
        "UserData": {...},
        "Transactions": [...],
        "mode": "daily" | "weekly" | "monthly",
        "filter_type": "category" | "location" | "type" (optional),
        "filter_value": "coffee" (optional)
    }
    """
    try:
        print("\n" + "="*60)
        print("📈 SPENDING FORECAST REQUEST")
        print("="*60)
        
        # Extract and cast parameters
        data: InputDataDict = cast(InputDataDict, {
            'UserData': request.get('UserData', {}),
            'Transactions': request.get('Transactions', []),
            'DiningHalls': request.get('DiningHalls', [])
        })
        
        mode: ForecastMode = cast(ForecastMode, request.get('mode', 'daily'))
        filter_type: Optional[FilterType] = cast(Optional[FilterType], request.get('filter_type'))
        filter_value: Optional[str] = request.get('filter_value')
        
        user_name: str = str(data.get('UserData', {}).get('name', 'User'))
        transaction_count: int = len(data.get('Transactions', []))
        
        print(f"User: {user_name}")
        print(f"Transactions: {transaction_count}")
        print(f"Mode: {mode}")
        if filter_type and filter_value:
            print(f"Filter: {filter_type}={filter_value}")
        
        # Generate forecast
        result: ResultDict = forecast_from_json(
            data=data,
            mode=mode,
            filter_type=filter_type,
            filter_value=filter_value
        )
        
        summary: Any = result.get('summary', {})
        total_forecasted: float = float(summary.get('total_forecasted', 0))
        trend: str = str(summary.get('trend', 'unknown'))
        
        print(f"✅ Forecast complete: ${total_forecasted:.2f} ({trend} trend)")
        
        return result
        
    except Exception as e:
        print(f"❌ Forecast failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting ZenWallet API with Claude AI via Lava Payments...")
    print("\n" + "="*60)
    print("🚀 Starting ZenWallet AI Agent")
    print("="*60)
    print("\nEndpoints:")
    print("  GET  /          - Health check")
    print("  GET  /health    - Detailed status")
    print("  POST /api/analyze - Spending analysis")
    print("  POST /api/recommendations - Meal recommendations")
    print("  POST /api/query - Natural language query")
    print(" POST /api/spending-forecast - ML spending forecast")
    print("\nDocs: http://localhost:8000/docs")
    print("="*60 + "\n")
    
    # Check if Lava is configured
    if os.getenv("LAVA_FORWARD_TOKEN"):
        print("✅ Lava API configured - using real Claude AI")
    else:
        print("⚠️  Lava API not configured - will use fallback responses")
        print("   Add LAVA_FORWARD_TOKEN to .env to enable AI")
    
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)