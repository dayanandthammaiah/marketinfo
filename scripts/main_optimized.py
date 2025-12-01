"""
Optimized Main Script for Fast Data Generation
Target: Complete in under 2 minutes
"""
import sys
import os
import json
import logging
import math
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from fetchers.stocks_enhanced import fetch_stock_data, NIFTY_50_TICKERS, US_TICKERS
    from fetchers.crypto_enhanced import fetch_crypto_data
    from fetchers.news_enhanced import fetch_news
except ImportError:
    # Fallback to original fetchers if enhanced not available
    from fetchers.stocks_async import fetch_stock_data, NIFTY_50_TICKERS, US_TICKERS
    from fetchers.crypto import fetch_crypto_data
    from fetchers.news import fetch_news
    logger.warning("Using fallback fetchers - enhanced modules not found")
from analysis.metrics import score_stock

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def sanitize_for_json(obj):
    """
    Recursively sanitize data to remove NaN and Infinity values.
    """
    if isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_for_json(item) for item in obj]
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    return obj

def analyze_and_score_stocks(stock_dict):
    """Analyze and score stocks"""
    analyzed = []
    for ticker, data in stock_dict.items():
        try:
            score, rec, reasons = score_stock(data)
            data['score'] = score
            data['recommendation'] = rec
            data['reasons'] = reasons
            analyzed.append(data)
        except Exception as e:
            logger.warning(f"Error scoring {ticker}: {e}")
            # Include stock even if scoring fails
            data['score'] = 50
            data['recommendation'] = 'HOLD'
            data['reasons'] = []
            analyzed.append(data)
    
    # Sort by score
    analyzed.sort(key=lambda x: x.get('score', 0), reverse=True)
    return analyzed

def main():
    """Main optimized execution"""
    overall_start = time.time()
    logger.info("=" * 60)
    logger.info("Starting OPTIMIZED Market Data Generation")
    logger.info("=" * 60)
    
    # Use ThreadPoolExecutor to fetch all data sources in parallel
    results = {}
    
    def fetch_india_stocks():
        logger.info("📊 Fetching India stocks...")
        start = time.time()
        data = fetch_stock_data(NIFTY_50_TICKERS[:30])  # Top 30 for speed
        logger.info(f"✓ India stocks completed in {time.time() - start:.1f}s")
        return 'nifty', data
    
    def fetch_us_stocks():
        logger.info("📊 Fetching US stocks...")
        start = time.time()
        data = fetch_stock_data(US_TICKERS[:28])  # Top 28 for speed
        logger.info(f"✓ US stocks completed in {time.time() - start:.1f}s")
        return 'us', data
    
    def fetch_crypto():
        logger.info("₿ Fetching cryptocurrency data...")
        start = time.time()
        data = fetch_crypto_data()
        logger.info(f"✓ Crypto completed in {time.time() - start:.1f}s")
        return 'crypto', data
    
    def fetch_news_data():
        logger.info("📰 Fetching news...")
        start = time.time()
        data = fetch_news()
        logger.info(f"✓ News completed in {time.time() - start:.1f}s")
        return 'news', data
    
    # Parallel execution
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = [
            executor.submit(fetch_india_stocks),
            executor.submit(fetch_us_stocks),
            executor.submit(fetch_crypto),
            executor.submit(fetch_news_data)
        ]
        
        for future in as_completed(futures):
            try:
                key, data = future.result()
                results[key] = data
            except Exception as e:
                logger.error(f"Error in parallel fetch: {e}")
    
    # Analyze stocks
    logger.info("🔍 Analyzing and scoring stocks...")
    analyzed_nifty = analyze_and_score_stocks(results.get('nifty', {}))
    analyzed_us = analyze_and_score_stocks(results.get('us', {}))
    crypto_data = results.get('crypto', [])
    news_data = results.get('news', [])
    
    # Generate final JSON
    logger.info("📦 Generating final output...")
    app_data = {
        "last_updated": datetime.now().isoformat(),
        "nifty_50": analyzed_nifty,
        "us_stocks": analyzed_us,
        "crypto": crypto_data,
        "news": news_data
    }
    
    # Sanitize
    app_data = sanitize_for_json(app_data)
    
    # Save JSON
    output_dir = os.path.join(os.path.dirname(__file__), '../app/public')
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, 'latest_data.json')
    
    with open(output_path, 'w') as f:
        json.dump(app_data, f, indent=2)
    
    # Summary
    elapsed = time.time() - overall_start
    logger.info("=" * 60)
    logger.info("✅ GENERATION COMPLETE")
    logger.info("=" * 60)
    logger.info(f"Total time: {elapsed:.1f}s")
    logger.info(f"  - {len(analyzed_nifty)} India stocks")
    logger.info(f"  - {len(analyzed_us)} US stocks")
    logger.info(f"  - {len(crypto_data)} crypto assets")
    logger.info(f"  - {len(news_data)} news articles")
    logger.info(f"Output: {output_path}")
    logger.info("=" * 60)
    
    # Return success code
    return 0 if elapsed < 120 else 1  # Success if under 2 minutes

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)
