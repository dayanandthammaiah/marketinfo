import feedparser
import logging
from datetime import datetime
import time

RSS_FEEDS = {
    "Markets": [
        "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664",  # CNBC Business
        "https://feeds.reuters.com/reuters/businessNews",  # Reuters Business
        "https://feeds.reuters.com/reuters/companyNews",  # Reuters Companies
        "https://www.marketwatch.com/rss/topstories",  # MarketWatch
    ],
    "Economy": [
        "https://www.thehindubusinessline.com/economy/?service=rss",  # Hindu Business Line Economy
        "https://economictimes.indiatimes.com/rssfeedstopstories.cms",  # Economic Times
        "https://feeds.reuters.com/reuters/INbusinessNews",  # Reuters India Business
    ],
    "Technology": [
        "http://feeds.bbci.co.uk/news/technology/rss.xml",  # BBC Tech
        "https://techcrunch.com/feed/",  # TechCrunch
        "https://www.theverge.com/rss/index.xml",  # The Verge
        "https://www.wired.com/feed/rss",  # Wired
    ],
    "Crypto": [
        "https://cointelegraph.com/rss",  # CoinTelegraph
        "https://www.coindesk.com/arc/outboundfeeds/rss/",  # CoinDesk
        "https://decrypt.co/feed",  # Decrypt
    ],
    "Science": [
        "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml",  # BBC Science
        "https://www.sciencedaily.com/rss/top.xml",  # Science Daily
    ],
    "Business": [
        "http://feeds.bbci.co.uk/news/business/rss.xml",  # BBC Business
        "https://feeds.reuters.com/reuters/businessNews",  # Reuters
        "https://feeds.bloomberg.com/markets/news.rss",  # Bloomberg (if available)
    ],
    "Entertainment": [
        "http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",  # BBC Entertainment
        "https://variety.com/feed/",  # Variety
    ],
    "Sports": [
        "http://feeds.bbci.co.uk/sport/rss.xml",  # BBC Sport
        "https://www.espn.com/espn/rss/news",  # ESPN
    ],
    "World": [
        "http://feeds.bbci.co.uk/news/world/rss.xml",  # BBC World
        "https://www.aljazeera.com/xml/rss/all.xml",  # Al Jazeera
        "https://feeds.reuters.com/reuters/worldNews",  # Reuters World
        "https://www.theguardian.com/world/rss",  # The Guardian World
    ],
    "Politics": [
        "http://feeds.bbci.co.uk/news/politics/rss.xml",  # BBC Politics
        "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",  # NY Times Politics
    ]
}

def fetch_news(limit=30):
    logging.info("Fetching news from multiple RSS feeds across diverse categories...")
    all_news = []
    seen_titles = set()
    
    for category, urls in RSS_FEEDS.items():
        for url in urls:
            try:
                feed = feedparser.parse(url)
                count = 0
                for entry in feed.entries:
                    if count >= 3:  # Max 3 per feed to ensure diversity
                        break
                    
                    title = entry.title.strip()
                    # Skip duplicates or very similar titles
                    if title in seen_titles or len(title) < 10:
                        continue
                    seen_titles.add(title)
                    
                    # Extract image if available
                    image = None
                    if hasattr(entry, 'media_content') and entry.media_content:
                        image = entry.media_content[0].get('url')
                    elif hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
                        image = entry.media_thumbnail[0].get('url')
                    elif hasattr(entry, 'enclosures') and entry.enclosures:
                        for enc in entry.enclosures:
                            if 'image' in enc.get('type', ''):
                                image = enc.get('href')
                                break
                    
                    # Extract summary
                    summary = ""
                    if hasattr(entry, 'summary'):
                        summary = entry.summary[:200]  # Limit length
                    elif hasattr(entry, 'description'):
                        summary = entry.description[:200]
                    
                    # Parse published date
                    published = datetime.now().isoformat()
                    if hasattr(entry, 'published'):
                        published = entry.published
                    elif hasattr(entry, 'updated'):
                        published = entry.updated
                    
                    all_news.append({
                        "title": title,
                        "link": entry.link,
                        "source": feed.feed.get('title', category) if hasattr(feed, 'feed') else category,
                        "published": published,
                        "summary": summary,
                        "category": category,
                        "image": image
                    })
                    count += 1
                    
            except Exception as e:
                logging.error(f"Error fetching {url} in {category}: {e}")
                continue
    
    # Sort by published date (newest first) - simplified string sort
    # Better parsing could be done with dateutil but keeping dependencies minimal
    try:
        all_news.sort(key=lambda x: x['published'], reverse=True)
    except:
        pass  # If sorting fails, just use as-is
    
    logging.info(f"Fetched {len(all_news)} total news articles")
    return all_news[:limit]

