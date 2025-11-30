#!/bin/bash

# MiniPay Testing Script with ngrok
# This script starts the Next.js dev server and creates an ngrok tunnel for MiniPay testing

set -e

echo "🚀 Starting MiniPay Test Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${YELLOW}⚠️  ngrok is not installed. Installing...${NC}"
    echo "Visit https://ngrok.com/download to install ngrok"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm is not installed${NC}"
    exit 1
fi

# Set ngrok authtoken if not already set
if ! ngrok config check &> /dev/null; then
    echo -e "${BLUE}📝 Setting up ngrok authtoken...${NC}"
    ngrok config add-authtoken 36CvUohyEV4Qoa3iSBkdhBPpVfR_4jk3kWwMpEpdgswDJ5EpG
fi

# Navigate to web app directory
cd "$(dirname "$0")/../apps/web" || exit 1

echo -e "${GREEN}✅ Starting Next.js development server...${NC}"
echo ""

# Start Next.js dev server in background
pnpm dev &
DEV_PID=$!

# Wait for server to start
echo -e "${BLUE}⏳ Waiting for dev server to start...${NC}"
sleep 5

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${YELLOW}⚠️  Dev server might not be ready yet. Continuing anyway...${NC}"
fi

echo ""
echo -e "${GREEN}✅ Starting ngrok tunnel...${NC}"
echo ""

# Start ngrok tunnel
ngrok http 3000 --log=stdout &
NGROK_PID=$!

# Wait a moment for ngrok to start
sleep 3

# Get ngrok URL
echo -e "${BLUE}📡 Fetching ngrok tunnel URL...${NC}"
sleep 2

# Try to get URL from ngrok API
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo -e "${YELLOW}⚠️  Could not automatically fetch ngrok URL${NC}"
    echo -e "${YELLOW}   Please check ngrok web interface at http://localhost:4040${NC}"
    NGROK_URL="http://localhost:4040 (check web interface)"
else
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 MiniPay Test Environment Ready!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}📱 Your MiniPay Test URL:${NC}"
    echo -e "${GREEN}   $NGROK_URL${NC}"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo "   1. Copy the URL above"
    echo "   2. Open MiniPay Mini App Test tool"
    echo "   3. Paste the URL to test your app"
    echo ""
    echo -e "${BLUE}🔍 Debug Info:${NC}"
    echo "   - Dev Server: http://localhost:3000"
    echo "   - ngrok Web UI: http://localhost:4040"
    echo ""
    echo -e "${YELLOW}⚠️  Press Ctrl+C to stop both servers${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down...${NC}"
    kill $DEV_PID 2>/dev/null || true
    kill $NGROK_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Cleaned up${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Keep script running
wait

