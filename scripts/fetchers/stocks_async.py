"""
Async stock data fetcher with concurrent requests and multi-source fallback.
"""
import asyncio
import aiohttp
import yfinance as yf
import pandas as pd
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from tenacity import retry, stop_after_attempt, wait_exponential

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

NIFTY_50_TICKERS = [
    "ADANIENT.NS", "ADANIPORTS.NS", "APOLLOHOSP.NS", "ASIANPAINT.NS", "AXISBANK.NS",
    "BAJAJ-AUTO.NS", "BAJFINANCE.NS", "BAJAJFINSV.NS", "BPCL.NS", "BHARTIARTL.NS",
    "BRITANNIA.NS", "CIPLA.NS", "COALINDIA.NS", "DIVISLAB.NS", "DRREDDY.NS",
    "EICHERMOT.NS", "GRASIM.NS", "HCLTECH.NS", "HDFCBANK.NS", "HDFCLIFE.NS",
    "HEROMOTOCO.NS", "HINDALCO.NS", "HINDUNILVR.NS", "ICICIBANK.NS", "ITC.NS",
    "INDUSINDBK.NS", "INFY.NS", "JSWSTEEL.NS", "KOTAKBANK.NS", "LT.NS",
    "LTIM.NS", "M&M.NS", "MARUTI.NS", "NESTLEIND.NS", "NTPC.NS",
    "ONGC.NS", "POWERGRID.NS", "RELIANCE.NS", "SBILIFE.NS", "SBIN.NS",
    "SUNPHARMA.NS", "TCS.NS", "TATACONSUM.NS", "TATAMOTORS.NS", "TATASTEEL.NS",
    "TECHM.NS", "TITAN.NS", "ULTRACEMCO.NS", "UPL.NS", "WIPRO.NS"
]

US_TICKERS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "BRK-B", "V", "JNJ"
]


def chunk_list(lst: List, chunk_size: int) -> List[List]:
    """Split a list into chunks."""
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
async def fetch_single_stock(ticker: str, period: str = "1y") -> Optional[Dict]:
    """
    Fetch data for a single stock with retry logic.
    
    Args:
        ticker: Stock ticker symbol
        period: Historical data period
    
    Returns:
        Dictionary containing stock data or None on failure
    """
    try:
        # Run yfinance in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        stock = await loop.run_in_executor(None, yf.Ticker, ticker)
        info = await loop.run_in_executor(None, lambda: stock.info)
        hist = await loop.run_in_executor(None, lambda: stock.history(period=period))
        
        if hist.empty:
            logging.warning(f"No historical data for {ticker}")
            return None
        
        # Current price
        current_price = float(info.get("currentPrice") or hist['Close'].iloc[-1])
        
        # Calculate 6-month return for relative performance (FIX: Handle timezone-aware dates)
        try:
            six_months_ago = datetime.now() - timedelta(days=180)
            # Convert hist index to timezone-naive for comparison
            hist_index_naive = hist.index.tz_localize(None) if hist.index.tz is not None else hist.index
            hist_6m = hist[hist_index_naive >= six_months_ago]
            
            if len(hist_6m) > 1:
                price_6m_return = ((hist_6m['Close'].iloc[-1] - hist_6m['Close'].iloc[0]) / hist_6m['Close'].iloc[0] * 100)
            else:
                price_6m_return = 0
        except Exception as e:
            logging.warning(f"Could not calculate 6M return for {ticker}: {e}")
            price_6m_return = 0
        
        # Historical data for chart (last 90 days)
        hist_data = [
            {"time": d.strftime('%Y-%m-%d'), "value": float(c)} 
            for d, c in zip(hist.index[-90:], hist['Close'][-90:])
        ] if not hist.empty else []
        
        # Ideal Range (target price)
        target_price = info.get('targetMeanPrice', 0)
        is_indian = ticker.endswith('.NS')
        ideal_range = f"{'₹' if is_indian else '$'}{target_price:.2f}" if target_price else "N/A"
        
        # Enhanced fundamental metrics
        market_cap = int(info.get("marketCap", 0) or 0)
        free_cashflow = float(info.get("freeCashflow", 0) or 0)
        fcf_yield = (free_cashflow / market_cap * 100) if market_cap > 0 and free_cashflow else 0
        
        # EBITDA metrics
        ebitda = float(info.get("ebitda", 0) or 0)
        total_debt = float(info.get("totalDebt", 0) or 0)
        debt_to_ebitda = (total_debt / ebitda) if ebitda > 0 else 0
        
        # Enterprise value metrics
        enterprise_value = float(info.get("enterpriseValue", 0) or 0)
        ev_to_ebitda = (enterprise_value / ebitda) if ebitda > 0 else 0
        
        data = {
            "symbol": ticker,
            "name": str(info.get("shortName") or info.get("longName", ticker)),
            "sector": str(info.get("sector", "Unknown")),
            "industry": str(info.get("industry", "Unknown")),
            "current_price": float(current_price),
            "market_cap": market_cap,
            "pe_ratio": float(info.get("trailingPE", 0) or 0),
            "forward_pe": float(info.get("forwardPE", 0) or 0),
            "peg_ratio": float(info.get("pegRatio", 0) or 0),
            "price_to_book": float(info.get("priceToBook", 0) or 0),
            "roce": float(info.get("returnOnEquity", 0) or 0),
            "eps_growth": float(info.get("earningsGrowth", 0) or 0),
            "debt_to_equity": float(info.get("debtToEquity", 0) or 0) / 100 if info.get("debtToEquity") else 0,
            "free_cashflow": free_cashflow,
            "fcf_yield": fcf_yield,
            "operating_margins": float(info.get("operatingMargins", 0) or 0),
            "ideal_range": ideal_range,
            "price_6m_return": price_6m_return,
            "debt_to_ebitda": debt_to_ebitda,
            "ev_to_ebitda": ev_to_ebitda,
            "ebitda": ebitda,
            "history": hist_data,
            "score": 0,  # Will be calculated by metrics.py
            "recommendation": "Hold",  # Will be set by metrics.py
            "reasons": []  # Will be populated by metrics.py
        }
        
        return data
        
    except Exception as e:
        logging.error(f"Error fetching {ticker}: {e}")
        return None


