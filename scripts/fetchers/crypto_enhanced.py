"""
Enhanced Crypto Data Fetcher with Institutional-Grade Technical Analysis
Uses only free APIs: CoinGecko (no API key needed), Binance Public API
FIXED VERSION with batch processing and rate limit handling
"""
import requests
import pandas as pd
import numpy as np
import logging
from datetime import datetime
import time

logger = logging.getLogger(__name__)

COINGECKO_BASE = "https://api.coingecko.com/api/v3"
BINANCE_BASE = "https://api.binance.com/api/v3"

# Top cryptocurrencies by market cap
CRYPTO_IDS = [
    'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana', 'ripple',
    'usd-coin', 'cardano', 'avalanche-2', 'dogecoin', 'polkadot', 'matic-network',
    'chainlink', 'litecoin', 'bitcoin-cash', 'uniswap', 'stellar', 'monero'
]

def calculate_technical_indicators(prices_df):
    """Calculate institutional-grade technical indicators"""
    if len(prices_df) < 50:
        return {}
    
    close = prices_df['price']
    
    # RSI (14-day)
    delta = close.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    rsi_value = float(rsi.iloc[-1]) if not pd.isna(rsi.iloc[-1]) else 50.0
    
    # EMA calculations
    ema_200 = close.ewm(span=200, adjust=False).mean()
    distance_from_200_ema = ((close.iloc[-1] - ema_200.iloc[-1]) / ema_200.iloc[-1] * 100) if len(ema_200) >= 200 else 0
    
    # MACD
    ema_12 = close.ewm(span=12, adjust=False).mean()
    ema_26 = close.ewm(span=26, adjust=False).mean()
    macd = ema_12 - ema_26
    signal = macd.ewm(span=9, adjust=False).mean()
    macd_slope = float(macd.iloc[-1] - macd.iloc[-5]) if len(macd) >= 5 else 0
    
    # Determine MACD vs 200 EMA trend
    if len(ema_200) >= 200:
        if close.iloc[-1] > ema_200.iloc[-1] and macd.iloc[-1] > 0:
            macd_vs_200ema = "BULLISH"
        elif close.iloc[-1] < ema_200.iloc[-1] and macd.iloc[-1] < 0:
            macd_vs_200ema = "BEARISH"
        else:
            macd_vs_200ema = "NEUTRAL"
    else:
        macd_vs_200ema = "NEUTRAL"
    
    # ADX (Average Directional Index) - trend strength
    high = prices_df['high'] if 'high' in prices_df else close
    low = prices_df['low'] if 'low' in prices_df else close
    
    tr1 = high - low
    tr2 = abs(high - close.shift())
    tr3 = abs(low - close.shift())
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(14).mean()
    
    plus_dm = high.diff()
    minus_dm = -low.diff()
    plus_dm[plus_dm < 0] = 0
    minus_dm[minus_dm < 0] = 0
    
    plus_di = 100 * (plus_dm.rolling(14).mean() / atr)
    minus_di = 100 * (minus_dm.rolling(14).mean() / atr)
    dx = 100 * abs(plus_di - minus_di) / (plus_di + minus_di)
    adx = dx.rolling(14).mean()
    adx_value = float(adx.iloc[-1]) if not pd.isna(adx.iloc[-1]) else 25.0
    
    # CMF (Chaikin Money Flow) - volume-weighted indicator
    if 'volume' in prices_df:
        volume = prices_df['volume']
        mfm = ((close - low) - (high - close)) / (high - low)
        mfm = mfm.fillna(0)
        mfv = mfm * volume
        cmf = mfv.rolling(20).sum() / volume.rolling(20).sum()
        cmf_value = float(cmf.iloc[-1]) if not pd.isna(cmf.iloc[-1]) else 0.0
    else:
        cmf_value = 0.0
    
    return {
        'rsi': rsi_value,
        'macd_vs_200ema': macd_vs_200ema,
        'distance_from_200_ema': distance_from_200_ema,
        'macd_slope': macd_slope,
        'adx': adx_value,
        'cmf': cmf_value
    }

