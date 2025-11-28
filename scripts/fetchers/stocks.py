import yfinance as yf
import pandas as pd
import logging

# Configure logging
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

def fetch_stock_data(tickers, period="1y"):
    """
    Fetches historical data and fundamentals for a list of tickers.
    """
    logging.info(f"Fetching data for {len(tickers)} tickers...")
    data = {}
    
    # Batch fetch price data
    try:
        prices = yf.download(tickers, period=period, group_by='ticker', auto_adjust=True, threads=True)
    except Exception as e:
        logging.error(f"Error fetching price data: {e}")
        return {}

    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            
            # Get historical data for this ticker
            hist = prices[ticker] if len(tickers) > 1 else prices
            
            # Basic Fundamental Data
            hist_data = [{"time": d.strftime('%Y-%m-%d'), "value": float(c)} for d, c in zip(hist.index[-90:], hist['Close'][-90:])] if not hist.empty else []
            
            data[ticker] = {
                "name": str(info.get("shortName", ticker)),
                "sector": str(info.get("sector", "Unknown")),
                "industry": str(info.get("industry", "Unknown")),
                "current_price": float(info.get("currentPrice", hist['Close'].iloc[-1] if not hist.empty else 0)),
                "market_cap": int(info.get("marketCap", 0) or 0),
                "pe_ratio": float(info.get("trailingPE", 0) or 0),
                "forward_pe": float(info.get("forwardPE", 0) or 0),
                "peg_ratio": float(info.get("pegRatio", 0) or 0),
                "price_to_book": float(info.get("priceToBook", 0) or 0),
                "roce": float(info.get("returnOnEquity", 0) or 0),
                "eps_growth": float(info.get("earningsGrowth", 0) or 0),
                "debt_to_equity": float(info.get("debtToEquity", 0) or 0),
                "free_cashflow": float(info.get("freeCashflow", 0) or 0),
                "operating_margins": float(info.get("operatingMargins", 0) or 0),
                "ideal_range": f"₹{info.get('targetMeanPrice', 0)}",
                "history": hist_data
            }
        except Exception as e:
            logging.error(f"Error processing {ticker}: {e}")
            
    return data

if __name__ == "__main__":
    data = fetch_stock_data(NIFTY_50_TICKERS[:5]) # Test with 5
    print(f"Fetched {len(data)} stocks.")
