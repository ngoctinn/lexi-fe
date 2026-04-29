#!/bin/bash

# Script để verify nhiều email addresses cho team trong SES Sandbox
# Usage: ./scripts/verify-team-emails.sh

set -e

REGION="ap-southeast-1"

echo "=================================================="
echo "📧 VERIFY TEAM EMAILS - SES Sandbox Mode"
echo "=================================================="
echo ""

# Danh sách email của team (thêm email vào đây)
TEAM_EMAILS=(
    "ngoctin.work@gmail.com"
    "tinvg2918@gmail.com"
    "tinn3941@gmail.com"
    # Thêm email team members khác vào đây:
    # "member4@gmail.com"
    # "member5@gmail.com"
)

echo "📋 Danh sách email sẽ được verify:"
for email in "${TEAM_EMAILS[@]}"; do
    echo "  - $email"
done
echo ""

read -p "Tiếp tục? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Đã hủy."
    exit 0
fi

echo ""
echo "🚀 Bắt đầu tạo email identities..."
echo ""

SUCCESS_COUNT=0
ALREADY_EXISTS_COUNT=0
FAILED_COUNT=0

for email in "${TEAM_EMAILS[@]}"; do
    echo -n "Processing: $email ... "
    
    RESULT=$(aws sesv2 create-email-identity \
        --email-identity "$email" \
        --region $REGION 2>&1 || true)
    
    if echo "$RESULT" | grep -q "AlreadyExistsException"; then
        echo "⚠️  Already exists"
        ((ALREADY_EXISTS_COUNT++))
    elif echo "$RESULT" | grep -q "IdentityType"; then
        echo "✅ Created"
        ((SUCCESS_COUNT++))
    else
        echo "❌ Failed"
        echo "   Error: $RESULT"
        ((FAILED_COUNT++))
    fi
done

echo ""
echo "=================================================="
echo "📊 SUMMARY"
echo "=================================================="
echo "✅ Created: $SUCCESS_COUNT"
echo "⚠️  Already exists: $ALREADY_EXISTS_COUNT"
echo "❌ Failed: $FAILED_COUNT"
echo ""

echo "=================================================="
echo "📬 NEXT STEPS"
echo "=================================================="
echo ""
echo "1. Yêu cầu mỗi team member:"
echo "   - Kiểm tra inbox (và spam folder)"
echo "   - Tìm email từ: no-reply-aws@amazon.com"
echo "   - Subject: Amazon SES Email Address Verification Request"
echo "   - Click vào link verify"
echo ""
echo "2. Sau khi verify, kiểm tra status:"
echo "   ./scripts/check-team-emails-status.sh"
echo ""
echo "3. Test signup với email đã verify"
echo ""
echo "=================================================="