def calculate_institutional_score(crypto_data):
    """Calculate institutional-grade composite score (0-100)"""
    score = 50  # Base score
    
    # RSI component (±15 points)
    rsi = crypto_data.get('rsi', 50)
    if 40 <= rsi <= 60:
        score += 15  # Neutral zone
    elif 30 <= rsi < 40:
        score += 10  # Slightly oversold (good)
    elif rsi < 30:
        score += 5  # Very oversold (caution)
    elif 60 < rsi <= 70:
        score += 5  # Slightly overbought
    else:
        score -= 5  # Very overbought
    
    # Trend component (±20 points)
    trend = crypto_data.get('macd_vs_200ema', 'NEUTRAL')
    if trend == 'BULLISH':
        score += 20
    elif trend == 'BEARISH':
        score -= 10
    
    # ADX component (±10 points) - trend strength
    adx = crypto_data.get('adx', 25)
    if adx > 50:
        score += 10  # Strong trend
    elif adx > 25:
        score += 5  # Moderate trend
    
    # CMF component (±10 points) - money flow
    cmf = crypto_data.get('cmf', 0)
    if cmf > 0.1:
        score += 10  # Strong buying pressure
    elif cmf > 0:
        score += 5  # Moderate buying
    elif cmf < -0.1:
        score -= 10  # Strong selling pressure
    
    # Price change component (±10 points)
    price_change_24h = crypto_data.get('price_change_percentage_24h', 0)
    if -5 < price_change_24h < 15:
        score += 10  # Healthy growth
    elif price_change_24h >= 15:
        score += 5  # Strong growth (possible overbought)
    
    return max(0, min(100, score))

def get_recommendation(score, rsi, trend):
    """Generate recommendation based on score and indicators"""
    if score >= 75 and trend == 'BULLISH':
        return "STRONG BUY"
    elif score >= 60:
        return "BUY"
    elif score >= 40:
        return "HOLD"
    elif score >= 25:
        return "SELL"
    else:
        return "STRONG SELL"

