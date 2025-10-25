"""
FastAPI server for ZenWallet
Includes AI analysis, recommendations, query, and ML forecasting
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Literal, cast
import os
from dotenv import load_dotenv

# Your existing imports
from src.agent import analyze_spending, generate_recommendations, handle_query
from src.models import UserProfile, Transaction, DiningHall, SpendingAnalysis, Recommendation
from src.mock_data import FALLBACK_ANALYSIS, FALLBACK_RECOMMENDATIONS, FALLBACK_QUERY_RESPONSE

# Partner's ML forecasting import
from src.prediction import (
    forecast_from_json,
    InputDataDict,
    ResultDict,
    ForecastMode,
    FilterType
)

load_dotenv()

app = FastAPI(
    title="ZenWallet API",
    description="AI-powered meal plan optimizer with ML forecasting",
    version="2.0.0"
)

# CRITICAL: CORS Configuration - Allow ALL origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
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
        "ai": "Claude Sonnet 4.5 via Lava Payments",
        "ml": "Prophet Forecasting Enabled"
    }

@app.get("/health")
async def health():
    lava_configured = bool(os.getenv("LAVA_FORWARD_TOKEN"))
    return {
        "status": "healthy", 
        "version": "2.0.0",
        "lava_configured": lava_configured,
        "features": ["AI Analysis", "AI Recommendations", "Natural Language Query", "ML Forecasting"]
    }

@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    """Analyze spending patterns using Claude AI via Lava"""
    print(f"📊 Analyzing spending for {request.user_data['name']}")
    
    try:
        user_profile = UserProfile(**request.user_data)
        transactions = [Transaction(**t) for t in request.transactions]
        
        analysis = analyze_spending(user_profile, transactions)
        
        print(f"✅ AI Analysis complete: {analysis.main_insight}")
        
        return {
            "main_insight": analysis.main_insight,
            "dollar_amount": analysis.dollar_amount,
            "patterns": analysis.patterns,
            "recommendation": analysis.recommendation
        }
        
    except Exception as e:
        print(f"❌ Error in analyze: {e}")
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
    
    # Debug: Print preferences
    user_prefs = request.user_data.get('preferences', None)
    if user_prefs:
        print(f"📊 PREFERENCES RECEIVED:")
        print(f"   Priorities: {user_prefs.get('priorities', {})}")
        print(f"   Dietary: {user_prefs.get('dietary_restrictions', [])}")
        print(f"   Cuisines: {user_prefs.get('cuisine_ratings', {})}")
    else:
        print(f"⚠️ NO PREFERENCES RECEIVED")
    
    try:
        user_profile = UserProfile(**request.user_data)
        dining_halls = [DiningHall(**d) for d in request.dining_halls]
        
        user_preferences = request.user_data.get('preferences', None)
        
        recs = generate_recommendations(
            user_profile, 
            dining_halls, 
            request.current_time,
            user_preferences
        )
        
        print(f"✅ Generated {len(recs)} AI recommendations with preferences")
        
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
        import traceback
        traceback.print_exc()
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
        user_profile = UserProfile(**request.user_data)
        dining_halls = [DiningHall(**d) for d in request.dining_halls]
        
        user_preferences = request.user_data.get('preferences', None)
        
        response = handle_query(
            request.query,
            user_profile,
            dining_halls,
            request.current_time,
            user_preferences
        )
        
        print(f"✅ AI response with preferences: {response[:100]}...")
        
        return {"response": response}
        
    except Exception as e:
        print(f"❌ Error in query: {e}")
        return {"response": FALLBACK_QUERY_RESPONSE}

# 🆕 ML FORECASTING ENDPOINT
@app.post("/api/spending-forecast")
async def spending_forecast(request: Dict[str, Any]) -> ResultDict:
    """
    ML-based spending forecast using Facebook Prophet
    
    Predicts future spending patterns based on historical transactions
    """
    try:
        print("\n" + "="*60)
        print("📈 SPENDING FORECAST REQUEST")
        print("="*60)
        
        # Extract and cast parameters
        user_data_raw = request.get('UserData', {})
        transactions_raw = request.get('Transactions', [])
        mode = cast(ForecastMode, request.get('mode', 'weekly'))
        filter_type = cast(Optional[FilterType], request.get('filter_type'))
        filter_value = request.get('filter_value')
        
        # Build input data structure
        data: InputDataDict = cast(InputDataDict, {
            'UserData': user_data_raw,
            'Transactions': transactions_raw,
            'DiningHalls': request.get('DiningHalls', [])
        })
        
        user_name = str(user_data_raw.get('name', 'User'))
        transaction_count = len(transactions_raw)
        
        print(f"User: {user_name}")
        print(f"Transactions: {transaction_count}")
        print(f"Mode: {mode}")
        if filter_type and filter_value:
            print(f"Filter: {filter_type}={filter_value}")
        
        # Call Prophet forecast
        result: ResultDict = forecast_from_json(
            data=data,
            mode=mode,
            filter_type=filter_type,
            filter_value=filter_value if filter_value else None
        )
        
        summary = result.get('summary', {})
        total_forecasted = float(summary.get('total_forecasted', 0))
        trend = str(summary.get('trend', 'unknown'))
        
        print(f"✅ Forecast complete: ${total_forecasted:.2f} ({trend} trend)")
        
        return result
        
    except Exception as e:
        print(f"❌ Forecast failed: {e}")
        import traceback
        traceback.print_exc()
        
        # Return error with proper structure
        raise HTTPException(
            status_code=500, 
            detail={
                "error": str(e),
                "message": "Forecast unavailable - not enough transaction data"
            }
        )

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 Starting ZenWallet API")
    print("="*60)
    print("\nFeatures:")
    print("  ✅ Claude AI Analysis & Recommendations")
    print("  ✅ Natural Language Query")
    print("  ✅ User Preferences Support")
    print("  ✅ Prophet ML Forecasting")
    print("\nEndpoints:")
    print("  GET  /health")
    print("  POST /api/analyze")
    print("  POST /api/recommendations")
    print("  POST /api/query")
    print("  POST /api/spending-forecast")
    print("\nDocs: http://localhost:8000/docs")
    print("="*60 + "\n")
    
    if os.getenv("LAVA_FORWARD_TOKEN"):
        print("✅ Lava API configured - real Claude AI enabled")
    else:
        print("⚠️  Lava API not configured - using fallbacks")
    
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)