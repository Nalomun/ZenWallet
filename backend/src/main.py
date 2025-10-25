"""
FastAPI server for ZenWallet AI Agent
Exposes REsST API endpoints for the frontend to call
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Literal, cast
import os
from dotenv import load_dotenv

# AI Agent imports
from src.agent import analyze_spending, generate_recommendations, handle_query
from src.models import (
    UserProfile, 
    Transaction, 
    DiningHall, 
    SpendingAnalysis, 
    Recommendation,
    AnalysisRequest,
    RecommendationRequest,
    QueryRequest
)
from src.mock_data import (
    FALLBACK_ANALYSIS,
    FALLBACK_RECOMMENDATIONS,
    FALLBACK_QUERY_RESPONSE
)

# Prophet forecasting imports
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

# Routes
@app.get("/")
async def root() -> Dict[str, str]:
    """Health check endpoint"""
    return {
        "message": "ZenWallet API is running!",
        "status": "healthy",
        "cors": "enabled",
        "ai": "Claude Sonnet 4.5 via Lava Payments",
        "ml": "Prophet forecasting enabled"
    }

@app.get("/health")
async def health() -> Dict[str, Any]:
    """Detailed health check"""
    lava_configured: bool = bool(os.getenv("LAVA_FORWARD_TOKEN"))
    
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
async def analyze(request: AnalysisRequest) -> Dict[str, Any]:
    """Analyze spending patterns using Claude AI via Lava"""
    print(f"\n{'='*60}")
    print(f"📊 ANALYZE REQUEST")
    print(f"User: {request.user_data.name}")
    print(f"Transactions: {len(request.transactions)}")
    print(f"{'='*60}")
    
    try:
        # Call Claude AI via Lava
        analysis: SpendingAnalysis = analyze_spending(request.user_data, request.transactions)
        
        print(f"✅ Analysis complete: ${analysis.dollar_amount} waste identified")
        
        # Return as dict for JSON serialization
        return {
            "main_insight": analysis.main_insight,
            "dollar_amount": analysis.dollar_amount,
            "patterns": analysis.patterns,
            "recommendation": analysis.recommendation
        }
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        print("⚠️  Using fallback analysis data")
        # Fallback to mock data if AI fails
        return {
            "main_insight": FALLBACK_ANALYSIS.main_insight,
            "dollar_amount": FALLBACK_ANALYSIS.dollar_amount,
            "patterns": FALLBACK_ANALYSIS.patterns,
            "recommendation": FALLBACK_ANALYSIS.recommendation
        }

@app.post("/api/recommendations")
async def recommendations(request: RecommendationRequest) -> List[Dict[str, Any]]:
    """Generate meal recommendations using Claude AI via Lava"""
    print(f"\n{'='*60}")
    print(f"🍽️ RECOMMENDATIONS REQUEST")
    print(f"User: {request.user_data.name}")
    print(f"Time: {request.current_time}")
    print(f"Dining halls: {len(request.dining_halls)}")
    print(f"{'='*60}")
    
    try:
        # Call Claude AI via Lava
        recs: List[Recommendation] = generate_recommendations(
            request.user_data,
            request.dining_halls,
            request.current_time
        )
        
        print(f"✅ Generated {len(recs)} recommendations")
        
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
        print(f"❌ Recommendations failed: {e}")
        print("⚠️  Using fallback recommendations")
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
async def query(request: QueryRequest) -> Dict[str, str]:
    """Process natural language queries using Claude AI via Lava"""
    print(f"\n{'='*60}")
    print(f"💬 QUERY REQUEST")
    print(f"User: {request.user_data.name}")
    print(f"Query: {request.query}")
    print(f"{'='*60}")
    
    try:
        # Call Claude AI via Lava - THIS IS THE WOW MOMENT
        response: str = handle_query(
            request.query,
            request.user_data,
            request.dining_halls,
            request.current_time
        )
        
        print(f"✅ Query handled successfully")
        print(f"Response: {response[:100]}...")
        
        return {"response": response}
        
    except Exception as e:
        print(f"❌ Query failed: {e}")
        print("⚠️  Using fallback query response")
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
        print(f"\n{'='*60}")
        print("📈 SPENDING FORECAST REQUEST")
        print(f"{'='*60}")
        
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
    print("\n" + "="*60)
    print("🚀 Starting ZenWallet AI Agent")
    print("="*60)
    print("\nEndpoints:")
    print("  GET  /          - Health check")
    print("  GET  /health    - Detailed status")
    print("  POST /api/analyze - Spending analysis")
    print("  POST /api/recommendations - Meal recommendations")
    print("  POST /api/query - Natural language query")
    print("  POST /api/spending-forecast - ML spending forecast")
    print("\nDocs: http://localhost:8000/docs")
    print("="*60 + "\n")
    
    # Check if Lava is configured
    if os.getenv("LAVA_FORWARD_TOKEN"):
        print("✅ Lava API configured - using real Claude AI")
    else:
        print("⚠️  Lava API not configured - will use fallback responses")
        print("   Add LAVA_FORWARD_TOKEN to .env to enable AI")
    
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)