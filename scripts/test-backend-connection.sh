#!/bin/bash

# Script kiểm tra kết nối với backend lexi-be
# Usage: ./scripts/test-backend-connection.sh

set -e

echo "🔍 Testing Backend Connection..."
echo ""

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

API_URL="${NEXT_PUBLIC_API_URL}"
WS_URL="${NEXT_PUBLIC_WS_URL}"
USER_POOL_ID="${NEXT_PUBLIC_COGNITO_USER_POOL_ID}"
CLIENT_ID="${NEXT_PUBLIC_COGNITO_CLIENT_ID}"
REGION="${NEXT_PUBLIC_AWS_REGION}"

echo "📋 Configuration:"
echo "  API URL: $API_URL"
echo "  WebSocket URL: $WS_URL"
echo "  User Pool ID: $USER_POOL_ID"
echo "  Client ID: $CLIENT_ID"
echo "  Region: $REGION"
echo ""

# Test 1: API Gateway Health
echo "1️⃣ Testing API Gateway..."
if curl -s -o /dev/null -w "%{http_code}" "${API_URL}" | grep -q "403\|200"; then
  echo "  ✅ API Gateway is reachable"
else
  echo "  ❌ API Gateway is not reachable"
  exit 1
fi
echo ""

# Test 2: Cognito User Pool
echo "2️⃣ Testing Cognito User Pool..."
if aws cognito-idp describe-user-pool --user-pool-id "$USER_POOL_ID" --region "$REGION" > /dev/null 2>&1; then
  echo "  ✅ Cognito User Pool exists"
  
  # Get User Pool details
  POOL_NAME=$(aws cognito-idp describe-user-pool --user-pool-id "$USER_POOL_ID" --region "$REGION" --query "UserPool.Name" --output text)
  echo "  📝 Pool Name: $POOL_NAME"
else
  echo "  ❌ Cognito User Pool not found"
  exit 1
fi
echo ""

# Test 3: Cognito User Pool Client
echo "3️⃣ Testing Cognito User Pool Client..."
if aws cognito-idp describe-user-pool-client --user-pool-id "$USER_POOL_ID" --client-id "$CLIENT_ID" --region "$REGION" > /dev/null 2>&1; then
  echo "  ✅ Cognito User Pool Client exists"
  
  # Get Client details
  CLIENT_NAME=$(aws cognito-idp describe-user-pool-client --user-pool-id "$USER_POOL_ID" --client-id "$CLIENT_ID" --region "$REGION" --query "UserPoolClient.ClientName" --output text)
  echo "  📝 Client Name: $CLIENT_NAME"
else
  echo "  ❌ Cognito User Pool Client not found"
  exit 1
fi
echo ""

# Test 4: Public API Endpoints (no auth required)
echo "4️⃣ Testing Public API Endpoints..."

# Test scenarios endpoint
SCENARIOS_URL="${API_URL}scenarios"
echo "  Testing: $SCENARIOS_URL"
SCENARIOS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SCENARIOS_URL")
if [ "$SCENARIOS_STATUS" = "200" ]; then
  echo "  ✅ Scenarios endpoint is working (200)"
else
  echo "  ⚠️  Scenarios endpoint returned: $SCENARIOS_STATUS"
fi
echo ""

# Summary
echo "✅ Backend Connection Test Complete!"
echo ""
echo "📝 Next Steps:"
echo "  1. Restart Next.js dev server: pnpm dev"
echo "  2. Test signup flow at: http://localhost:3000/signup"
echo "  3. Check Cognito console for email verification"
echo "  4. Test login at: http://localhost:3000/login"
echo ""
