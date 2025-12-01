"""
Enhanced News Fetcher using only free/open-source APIs
Sources: NewsAPI (free tier), GNews, RSS feeds from major outlets
"""
import requests
import feedparser
import logging
from datetime import datetime, timedelta
import os

logger = logging.getLogger(__name__)

# Free tier API keys (can be set as environment variables)
NEWSAPI_KEY = os.getenv('NEWSAPI_KEY', '')  # newsapi.org - free 100 requests/day
GNEWS_KEY = os.getenv('GNEWS_KEY', '')  # gnews.io - free 100 requests/day

# Free RSS feeds (no API key needed)
RSS_FEEDS = {
    'World Markets': [
        'https://feeds.bloomberg.com/markets/news.rss',
        'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    ],
    'Technology': [
        'https://techcrunch.com/feed/',
        'https://www.theverge.com/rss/index.xml',
    ],
    'AI': [
        'https://feeds.feedburner.com/venturebeat/SZYF',  # AI news
    ],
    'Cryptocurrency': [
        'https://cointelegraph.com/rss',
        'https://www.coindesk.com/arc/outboundfeeds/rss/',
    ],
    'Business': [
        'https://feeds.reuters.com/reuters/businessNews',
        'https://www.forbes.com/business/feed/',
    ],
    'India Markets': [
        'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
        'https://www.business-standard.com/rss/markets-106.rss',
    ],
    'Science': [
        'https://www.sciencedaily.com/rss/top/science.xml',
    ],
    'Entertainment': [
        'https://variety.com/feed/',
    ]
}

def fetch_from_rss(feed_url, category):
    """Fetch news from RSS feed"""
    try:
        feed = feedparser.parse(feed_url)
        articles = []
        
        for entry in feed.entries[:10]:  # Limit to 10 per feed
            try:
                # Parse published date
                published = entry.get('published', entry.get('updated', ''))
                if published:
                    try:
                        pub_date = datetime(*entry.published_parsed[:6])
                        published = pub_date.isoformat()
                    except:
                        published = datetime.now().isoformat()
                else:
                    published = datetime.now().isoformat()
                
                # Get image
                image = None
                if hasattr(entry, 'media_content') and entry.media_content:
                    image = entry.media_content[0].get('url')
                elif hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
                    image = entry.media_thumbnail[0].get('url')
                elif hasattr(entry, 'enclosures') and entry.enclosures:
                    image = entry.enclosures[0].get('href')
                
                # Fallback images
                if not image:
                    category_images = {
                        'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
                        'AI': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
                        'Cryptocurrency': 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
                        'World Markets': 'https://images.unsplash.com/photo-1611974765270-ca1258634369?w=800',
                        'Business': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
                        'India Markets': 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800',
                        'Science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
                        'Entertainment': 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800',
                    }
                    image = category_images.get(category, 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800')
                
                article = {
                    'title': entry.get('title', 'No Title'),
                    'link': entry.get('link', '#'),
                    'source': feed.feed.get('title', 'Unknown'),
                    'published': published,
                    'summary': entry.get('summary', entry.get('description', ''))[:200],
                    'category': category,
                    'image': image
                }
                articles.append(article)
            except Exception as e:
                logger.warning(f"Error parsing RSS entry: {e}")
                continue
        
        return articles
    except Exception as e:
        logger.warning(f"Error fetching RSS feed {feed_url}: {e}")
        return []

def fetch_from_newsapi(query, category):
    """Fetch news from NewsAPI.org (free tier)"""
    if not NEWSAPI_KEY:
        return []
    
    try:
        url = "https://newsapi.org/v2/everything"
        params = {
            'q': query,
            'apiKey': NEWSAPI_KEY,
            'language': 'en',
            'sortBy': 'publishedAt',
            'pageSize': 10
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            articles = []
            
            for item in data.get('articles', []):
                article = {
                    'title': item.get('title', 'No Title'),
                    'link': item.get('url', '#'),
                    'source': item.get('source', {}).get('name', 'Unknown'),
                    'published': item.get('publishedAt', datetime.now().isoformat()),
                    'summary': item.get('description', '')[:200],
                    'category': category,
                    'image': item.get('urlToImage', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800')
                }
                articles.append(article)
            
            return articles
    except Exception as e:
        logger.warning(f"Error fetching from NewsAPI: {e}")
    
    return []

def fetch_from_gnews(query, category):
    """Fetch news from GNews.io (free tier)"""
    if not GNEWS_KEY:
        return []
    
    try:
        url = "https://gnews.io/api/v4/search"
        params = {
            'q': query,
            'token': GNEWS_KEY,
            'lang': 'en',
            'max': 10
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            articles = []
            
            for item in data.get('articles', []):
                article = {
                    'title': item.get('title', 'No Title'),
                    'link': item.get('url', '#'),
                    'source': item.get('source', {}).get('name', 'Unknown'),
                    'published': item.get('publishedAt', datetime.now().isoformat()),
                    'summary': item.get('description', '')[:200],
                    'category': category,
                    'image': item.get('image', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800')
                }
                articles.append(article)
            
            return articles
    except Exception as e:
        logger.warning(f"Error fetching from GNews: {e}")
    
    return []

def fetch_news():
    """Main function to fetch news from all sources"""
    logger.info("Fetching news from multiple sources...")
    all_articles = []
    
    # Fetch from RSS feeds (free, no API key needed)
    for category, feeds in RSS_FEEDS.items():
        for feed_url in feeds:
            articles = fetch_from_rss(feed_url, category)
            all_articles.extend(articles)
            logger.info(f"✓ {category}: {len(articles)} articles from RSS")
    
    # Optionally fetch from NewsAPI if key is available
    if NEWSAPI_KEY:
        api_queries = {
            'AI': 'artificial intelligence OR machine learning',
            'Cryptocurrency': 'bitcoin OR ethereum OR cryptocurrency',
            'Technology': 'technology OR tech',
        }
        for category, query in api_queries.items():
            articles = fetch_from_newsapi(query, category)
            all_articles.extend(articles)
            logger.info(f"✓ {category}: {len(articles)} articles from NewsAPI")
    
    # Sort by published date (most recent first)
    all_articles.sort(key=lambda x: x['published'], reverse=True)
    
    # Remove duplicates by title
    seen_titles = set()
    unique_articles = []
    for article in all_articles:
        title_lower = article['title'].lower()
        if title_lower not in seen_titles:
            seen_titles.add(title_lower)
            unique_articles.append(article)
    
    logger.info(f"Total unique articles: {len(unique_articles)}")
    return unique_articles[:100]  # Limit to 100 most recent

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    news = fetch_news()
    print(f"Fetched {len(news)} news articles")
    for article in news[:5]:
        print(f"  - {article['category']}: {article['title']}")
