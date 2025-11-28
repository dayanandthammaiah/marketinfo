from pycoingecko import CoinGeckoAPI
import pandas as pd
import numpy as np
import logging

cg = CoinGeckoAPI()

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

def calculate_adx(high, low, close, period=14):
    # Simplified ADX calculation
    plus_dm = high.diff()
    minus_dm = low.diff()
    plus_dm[plus_dm < 0] = 0
    minus_dm[minus_dm > 0] = 0
    
    tr1 = pd.DataFrame(high - low)
    tr2 = pd.DataFrame(abs(high - close.shift(1)))
    tr3 = pd.DataFrame(abs(low - close.shift(1)))
    frames = [tr1, tr2, tr3]
    tr = pd.concat(frames, axis=1, join='inner').max(axis=1)
    atr = tr.rolling(period).mean()
    
    plus_di = 100 * (plus_dm.ewm(alpha=1/period).mean() / atr)
    minus_di = 100 * (abs(minus_dm).ewm(alpha=1/period).mean() / atr)
    dx = (abs(plus_di - minus_di) / (plus_di + minus_di)) * 100
    adx = dx.rolling(period).mean()
    return adx

def fetch_crypto_data(top_n=30):
    logging.info(f"Fetching top {top_n} cryptocurrencies...")
    try:
        coins = cg.get_coins_markets(vs_currency='usd', order='market_cap_desc', per_page=top_n, page=1, sparkline=True)
        
        data = []
        for coin in coins:
            # Fetch OHLC for indicators (mocking with sparkline for speed, ideally separate call)
            # Using sparkline (last 7 days hourly) to approximate daily indicators is rough but faster than 30 API calls
            # For production, we'd need daily OHLC. Here we'll use sparkline as a proxy for "recent trend"
            prices = np.array(coin.get('sparkline_in_7d', {}).get('price', []))
            
            # Simple indicators based on 7d hourly data (168 points)
            if len(prices) > 20:
                series = pd.Series(prices)
                rsi = calculate_rsi(series).iloc[-1]
                macd, signal = calculate_macd(series)
                macd_val = macd.iloc[-1]
                
                # Mocking ADX/CMF as we don't have High/Low/Vol in sparkline
                adx = 50 + (np.random.random() * 20 - 10) # Placeholder
                cmf = (np.random.random() * 1 - 0.5) # Placeholder
            else:
                rsi, macd_val, adx, cmf = 50, 0, 0, 0

            # Score Calculation (0-100)
            score = 50
            if rsi < 30: score += 20 # Oversold
            if rsi > 70: score -= 10 # Overbought
            if macd_val > 0: score += 10 # Bullish MACD
            
            rec = "Hold"
            if score > 70: rec = "Strong Buy"
            elif score > 60: rec = "Buy"
            elif score < 40: rec = "Sell"

            data.append({
                "id": coin['id'],
                "symbol": coin['symbol'].upper(),
                "name": coin['name'],
                "current_price": coin['current_price'],
                "market_cap": coin['market_cap'],
                "price_change_24h": coin['price_change_percentage_24h'],
                "sparkline": prices.tolist(),
                "rsi": float(rsi) if not pd.isna(rsi) else 50,
                "macd": float(macd_val) if not pd.isna(macd_val) else 0,
                "adx": float(adx),
                "cmf": float(cmf),
                "score": score,
                "recommendation": rec
            })
        return data
    except Exception as e:
        logging.error(f"Error fetching crypto data: {e}")
        return []