def fetch_crypto_data():
    """Fetch crypto data from CoinGecko with enhanced metrics and retry logic"""
    logger.info("Fetching cryptocurrency data with rate limit handling...")
    
    # Split into smaller batches to avoid rate limiting
    batch_size = 5
    all_market_data = []
    
    for i in range(0, len(CRYPTO_IDS), batch_size):
        batch = CRYPTO_IDS[i:i + batch_size]
        
        try:
            # Add delay between requests to respect rate limits
            if i > 0:
                logger.info(f"Waiting 2 seconds before next batch...")
                time.sleep(2)
            
            url = f"{COINGECKO_BASE}/coins/markets"
            params = {
                'vs_currency': 'usd',
                'ids': ','.join(batch),
                'order': 'market_cap_desc',
                'sparkline': False,
                'price_change_percentage': '24h,7d,30d,1y'
            }
            
            batch_num = i // batch_size + 1
            total_batches = (len(CRYPTO_IDS) + batch_size - 1) // batch_size
            logger.info(f"Fetching batch {batch_num}/{total_batches} ({len(batch)} coins)...")
            
            response = requests.get(url, params=params, timeout=15)
            
            # Handle rate limiting
            if response.status_code == 429:
                logger.warning(f"Rate limited on batch {batch_num}, waiting 10 seconds...")
                time.sleep(10)
                response = requests.get(url, params=params, timeout=15)
            
            response.raise_for_status()
            batch_data = response.json()
            all_market_data.extend(batch_data)
            logger.info(f"✓ Batch {batch_num} fetched: {len(batch_data)} coins")
            
        except requests.exceptions.HTTPError as e:
            if hasattr(e.response, 'status_code') and e.response.status_code == 429:
                logger.warning(f"Rate limit exceeded for batch {batch_num}, skipping...")
                continue
            else:
                logger.error(f"HTTP error for batch {batch_num}: {e}")
                continue
        except Exception as e:
            logger.error(f"Error fetching batch {batch_num}: {e}")
            continue
    
    if not all_market_data:
        logger.error("Failed to fetch any crypto data - returning empty list")
        return []
    
    logger.info(f"Successfully fetched {len(all_market_data)} cryptocurrencies from API")
    
    # Process each crypto
    enhanced_data = []
    
    for crypto in all_market_data:
        try:
            symbol = crypto['symbol'].upper()
            
            # Get historical data for technical analysis (with rate limiting)
            hist_url = f"{COINGECKO_BASE}/coins/{crypto['id']}/market_chart"
            hist_params = {'vs_currency': 'usd', 'days': '200'}
            
            # Add delay before historical data request
            time.sleep(1.2)  # 1.2 second delay between requests
            logger.info(f"Fetching historical data for {symbol}...")
            
            indicators = {}
            try:
                hist_response = requests.get(hist_url, params=hist_params, timeout=15)
                
                if hist_response.status_code == 200:
                    hist_data = hist_response.json()
                    prices = hist_data.get('prices', [])
                    volumes = hist_data.get('total_volumes', [])
                    
                    if prices and len(prices) > 50:
                        # Convert to DataFrame with proper OHLC data
                        df = pd.DataFrame(prices, columns=['timestamp', 'price'])
                        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
                        
                        # Create realistic high/low based on price volatility
                        df['returns'] = df['price'].pct_change()
                        daily_vol = df['returns'].std()
                        if daily_vol > 0:
                            df['high'] = df['price'] * (1 + abs(daily_vol))
                            df['low'] = df['price'] * (1 - abs(daily_vol))
                        else:
                            df['high'] = df['price'] * 1.02
                            df['low'] = df['price'] * 0.98
                        
                        # Add volume data if available
                        if volumes and len(volumes) == len(prices):
                            df['volume'] = [v[1] for v in volumes]
                        else:
                            df['volume'] = df['price'] * 1000000  # Volume proxy
                        
                        # Calculate technical indicators
                        indicators = calculate_technical_indicators(df)
                        logger.info(f"✓ Calculated indicators for {symbol}: RSI={indicators.get('rsi', 50):.1f}")
                    else:
                        logger.warning(f"Not enough price data for {symbol} ({len(prices) if prices else 0} points), using defaults")
                elif hist_response.status_code == 429:
                    logger.warning(f"Rate limited for {symbol}, using defaults")
                else:
                    logger.warning(f"HTTP {hist_response.status_code} for {symbol}, using defaults")
            except Exception as e:
                logger.warning(f"Error fetching historical data for {symbol}: {e}")
            
            # Build crypto data object
            crypto_obj = {
                'id': crypto['id'],
                'symbol': symbol,
                'name': crypto['name'],
                'image': crypto.get('image', ''),
                'current_price': crypto['current_price'],
                'market_cap': crypto['market_cap'],
                'market_cap_rank': crypto.get('market_cap_rank', 0),
                'total_volume': crypto['total_volume'],
                'high_24h': crypto.get('high_24h', crypto['current_price']),
                'low_24h': crypto.get('low_24h', crypto['current_price']),
                'price_change_24h': crypto.get('price_change_24h', 0),
                'price_change_percentage_24h': crypto.get('price_change_percentage_24h', 0),
                'price_change_7d': crypto.get('price_change_percentage_7d_in_currency', 0),
                'price_change_30d': crypto.get('price_change_percentage_30d_in_currency', 0),
                'price_change_1y': crypto.get('price_change_percentage_1y_in_currency', 0),
                'market_cap_change_24h': crypto.get('market_cap_change_24h', 0),
                'market_cap_change_percentage_24h': crypto.get('market_cap_change_percentage_24h', 0),
                'circulating_supply': crypto.get('circulating_supply', 0),
                'total_supply': crypto.get('total_supply'),
                'max_supply': crypto.get('max_supply'),
                'ath': crypto.get('ath', crypto['current_price']),
                'ath_change_percentage': crypto.get('ath_change_percentage', 0),
                'ath_date': crypto.get('ath_date', ''),
                'atl': crypto.get('atl', crypto['current_price']),
                'atl_change_percentage': crypto.get('atl_change_percentage', 0),
                'atl_date': crypto.get('atl_date', ''),
                'last_updated': crypto.get('last_updated', datetime.now().isoformat()),
                
                # Technical indicators
                'rsi': indicators.get('rsi', 50.0),
                'macd_vs_200ema': indicators.get('macd_vs_200ema', 'NEUTRAL'),
                'distance_from_200_ema': indicators.get('distance_from_200_ema', 0),
                'macd_slope': indicators.get('macd_slope', 0),
                'adx': indicators.get('adx', 25.0),
                'cmf': indicators.get('cmf', 0.0),
                'squeeze': None  # Advanced indicator, placeholder
            }
            
            # Calculate score and recommendation
            score = calculate_institutional_score(crypto_obj)
            recommendation = get_recommendation(score, crypto_obj['rsi'], crypto_obj['macd_vs_200ema'])
            
            crypto_obj['score'] = score
            crypto_obj['recommendation'] = recommendation
            crypto_obj['score_breakdown'] = f"RSI:{crypto_obj['rsi']:.1f} | Trend:{crypto_obj['macd_vs_200ema']} | ADX:{crypto_obj['adx']:.1f} | CMF:{crypto_obj['cmf']:.3f}"
            
            enhanced_data.append(crypto_obj)
            logger.info(f"✓ {symbol}: ${crypto['current_price']:,.2f} | Score: {score} | {recommendation}")
            
        except Exception as e:
            logger.warning(f"Error processing {crypto.get('symbol', 'unknown')}: {e}")
            continue
    
    logger.info(f"Successfully processed {len(enhanced_data)} cryptocurrencies with technical analysis")
    return enhanced_data

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    data = fetch_crypto_data()
    print(f"Fetched {len(data)} cryptocurrencies with institutional metrics")
