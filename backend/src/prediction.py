"""
Production-ready expenditure forecasting using Facebook Prophet
Fully type-annotated for maximum type safety and IDE support
Author: AI Agent Team
Python: >=3.9, Prophet: -=1.1
"""

import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Literal, Tuple, Any, Union
from prophet import Prophet
from prophet.forecaster import Prophet as ProphetType
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger: logging.Logger = logging.getLogger(__name__)

# Type definitions
ForecastMode = Literal["daily", "weekly", "monthly"]
FilterType = Literal["category", "location", "type"]
FrequencyType = Literal["D", "W", "MS"]

# Data structure types
TransactionDict = Dict[str, Union[str, float, int]]
UserDataDict = Dict[str, Union[str, float, int, Dict[str, List[str]]]]
DiningHallDict = Dict[str, Union[str, Dict[str, str], List[str], bool]]
InputDataDict = Dict[str, Union[UserDataDict, List[TransactionDict], List[DiningHallDict]]]
ForecastItemDict = Dict[str, Union[str, float]]
SummaryDict = Dict[str, Union[str, float, int]]
MetadataDict = Dict[str, Union[str, int, Dict[str, str]]]
ResultDict = Dict[str, Union[List[ForecastItemDict], SummaryDict, MetadataDict]]

__all__ = [
    # Type aliases
    'ForecastMode',
    'FilterType',
    'FrequencyType',
    'TransactionDict',
    'UserDataDict',
    'DiningHallDict',
    'InputDataDict',
    'ForecastItemDict',
    'SummaryDict',
    'MetadataDict',
    'ResultDict',
    # Functions
    'load_data',
    'preprocess_data',
    'forecast_expenditure',
    'forecast_from_json',
]


def load_data(filepath: Union[str, Path]) -> InputDataDict:
    """
    Load JSON data from file with full type safety
    
    Args:
        filepath: Path to JSON file containing user data and transactions
        
    Returns:
        Dictionary with UserData, Transactions, and DiningHalls
        
    Raises:
        FileNotFoundError: If file doesn't exist
        json.JSONDecodeError: If JSON is malformed
        ValueError: If required keys are missing
    """
    filepath_str: str = str(filepath)
    
    try:
        file_handle: Any
        with open(filepath_str, 'r', encoding='utf-8') as file_handle:
            data: InputDataDict = json.load(file_handle)
        
        logger.info(f"Successfully loaded data from {filepath_str}")
        
        # Validate required keys
        if 'Transactions' not in data:
            error_msg: str = "Missing 'Transactions' key in JSON data"
            raise ValueError(error_msg)
        
        transactions: Any = data['Transactions']
        if not isinstance(transactions, list):
            error_msg = "'Transactions' must be a list"
            raise ValueError(error_msg)
        
        return data
        
    except FileNotFoundError as e:
        logger.error(f"File not found: {filepath_str}")
        raise
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON format: {e}")
        raise
    except Exception as e:
        logger.error(f"Error loading data: {e}")
        raise


