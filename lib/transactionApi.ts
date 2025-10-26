// lib/transactionApi.ts - AI-powered transaction parsing
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ParsedTransaction {
  merchant: string;
  amount: number;
  type: 'swipe' | 'flex' | 'external';
  category?: string;
}

export async function parseTransaction(naturalLanguage: string): Promise<ParsedTransaction | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parse-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: naturalLanguage })
    });

    if (!response.ok) {
      throw new Error(`Parse API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to parse transaction:', error);
    
    // Fallback: smart local parsing
    return parseTransactionLocally(naturalLanguage);
  }
}

function parseTransactionLocally(text: string): ParsedTransaction {
  const lowerText = text.toLowerCase();
  
  // Extract amount - handle dollars, cents, decimal
  let amount = 0;
  
  // Check for cents (like "150 cents" or "50¢")
  const centsMatch = text.match(/(\d+)\s*(?:cents?|¢)/i);
  if (centsMatch) {
    amount = parseFloat(centsMatch[1]) / 100;
  } else {
    // Check for dollars
    const dollarMatch = text.match(/\$?\s*(\d+\.?\d*)/);
    if (dollarMatch) {
      amount = parseFloat(dollarMatch[1]);
    }
  }
  
  // Determine type
  let type: 'swipe' | 'flex' | 'external' = 'flex';
  
  if (lowerText.includes('swipe') || 
      lowerText.includes('dining hall') || 
      lowerText.includes('meal plan')) {
    type = 'swipe';
  } else if (lowerText.includes('flex')) {
    type = 'flex';
  } else {
    type = 'external';
  }
  
  // Extract merchant - look for common places or capitalize first significant word
  let merchant = 'Restaurant';
  
  const knownPlaces = ['starbucks', 'chipotle', 'costco', 'sweetgreen', 'panera', 
                       'subway', 'mcdonalds', 'taco bell', 'chick-fil-a', 'panda express',
                       'central dining', 'north commons', 'west cafe', 'dining hall'];
  
  for (const place of knownPlaces) {
    if (lowerText.includes(place)) {
      merchant = place.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }
  
  // If no known place found, try to extract from "at/from [place]"
  if (merchant === 'Restaurant') {
    const atMatch = text.match(/(?:at|from)\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|,|\.|for)/i);
    if (atMatch) {
      merchant = atMatch[1].trim();
    }
  }
  
  return { merchant, amount, type };
}