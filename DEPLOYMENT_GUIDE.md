# 🚀 Deployment Guide - InvestIQ

## Pre-Deployment Checklist

Before deploying, ensure all critical fixes are working:

- ✅ Theme toggle works in both light and dark modes
- ✅ Tab bar is centered on desktop
- ✅ Tables scroll horizontally on mobile
- ✅ All text is readable (proper contrast)
- ✅ Data generation completes in <2 minutes
- ✅ Color-coded metrics display correctly

---

## 1. Deploy to GitHub Pages (Fastest)

### Enable GitHub Pages

1. Push your code to GitHub:
```bash
git add .
git commit -m "feat: implement all UI/UX fixes and institutional analysis"
git push origin main
```

2. Go to your GitHub repository → **Settings** → **Pages**

3. Under "Build and deployment":
   - Source: **GitHub Actions**
   - The app will auto-deploy on every push

4. Access your app at: `https://[username].github.io/[repo-name]/`

### Workflow Status

Check `.github/workflows/fast-build.yml` status:
- Should complete in 5-10 minutes
- Generates `latest_data.json` automatically
- Builds and deploys the app

---

## 2. Build Android APK

### Prerequisites
- Android Studio installed
- Java JDK 17+
- Android SDK (API 33+)

### Build Steps

```bash
cd app

# 1. Install dependencies
npm install

# 2. Build the web app
npm run build

# 3. Sync with Capacitor
npx cap sync android

# 4. Open in Android Studio
npx cap open android
```

### In Android Studio

1. Wait for Gradle sync to complete
2. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. APK location: `app/android/app/build/outputs/apk/debug/app-debug.apk`

### For Release (Signed APK)

1. Generate keystore:
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Add to `app/android/gradle.properties`:
```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your_password
MYAPP_RELEASE_KEY_PASSWORD=your_password
```

3. Build release APK:
```bash
cd app/android
./gradlew assembleRelease
```

4. Release APK: `app/android/app/build/outputs/apk/release/app-release.apk`

---

## 3. Deploy to Vercel (Fast & Free)

### One-Click Deploy

```bash
cd app
npm install -g vercel
vercel
```

### Configure Build Settings

When prompted:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables (Optional)

If using paid APIs, add in Vercel dashboard:
- `VITE_NEWSAPI_KEY`: NewsAPI key
- `VITE_GNEWS_KEY`: GNews key
- `VITE_CMC_API_KEY`: CoinMarketCap key

---

## 4. Deploy to Netlify (Alternative)

### Via Git Integration

1. Connect your GitHub repo to Netlify
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `app/dist`
   - **Base directory**: `app`

### Via Netlify CLI

```bash
cd app
npm install -g netlify-cli
netlify deploy --prod
```

---

## 5. Deploy to Firebase Hosting

### Setup

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

### Configure

- **Public directory**: `app/dist`
- **Single-page app**: Yes
- **Automatic builds**: Yes (optional)

### Deploy

```bash
cd app
npm run build
firebase deploy --only hosting
```

---

## 6. Self-Hosted (VPS/Docker)

### Using Nginx

1. Build the app:
```bash
cd app
npm run build
```

2. Copy `app/dist/` to your server:
```bash
scp -r dist/* user@server:/var/www/investiq/
```

3. Nginx config (`/etc/nginx/sites-available/investiq`):
```nginx
server {
    listen 80;
    server_name investiq.yourdomain.com;
    root /var/www/investiq;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /latest_data.json {
        add_header Cache-Control "no-cache";
        expires 5m;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

4. Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/investiq /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Using Docker

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY app/package*.json ./
RUN npm ci
COPY app/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t investiq .
docker run -p 80:80 investiq
```

---

## 7. Automated Data Updates

### GitHub Actions (Recommended)

The workflow `.github/workflows/fast-build.yml` automatically:
1. Generates fresh market data every push
2. Builds the app
3. Deploys to GitHub Pages

### Scheduled Updates

For daily updates, the `daily-analysis.yml` workflow runs at:
- **6:00 AM IST** (00:30 UTC) daily
- Generates new data
- Updates the app