def preprocess_data(
    data: InputDataDict,
    filter_type: Optional[FilterType] = None,
    filter_value: Optional[str] = None
) -> pd.DataFrame:
    """
    Preprocess transaction data for Prophet modeling
    
    Args:
        data: Dictionary containing 'Transactions' list
        filter_type: Optional filter field (category/location/type)
        filter_value: Optional filter value to match
        
    Returns:
        DataFrame with 'ds' (date) and 'y' (daily expenditure) columns
        
    Raises:
        ValueError: If no transactions remain after filtering
    """
    try:
        transactions: List[TransactionDict] = data.get('Transactions', [])
        
        if not transactions:
            error_msg: str = "No transactions found in data"
            raise ValueError(error_msg)
        
        transaction_count: int = len(transactions)
        logger.info(f"Processing {transaction_count} transactions")
        
        # Convert to DataFrame
        df: pd.DataFrame = pd.DataFrame(transactions)
        
        # Parse timestamps to datetime
        df['date'] = pd.to_datetime(df['date'], utc=True)
        
        # Apply filtering if specified
        if filter_type is not None and filter_value is not None:
            if filter_type not in df.columns:
                error_msg = f"Invalid filter_type: {filter_type}"
                raise ValueError(error_msg)
            
            original_count: int = len(df)
            df = df[df[filter_type] == filter_value]
            filtered_count: int = len(df)
            
            logger.info(f"Filtered by {filter_type}={filter_value}: "
                       f"{original_count} → {filtered_count} transactions")
            
            if df.empty:
                error_msg = f"No transactions match filter: {filter_type}={filter_value}"
                raise ValueError(error_msg)
        
        # Aggregate daily expenditure
        daily_agg: pd.DataFrame = df.groupby(df['date'].dt.date).agg({
            'amount': 'sum'
        }).reset_index()
        
        # Rename columns for Prophet (requires 'ds' and 'y')
        daily_agg.columns = ['ds', 'y']
        
        # Convert date back to datetime
        daily_agg['ds'] = pd.to_datetime(daily_agg['ds'])
        
        # Sort by date
        daily_agg = daily_agg.sort_values('ds').reset_index(drop=True)
        
        num_days: int = len(daily_agg)
        min_date: pd.Timestamp = daily_agg['ds'].min()
        max_date: pd.Timestamp = daily_agg['ds'].max()
        total_expenditure: float = float(daily_agg['y'].sum())
        
        logger.info(f"Aggregated to {num_days} daily data points")
        logger.info(f"Date range: {min_date} to {max_date}")
        logger.info(f"Total expenditure: ${total_expenditure:.2f}")
        
        return daily_agg
        
    except Exception as e:
        logger.error(f"Preprocessing failed: {e}")
        raise


def _calculate_trend(forecast_df: pd.DataFrame) -> str:
    """
    Calculate overall trend direction from forecast
    
    Args:
        forecast_df: Prophet forecast DataFrame
        
    Returns:
        Trend description: 'increasing', 'decreasing', or 'stable'
    """
    # Compare first and last predicted values
    first_val: float = float(forecast_df['yhat'].iloc[0])
    last_val: float = float(forecast_df['yhat'].iloc[-1])
    
    change_pct: float = ((last_val - first_val) / first_val) * 100
    
    trend: str
    if change_pct > 5:
        trend = "increasing"
    elif change_pct < -5:
        trend = "decreasing"
    else:
        trend = "stable"
    
    return trend


def _determine_forecast_params(mode: ForecastMode) -> Tuple[int, FrequencyType]:
    """
    Determine forecast periods and frequency based on mode
    
    Args:
        mode: Forecast mode (daily/weekly/monthly)
        
    Returns:
        Tuple of (periods, frequency)
    """
    params: Dict[ForecastMode, Tuple[int, FrequencyType]] = {
        'daily': (7, 'D'),      # 7 days
        'weekly': (4, 'W'),     # 4 weeks
        'monthly': (3, 'MS')    # 3 months (month start)
    }
    
    result: Tuple[int, FrequencyType] = params.get(mode, (7, 'D'))
    return result


