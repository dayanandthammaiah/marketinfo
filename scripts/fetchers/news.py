"""
Async news fetcher with parallel RSS feed parsing for diverse content.
"""
import feedparser
import logging
import asyncio
from datetime import datetime
from dateutil import parser as date_parser
from typing import List, Dict

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


async def fetch_single_feed(url: str, category: str, max_articles: int = 3) -> List[Dict]:
    """
    Fetch articles from a single RSS feed asynchronously.
    
    Args:
        url: RSS feed URL
        category: Category name
        max_articles: Maximum number of articles to fetch from this feed
    
    Returns:
        List of article dictionaries
    """
    articles = []
    try:
        # Run feedparser in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        feed = await loop.run_in_executor(None, feedparser.parse, url)
        
        count = 0
        for entry in feed.entries:
            if count >= max_articles:
                break
            
            title = entry.title.strip()
            
            # Skip very short titles
            if len(title) < 10:
                continue
            
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
                try:
                    published = date_parser.parse(entry.published).isoformat()
                except:
                    published = entry.published
            elif hasattr(entry, 'updated'):
                try:
                    published = date_parser.parse(entry.updated).isoformat()
                except:
                    published = entry.updated
            
            articles.append({
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
    
    return articles


async def fetch_category_feeds(category: str, urls: List[str], per_feed: int = 3) -> List[Dict]:
    """
    Fetch all feeds for a category in parallel.
    
    Args:
        category: Category name
        urls: List of RSS feed URLs
        per_feed: Maximum articles per feed
    
    Returns:
        List of all articles from this category
    """
    tasks = [fetch_single_feed(url, category, per_feed) for url in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Flatten results and filter out errors
    articles = []
    for result in results:
        if isinstance(result, list):
            articles.extend(result)
    
    return articles


async def fetch_news_async(limit: int = 50) -> List[Dict]:
    """
    Fetch news from all RSS feeds in parallel.
    
    Args:
        limit: Maximum total number of articles to return
    
    Returns:
        List of article dictionaries, sorted by published date
    """
    logging.info("Fetching news from multiple RSS feeds across diverse categories...")
    
    # Fetch all categories in parallel
    tasks = [fetch_category_feeds(cat, urls, per_feed=3) for cat, urls in RSS_FEEDS.items()]
    category_results = await asyncio.gather(*tasks)
    
    # Flatten all articles
    all_news = []
    seen_titles = set()
    
    for articles in category_results:
        for article in articles:
            title = article['title']
            # Skip duplicates
            if title not in seen_titles:
                seen_titles.add(title)
                all_news.append(article)
    
    # Sort by published date (newest first)
    try:
        all_news.sort(key=lambda x: x['published'], reverse=True)
    except:
        pass  # If sorting fails, use as-is
    
    logging.info(f"Fetched {len(all_news)} total news articles")
    return all_news[:limit]


def fetch_news(limit: int = 50) -> List[Dict]:
    """
    Synchronous wrapper for async news fetching (backward compatible).
    
    Args:
        limit: Maximum number of articles to return
    
    Returns:
        List of article dictionaries
    """
    return asyncio.run(fetch_news_async(limit))
