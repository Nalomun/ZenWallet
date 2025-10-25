// lib/forecastApi.ts - ML Forecasting API Wrapper (Isolated from main API)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ForecastRequest {
  UserData: {
    name: string;
    total_budget?: number;
    [key: string]: any;
  };
  Transactions: Array<{
    date: string;
    amount: number;
    category?: string;
    location?: string;
    type?: string;
    [key: string]: any;
  }>;
  mode: 'daily' | 'weekly' | 'monthly';
  filter_type?: 'category' | 'location' | 'type';
  filter_value?: string;
}

export interface ForecastResult {
  forecast: Array<{
    date: string;
    predicted_amount: number;
    lower_bound: number;
    upper_bound: number;
  }>;
  summary: {
    total_forecasted: number;
    mean_daily_expenditure: number;
    trend: string;
    forecast_periods: number;
    mode: string;
    confidence_interval: string;
    historical_mean: number;
    forecast_vs_historical_change: string;
  };
  metadata: {
    forecast_generated_at: string;
    historical_data_points: number;
    historical_date_range: {
      start: string;
      end: string;
    };
  };
}

export async function getSpendingForecast(
  request: ForecastRequest
): Promise<ForecastResult | null> {
  try {
    console.log('📈 Requesting ML forecast:', request.mode);
    
    const response = await fetch(`${API_BASE_URL}/api/spending-forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Forecast API error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Forecast received:', result.summary);
    
    return result;
    
  } catch (error) {
    console.error('Failed to get forecast:', error);
    return null;
  }
}

// Helper to convert MOCK_TRANSACTIONS format to Prophet format
export function convertTransactionsToProphetFormat(transactions: any[]) {
  return transactions.map(t => ({
    date: t.timestamp || t.date,
    amount: t.amount,
    category: t.type === 'swipe' ? 'dining' : 'flex',
    location: t.merchant,
    type: t.type
  }));
}