import sys
import os
import json
import logging
from datetime import datetime
from fetchers.stocks import fetch_stock_data, NIFTY_50_TICKERS, US_TICKERS
from fetchers.crypto import fetch_crypto_data
from analysis.metrics import score_stock
# from analysis.report import generate_html_report, send_email # To be implemented

# Configure logging
logging.basicConfig(level=logging.INFO)

def main():
    logging.info("Starting Daily Analysis...")
    
    # 1. Fetch Data
    nifty_data = fetch_stock_data(NIFTY_50_TICKERS)
    us_data = fetch_stock_data(US_TICKERS)
    crypto_data = fetch_crypto_data()
    
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
    
    # 3. Generate JSON for App
    app_data = {
        "last_updated": datetime.now().isoformat(),
        "nifty_50": analyzed_nifty,
        "us_stocks": list(us_data.values()),
        "crypto": crypto_data
    }
    
    # Save JSON
    output_dir = os.path.join(os.path.dirname(__file__), '../app/public') # Save directly to app public folder for dev
    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, 'latest_data.json'), 'w') as f:
        json.dump(app_data, f, indent=2)
        
    logging.info("Data saved to app/public/latest_data.json")
    
    # 4. Generate HTML & Send Email
    from analysis.report import generate_html_report
    from send_email import send_email
    
    html = generate_html_report(app_data)
    send_email(html)

if __name__ == "__main__":
    main()
