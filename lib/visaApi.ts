// lib/visaApi.ts - Visa API Integration (Frontend)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface MerchantData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
}

export interface VisaOffer {
  merchant_name: string;
  offer_title: string;
  offer_description: string;
  discount_percentage?: number;
  discount_amount?: number;
  category: string;
  valid_until: string;
  logo_url?: string;
}

export interface TransactionControl {
  category: string;
  mcc_codes: string[];
  limit_weekly: number;
  current_spend: number;
  enabled: boolean;
}

export async function searchMerchant(
  merchantName: string,
  latitude?: number,
  longitude?: number
): Promise<MerchantData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/merchant-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_name: merchantName,
        latitude,
        longitude
      })
    });

    if (!response.ok) {
      throw new Error(`Merchant search failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Merchant search failed:', error);
    return null;
  }
}

export async function getVisaOffers(
  latitude: number = 37.8044,
  longitude: number = -122.2712,
  radius: number = 5
): Promise<VisaOffer[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/visa-offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, radius })
    });

    if (!response.ok) {
      throw new Error(`Offers fetch failed: ${response.status}`);
    }

    const data = await response.json();
    return data.offers || [];
  } catch (error) {
    console.error('Visa offers fetch failed:', error);
    return [];
  }
}

export async function getTransactionControls(userId: string): Promise<TransactionControl[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transaction-controls/${userId}`);

    if (!response.ok) {
      throw new Error(`Controls fetch failed: ${response.status}`);
    }

    const data = await response.json();
    return data.controls || [];
  } catch (error) {
    console.error('Transaction controls fetch failed:', error);
    return [];
  }
}