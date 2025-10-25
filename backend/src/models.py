from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserProfile(BaseModel):
    """Student user profile with meal plan info"""
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
    preferences: Dict[str, Any]  # Changed from Dict[str, List[str]] to Dict[str, Any]

class Transaction(BaseModel):
    """Individual transaction record"""
    merchant: str
    amount: float
    type: str  # 'swipe' or 'flex'
    timestamp: str  # Changed from datetime to str for easier JSON handling

class DiningHall(BaseModel):
    """Dining hall information"""
    name: str
    current_menu: List[str]
    wait_time: int  # minutes
    crowd_level: str  # 'low', 'medium', 'high'
    accepts_swipes: bool
    distance: str

class SpendingAnalysis(BaseModel):
    """AI-generated spending analysis"""
    main_insight: str
    dollar_amount: float
    patterns: List[str]
    recommendation: str

class Recommendation(BaseModel):
    """AI-generated meal recommendation"""
    dining_hall: str
    meal: str
    reasoning: str
    emoji: str
    savings_amount: float
    use_swipe: bool

class QueryRequest(BaseModel):
    """Request for natural language query"""
    query: str
    user_data: UserProfile
    dining_halls: List[DiningHall]
    current_time: str

class AnalysisRequest(BaseModel):
    """Request for spending analysis"""
    user_data: UserProfile
    transactions: List[Transaction]

class RecommendationRequest(BaseModel):
    """Request for meal recommendations"""
    user_data: UserProfile
    dining_halls: List[DiningHall]
    current_time: str