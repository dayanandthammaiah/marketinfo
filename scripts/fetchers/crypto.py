from pycoingecko import CoinGeckoAPI
import pandas as pd
import numpy as np
import logging
from datetime import datetime, timedelta

cg = CoinGeckoAPI()

def calculate_rsi(series, period=14):
    """Calculate Relative Strength Index"""
    if len(series) < period + 1:
        return 50  # Default if not enough data
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi.iloc[-1] if not pd.isna(rsi.iloc[-1]) else 50

def calculate_macd(series, fast=12, slow=26, signal=9):
    """Calculate MACD and Signal Line"""
    if len(series) < slow + signal:
        return 0, 0, 0
    exp1 = series.ewm(span=fast, adjust=False).mean()
    exp2 = series.ewm(span=slow, adjust=False).mean()
    macd = exp1 - exp2
    signal_line = macd.ewm(span=signal, adjust=False).mean()
    histogram = macd - signal_line
    return (
        macd.iloc[-1] if not pd.isna(macd.iloc[-1]) else 0,
        signal_line.iloc[-1] if not pd.isna(signal_line.iloc[-1]) else 0,
        histogram.iloc[-1] if not pd.isna(histogram.iloc[-1]) else 0
    )

def calculate_ema(series, period):
    """Calculate Exponential Moving Average"""
    if len(series) < period:
        return series.mean()
    ema = series.ewm(span=period, adjust=False).mean()
    return ema.iloc[-1] if not pd.isna(ema.iloc[-1]) else series.iloc[-1]

def calculate_adx(series, period=14):
    """Simplified ADX calculation based on price momentum"""
    if len(series) < period * 2:
        return 25  # Neutral default
    
    # Simplified: use price volatility as proxy for trend strength
    returns = series.pct_change()
    directional_movement = returns.abs().rolling(window=period).mean()
    adx = min(100, max(0, directional_movement.iloc[-1] * 500))  # Scale to 0-100
    return adx

def calculate_cmf(series, period=20):
    """Simplified Chaikin Money Flow (using price as volume proxy)"""
    if len(series) < period:
        return 0
    
    # Simplified: use price position in range as money flow proxy
    money_flow = (series - series.rolling(period).min()) / (series.rolling(period).max() - series.rolling(period).min() + 1e-10)
    cmf = (money_flow.rolling(period).mean().iloc[-1] - 0.5) * 2  # Scale to -1 to 1
    return np.clip(cmf, -1, 1)

def calculate_supertrend(series, period=10, multiplier=3):
    """Simplified SuperTrend indicator"""
    if len(series) < period:
        return "Neutral"
    
    atr = series.rolling(period).std()
    hl_avg = series.rolling(period).mean()
    
    upper_band = hl_avg + multiplier * atr
    lower_band = hl_avg - multiplier * atr
    
    current_price = series.iloc[-1]
    
    if current_price > upper_band.iloc[-1]:
        return "Bullish"
    elif current_price < lower_band.iloc[-1]:
        return "Bearish"
    else:
        return "Neutral"

def calculate_squeeze_momentum(series, period=20):
    """Simplified Squeeze Momentum Indicator"""
    if len(series) < period:
        return 0
    
    bb_std = series.rolling(period).std()
    kc_atr = series.rolling(period).std() * 1.5
    
    squeeze_on = bb_std.iloc[-1] < kc_atr.iloc[-1]
    momentum = series.pct_change(period).iloc[-1] * 100
    
    return momentum if squeeze_on else momentum * 0.5

def calculate_z_score(series, period=20):
    """Calculate Z-Score for volatility analysis"""
    if len(series) < period:
        return 0
    
    mean = series.rolling(period).mean().iloc[-1]
    std = series.rolling(period).std().iloc[-1]
    current = series.iloc[-1]
    
    if std == 0:
        return 0
    
    return (current - mean) / std

def get_price_change_percentage(coin_id, days):
    """Get price change percentage for a specific period"""
    try:
        data = cg.get_coin_market_chart_by_id(
            id=coin_id,
            vs_currency='usd',
            days=days
        )
        
        if data and 'prices' in data and len(data['prices']) >= 2:
            old_price = data['prices'][0][1]
            new_price = data['prices'][-1][1]
            return ((new_price - old_price) / old_price) * 100
    except Exception as e:
        logging.warning(f"Could not fetch {days}d price change for {coin_id}: {e}")
    
    return None

