# PowerShell Local Testing Script for Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "InvestIQ - Local Testing Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 20+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 1: Generate Market Data" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Set-Location scripts

if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
python -m pip install --upgrade pip -q
pip install -q -r requirements.txt

Write-Host "Generating market data (target: <2 minutes)..." -ForegroundColor Yellow
$startTime = Get-Date
python main_optimized.py
$endTime = Get-Date
$elapsed = ($endTime - $startTime).TotalSeconds

Write-Host ""
Write-Host "✓ Data generation completed in $($elapsed)s" -ForegroundColor Green

if (-not (Test-Path "..\app\public\latest_data.json")) {
    Write-Host "❌ Error: Data file not generated" -ForegroundColor Red
    exit 1
}

$fileSize = (Get-Item "..\app\public\latest_data.json").Length
Write-Host "✓ Data file size: $fileSize bytes" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2: Install App Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Set-Location app

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 3: Start Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Starting app at http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Test Checklist:" -ForegroundColor Yellow
Write-Host "  ✓ Theme Toggle (light/dark mode)"
Write-Host "  ✓ Tab Bar (centered, responsive)"
Write-Host "  ✓ Table Horizontal Scroll"
Write-Host "  ✓ Mobile Bottom Navigation"
Write-Host "  ✓ Color-coded Metrics"
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev
