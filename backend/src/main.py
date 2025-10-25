"""
FastAPI server for ZenWallet AI Agent
Exposes REST API endpoints for the frontend to call
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Any, Dict

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

app = FastAPI(
    title="ZenWallet AI Agent",
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
        "service": "ZenWallet AI Agent",
        "version": "1.0.0",
        "message": "AI agent is ready to optimize meal plans! 🍽️"
    }

@app.get("/health")
def health_check() -> Dict[str, Any]:
    """Detailed health check"""
    import os
    
    lava_configured = bool(os.getenv("LAVA_FORWARD_TOKEN"))
    
    return {
        "status": "healthy",
        "lava_configured": lava_configured,
        "endpoints": {
            "analyze": "/api/analyze",
            "recommendations": "/api/recommendations",
            "query": "/api/query"
        }
    }

@app.post("/api/analyze", response_model=SpendingAnalysis)
async def analyze(request: AnalysisRequest):
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
        
        analysis = analyze_spending(request.user_data, request.transactions)
        
        print(f"✅ Analysis complete: ${analysis.dollar_amount} waste identified")
        return analysis
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        print("⚠️  Using fallback analysis data")
        return FALLBACK_ANALYSIS

@app.post("/api/recommendations", response_model=List[Recommendation])
async def recommendations(request: RecommendationRequest):
    """
    Generate personalized meal recommendations
    
    Returns 3-5 AI-generated recommendations based on context
    """
    try:
        print("\n" + "="*60)
        print("🍽️ RECOMMENDATIONS REQUEST")
        print(f"User: {request.user_data.name}")
        print(f"Time: {request.current_time}")
        print(f"Dining halls: {len(request.dining_halls)}")
        print("="*60)
        
        recs = generate_recommendations(
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
        
        response = handle_query(
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

# For running directly with: python -m src.main
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
    print("\nDocs: http://localhost:8000/docs")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)