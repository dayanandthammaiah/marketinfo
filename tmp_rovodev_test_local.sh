#!/bin/bash
# Local Testing Script for Quick Design Approval

echo "========================================"
echo "InvestIQ - Local Testing Setup"
echo "========================================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.11+"
    exit 1
fi
echo "✓ Python found: $(python3 --version)"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi
echo "✓ Node.js found: $(node --version)"

echo ""
echo "========================================"
echo "Step 1: Generate Market Data"
echo "========================================"
cd scripts || exit

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate || . venv/Scripts/activate

echo "Installing Python dependencies..."
pip install --upgrade pip -q
pip install -q -r requirements.txt

echo "Generating market data (target: <2 minutes)..."
START_TIME=$(date +%s)
python main_optimized.py
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo ""
echo "✓ Data generation completed in ${ELAPSED}s"

if [ ! -f "../app/public/latest_data.json" ]; then
    echo "❌ Error: Data file not generated"
    exit 1
fi

FILE_SIZE=$(stat -f%z "../app/public/latest_data.json" 2>/dev/null || stat -c%s "../app/public/latest_data.json")
echo "✓ Data file size: ${FILE_SIZE} bytes"

cd ..

echo ""
echo "========================================"
echo "Step 2: Install App Dependencies"
echo "========================================"
cd app || exit

if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
else
    echo "✓ Dependencies already installed"
fi

echo ""
echo "========================================"
echo "Step 3: Start Development Server"
echo "========================================"
echo ""
echo "🚀 Starting app at http://localhost:5173"
echo ""
echo "Test Checklist:"
echo "  ✓ Theme Toggle (light/dark mode)"
echo "  ✓ Tab Bar (centered, responsive)"
echo "  ✓ Table Horizontal Scroll"
echo "  ✓ Mobile Bottom Navigation"
echo "  ✓ Color-coded Metrics"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

npm run dev
