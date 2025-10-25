from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

# Import your existing agent code
from src.agent import analyze_spending_with_ai, generate_recommendations, process_natural_query

load_dotenv()

app = FastAPI(
    title="ZenWallet API",
    description="AI-powered meal plan optimizer",
    version="1.0.0"
)

# CRITICAL: Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://zenwallet-nine.vercel.app",
        "https://*.vercel.app",  # All Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your existing models
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
    preferences: Dict[str, Any]

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

@app.get("/")
async def root():
    return {"message": "ZenWallet API is running!", "status": "healthy"}

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    try:
        result = await analyze_spending_with_ai(
            request.user_data.dict(),
            [t.dict() for t in request.transactions]
        )
        return result
    except Exception as e:
        print(f"Error in /api/analyze: {e}")
        return {
            "main_insight": "Unable to analyze at this time",
            "dollar_amount": 0,
            "patterns": [str(e)],
            "recommendation": "Please try again later"
        }

@app.post("/api/recommendations")
async def recommendations(request: RecommendationsRequest):
    try:
        result = await generate_recommendations(
            request.user_data.dict(),
            [d.dict() for d in request.dining_halls],
            request.current_time
        )
        return result
    except Exception as e:
        print(f"Error in /api/recommendations: {e}")
        return []

@app.post("/api/query")
async def query(request: QueryRequest):
    try:
        result = await process_natural_query(
            request.query,
            request.user_data.dict(),
            [d.dict() for d in request.dining_halls],
            request.current_time
        )
        return {"response": result}
    except Exception as e:
        print(f"Error in /api/query: {e}")
        return {"response": "Sorry, I couldn't process that request right now."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)