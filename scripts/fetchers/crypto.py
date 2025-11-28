from pycoingecko import CoinGeckoAPI
import pandas as pd
import logging

cg = CoinGeckoAPI()

def fetch_crypto_data(top_n=20):
    logging.info(f"Fetching top {top_n} cryptocurrencies...")
    try:
        coins = cg.get_coins_markets(vs_currency='usd', order='market_cap_desc', per_page=top_n, page=1, sparkline=True)
        
        data = []
        for coin in coins:
            data.append({
                "id": coin['id'],
                "symbol": coin['symbol'].upper(),
                "name": coin['name'],
                "current_price": coin['current_price'],
                "market_cap": coin['market_cap'],
                "price_change_24h": coin['price_change_percentage_24h'],
                "sparkline": coin.get('sparkline_in_7d', {}).get('price', []),
                # Placeholders for advanced metrics (would need more API calls or calculation)
                "rsi": 50, # To be calculated
                "macd": "Neutral"
            })
        return data
    except Exception as e:
        logging.error(f"Error fetching crypto data: {e}")
        return []

if __name__ == "__main__":
    data = fetch_crypto_data(5)
    print(f"Fetched {len(data)} coins.")
