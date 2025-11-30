#!/bin/bash

# Simple ngrok starter script
# Starts ngrok tunnel for port 3000

echo "🚀 Starting ngrok tunnel for MiniPay testing..."
echo ""

# Set authtoken
ngrok config add-authtoken 36CvUohyEV4Qoa3iSBkdhBPpVfR_4jk3kWwMpEpdgswDJ5EpG 2>/dev/null || true

# Start ngrok
echo "📡 Creating tunnel to http://localhost:3000"
echo "🌐 ngrok web interface: http://localhost:4040"
echo ""
echo "✅ Your public URL will be shown above"
echo "📋 Copy the HTTPS URL and use it in MiniPay Mini App Test"
echo ""
echo "⚠️  Press Ctrl+C to stop"
echo ""

ngrok http 3000

