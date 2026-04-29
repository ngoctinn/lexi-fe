#!/bin/bash

# Script kiểm tra status của team emails trong SES
# Usage: ./scripts/check-team-emails-status.sh

set -e

REGION="ap-southeast-1"

echo "=================================================="
echo "📊 TEAM EMAILS VERIFICATION STATUS"
echo "=================================================="
echo ""

# Lấy danh sách tất cả email identities
IDENTITIES=$(aws sesv2 list-email-identities --region $REGION)

# Đếm số lượng
TOTAL=$(echo $IDENTITIES | jq '.EmailIdentities | length')
VERIFIED=$(echo $IDENTITIES | jq '[.EmailIdentities[] | select(.SendingEnabled == true)] | length')
PENDING=$(echo $IDENTITIES | jq '[.EmailIdentities[] | select(.SendingEnabled == false)] | length')

echo "📈 Tổng quan:"
echo "  Total: $TOTAL identities"
echo "  ✅ Verified: $VERIFIED"
echo "  ⏳ Pending: $PENDING"
echo ""

echo "=================================================="
echo "📧 Chi tiết từng email:"
echo "=================================================="
echo ""

# Hiển thị chi tiết
echo $IDENTITIES | jq -r '.EmailIdentities[] | 
    select(.IdentityType == "EMAIL_ADDRESS") | 
    "\(.IdentityName) - \(if .SendingEnabled then "✅ VERIFIED" else "⏳ PENDING" end)"' | 
    column -t -s '-'

echo ""
echo "=================================================="
echo "🔐 Domain Status:"
echo "=================================================="
echo ""

# Hiển thị domain status
echo $IDENTITIES | jq -r '.EmailIdentities[] | 
    select(.IdentityType == "DOMAIN") | 
    "\(.IdentityName) - \(if .SendingEnabled then "✅ VERIFIED" else "⏳ PENDING" end)"' | 
    column -t -s '-'

echo ""

if [ $PENDING -gt 0 ]; then
    echo "=================================================="
    echo "⚠️  CÒN $PENDING EMAIL CHƯA VERIFY"
    echo "=================================================="
    echo ""
    echo "Nhắc nhở team members:"
    echo "1. Kiểm tra inbox (và spam folder)"
    echo "2. Tìm email từ: no-reply-aws@amazon.com"
    echo "3. Click vào link verify"
    echo ""
    echo "Nếu không nhận được email, resend bằng cách:"
    echo "  aws sesv2 create-email-identity --email-identity <email> --region $REGION"
    echo ""
fi

if [ $VERIFIED -eq $TOTAL ]; then
    echo "=================================================="
    echo "🎉 TẤT CẢ EMAIL ĐÃ VERIFIED!"
    echo "=================================================="
    echo ""
    echo "Team có thể test signup với các email đã verify."
    echo ""
fi
