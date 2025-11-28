from pycoingecko import CoinGeckoAPI
import pandas as pd
import numpy as np
import logging

cg = CoinGeckoAPI()

def calculate_rsi(series, period=14):
    if len(series) < period + 1:
        return 50 # Default if not enough data
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculate_macd(series, fast=12, slow=26, signal=9):
    if len(series) < slow + signal:
        return pd.Series([0]*len(series)), pd.Series([0]*len(series))
    exp1 = series.ewm(span=fast, adjust=False).mean()
    exp2 = series.ewm(span=slow, adjust=False).mean()
    macd = exp1 - exp2
    signal_line = macd.ewm(span=signal, adjust=False).mean()
    return macd, signal_line

def fetch_crypto_data(top_n=50):
    logging.info(f"Fetching top {top_n} cryptocurrencies...")
    try:
        # Fetch with sparkline (last 7 days hourly data = ~168 points)
        coins = cg.get_coins_markets(vs_currency='usd', order='market_cap_desc', per_page=top_n, page=1, sparkline=True)
        
        data = []
        for coin in coins:
            try:
                prices = coin.get('sparkline_in_7d', {}).get('price', [])
                
                if not prices or len(prices) < 30:
                    logging.warning(f"Insufficient data for {coin['name']}")
                    rsi, macd_val, adx, cmf = 50, 0, 0, 0
                else:
                    series = pd.Series(prices)
                    
                    # RSI
                    rsi_series = calculate_rsi(series)
                    rsi = rsi_series.iloc[-1] if not pd.isna(rsi_series.iloc[-1]) else 50
                    
                    # MACD
                    macd_series, signal_series = calculate_macd(series)
                    macd_val = macd_series.iloc[-1]
                    
                    # Mock ADX/CMF (Since we lack High/Low/Vol in sparkline)
                    # In a real scenario, we'd need OHLCV data. 
                    # For now, we simulate "trend strength" based on price momentum
                    trend_strength = abs(series.pct_change(24).mean()) * 1000 # Proxy for ADX
                    adx = min(100, max(0, 20 + trend_strength))
                    
                    # Proxy for CMF (Money Flow) - using price direction as volume proxy
                    cmf = (series.iloc[-1] - series.mean()) / series.std() if series.std() != 0 else 0
                    cmf = max(-1, min(1, cmf / 3)) # Normalize roughly -1 to 1

                # Score Calculation (0-100)
                score = 50
                if rsi < 30: score += 20 # Oversold -> Bullish
                if rsi > 70: score -= 10 # Overbought -> Bearish
                if macd_val > 0: score += 10 # Bullish Momentum
                if adx > 25: score += 5 # Strong Trend
                if cmf > 0: score += 5 # Inflow
                
                score = min(100, max(0, score))
                
                # Recommendation Logic
                rec = "Hold"
                if score >= 80: rec = "Strong Buy"
                elif score >= 60: rec = "Buy"
                elif score <= 20: rec = "Avoid" # Changed from Sell to Avoid/Sell
                elif score <= 40: rec = "Wait" # Changed from Sell to Wait

                data.append({
                    "id": coin['id'],
                    "symbol": coin['symbol'].upper(),
                    "name": coin['name'],
                    "current_price": coin['current_price'],
                    "market_cap": coin['market_cap'],
                    "price_change_24h": coin['price_change_percentage_24h'],
                    "sparkline": prices,
                    "rsi": float(rsi),
                    "macd": float(macd_val),
                    "adx": float(adx),
                    "cmf": float(cmf),
                    "score": int(score),
                    "recommendation": rec
                })
            except Exception as e:
                logging.error(f"Error processing {coin['name']}: {e}")
                continue
                
        return data
    except Exception as e:
        logging.error(f"Error fetching crypto data: {e}")
        return []
