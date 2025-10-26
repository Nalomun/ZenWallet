"""
Visa API Integration Service
Handles Merchant Search, Merchant Offers (VMORC), and Transaction Controls
"""

import os
import requests
import base64
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Visa API Configuration
VISA_USER_ID = os.getenv("VISA_USER_ID", "")
VISA_PASSWORD = os.getenv("VISA_PASSWORD", "")
VISA_CERT_PATH = os.getenv("VISA_CERT_PATH", "")
VISA_KEY_PATH = os.getenv("VISA_KEY_PATH", "")

# Visa API Base URLs
MERCHANT_SEARCH_URL = "https://sandbox.api.visa.com/merchantsearch/v1/search"
MERCHANT_LOCATOR_URL = "https://sandbox.api.visa.com/merchantlocator/v1/locator"
VMORC_URL = "https://sandbox.api.visa.com/vmorc/v1/offers"

# MCC Code mappings for college spending categories
MCC_CATEGORIES = {
    "fast_food": ["5814"],  # Fast Food Restaurants
    "restaurants": ["5812", "5813"],  # Restaurants, Bars
    "coffee": ["5499"],  # Misc Food Stores (coffee shops)
    "grocery": ["5411"],  # Grocery Stores
    "bookstores": ["5942", "5192"],  # Book Stores
    "transit": ["4111", "4121"],  # Local Transport
    "convenience": ["5422"],  # Convenience Stores
}

def get_visa_auth_header() -> str:
    """Generate Basic Auth header for Visa API"""
    if not VISA_USER_ID or not VISA_PASSWORD:
        raise ValueError("Visa credentials not configured")
    
    credentials = f"{VISA_USER_ID}:{VISA_PASSWORD}"
    encoded = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded}"

