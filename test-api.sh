#!/bin/bash

# Test API Gateway endpoints
API_URL="https://yz8fyx7zub.execute-api.ap-southeast-1.amazonaws.com/Prod"

echo "=== Testing API Gateway Endpoints ==="
echo ""

# Test 1: GET /profile (should fail without auth)
echo "1. GET /profile (no auth):"
curl -s -X GET "$API_URL/profile" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" | head -20
echo ""

# Test 2: Check CORS headers
echo "2. OPTIONS /profile (CORS preflight):"
curl -s -X OPTIONS "$API_URL/profile" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -w "\nStatus: %{http_code}\n"
echo ""

# Test 3: Check API Gateway health
echo "3. API Gateway health check:"
curl -s -X GET "$API_URL/" \
  -w "\nStatus: %{http_code}\n"
echo ""

echo "=== End of tests ==="
