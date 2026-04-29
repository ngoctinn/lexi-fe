#!/bin/bash

# Script kiểm tra SES và Cognito Email Configuration Status
# Usage: ./scripts/check-ses-status.sh

set -e

REGION="ap-southeast-1"
USER_POOL_ID="ap-southeast-1_6GzL5k9Fr"

echo "=================================================="
echo "🔍 LEXI - SES & COGNITO EMAIL STATUS CHECK"
echo "=================================================="
echo ""

# 1. Kiểm tra SES Account Status
echo "📊 1. SES Account Status"
echo "--------------------------------------------------"
SES_ACCOUNT=$(aws sesv2 get-account --region $REGION)
PRODUCTION_ACCESS=$(echo $SES_ACCOUNT | jq -r '.ProductionAccessEnabled')
SENDING_ENABLED=$(echo $SES_ACCOUNT | jq -r '.SendingEnabled')
MAX_SEND=$(echo $SES_ACCOUNT | jq -r '.SendQuota.Max24HourSend')
SENT_LAST_24H=$(echo $SES_ACCOUNT | jq -r '.SendQuota.SentLast24Hours')

echo "Production Access: $PRODUCTION_ACCESS"
echo "Sending Enabled: $SENDING_ENABLED"
echo "Max Send (24h): $MAX_SEND emails"
echo "Sent (Last 24h): $SENT_LAST_24H emails"

if [ "$PRODUCTION_ACCESS" = "true" ]; then
    echo "✅ SES đã ở Production Mode"
else
    echo "⚠️  SES đang ở Sandbox Mode - chỉ gửi được đến verified emails"
fi
echo ""

# 2. Kiểm tra Email Identities
echo "📧 2. Email Identities Status"
echo "--------------------------------------------------"
IDENTITIES=$(aws sesv2 list-email-identities --region $REGION)

if [ "$(echo $IDENTITIES | jq '.EmailIdentities | length')" -eq 0 ]; then
    echo "❌ Không có email identity nào"
else
    echo $IDENTITIES | jq -r '.EmailIdentities[] | "\(.IdentityName) - \(.IdentityType) - Verified: \(.SendingEnabled)"'
fi
echo ""

# 3. Kiểm tra Domain DKIM Status
echo "🔐 3. Domain DKIM Status"
echo "--------------------------------------------------"
DOMAIN_STATUS=$(aws sesv2 get-email-identity --email-identity ngoctin.me --region $REGION 2>/dev/null || echo "{}")

if [ "$DOMAIN_STATUS" != "{}" ]; then
    DKIM_STATUS=$(echo $DOMAIN_STATUS | jq -r '.DkimAttributes.Status')
    VERIFIED=$(echo $DOMAIN_STATUS | jq -r '.VerifiedForSendingStatus')
    
    echo "Domain: ngoctin.me"
    echo "DKIM Status: $DKIM_STATUS"
    echo "Verified for Sending: $VERIFIED"
    
    if [ "$DKIM_STATUS" = "SUCCESS" ]; then
        echo "✅ DKIM đã được verify"
    elif [ "$DKIM_STATUS" = "PENDING" ]; then
        echo "⏳ DKIM đang chờ DNS propagate"
        echo ""
        echo "Cần thêm các CNAME records sau vào DNS:"
        echo $DOMAIN_STATUS | jq -r '.DkimAttributes.Tokens[] | "  \(.)._domainkey.ngoctin.me -> \(.).dkim.amazonses.com"'
    else
        echo "❌ DKIM chưa được cấu hình"
    fi
else
    echo "❌ Domain ngoctin.me chưa được tạo trong SES"
fi
echo ""

# 4. Kiểm tra Cognito Email Configuration
echo "🔧 4. Cognito Email Configuration"
echo "--------------------------------------------------"
COGNITO_CONFIG=$(aws cognito-idp describe-user-pool \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query 'UserPool.EmailConfiguration')

echo $COGNITO_CONFIG | jq '.'

EMAIL_SENDING_ACCOUNT=$(echo $COGNITO_CONFIG | jq -r '.EmailSendingAccount')

if [ "$EMAIL_SENDING_ACCOUNT" = "DEVELOPER" ]; then
    echo "✅ Cognito đang sử dụng SES (DEVELOPER mode)"
elif [ "$EMAIL_SENDING_ACCOUNT" = "COGNITO_DEFAULT" ]; then
    echo "⚠️  Cognito đang sử dụng COGNITO_DEFAULT (giới hạn thấp)"
    echo "    Cần cập nhật để sử dụng SES"
fi
echo ""

# 5. Tổng kết và Khuyến nghị
echo "=================================================="
echo "📋 SUMMARY & RECOMMENDATIONS"
echo "=================================================="

if [ "$PRODUCTION_ACCESS" = "false" ]; then
    echo "⚠️  1. Chờ AWS approve Production Access (24-48h)"
fi

if [ "$DKIM_STATUS" = "PENDING" ]; then
    echo "⚠️  2. Thêm DKIM CNAME records vào DNS"
fi

if [ "$EMAIL_SENDING_ACCOUNT" = "COGNITO_DEFAULT" ]; then
    echo "⚠️  3. Cập nhật Cognito để sử dụng SES"
    echo "       Chạy: aws cognito-idp update-user-pool ..."
fi

if [ "$PRODUCTION_ACCESS" = "true" ] && [ "$DKIM_STATUS" = "SUCCESS" ] && [ "$EMAIL_SENDING_ACCOUNT" = "DEVELOPER" ]; then
    echo "✅ Tất cả đã được cấu hình đúng!"
    echo "   Email verification sẽ hoạt động bình thường."
fi

echo ""
echo "=================================================="
echo "Để xem chi tiết, check: docs/SES_PRODUCTION_SETUP.md"
echo "=================================================="