def search_merchant(
    merchant_name: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None
) -> Optional[Dict[str, Any]]:
    """
    Search for merchant details using Visa Merchant Search API
    
    Args:
        merchant_name: Name of the merchant (e.g., "Starbucks")
        latitude: Optional location for nearby search
        longitude: Optional location for nearby search
        
    Returns:
        Merchant data with logo, address, hours, etc.
    """
    try:
        headers = {
            "Authorization": get_visa_auth_header(),
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        payload = {
            "header": {
                "messageDateTime": "2024-10-25T12:00:00",
                "requestMessageId": "Request_001",
                "startIndex": "0"
            },
            "searchAttrList": {
                "merchantName": merchant_name
            },
            "responseAttrList": [
                "GNLOCATOR",
                "GNBUSINESS"
            ],
            "searchOptions": {
                "maxRecords": "5",
                "matchIndicators": "true",
                "matchScore": "true"
            }
        }
        
        # Add location if provided
        if latitude and longitude:
            payload["searchAttrList"]["latitude"] = str(latitude)
            payload["searchAttrList"]["longitude"] = str(longitude)
            payload["searchAttrList"]["distance"] = "5"
        
        # For demo/development without actual Visa credentials, return mock data
        if not VISA_USER_ID or VISA_USER_ID == "":
            logger.info(f"Visa API not configured, using mock data for {merchant_name}")
            return get_mock_merchant_data(merchant_name)
        
        response = requests.post(
            MERCHANT_SEARCH_URL,
            headers=headers,
            json=payload,
            timeout=10
        )
        
        response.raise_for_status()
        data = response.json()
        
        # Extract first merchant result
        if data.get("response", {}).get("merchantList"):
            merchant = data["response"]["merchantList"][0]
            return {
                "name": merchant.get("visaMerchantName", merchant_name),
                "address": merchant.get("visaStoreStreetAddress", ""),
                "city": merchant.get("visaStoreCity", ""),
                "state": merchant.get("visaStoreState", ""),
                "zip": merchant.get("visaStoreZipCode", ""),
                "phone": merchant.get("visaStoreTelephone", ""),
                "latitude": merchant.get("visaStoreLatitude"),
                "longitude": merchant.get("visaStoreLongitude"),
            }
        
        return None
        
    except Exception as e:
        logger.error(f"Merchant search failed for {merchant_name}: {e}")
        return get_mock_merchant_data(merchant_name)

def get_merchant_offers(
    latitude: float = 37.8044,  # Default: Oakland, CA
    longitude: float = -122.2712,
    radius: int = 5
) -> List[Dict[str, Any]]:
    """
    Get merchant offers from Visa VMORC API
    
    Returns card-linked offers available near the user
    """
    try:
        headers = {
            "Authorization": get_visa_auth_header(),
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        payload = {
            "header": {
                "messageDateTime": "2024-10-25T12:00:00",
                "requestMessageId": "Offers_001"
            },
            "location": {
                "latitude": str(latitude),
                "longitude": str(longitude),
                "radius": str(radius)
            }
        }
        
        # For demo without credentials, return mock offers
        if not VISA_USER_ID or VISA_USER_ID == "":
            logger.info("Visa API not configured, using mock offers")
            return get_mock_offers()
        
        response = requests.post(
            VMORC_URL,
            headers=headers,
            json=payload,
            timeout=10
        )
        
        response.raise_for_status()
        data = response.json()
        
        # Parse offers
        offers = []
        for offer in data.get("response", {}).get("offers", []):
            offers.append({
                "merchant_name": offer.get("merchantName", ""),
                "offer_title": offer.get("offerTitle", ""),
                "offer_description": offer.get("description", ""),
                "discount_percentage": offer.get("discountPercentage"),
                "discount_amount": offer.get("discountAmount"),
                "category": offer.get("category", ""),
                "valid_until": offer.get("validUntil", "")
            })
        
        return offers
        
    except Exception as e:
        logger.error(f"Offers fetch failed: {e}")
        return get_mock_offers()

def get_transaction_controls(user_id: str) -> Dict[str, Any]:
    """
    Get spending controls/limits by category
    Uses Visa Transaction Controls concepts
    """
    # In production, this would call Visa Transaction Controls API
    # For demo, return structured control data
    return {
        "controls": [
            {
                "category": "Food Delivery",
                "mcc_codes": ["5814"],
                "limit_weekly": 50.00,
                "current_spend": 0,
                "enabled": True
            },
            {
                "category": "Coffee Shops",
                "mcc_codes": ["5499"],
                "limit_weekly": 20.00,
                "current_spend": 0,
                "enabled": True
            },
            {
                "category": "Restaurants",
                "mcc_codes": ["5812", "5813"],
                "limit_weekly": 100.00,
                "current_spend": 0,
                "enabled": False
            }
        ]
    }

# Mock data for demo (used when Visa API not configured)
def get_mock_merchant_data(merchant_name: str) -> Dict[str, Any]:
    """Mock merchant data for demo"""
    mock_merchants = {
        "Starbucks": {
            "name": "Starbucks",
            "address": "2150 Shattuck Ave",
            "city": "Berkeley",
            "state": "CA",
            "zip": "94704",
            "phone": "(510) 548-3542",
            "latitude": 37.8691,
            "longitude": -122.2680,
            "logo_url": "https://logo.clearbit.com/starbucks.com"
        },
        "Chipotle": {
            "name": "Chipotle Mexican Grill",
            "address": "2600 Telegraph Ave",
            "city": "Berkeley",
            "state": "CA",
            "zip": "94704",
            "phone": "(510) 486-0755",
            "latitude": 37.8641,
            "longitude": -122.2589,
            "logo_url": "https://logo.clearbit.com/chipotle.com"
        },
        "Costco": {
            "name": "Costco Wholesale",
            "address": "1001 85th Ave",
            "city": "Oakland",
            "state": "CA",
            "zip": "94621",
            "phone": "(510) 632-4400",
            "latitude": 37.7540,
            "longitude": -122.1817,
            "logo_url": "https://logo.clearbit.com/costco.com"
        }
    }
    
    return mock_merchants.get(merchant_name, {
        "name": merchant_name,
        "address": "Campus Area",
        "city": "Oakland",
        "state": "CA",
        "zip": "94612",
        "phone": "N/A",
        "logo_url": None
    })

def get_mock_offers() -> List[Dict[str, Any]]:
    """Mock Visa offers for demo"""
    return [
        {
            "merchant_name": "Chipotle",
            "offer_title": "10% Off Your Order",
            "offer_description": "Get 10% off when you pay with your Visa card. Valid on orders $10 or more.",
            "discount_percentage": 10,
            "discount_amount": None,
            "category": "Restaurants",
            "valid_until": "2025-12-31",
            "logo_url": "https://logo.clearbit.com/chipotle.com"
        },
        {
            "merchant_name": "Starbucks",
            "offer_title": "$2 Off $10+",
            "offer_description": "Save $2 on purchases of $10 or more with your Visa card.",
            "discount_percentage": None,
            "discount_amount": 2.00,
            "category": "Coffee",
            "valid_until": "2025-11-30",
            "logo_url": "https://logo.clearbit.com/starbucks.com"
        },
        {
            "merchant_name": "Panera Bread",
            "offer_title": "15% Off Breakfast",
            "offer_description": "Start your day right with 15% off breakfast items before 11am.",
            "discount_percentage": 15,
            "discount_amount": None,
            "category": "Restaurants",
            "valid_until": "2025-12-15",
            "logo_url": "https://logo.clearbit.com/panerabread.com"
        },
        {
            "merchant_name": "Subway",
            "offer_title": "Buy One Get One 50% Off",
            "offer_description": "Get a second sub at 50% off with your Visa card.",
            "discount_percentage": 50,
            "discount_amount": None,
            "category": "Fast Food",
            "valid_until": "2025-11-15",
            "logo_url": "https://logo.clearbit.com/subway.com"
        }
    ]