### Custom Backend (Optional)

For real-time updates, deploy `scripts/main_optimized.py` to:

**Railway.app** (Free tier):
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
cd scripts
railway init
railway up
```

**Render.com** (Free tier):
- Create a new Web Service
- Connect your GitHub repo
- Build command: `pip install -r scripts/requirements.txt`
- Start command: `python scripts/main_optimized.py`

**Cloudflare Workers** (For lightweight API):
- Convert Python logic to JavaScript
- Deploy as serverless function

---

## 8. iOS Build (Requires Mac)

### Prerequisites
- macOS with Xcode 15+
- Apple Developer Account ($99/year for App Store)

### Build Steps

```bash
cd app
npm run build
npx cap sync ios
npx cap open ios
```

### In Xcode

1. Select your development team
2. Update Bundle Identifier (e.g., `com.yourcompany.investiq`)
3. **Product** → **Archive**
4. Distribute to App Store or TestFlight

---

## 9. Progressive Web App (PWA)

The app is already PWA-ready! Features:

- ✅ Offline support via service worker (`app/public/sw.js`)
- ✅ App manifest (`app/public/manifest.json`)
- ✅ Install prompt on mobile browsers
- ✅ Works without internet (cached data)

### Test PWA

1. Deploy to HTTPS domain
2. Open in mobile browser (Chrome/Safari)
3. Tap "Add to Home Screen"
4. App installs like a native app

---

## 10. Performance Optimization

### Production Build Checklist

- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Enable HTTP/2
- [ ] Configure caching headers
- [ ] Minimize bundle size
- [ ] Enable lazy loading

### Cloudflare (Recommended)

1. Add your domain to Cloudflare (free plan)
2. Enable:
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - Rocket Loader
   - HTTP/3
3. Configure Page Rules:
   - Cache level: Standard
   - Browser TTL: 4 hours

---

## 11. Monitoring & Analytics

### Google Analytics (Optional)

Add to `app/index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Sentry Error Tracking (Optional)

```bash
cd app
npm install @sentry/react
```

Add to `app/src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
});
```

---

## 12. Security Best Practices

### Content Security Policy

Add to `app/index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.coingecko.com https://query1.finance.yahoo.com;">
```

### API Key Protection

**Never commit API keys!**

Use environment variables:
```bash
# .env.local (add to .gitignore)
VITE_NEWSAPI_KEY=your_key_here
```

Access in code:
```typescript
const apiKey = import.meta.env.VITE_NEWSAPI_KEY;
```

---

## 13. Post-Deployment Testing

### Checklist

- [ ] Test on real Android device
- [ ] Test on real iOS device (if applicable)
- [ ] Test theme toggle
- [ ] Test all tabs
- [ ] Test table scrolling on mobile
- [ ] Verify data freshness
- [ ] Check console for errors
- [ ] Test offline mode (PWA)
- [ ] Verify loading speed (<3s)

### Tools

- **Lighthouse**: Chrome DevTools → Lighthouse tab
  - Target: 90+ Performance, 100 Accessibility
- **Mobile Testing**: Use Chrome DevTools device emulation
- **Real Device Testing**: BrowserStack (paid) or your own devices

---

## 14. Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
cd app
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Android Build Fails

```bash
cd app/android
./gradlew clean
cd ..
npx cap sync android
```

### Data Not Loading

1. Check `app/public/latest_data.json` exists
2. Verify file size >1KB
3. Check browser console for CORS errors
4. Regenerate data: `python scripts/main_optimized.py`

---

## 🎯 Recommended Setup for Production

**Best combo for reliability and cost:**

1. **Frontend**: GitHub Pages (free) or Vercel (free)
2. **Data Generation**: GitHub Actions (free)
3. **CDN**: Cloudflare (free)
4. **Monitoring**: Sentry (free tier)
5. **Analytics**: Google Analytics (free)

**Total Cost: $0/month** 🎉

---

## 📞 Support

- Check `IMPLEMENTATION_SUMMARY.md` for technical details
- Review `README_QUICK_START.md` for local testing
- Create GitHub issue for deployment problems

**Your app is ready for production deployment!** 🚀
