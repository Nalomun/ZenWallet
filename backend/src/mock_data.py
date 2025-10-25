"""
Fallback mock data for when API calls fail
These ensure the demo still works even if there are connection issues
"""

from backend.src.models import SpendingAnalysis, Recommendation

# Fallback spending analysis
FALLBACK_ANALYSIS = SpendingAnalysis(
    main_insight="You're spending $47/week on coffee while 8 breakfast swipes go unused",
    dollar_amount=380.0,
    patterns=[
        "Buying Starbucks 4x/week instead of using breakfast swipes",
        "Ordering delivery Friday nights when dining halls are open",
        "8 meal swipes expiring unused every week",
        "Spending on flex when swipes are available"
    ],
    recommendation="Use breakfast swipes for coffee & pastries - saves $188/month"
)

# Fallback meal recommendations
FALLBACK_RECOMMENDATIONS = [
    Recommendation(
        dining_hall="Central Dining",
        meal="Pasta bar with marinara and garlic bread",
        reasoning="Use your meal swipe here - you have 8 expiring Sunday. Saves $12 vs off-campus lunch and matches your Italian food preference.",
        emoji="🍝",
        savings_amount=12.0,
        use_swipe=True
    ),
    Recommendation(
        dining_hall="North Commons",
        meal="Buddha bowl with tofu and veggies",
        reasoning="Matches your healthy priority and vegetarian diet. Only 3 min wait right now, perfect for quick lunch between classes.",
        emoji="🥗",
        savings_amount=9.0,
        use_swipe=True
    ),
    Recommendation(
        dining_hall="West Hall",
        meal="Vegetable stir fry with brown rice",
        reasoning="Asian cuisine you love, vegetarian-friendly. Use a swipe here to save your flex dollars for emergencies.",
        emoji="🍜",
        savings_amount=12.0,
        use_swipe=True
    )
]

# Fallback query response
FALLBACK_QUERY_RESPONSE = "Perfect timing! North Commons just opened their Buddha bowl station (3 min wait). Use a meal swipe there - saves you $9 vs your usual Sweetgreen order, and it's vegetarian and healthy like you prefer. Plus they have fresh smoothies today! 🥗✨"