def forecast_expenditure(
    df: pd.DataFrame,
    mode: ForecastMode = 'daily',
    confidence_interval: float = 0.95
) -> ResultDict:
    """
    Forecast future expenditure using Prophet
    
    Args:
        df: DataFrame with 'ds' (date) and 'y' (amount) columns
        mode: Forecast mode - 'daily', 'weekly', or 'monthly'
        confidence_interval: Width of uncertainty intervals (default 0.95)
        
    Returns:
        Dictionary with forecast and summary statistics
        
    Raises:
        ValueError: If DataFrame is invalid
        
    Example:
        >>> result: ResultDict = forecast_expenditure(df, mode='weekly')
        >>> print(json.dumps(result, indent=2))
    """
    try:
        num_rows: int = len(df)
        logger.info(f"Starting {mode} forecast with {num_rows} historical data points")
        
        # Validate input
        if df.empty:
            error_msg: str = "Cannot forecast with empty DataFrame"
            raise ValueError(error_msg)
        
        required_columns: set = {'ds', 'y'}
        actual_columns: set = set(df.columns)
        if not required_columns.issubset(actual_columns):
            error_msg = "DataFrame must contain 'ds' and 'y' columns"
            raise ValueError(error_msg)
        
        # Initialize Prophet model
        model: ProphetType = Prophet(
            interval_width=confidence_interval,
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=False,  # Not enough data typically
            changepoint_prior_scale=0.5  # Moderate flexibility
        )
        
        # Suppress Prophet's verbose output
        import logging as prophet_logging
        prophet_logger: logging.Logger = prophet_logging.getLogger('prophet')
        cmdstan_logger: logging.Logger = prophet_logging.getLogger('cmdstanpy')
        prophet_logger.setLevel(prophet_logging.WARNING)
        cmdstan_logger.setLevel(prophet_logging.WARNING)
        
        # Fit model
        logger.info("Fitting Prophet model...")
        model.fit(df)
        
        # Determine forecast parameters
        periods: int
        freq: FrequencyType
        periods, freq = _determine_forecast_params(mode)
        
        # Create future dataframe
        future: pd.DataFrame = model.make_future_dataframe(periods=periods, freq=freq)
        
        # Generate forecast
        logger.info(f"Generating forecast for next {periods} {mode} periods...")
        forecast: pd.DataFrame = model.predict(future)
        
        # Extract future predictions only
        last_historical_date: pd.Timestamp = df['ds'].max()
        future_forecast: pd.DataFrame = forecast[forecast['ds'] > last_historical_date].copy()
        
        # Ensure non-negative predictions
        future_forecast['yhat'] = future_forecast['yhat'].clip(lower=0)
        future_forecast['yhat_lower'] = future_forecast['yhat_lower'].clip(lower=0)
        future_forecast['yhat_upper'] = future_forecast['yhat_upper'].clip(lower=0)
        
        # Build forecast list
        forecast_list: List[ForecastItemDict] = []
        row: pd.Series
        for _, row in future_forecast.iterrows():
            date_str: str = row['ds'].strftime('%Y-%m-%d')
            predicted_amount: float = round(float(row['yhat']), 2)
            lower_bound: float = round(float(row['yhat_lower']), 2)
            upper_bound: float = round(float(row['yhat_upper']), 2)
            
            forecast_item: ForecastItemDict = {
                'date': date_str,
                'predicted_amount': predicted_amount,
                'lower_bound': lower_bound,
                'upper_bound': upper_bound
            }
            forecast_list.append(forecast_item)
        
        # Calculate summary statistics
        total_forecasted: float = float(future_forecast['yhat'].sum())
        mean_expenditure: float = float(future_forecast['yhat'].mean())
        trend: str = _calculate_trend(future_forecast)
        
        # Calculate historical baseline for comparison
        historical_mean: float = float(df['y'].mean())
        forecast_vs_historical: float = ((mean_expenditure - historical_mean) / historical_mean) * 100
        
        confidence_pct: str = f"{int(confidence_interval * 100)}%"
        change_str: str = f"{forecast_vs_historical:+.1f}%"
        
        summary: SummaryDict = {
            'total_forecasted': round(total_forecasted, 2),
            'mean_daily_expenditure': round(mean_expenditure, 2),
            'trend': trend,
            'forecast_periods': periods,
            'mode': mode,
            'confidence_interval': confidence_pct,
            'historical_mean': round(historical_mean, 2),
            'forecast_vs_historical_change': change_str
        }
        
        logger.info(f"Forecast complete: ${total_forecasted:.2f} over {periods} {mode} periods")
        logger.info(f"Trend: {trend}, Mean: ${mean_expenditure:.2f}/day")
        
        # Build metadata
        now: datetime = datetime.now()
        generated_at: str = now.isoformat()
        historical_count: int = len(df)
        start_date: str = df['ds'].min().strftime('%Y-%m-%d')
        end_date: str = df['ds'].max().strftime('%Y-%m-%d')
        
        date_range: Dict[str, str] = {
            'start': start_date,
            'end': end_date
        }
        
        metadata: MetadataDict = {
            'forecast_generated_at': generated_at,
            'historical_data_points': historical_count,
            'historical_date_range': date_range
        }
        
        # Build result
        result: ResultDict = {
            'forecast': forecast_list,
            'summary': summary,
            'metadata': metadata
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Forecasting failed: {e}", exc_info=True)
        raise


def forecast_from_json(
    data: InputDataDict,
    mode: ForecastMode = 'daily',
    filter_type: Optional[FilterType] = None,
    filter_value: Optional[str] = None
) -> ResultDict:
    """
    End-to-end forecasting from JSON data
    
    Args:
        data: Dictionary with UserData and Transactions
        mode: Forecast mode (daily/weekly/monthly)
        filter_type: Optional filter field
        filter_value: Optional filter value
        
    Returns:
        Forecast result dictionary
    """
    # Preprocess data
    df: pd.DataFrame = preprocess_data(data, filter_type, filter_value)
    
    # Generate forecast
    result: ResultDict = forecast_expenditure(df, mode)
    
    # Add filter info to metadata if applied
    if filter_type is not None and filter_value is not None:
        metadata: MetadataDict = result['metadata']  # type: ignore
        filter_info: Dict[str, str] = {
            'type': filter_type,
            'value': filter_value
        }
        metadata['filter'] = filter_info
    
    return result


def main() -> None:
    """
    Example usage and testing
    """
    separator: str = "="*70
    subseparator: str = "-"*70
    
    print(separator)
    print("EXPENDITURE FORECASTING SYSTEM - DEMO")
    print(separator)
    
    # Example: Load from file
    try:
        # Assuming you have a mock_data.json file
        filepath: str = 'mock_data.json'
        data: InputDataDict = load_data(filepath)
        
        print("\n📊 SCENARIO 1: Daily Forecast (All Transactions)")
        print(subseparator)
        daily_result: ResultDict = forecast_from_json(data, mode='daily')
        result_json: str = json.dumps(daily_result, indent=2)
        print(result_json)
        
        print("\n📊 SCENARIO 2: Weekly Forecast (Coffee Only)")
        print(subseparator)
        weekly_coffee: ResultDict = forecast_from_json(
            data,
            mode='weekly',
            filter_type='category',
            filter_value='coffee'
        )
        coffee_json: str = json.dumps(weekly_coffee, indent=2)
        print(coffee_json)
        
        print("\n📊 SCENARIO 3: Monthly Forecast (Central Dining)")
        print(subseparator)
        monthly_central: ResultDict = forecast_from_json(
            data,
            mode='monthly',
            filter_type='location',
            filter_value='Central Dining'
        )
        central_json: str = json.dumps(monthly_central, indent=2)
        print(central_json)
        
    except FileNotFoundError:
        warning_msg: str = "\n⚠️  mock_data.json not found. Using inline example data..."
        print(warning_msg)
        
        # Create sample data inline
        sample_transaction_1: TransactionDict = {
            "id": "1",
            "date": "2024-10-01T12:00:00Z",
            "amount": 25.50,
            "location": "Central Dining",
            "type": "swipe",
            "category": "lunch"
        }
        
        sample_transaction_2: TransactionDict = {
            "id": "2",
            "date": "2024-10-02T12:00:00Z",
            "amount": 30.00,
            "location": "North Commons",
            "type": "flex",
            "category": "dinner"
        }
        
        sample_transactions: List[TransactionDict] = [
            sample_transaction_1,
            sample_transaction_2
        ]
        
        sample_user_data: UserDataDict = {
            "name": "Test User",
            "totalPlan": 2800
        }
        
        sample_data: InputDataDict = {
            "UserData": sample_user_data,
            "Transactions": sample_transactions
        }
        
        result: ResultDict = forecast_from_json(sample_data, mode='daily')
        sample_msg: str = "\nSample forecast result:"
        print(sample_msg)
        result_str: str = json.dumps(result, indent=2)
        print(result_str)
    
    except Exception as e:
        logger.error(f"Demo failed: {e}", exc_info=True)
        error_msg: str = f"\n❌ Error: {e}"
        print(error_msg)
