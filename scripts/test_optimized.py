"""
Quick test script to verify optimized fetchers work
"""
import sys
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_stocks():
    """Test stock fetcher"""
    try:
        from fetchers.stocks_enhanced import fetch_stock_data
        logger.info("Testing stock fetcher with 3 symbols...")
        data = fetch_stock_data(['AAPL', 'MSFT', 'RELIANCE.NS'])
        logger.info(f"✓ Fetched {len(data)} stocks")
        for symbol, stock in list(data.items())[:2]:
            logger.info(f"  {symbol}: ${stock['current_price']:.2f} | ROCE: {stock.get('roce', 0):.1f}% | Score: {stock.get('score', 0)}")
        return True
    except Exception as e:
        logger.error(f"✗ Stock test failed: {e}")
        return False

def test_crypto():
    """Test crypto fetcher"""
    try:
        from fetchers.crypto_enhanced import fetch_crypto_data
        logger.info("Testing crypto fetcher...")
        data = fetch_crypto_data()
        logger.info(f"✓ Fetched {len(data)} cryptocurrencies")
        for crypto in data[:2]:
            logger.info(f"  {crypto['symbol']}: ${crypto['current_price']:,.2f} | RSI: {crypto.get('rsi', 0):.1f} | Score: {crypto.get('score', 0)}")
        return True
    except Exception as e:
        logger.error(f"✗ Crypto test failed: {e}")
        return False

def test_news():
    """Test news fetcher"""
    try:
        from fetchers.news_enhanced import fetch_news
        logger.info("Testing news fetcher...")
        data = fetch_news()
        logger.info(f"✓ Fetched {len(data)} news articles")
        for article in data[:3]:
            logger.info(f"  [{article['category']}] {article['title'][:60]}...")
        return True
    except Exception as e:
        logger.error(f"✗ News test failed: {e}")
        return False

if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("Testing Optimized Fetchers")
    logger.info("=" * 60)
    
    results = []
    results.append(("Stocks", test_stocks()))
    results.append(("Crypto", test_crypto()))
    results.append(("News", test_news()))
    
    logger.info("=" * 60)
    logger.info("Test Results")
    logger.info("=" * 60)
    
    for name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        logger.info(f"{name}: {status}")
    
    all_passed = all(r[1] for r in results)
    sys.exit(0 if all_passed else 1)
