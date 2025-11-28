import pandas as pd
import numpy as np

def calculate_rsi(series, period=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculate_macd(series, fast=12, slow=26, signal=9):
    exp1 = series.ewm(span=fast, adjust=False).mean()
    exp2 = series.ewm(span=slow, adjust=False).mean()
    macd = exp1 - exp2
    signal_line = macd.ewm(span=signal, adjust=False).mean()
    return macd, signal_line

def calculate_bollinger_bands(series, window=20, num_std=2):
    rolling_mean = series.rolling(window=window).mean()
    rolling_std = series.rolling(window=window).std()
    upper_band = rolling_mean + (rolling_std * num_std)
    lower_band = rolling_mean - (rolling_std * num_std)
    return upper_band, lower_band

def score_stock(stock_data):
    """
    Scoring logic based on institutional parameters.
    Returns a score (0-100) and recommendation.
    """
    score = 0
    reasons = []
    
    # Example Scoring Logic (Simplified for now)
    # ROCE
    roce = stock_data.get('roce', 0)
    if roce and roce > 0.20:
        score += 20
        reasons.append("High ROCE")
    elif roce and roce > 0.15:
        score += 10
        
    # EPS Growth
    eps_growth = stock_data.get('eps_growth', 0)
    if eps_growth and eps_growth > 0.15:
        score += 20
        reasons.append("Strong EPS Growth")
        
    # Debt
    debt_eq = stock_data.get('debt_to_equity', 100)
    if debt_eq and debt_eq < 0.5:
        score += 15
        reasons.append("Low Debt")
        
    # Recommendation
    if score >= 80:
        rec = "Strong Buy"
    elif score >= 60:
        rec = "Buy"
    elif score >= 40:
        rec = "Hold"
    else:
        rec = "Avoid"
        
    return score, rec, reasons