async def fetch_stock_batch(tickers: List[str], period: str = "1y") -> Dict[str, Dict]:
    """
    Fetch data for a batch of stocks concurrently.
    
    Args:
        tickers: List of stock ticker symbols
        period: Historical data period
    
    Returns:
        Dictionary mapping tickers to their data
    """
    logging.info(f"Fetching batch of {len(tickers)} stocks...")
    
    # Create tasks for each stock
    tasks = [fetch_single_stock(ticker, period) for ticker in tickers]
    
    # Execute all tasks concurrently with some delay to avoid rate limiting
    results = []
    for i in range(0, len(tasks), 10):  # Process 10 at a time
        batch = tasks[i:i+10]
        batch_results = await asyncio.gather(*batch, return_exceptions=True)
        results.extend(batch_results)
        await asyncio.sleep(0.5)  # Small delay between batches
    
    # Build result dictionary
    data = {}
    for ticker, result in zip(tickers, results):
        if result and not isinstance(result, Exception):
            data[ticker] = result
    
    logging.info(f"Successfully fetched {len(data)}/{len(tickers)} stocks in batch")
    return data


async def fetch_stock_data_async(tickers: List[str], period: str = "1y") -> Dict[str, Dict]:
    """
    Main async function to fetch stock data with chunking and concurrency.
    
    Args:
        tickers: List of stock ticker symbols
        period: Historical data period
    
    Returns:
        Dictionary mapping tickers to their data
    """
    logging.info(f"Starting async fetch for {len(tickers)} stocks...")
    
    # Split into chunks of 10 for better concurrency control
    chunks = chunk_list(tickers, 10)
    
    # Process all chunks concurrently
    chunk_tasks = [fetch_stock_batch(chunk, period) for chunk in chunks]
    chunk_results = await asyncio.gather(*chunk_tasks)
    
    # Merge all results
    all_data = {}
    for chunk_data in chunk_results:
        all_data.update(chunk_data)
    
    logging.info(f"Completed async fetch: {len(all_data)}/{len(tickers)} stocks")
    return all_data


def fetch_stock_data(tickers: List[str], period: str = "1y") -> Dict[str, Dict]:
    """
    Synchronous wrapper for async stock fetching (backward compatible).
    
    Args:
        tickers: List of stock ticker symbols
        period: Historical data period
    
    Returns:
        Dictionary mapping tickers to their data
    """
    return asyncio.run(fetch_stock_data_async(tickers, period))


if __name__ == "__main__":
    # Test with a few stocks
    test_tickers = NIFTY_50_TICKERS[:5]
    data = fetch_stock_data(test_tickers)
    print(f"\nFetched {len(data)} stocks:")
    for ticker, stock_data in data.items():
        print(f"  {ticker}: {stock_data['name']} - ₹{stock_data['current_price']:.2f}")
