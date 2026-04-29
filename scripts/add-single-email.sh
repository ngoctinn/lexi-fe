#!/bin/bash

# Script để thêm một email address vào SES
# Usage: ./scripts/add-single-email.sh email@example.com

set -e

REGION="ap-southeast-1"

if [ -z "$1" ]; then
    echo "❌ Error: Email address required"
    echo ""
    echo "Usage: ./scripts/add-single-email.sh email@example.com"
    echo ""
    echo "Example:"
    echo "  ./scripts/add-single-email.sh member@gmail.com"
    exit 1
fi

EMAIL="$1"

echo "=================================================="
echo "📧 ADDING EMAIL TO SES"
echo "=================================================="
echo ""
echo "Email: $EMAIL"
echo "Region: $REGION"
echo ""

# Tạo email identity
echo "Creating email identity..."
RESULT=$(aws sesv2 create-email-identity \
    --email-identity "$EMAIL" \
    --region $REGION 2>&1 || true)

if echo "$RESULT" | grep -q "AlreadyExistsException"; then
    echo "⚠️  Email already exists in SES"
    echo ""
    echo "Checking current status..."
    
    # Kiểm tra status hiện tại
    STATUS=$(aws sesv2 get-email-identity \
        --email-identity "$EMAIL" \
        --region $REGION 2>/dev/null || echo "{}")
    
    if [ "$STATUS" != "{}" ]; then
        VERIFIED=$(echo $STATUS | jq -r '.VerifiedForSendingStatus')
        if [ "$VERIFIED" = "true" ]; then
            echo "✅ Email đã verified - có thể sử dụng ngay"
        else
            echo "⏳ Email đang pending - cần verify"
            echo ""
            echo "Resending verification email..."
            aws sesv2 create-email-identity \
                --email-identity "$EMAIL" \
                --region $REGION 2>&1 || true
            echo "✅ Đã gửi lại email verification"
        fi
    fi
elif echo "$RESULT" | grep -q "IdentityType"; then
    echo "✅ Email identity created successfully!"
    echo ""
    echo "Verification email đã được gửi đến: $EMAIL"
else
    echo "❌ Failed to create email identity"
    echo "Error: $RESULT"
    exit 1
fi

echo ""
echo "=================================================="
echo "📬 NEXT STEPS"
echo "=================================================="
echo ""
echo "1. Yêu cầu owner của email ($EMAIL):"
echo "   - Kiểm tra inbox (và spam folder)"
echo "   - Tìm email từ: no-reply-aws@amazon.com"
echo "   - Subject: Amazon SES Email Address Verification Request"
echo "   - Click vào link verify"
echo ""
echo "2. Sau khi verify, kiểm tra status:"
echo "   ./scripts/check-team-emails-status.sh"
echo ""
echo "3. Hoặc kiểm tra email cụ thể:"
echo "   aws sesv2 get-email-identity --email-identity $EMAIL --region $REGION"
echo ""
echo "=================================================="
