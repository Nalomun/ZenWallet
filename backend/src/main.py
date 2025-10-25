"""
FastAPI server for MealPrep IQ AI Agent
Includes spending analysis, recommendations, query, and ML forecasting
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional, Literal, cast

from src.models import (
    AnalysisRequest,
    RecommendationRequest,
    QueryRequest,
    SpendingAnalysis,
    Recommendation
)
from src.agent import analyze_spending, generate_recommendations, handle_query
from src.mock_data import (
    FALLBACK_ANALYSIS,
    FALLBACK_RECOMMENDATIONS,
    FALLBACK_QUERY_RESPONSE
)

# Import forecasting module
from src.prediction import (
    forecast_from_json,
    InputDataDict,
    ResultDict,
    ForecastMode,
    FilterType
)

app: FastAPI = FastAPI(
    title="MealPrep IQ AI Agent",
    description="AI-powered meal plan optimization for college students",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",
        "https://*.vercel.app",   # Vercel deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root() -> Dict[str, str]:
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "MealPrep IQ AI Agent",
        "version": "1.0.0",
        "message": "AI agent is ready to optimize meal plans! 🍽️"
    }

@app.get("/health")
def health_check() -> Dict[str, Any]:
    """Detailed health check"""
    import os
    
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

@app.post("/api/analyze", response_model=SpendingAnalysis)
async def analyze(request: AnalysisRequest) -> SpendingAnalysis:
    """
    Analyze spending patterns and identify waste
    
    Returns AI-generated insights about meal plan usage
    """
    try:
        print("\n" + "="*60)
        print("📊 ANALYZE REQUEST")
        print(f"User: {request.user_data.name}")
        print(f"Transactions: {len(request.transactions)}")
        print("="*60)
        
        analysis: SpendingAnalysis = analyze_spending(request.user_data, request.transactions)
        
        print(f"✅ Analysis complete: ${analysis.dollar_amount} waste identified")
        return analysis
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        print("⚠️  Using fallback analysis data")
        return FALLBACK_ANALYSIS

@app.post("/api/recommendations", response_model=List[Recommendation])
async def recommendations(request: RecommendationRequest) -> List[Recommendation]:
    """
    Generate personalized meal recommendations
    
    Returns 3 AI-generated recommendations based on context
    """
    try:
        print("\n" + "="*60)
        print("🍽️ RECOMMENDATIONS REQUEST")
        print(f"User: {request.user_data.name}")
        print(f"Time: {request.current_time}")
        print(f"Dining halls: {len(request.dining_halls)}")
        print("="*60)
        
        recs: List[Recommendation] = generate_recommendations(
            request.user_data,
            request.dining_halls,
            request.current_time
        )
        
        print(f"✅ Generated {len(recs)} recommendations")
        return recs
        
    except Exception as e:
        print(f"❌ Recommendations failed: {e}")
        print("⚠️  Using fallback recommendations")
        return FALLBACK_RECOMMENDATIONS

@app.post("/api/query")
async def query(request: QueryRequest) -> Dict[str, str]:
    """
    Handle natural language queries
    
    The "wow moment" - conversational AI meal recommendations
    """
    try:
        print("\n" + "="*60)
        print("💬 QUERY REQUEST")
        print(f"User: {request.user_data.name}")
        print(f"Query: {request.query}")
        print("="*60)
        
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
        return {"response": FALLBACK_QUERY_RESPONSE}

@app.post("/api/spending-forecast")
async def spending_forecast(request: Dict[str, Any]) -> ResultDict:
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
    
    Returns:
    {
        "forecast": [...],
        "summary": {...},
        "metadata": {...}
    }
    """
    try:
        print("\n" + "="*60)
        print("📈 SPENDING FORECAST REQUEST")
        print("="*60)
        
        # Extract parameters with explicit types
        user_data_raw: Any = request.get('UserData', {})
        transactions_raw: Any = request.get('Transactions', [])
        mode_raw: Any = request.get('mode', 'daily')
        filter_type_raw: Optional[Any] = request.get('filter_type')
        filter_value_raw: Optional[Any] = request.get('filter_value')
        
        # Type casting
        data: InputDataDict = cast(InputDataDict, {
            'UserData': user_data_raw,
            'Transactions': transactions_raw,
            'DiningHalls': request.get('DiningHalls', [])
        })
        
        mode: ForecastMode = cast(ForecastMode, mode_raw)
        filter_type: Optional[FilterType] = cast(Optional[FilterType], filter_type_raw) if filter_type_raw else None
        filter_value: Optional[str] = str(filter_value_raw) if filter_value_raw else None
        
        user_name: str = str(user_data_raw.get('name', 'User'))
        transaction_count: int = len(transactions_raw)
        
        print(f"User: {user_name}")
        print(f"Transactions: {transaction_count}")
        print(f"Mode: {mode}")
        if filter_type and filter_value:
            print(f"Filter: {filter_type}={filter_value}")
        
        # Call forecast function
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
        
        # Return error response
        error_msg: str = str(e)
        error_response: Dict[str, Any] = {
            "error": error_msg,
            "fallback": True,
            "message": "Forecast unavailable - using fallback estimate",
            "forecast": [],
            "summary": {
                "total_forecasted": 0,
                "mean_daily_expenditure": 0,
                "trend": "unavailable",
                "mode": request.get('mode', 'daily')
            },
            "metadata": {
                "forecast_generated_at": "",
                "historical_data_points": 0
            }
        }
        raise HTTPException(status_code=500, detail=error_response)

# For running directly with: python src/main.py
if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 Starting MealPrep IQ AI Agent")
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
    
    uvicorn.run(app, host="0.0.0.0", port=8000)