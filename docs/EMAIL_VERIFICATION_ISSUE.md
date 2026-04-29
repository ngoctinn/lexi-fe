# Vấn đề Xác thực Email - Phân tích và Giải pháp

## Ngày phân tích: 28/04/2026

## 🔍 Vấn đề
Khi người dùng đăng ký tài khoản thành công, **không có email xác thực nào được gửi đến hộp thư**.

## 🔎 Nguyên nhân gốc rễ

### 1. **Amazon SES đang ở chế độ Sandbox**
```json
{
  "ProductionAccessEnabled": false,
  "SendQuota": {
    "Max24HourSend": 200.0,
    "MaxSendRate": 1.0
  }
}
```

**Hạn chế của chế độ Sandbox:**
- ✅ Chỉ có thể gửi email đến **địa chỉ email đã được xác minh** trong SES
- ❌ Không thể gửi email đến địa chỉ email bất kỳ (như khi người dùng đăng ký)
- ⚠️ Giới hạn: 200 email/24h, 1 email/giây

### 2. **Cognito đang sử dụng COGNITO_DEFAULT email service**
```json
{
  "EmailConfiguration": {
    "EmailSendingAccount": "COGNITO_DEFAULT"
  }
}
```

**Vấn đề:**
- Cognito Default email service có giới hạn rất thấp
- Không đáng tin cậy cho production
- Phụ thuộc vào SES sandbox status

### 3. **PreSignUp Lambda không tự động xác nhận email**
Từ CloudWatch logs:
```
"message": "Skipping non-federated sign-up: PreSignUp_SignUp"
```

Lambda đang bỏ qua việc tự động xác nhận email cho người dùng đăng ký thông thường.

## ✅ Giải pháp

### Giải pháp 1: **Chuyển SES sang Production Mode** (Khuyến nghị)

**Bước 1: Request Production Access**
```bash
# Yêu cầu chuyển SES sang production mode
aws sesv2 put-account-details \
  --production-access-enabled \
  --mail-type TRANSACTIONAL \
  --website-url https://ngoctin.me \
  --use-case-description "Educational platform sending verification emails, password resets, and notifications to users" \
  --region ap-southeast-1
```

**Bước 2: Cấu hình Cognito sử dụng SES**
```bash
# Cập nhật Cognito User Pool để sử dụng SES
aws cognito-idp update-user-pool \
  --user-pool-id ap-southeast-1_6GzL5k9Fr \
  --email-configuration \
    EmailSendingAccount=DEVELOPER,\
    SourceArn=arn:aws:ses:ap-southeast-1:826229823693:identity/noreply@ngoctin.me \
  --region ap-southeast-1
```

**Bước 3: Xác minh domain/email trong SES**
```bash
# Xác minh email address
aws sesv2 create-email-identity \
  --email-identity noreply@ngoctin.me \
  --region ap-southeast-1

# Hoặc xác minh toàn bộ domain
aws sesv2 create-email-identity \
  --email-identity ngoctin.me \
  --region ap-southeast-1
```

**Lưu ý:** AWS thường mất 24-48 giờ để review và approve production access.

---

### Giải pháp 2: **Tự động xác nhận email trong PreSignUp Lambda** (Tạm thời)

Sửa PreSignUp Lambda để tự động xác nhận email cho người dùng đăng ký:

```python
def lambda_handler(event, context):
    trigger_source = event.get("triggerSource")
    
    # Tự động xác nhận email cho người dùng đăng ký thông thường
    if trigger_source == "PreSignUp_SignUp":
        event["response"]["autoConfirmUser"] = True
        event["response"]["autoVerifyEmail"] = True
    
    return event
```

**Ưu điểm:**
- ✅ Giải quyết ngay lập tức
- ✅ Không cần chờ AWS approve
- ✅ Người dùng có thể đăng nhập ngay

**Nhược điểm:**
- ⚠️ Bỏ qua bước xác thực email
- ⚠️ Có thể tạo tài khoản với email không tồn tại
- ⚠️ Không phù hợp cho production lâu dài

---

### Giải pháp 3: **Xác minh email test trong SES Sandbox** (Development)

Nếu đang trong giai đoạn development và chỉ cần test:

```bash
# Xác minh email test
aws sesv2 create-email-identity \
  --email-identity your-test-email@gmail.com \
  --region ap-southeast-1
```

Sau đó kiểm tra email và click vào link xác nhận từ AWS SES.

---

## 📊 Luồng hiện tại

```
User đăng ký
    ↓
PreSignUp Lambda (skipping auto-confirm)
    ↓
Cognito tạo user với status UNCONFIRMED
    ↓
Cognito cố gắng gửi email qua COGNITO_DEFAULT
    ↓
SES Sandbox chặn email (địa chỉ chưa verified)
    ↓
❌ Email không được gửi
```

## 🎯 Luồng mong muốn (sau khi fix)

```
User đăng ký
    ↓
PreSignUp Lambda
    ↓
Cognito tạo user với status UNCONFIRMED
    ↓
Cognito gửi email qua SES (Production mode)
    ↓
✅ Email được gửi thành công
    ↓
User nhập mã xác thực
    ↓
User status: CONFIRMED
```

## 🔧 Kiểm tra trạng thái hiện tại

```bash
# Kiểm tra SES status
aws sesv2 get-account --region ap-southeast-1

# Kiểm tra Cognito email config
aws cognito-idp describe-user-pool \
  --user-pool-id ap-southeast-1_6GzL5k9Fr \
  --region ap-southeast-1 \
  --query 'UserPool.EmailConfiguration'

# Kiểm tra verified identities trong SES
aws sesv2 list-email-identities --region ap-southeast-1
```

## 📝 Khuyến nghị

**Cho Production:**
1. ✅ Request SES Production Access (Giải pháp 1)
2. ✅ Cấu hình Cognito sử dụng SES với verified domain
3. ✅ Giữ nguyên email verification flow

**Cho Development/Testing:**
1. Tạm thời sử dụng Giải pháp 2 (auto-confirm)
2. Hoặc verify một số email test trong SES Sandbox

## 🔗 Tài liệu tham khảo

- [Moving out of SES Sandbox](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- [Cognito Email Configuration](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-email.html)
- [PreSignUp Lambda Trigger](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-pre-sign-up.html)
