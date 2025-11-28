import feedparser
import logging
from datetime import datetime
import time

RSS_FEEDS = {
    "Global": [
        "http://feeds.bbci.co.uk/news/world/rss.xml",
        "https://www.aljazeera.com/xml/rss/all.xml"
    ],
    "Finance": [
        "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664",
        "https://feeds.reuters.com/reuters/businessNews"
    ],
    "Technology": [
        "http://feeds.bbci.co.uk/news/technology/rss.xml",
        "https://techcrunch.com/feed/"
    ],
    "Crypto": [
        "https://cointelegraph.com/rss",
        "https://www.coindesk.com/arc/outboundfeeds/rss/"
    ],
    "Science": [
        "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml"
    ]
}

def fetch_news(limit=30):
    logging.info("Fetching news from multiple RSS feeds...")
    all_news = []
    seen_titles = set()
    
    for category, urls in RSS_FEEDS.items():
        for url in urls:
            try:
                feed = feedparser.parse(url)
                count = 0
                for entry in feed.entries:
                    if count >= 5: break # Max 5 per feed
                    
                    title = entry.title
                    if title in seen_titles: continue
                    seen_titles.add(title)
                    
                    # Extract image if available
                    image = None
                    if 'media_content' in entry:
                        image = entry.media_content[0]['url']
                    elif 'media_thumbnail' in entry:
                        image = entry.media_thumbnail[0]['url']
                    
                    all_news.append({
                        "title": title,
                        "link": entry.link,
                        "source": feed.feed.title if 'title' in feed.feed else category,
                        "published": entry.published if 'published' in entry else datetime.now().isoformat(),
                        "summary": entry.summary if 'summary' in entry else "",
                        "category": category,
                        "image": image
                    })
                    count += 1
            except Exception as e:
                logging.error(f"Error fetching {url}: {e}")
                
    # Sort by published date (simple string sort might not be perfect but works for ISO/similar formats often found in RSS)
    # Better to just return mixed list or sort if we parse dates. 
    # For now, we'll shuffle or just return as is, frontend can sort if needed.
    
    return all_news[:limit]
