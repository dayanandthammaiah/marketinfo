/**
 * News Data Service
 * Fetches real-time financial news from multiple sources with fallback
 */

import type { NewsItem } from '../types';
import { fetchWithFallback, fetchWithTimeout, safeJsonParse, parseRSSFeed, rateLimiter, type DataSource } from '../utils/apiHelpers';

// API Keys from environment
const NEWSAPI_KEY = import.meta.env.VITE_NEWSAPI_KEY || '';
const GNEWS_KEY = import.meta.env.VITE_GNEWS_API_KEY || '';
const CURRENTS_KEY = import.meta.env.VITE_CURRENTS_API_KEY || '';

/**
 * Fetch news from NewsAPI.org
 */
async function fetchNewsAPI(): Promise<NewsItem[]> {
    if (!NEWSAPI_KEY) throw new Error('NewsAPI key not configured');

    await rateLimiter.waitForSlot('newsapi', 100, 86400000); // 100 calls/day

    const url = `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=20&apiKey=${NEWSAPI_KEY}`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) throw new Error(`NewsAPI error: ${response.status}`);
    const data = await safeJsonParse<any>(response);

    if (!data?.articles) throw new Error('No articles in response');

    return data.articles.map((article: any) => ({
        title: article.title || 'Untitled',
        link: article.url || '#',
        source: article.source?.name || 'Unknown',
        published: article.publishedAt || new Date().toISOString(),
        summary: article.description || article.content || '',
        category: 'Business',
        image: article.urlToImage || '',
    }));
}

/**
 * Fetch news from GNews API
 */
async function fetchGNews(): Promise<NewsItem[]> {
    if (!GNEWS_KEY) throw new Error('GNews API key not configured');

    await rateLimiter.waitForSlot('gnews', 100, 86400000); // 100 calls/day

    const url = `https://gnews.io/api/v4/top-headlines?category=business&lang=en&max=20&apikey=${GNEWS_KEY}`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) throw new Error(`GNews error: ${response.status}`);
    const data = await safeJsonParse<any>(response);

    if (!data?.articles) throw new Error('No articles in response');

    return data.articles.map((article: any) => ({
        title: article.title || 'Untitled',
        link: article.url || '#',
        source: article.source?.name || 'Unknown',
        published: article.publishedAt || new Date().toISOString(),
        summary: article.description || '',
        category: 'Business',
        image: article.image || '',
    }));
}

/**
 * Fetch news from Currents API
 */
async function fetchCurrentsAPI(): Promise<NewsItem[]> {
    if (!CURRENTS_KEY) throw new Error('Currents API key not configured');

    await rateLimiter.waitForSlot('currents', 600, 86400000); // 600 calls/day

    const url = `https://api.currentsapi.services/v1/latest-news?category=business&language=en&apiKey=${CURRENTS_KEY}`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) throw new Error(`Currents error: ${response.status}`);
    const data = await safeJsonParse<any>(response);

    if (!data?.news) throw new Error('No news in response');

    return data.news.map((article: any) => ({
        title: article.title || 'Untitled',
        link: article.url || '#',
        source: article.author || 'Unknown',
        published: article.published || new Date().toISOString(),
        summary: article.description || '',
        category: article.category?.[0] || 'Business',
        image: article.image || '',
    }));
}

/**
 * Fetch news from RSS feeds (fallback, no API key required)
 */
async function fetchRSSNews(): Promise<NewsItem[]> {
    const feeds = [
        'https://feeds.bloomberg.com/markets/news.rss',
        'https://www.reuters.com/rssFeed/businessNews',
        'https://finance.yahoo.com/news/rssindex',
    ];

    const results = await Promise.allSettled(
        feeds.map(feed => parseRSSFeed(feed))
    );

    const allNews: NewsItem[] = [];

    for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
            const items = result.value.map((item: any) => ({
                title: item.title || 'Untitled',
                link: item.link || '#',
                source: item.source || 'RSS Feed',
                published: item.pubDate || new Date().toISOString(),
                summary: item.description || '',
                category: 'Business',
                image: '', // RSS feeds typically don't have images
            }));
            allNews.push(...items);
        }
    }

    // Return top 20 most recent
    return allNews
        .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
        .slice(0, 20);
}

/**
 * Fetch from Bing News (no API key, public endpoint)
 */
async function fetchBingNews(): Promise<NewsItem[]> {
    // Bing News Search public endpoint (limited, but works without auth)
    const url = 'https://www.bing.com/news/search?q=financial+markets&format=rss';

    try {
        const items = await parseRSSFeed(url);
        return items.slice(0, 20).map((item: any) => ({
            title: item.title || 'Untitled',
            link: item.link || '#',
            source: 'Bing News',
            published: item.pubDate || new Date().toISOString(),
            summary: item.description || '',
            category: 'Business',
            image: '',
        }));
    } catch (error) {
        throw new Error('Bing News fetch failed');
    }
}

/**
 * Fetch news with multiple fallback sources
 */
export async function fetchNewsData(): Promise<NewsItem[]> {
    const sources: DataSource<NewsItem[]>[] = []; // Fix: initialize as array

    // Add sources based on available API keys
    if (NEWSAPI_KEY) {
        sources.push({
            name: 'NewsAPI',
            priority: 1,
            fetch: fetchNewsAPI,
        });
    }

    if (GNEWS_KEY) {
        sources.push({
            name: 'GNews',
            priority: 2,
            fetch: fetchGNews,
        });
    }

    if (CURRENTS_KEY) {
        sources.push({
            name: 'Currents API',
            priority: 3,
            fetch: fetchCurrentsAPI,
        });
    }

    // Always add RSS feeds as fallback (no auth required)
    sources.push({
        name: 'RSS Feeds',
        priority: 4,
        fetch: fetchRSSNews,
    });

    sources.push({
        name: 'Bing News',
        priority: 5,
        fetch: fetchBingNews,
    });

    const cacheKey = 'news-data';
    const news = await fetchWithFallback(sources, cacheKey, 300000); // 5 min cache

    return news;
}
