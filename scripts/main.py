import sys
import os
import json
import logging
import math
from datetime import datetime
from fetchers.stocks import fetch_stock_data, NIFTY_50_TICKERS, US_TICKERS
from fetchers.crypto import fetch_crypto_data
from fetchers.news import fetch_news
from analysis.metrics import score_stock

# Configure logging
logging.basicConfig(level=logging.INFO)

def sanitize_for_json(obj):
    """
    Recursively sanitize data to remove NaN and Infinity values that break JSON.
    Replaces NaN/Infinity with None (null in JSON).
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

def main():
    logging.info("Starting Daily Analysis...")
    
    # 1. Fetch Data
    nifty_data = fetch_stock_data(NIFTY_50_TICKERS)
    us_data = fetch_stock_data(US_TICKERS)
    crypto_data = fetch_crypto_data()
    news_data = fetch_news()
    
    # 2. Analyze & Score
    analyzed_nifty = []
    for ticker, data in nifty_data.items():
        score, rec, reasons = score_stock(data)
        data['score'] = score
        data['recommendation'] = rec
        data['reasons'] = reasons
        analyzed_nifty.append(data)
        
    # Sort by score
    analyzed_nifty.sort(key=lambda x: x['score'], reverse=True)
    
    # Same for US stocks
    analyzed_us = []
    for ticker, data in us_data.items():
        score, rec, reasons = score_stock(data)
        data['score'] = score
        data['recommendation'] = rec
        data['reasons'] = reasons
        analyzed_us.append(data)
    analyzed_us.sort(key=lambda x: x['score'], reverse=True)
    
    # 3. Generate JSON for App
    app_data = {
        "last_updated": datetime.now().isoformat(),
        "nifty_50": analyzed_nifty,
        "us_stocks": analyzed_us,
        "crypto": crypto_data,
        "news": news_data
    }
    
    # Sanitize data to remove NaN/Infinity values
    app_data = sanitize_for_json(app_data)
    
    # Save JSON
    output_dir = os.path.join(os.path.dirname(__file__), '../app/public')
    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, 'latest_data.json'), 'w') as f:
        json.dump(app_data, f, indent=2)
        
    logging.info(f"Data saved to app/public/latest_data.json")
    logging.info(f"  - {len(analyzed_nifty)} India stocks")
    logging.info(f"  - {len(analyzed_us)} US stocks")
    logging.info(f"  - {len(crypto_data)} crypto assets")
    logging.info(f"  - {len(news_data)} news articles")
    
    # 4. Generate HTML & Send Email
    try:
        from analysis.report import generate_html_report
        from send_email import send_email
        
        html = generate_html_report(app_data)
        send_email(html)
        logging.info("Email report sent successfully")
    except Exception as e:
        logging.warning(f"Email sending skipped: {e}")

if __name__ == "__main__":
    main()

