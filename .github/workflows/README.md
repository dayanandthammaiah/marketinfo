# GitHub Workflows

This directory contains optimized GitHub Actions workflows for the InvestIQ project.

## Active Workflows

### 1. Daily Market Reports (`daily-reports.yml`)

**Purpose**: Fetch market data and email institutional analysis reports

**Schedule**: Daily at 6:00 AM IST (00:30 UTC)

**What it does**:
1. Fetches India Nifty 50 stocks data
2. Fetches top 20 US stocks data  
3. Fetches top 20 cryptocurrencies
4. Generates institutional analysis report
5. Sends HTML email with analysis
6. Uploads report as artifact (backup)

**Runtime**: ~5-10 minutes

**Required Secrets**:
- `EMAIL_USER` - Gmail address for sending reports
- `GMAIL_APP_PASSWORD` - Gmail app password (not regular password)

**Manual Trigger**: Available via "Run workflow" button

**Artifacts**: Market report JSON and HTML (7 days retention)

---

### 2. Build Apps (`build-apps.yml`)

**Purpose**: Build Web, Android, and iOS apps (unsigned)

**Triggers**: 
- Push to `main` branch (when `app/**` changes)
- Manual workflow dispatch

**What it does**:
1. **Web Build**: Builds production-ready web app (Vite)
2. **Android Build**: Builds unsigned debug APK
3. **iOS Build**: Builds unsigned simulator app (.zip)
4. Uploads all artifacts
5. Generates build summary

**Runtime**: 
- Web: ~3-5 minutes
- Android: ~5-8 minutes  
- iOS: ~10-15 minutes
- **Total (parallel)**: ~10-15 minutes

**Artifacts** (30 days retention):
- `InvestIQ-Web-{run_number}` - Production web build
- `InvestIQ-Android-{run_number}` - Debug APK
- `InvestIQ-iOS-{run_number}` - Simulator .zip

**Manual Trigger**: Available via "Run workflow" button

---

## Performance Optimizations Applied

✅ **Caching**:
- npm dependencies (`node_modules`)
- Python pip packages
- Gradle dependencies
- CocoaPods
- Web build artifacts (reused for Android/iOS)

✅ **Parallel Execution**:
- Android and iOS builds run in parallel after web build
- Independent steps run concurrently

✅ **Efficient Dependencies**:
- `npm ci --prefer-offline --no-audit` for faster installs
- Python pip cache for scripts
- Gradle build cache enabled

✅ **Timeouts**:
- Each job has timeout to prevent stuck builds
- Web: 10min, Android: 15min, iOS: 20min

✅ **Concurrency Control**:
- Cancel in-progress runs when new push happens
- Prevents wasted resources

## Setup Instructions

### 1. Email Reports Setup

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

1. **EMAIL_USER**: Your Gmail address
   ```
   example@gmail.com
   ```

2. **GMAIL_APP_PASSWORD**: Generate an app password
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and device type
   - Copy the 16-character password
   ```
   abcd efgh ijkl mnop
   ```

### 2. Test Workflows

**Test Daily Reports**:
1. Go to Actions tab
2. Select "Daily Market Reports (Email)"
3. Click "Run workflow" → "Run workflow"
4. Wait ~5-10 minutes
5. Check email for report

**Test App Builds**:
1. Make a small change to `app/src/App.tsx` (add comment)
2. Commit and push to `main`
3. Builds trigger automatically
4. Or manually: Actions → "Build Apps" → "Run workflow"
5. Download artifacts from workflow run

---

## Workflow Files Removed

The following workflows were removed as they are no longer needed:

- ❌ `daily-analysis.yml` (replaced by `daily-reports.yml`)
- ❌ `build-app.yml` (replaced by `build-apps.yml`)  
- ❌ `deploy-pages.yml` (not needed)
- ❌ `deploy-pages-fixed.yml` (not needed)
- ❌ `fast-build.yml` (not needed)
- ❌ `fast-build-fixed.yml` (not needed)

---

## Monitoring & Troubleshooting

### Check Workflow Status

1. Go to **Actions** tab in GitHub
2. View recent runs and their status
3. Click on any run to see detailed logs

### Common Issues

**Email not sending**:
- Verify `EMAIL_USER` and `GMAIL_APP_PASSWORD` secrets are set
- Check Gmail app password is correct (16 chars, no spaces)
- Verify 2FA is enabled on Gmail account
- Check workflow logs for error messages

**Build failing**:
- Check if dependencies changed (update caches)
- View detailed logs in failed step
- Try re-running the workflow

**iOS build failing**:
- Most common: Xcode version mismatch
- Check if CocoaPods need updating
- Verify `cap sync ios` completed successfully

### Performance Tips

- **Cache hits**: Green checkmarks in logs = faster builds
- **Artifacts**: Download from Actions tab within retention period
- **Parallel builds**: Monitor Summary tab to see timing

---

## Future Improvements

Potential optimizations for the future:

- [ ] Add signed APK/IPA builds (requires keystore/certificates)
- [ ] Deploy web build to GitHub Pages or Netlify
- [ ] Add automated testing before builds
- [ ] Implement release tagging and versioning
- [ ] Add Slack/Discord notifications for build status
- [ ] Cache Docker images if needed
- [ ] Add performance regression testing

---

## Quick Reference

| Workflow | Trigger | Runtime | Artifacts |
|----------|---------|---------|-----------|
| Daily Reports | Daily 6AM IST | ~5-10min | Report JSON/HTML |
| Build Apps | Push to main | ~10-15min | Web, APK, iOS |

**Status**: ✅ Both workflows optimized and production-ready!
