# Local Testing Guide

This guide explains how to run the app locally for design approval and testing.

## Prerequisites

- **Node.js 20+** ([Download](https://nodejs.org/))
- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Android Studio** (optional, for Android testing)

---

## Quick Start - Web Browser (Fastest)

### 1. Generate Market Data

```bash
cd scripts
pip install -r requirements.txt
python main_optimized.py
```

This will generate `app/public/latest_data.json` in under 2 minutes.

### 2. Run Web App

```bash
cd app
npm install
npm run dev
```

Open browser at: **http://localhost:5173**

### 3. Test Theme Toggle

- Click the **sun/moon icon** in the top right
- Verify text is readable in both light and dark modes
- All tables, cards, and UI elements should have proper contrast

### 4. Test Tab Bar

- Click through **India**, **US**, **Crypto**, **News**, **Portfolio** tabs
- Tabs should be centered and evenly spaced on desktop
- Bottom navigation should work smoothly on mobile (resize browser to <768px width)

### 5. Test Table Scrolling

- On mobile width, swipe tables left/right to see all columns
- Tables should scroll horizontally without cutting off data
- First column (Stock/Asset name) should remain visible when scrolling

---

## Testing on Android

### Option 1: Android Studio Emulator

```bash
cd app
npm install
npm run build
npx cap sync android
npx cap open android
```

Then click **Run** in Android Studio.

### Option 2: Physical Device (USB Debugging)

1. Enable Developer Options on your Android phone
2. Enable USB Debugging
3. Connect via USB
4. Run:

```bash
cd app
npm run build
npx cap sync android
npx cap run android
```

---

## Design Checklist

### ✅ Theme Toggle
- [ ] Light mode: Dark text on light backgrounds (readable)
- [ ] Dark mode: Light text on dark backgrounds (readable)
- [ ] Smooth transition animation
- [ ] Theme persists after refresh

### ✅ Tab Bar
- [ ] Desktop: Centered, evenly spaced tabs
- [ ] Active tab has colored indicator
- [ ] Icons scale up on active tab
- [ ] Mobile: Bottom navigation bar works

### ✅ Tables
- [ ] Horizontal scroll works on mobile
- [ ] All columns visible when scrolling
- [ ] Zebra striping for readability
- [ ] Color-coded metrics (green/yellow/red)

### ✅ Data Display
- [ ] Stock prices show ROCE, EPS Growth, FCF Yield, etc.
- [ ] Crypto shows RSI, MACD, ADX indicators
- [ ] News cards have images and categories
- [ ] All data loads within 5 seconds

### ✅ Performance
- [ ] Smooth 60 FPS scrolling
- [ ] No layout shifts
- [ ] Fast tab switching
- [ ] Pull-to-refresh works

---

## Build for Production

### Web (PWA)

```bash
cd app
npm run build
```

Output in `app/dist/` - ready to deploy to any static host.

### Android APK

```bash
cd app
npm run build
npx cap sync android
npx cap open android
```

In Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**

APK location: `app/android/app/build/outputs/apk/debug/app-debug.apk`

---

## Troubleshooting

### "latest_data.json not found"

Generate it first:
```bash
cd scripts
python main_optimized.py
```

### "Module not found" errors

Reinstall dependencies:
```bash
cd app
rm -rf node_modules package-lock.json
npm install
```

### Android build fails

Sync Capacitor:
```bash
cd app
npx cap sync android
```

### Tables not scrolling

Clear browser cache and refresh:
- Chrome: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
- Then refresh with Ctrl+F5

---

## API Rate Limits (Free Tier)

All data sources are **100% free and open-source**:

- **yfinance** (stocks): Unlimited, no API key
- **CoinGecko** (crypto): 10-50 calls/minute, no API key
- **RSS Feeds** (news): Unlimited, no API key

Optional (if you have API keys):
- **NewsAPI.org**: 100 requests/day (free tier)
- **GNews.io**: 100 requests/day (free tier)

Set as environment variables:
```bash
export NEWSAPI_KEY="your_key_here"
export GNEWS_KEY="your_key_here"
```

---

## Next Steps

After testing locally:

1. **Approve Design**: Verify all UI/UX fixes are working
2. **Test Performance**: Check loading times and smoothness
3. **Deploy**: Push to GitHub to trigger automatic build
4. **Download APK**: Get the built APK from GitHub Actions artifacts

---

## Contact & Support

For issues or questions, create an issue on GitHub or check the main README.md.

**Target Performance:**
- ✅ Data generation: < 2 minutes
- ✅ App load time: < 3 seconds
- ✅ Theme switch: < 300ms
- ✅ Tab switch: < 200ms
- ✅ Table scroll: 60 FPS
