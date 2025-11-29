# InvestIQ Setup Guide - Get Your Free API Keys

The app now uses real-time data from multiple free sources. Follow these simple steps to get your API keys (all 100% free, no credit card required):

## Quick Setup (15 minutes)

### 1. Stock Data APIs

#### Finnhub (Recommended, 60 calls/minute)
1. Go to: https://finnhub.io/register
2. Sign up with Google/GitHub or email
3. Copy your API key
4. **Paste in `.env.local`**: `VITE_FINNHUB_API_KEY=your_key_here`

#### Alpha Vantage (Backup, 5 calls/minute)
1. Go to: https://www.alphavantage.co/support/#api-key
2. Enter your email, click "GET FREE API KEY"
3. Check your email for the key
4. **Paste in `.env.local`**: `VITE_ALPHA_VANTAGE_API_KEY=your_key_here`

### 2. News APIs

#### NewsAPI (Recommended, 100 requests/day)
1. Go to: https://newsapi.org/register
2. Sign up with email
3. Copy your API key from dashboard
4. **Paste in `.env.local`**: `VITE_NEWSAPI_KEY=your_key_here`

#### GNews (Backup, 100 requests/day)
1. Go to: https://gnews.io/register
2. Create account
3. Copy API token
4. **Paste in `.env.local`**: `VITE_GNEWS_API_KEY=your_key_here`

#### Currents API (Backup, 600 requests/day)
1. Go to: https://currentsapi.services/en/register
2. Sign up and verify email
3. Copy API key
4. **Paste in `.env.local`**: `VITE_CURRENTS_API_KEY=your_key_here`

## Configure Your App

### Create `.env.local` file

1. Navigate to `i:\dailyalertsstocks\app\`
2. Create a new file named `.env.local` (exactly)
3. Paste this template:

```env
# Stock Data APIs
VITE_FINNHUB_API_KEY=pk_your_finnhub_key_here
VITE_ALPHA_VANTAGE_API_KEY=your_alphavantage_key_here

# News APIs
VITE_NEWSAPI_KEY=your_newsapi_key_here
VITE_GNEWS_API_KEY=your_gnews_key_here
VITE_CURRENTS_API_KEY=your_currents_key_here
```

4. Replace each `your_key_here` with the actual API keys you got
5. Save the file

## Run the App

```bash
cd i:\dailyalertsstocks\app
npm run dev
```

Open http://localhost:5173 in your browser!

## Important Notes

- **Minimum Required**: None! The app works without any keys using Yahoo Finance + RSS feeds
- **Recommended**: Finnhub + NewsAPI (best data quality)
- **Full Experience**: All 5 keys for maximum reliability

## Fallback Behavior

Even without API keys, the app will still work using:
- Yahoo Finance (stocks - no auth required)
- RSS feeds (news - Bloomberg, Reuters, Yahoo)
- CoinGecko (crypto - basic tier, no auth)

Adding API keys improves:
- Data freshness
- Request limits
- Additional features

## Troubleshooting

### "API key not configured"
- Solution: Add the key to `.env.local` and restart dev server

### "CORS error"
- Solution: The app automatically falls back to other sources

### "Rate limit exceeded"
- Solution: Wait 1 minute or app will use fallback source

## Deploy to Vercel (Optional)

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard (same as `.env.local`)
4. Deploy: `vercel --prod`

You'll get a public URL like: `https://investiq.vercel.app`