def fetch_crypto_data(top_n=50):
    logging.info(f"Fetching top {top_n} cryptocurrencies with comprehensive analysis...")
    try:
        # Fetch market data with 90-day sparkline
        coins = cg.get_coins_markets(
            vs_currency='usd',
            order='market_cap_desc',
            per_page=top_n,
            page=1,
            sparkline=True,
            price_change_percentage='24h,7d,30d,1y'
        )
        
        data = []
        for coin in coins:
            try:
                coin_id = coin['id']
                prices = coin.get('sparkline_in_7d', {}).get('price', [])
                
                if not prices or len(prices) < 30:
                    logging.warning(f"Insufficient data for {coin['name']}, using defaults")
                    prices = [coin['current_price']] * 90
                
                series = pd.Series(prices)
                current_price = coin['current_price']
                
                # Technical Indicators
                rsi = calculate_rsi(series)
                macd_val, macd_signal, macd_hist = calculate_macd(series)
                ema_50 = calculate_ema(series, 50)
                ema_200 = calculate_ema(series, 200) if len(series) >= 200 else calculate_ema(series, min(len(series), 50))
                adx = calculate_adx(series)
                cmf = calculate_cmf(series)
                supertrend = calculate_supertrend(series)
                squeeze_mom = calculate_squeeze_momentum(series)
                z_score = calculate_z_score(series)
                
                # Distance from 200 EMA
                distance_from_200ema = ((current_price - ema_200) / ema_200 * 100) if ema_200 > 0 else 0
                
                # MACD Slope (simplified)
                macd_slope = macd_hist
                
                # Price Changes for multiple timeframes
                price_change_1m = get_price_change_percentage(coin_id, 30)
                price_change_3m = get_price_change_percentage(coin_id, 90)
                price_change_6m = get_price_change_percentage(coin_id, 180)
                price_change_1y = coin.get('price_change_percentage_1y_in_currency')
                price_change_5y = None  # CoinGecko free tier doesn't provide 5y data easily
                
                # Comprehensive Scoring Algorithm (0-100)
                score = 50  # Start neutral
                
                # RSI Analysis (20 points max)
                if rsi < 30:
                    score += 20  # Oversold - Strong buy signal
                elif rsi < 40:
                    score += 10  # Approaching oversold
                elif rsi > 70:
                    score -= 15  # Overbought - Sell signal
                elif rsi > 60:
                    score -= 5  # Approaching overbought
                
                # MACD Analysis (15 points max)
                if macd_val > macd_signal and macd_hist > 0:
                    score += 15  # Bullish crossover
                elif macd_val > 0:
                    score += 5  # Positive MACD
                elif macd_val < macd_signal:
                    score -= 10  # Bearish crossover
                
                # EMA Analysis (15 points max)
                if current_price > ema_50 and ema_50 > ema_200:
                    score += 15  # Strong uptrend
                elif current_price > ema_200:
                    score += 8  # Above long-term average
                elif current_price < ema_200:
                    score -= 10  # Below long-term average
                
                # Trend Strength (ADX) (10 points max)
                if adx > 25:
                    score += 10  # Strong trend
                elif adx > 20:
                    score += 5  # Moderate trend
                
                # Money Flow (CMF) (10 points max)
                if cmf > 0.1:
                    score += 10  # Strong buying pressure
                elif cmf > 0:
                    score += 5  # Moderate buying
                elif cmf < -0.1:
                    score -= 10  # Strong selling pressure
                
                # SuperTrend (10 points max)
                if supertrend == "Bullish":
                    score += 10
                elif supertrend == "Bearish":
                    score -= 10
                
                # Performance-based adjustment (10 points max)
                if price_change_1m and price_change_1m > 20:
                    score += 5
                elif price_change_1m and price_change_1m < -20:
                    score -= 5
                
                # Ensure score is within bounds
                score = min(100, max(0, score))
                
                # Recommendation Logic
                if score >= 80:
                    rec = "Strong Buy"
                    reasons = ["Excellent technical setup", "Multiple bullish indicators"]
                elif score >= 65:
                    rec = "Buy"
                    reasons = ["Positive technical indicators", "Good risk/reward"]
                elif score >= 45:
                    rec = "Hold"
                    reasons = ["Neutral technical setup", "Wait for clearer signals"]
                elif score >= 30:
                    rec = "Wait"
                    reasons = ["Mixed signals", "Caution advised"]
                else:
                    rec = "Avoid"
                    reasons = ["Weak technical setup", "High risk"]
                
                # Add specific reasons based on indicators
                if rsi < 30:
                    reasons.append(f"Oversold (RSI: {rsi:.1f})")
                if rsi > 70:
                    reasons.append(f"Overbought (RSI: {rsi:.1f})")
                if supertrend == "Bullish":
                    reasons.append("SuperTrend: Bullish")
                if macd_val > macd_signal:
                    reasons.append("Bullish MACD crossover")
                
                # Prepare historical data for chart
                history = []
                if len(prices) > 0:
                    days_back = min(90, len(prices))
                    for i, price in enumerate(prices[-days_back:]):
                        date = (datetime.now() - timedelta(days=days_back-i)).strftime('%Y-%m-%d')
                        history.append({"time": date, "value": float(price)})
                
                data.append({
                    "id": coin_id,
                    "symbol": coin['symbol'].upper(),
                    "name": coin['name'],
                    "sector": "Cryptocurrency",
                    "current_price": float(current_price),
                    "market_cap": int(coin.get('market_cap', 0) or 0),
                    
                    # Price Changes
                    "price_change_24h": float(coin.get('price_change_percentage_24h', 0) or 0),
                    "price_change_1m": float(price_change_1m) if price_change_1m else None,
                    "price_change_3m": float(price_change_3m) if price_change_3m else None,
                    "price_change_6m": float(price_change_6m) if price_change_6m else None,
                    "price_change_1y": float(price_change_1y) if price_change_1y else None,
                    "price_change_5y": None,
                    
                    # Technical Indicators
                    "rsi": float(rsi),
                    "macd": float(macd_val),
                    "macd_signal": float(macd_signal),
                    "adx": float(adx),
                    "cmf": float(cmf),
                    "ema_50": float(ema_50),
                    "ema_200": float(ema_200),
                    "distance_from_200ema": float(distance_from_200ema),
                    "macd_slope": float(macd_slope),
                    "squeeze_momentum": float(squeeze_mom),
                    "supertrend": supertrend,
                    "z_score": float(z_score),
                    
                    # Score and Recommendation
                    "score": int(score),
                    "recommendation": rec,
                    "reasons": reasons[:5],  # Limit to top 5 reasons
                    
                    # Chart Data
                    "history": history
                })
                
            except Exception as e:
                logging.error(f"Error processing {coin.get('name', 'unknown')}: {e}")
                continue
        
        logging.info(f"Successfully processed {len(data)} cryptocurrencies")
        return data
        
    except Exception as e:
        logging.error(f"Error fetching crypto data: {e}")
        return []

