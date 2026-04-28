#!/bin/bash

# Test Flashcards API endpoints
# Usage: ./test-flashcards-api.sh

# Load environment variables
source .env.local

# Get ID token (you need to replace this with actual token from browser)
# Open browser console and run: await (await fetch('/api/auth/session')).json()
echo "⚠️  You need to provide ID_TOKEN manually"
echo "Get it from browser console or Amplify"
echo ""

read -p "Enter your Cognito ID Token: " ID_TOKEN

if [ -z "$ID_TOKEN" ]; then
  echo "❌ ID_TOKEN is required"
  exit 1
fi

echo ""
echo "🧪 Testing Flashcards API..."
echo "Base URL: $NEXT_PUBLIC_API_URL"
echo ""

# Test 1: GET /flashcards
echo "📋 Test 1: GET /flashcards (all flashcards)"
echo "---"
curl -X GET "$NEXT_PUBLIC_API_URL/flashcards?limit=5" \
  -H "Authorization: $ID_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo ""

# Test 2: GET /flashcards/due
echo "📋 Test 2: GET /flashcards/due (due flashcards)"
echo "---"
curl -X GET "$NEXT_PUBLIC_API_URL/flashcards/due" \
  -H "Authorization: $ID_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo ""

echo "✅ Tests completed"
