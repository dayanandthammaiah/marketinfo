import feedparser
import logging
from datetime import datetime

RSS_FEEDS = {
    "Global": "http://feeds.bbci.co.uk/news/world/rss.xml",
    "Technology": "http://feeds.bbci.co.uk/news/technology/rss.xml",
    "Business": "http://feeds.bbci.co.uk/news/business/rss.xml",
    "Science": "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    "Crypto": "https://cointelegraph.com/rss"
}

def fetch_news():
    logging.info("Fetching news from RSS feeds...")
    all_news = []
    
    for category, url in RSS_FEEDS.items():
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:5]: # Top 5 per category
                all_news.append({
                    "title": entry.title,
                    "link": entry.link,
                    "source": feed.feed.title if 'title' in feed.feed else category,
                    "published": entry.published if 'published' in entry else datetime.now().isoformat(),
                    "summary": entry.summary if 'summary' in entry else "",
                    "category": category
                })
        except Exception as e:
            logging.error(f"Error fetching {category} news: {e}")
            
    return all_news
