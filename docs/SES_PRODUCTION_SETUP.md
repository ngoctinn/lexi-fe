# Hướng dẫn Setup SES Production - Lexi Platform

## ✅ Đã hoàn thành

### 1. Request SES Production Access ✓
```bash
Status: Đã gửi request
Timeline: AWS thường review trong 24-48 giờ
```

**Thông tin đã gửi:**
- Mail Type: TRANSACTIONAL
- Website: https://ngoctin.me
- Use Case: Educational platform sending verification emails, password resets, and notifications
- Contact Email: ngoctin.work@gmail.com

### 2. Tạo Email Identities ✓

**Domain Identity: ngoctin.me**
```
Status: PENDING (chờ verify DNS)
DKIM: Enabled
```

**Email Identities đã tạo:**
- ✉️ noreply@ngoctin.me (PENDING - chờ verify)
- ✉️ ngoctin.work@gmail.com (PENDING - chờ verify)

---

## 🔧 Bước tiếp theo (CẦN THỰC HIỆN)

### Bước 1: Verify Domain trong DNS

Bạn cần thêm các CNAME records sau vào DNS của domain `ngoctin.me`:

#### DKIM Records (bắt buộc cho domain verification):

```
Type: CNAME
Name: zzc4zaixieaz67x4uvxe5pytnlqtk7gy._domainkey.ngoctin.me
Value: zzc4zaixieaz67x4uvxe5pytnlqtk7gy.dkim.amazonses.com

Type: CNAME
Name: oct3xwt4ieszf7zhyn2gy7hbp2bubesj._domainkey.ngoctin.me
Value: oct3xwt4ieszf7zhyn2gy7hbp2bubesj.dkim.amazonses.com

Type: CNAME
Name: wbxjaxs5tecj73b46lupx4syiamjco4u._domainkey.ngoctin.me
Value: wbxjaxs5tecj73b46lupx4syiamjco4u.dkim.amazonses.com
```

**Nếu bạn dùng Cloudflare/Route53:**
- Tắt proxy (DNS only) cho các CNAME records này
- TTL: Auto hoặc 300 seconds

**Kiểm tra sau khi thêm DNS:**
```bash
# Kiểm tra DKIM records
dig zzc4zaixieaz67x4uvxe5pytnlqtk7gy._domainkey.ngoctin.me CNAME
dig oct3xwt4ieszf7zhyn2gy7hbp2bubesj._domainkey.ngoctin.me CNAME
dig wbxjaxs5tecj73b46lupx4syiamjco4u._domainkey.ngoctin.me CNAME

# Kiểm tra status trong AWS
aws sesv2 get-email-identity --email-identity ngoctin.me --region ap-southeast-1
```

---

### Bước 2: Verify Email Addresses

Bạn cần kiểm tra email và click vào link xác nhận từ AWS SES:

**Email 1: noreply@ngoctin.me**
- Kiểm tra inbox của email này
- Click vào link "Verify email address" từ AWS

**Email 2: ngoctin.work@gmail.com**
- Kiểm tra inbox Gmail
- Click vào link "Verify email address" từ AWS

**Kiểm tra status:**
```bash
aws sesv2 list-email-identities --region ap-southeast-1
```

---

### Bước 3: Cấu hình Cognito sử dụng SES

**⚠️ CHỈ THỰC HIỆN SAU KHI:**
- Domain `ngoctin.me` đã verified (DKIM status = SUCCESS)
- HOẶC email `noreply@ngoctin.me` đã verified

**Lệnh cập nhật Cognito:**

```bash
# Option 1: Sử dụng domain verified (khuyến nghị)
aws cognito-idp update-user-pool \
  --user-pool-id ap-southeast-1_6GzL5k9Fr \
  --email-configuration \
    EmailSendingAccount=DEVELOPER,\
    SourceArn=arn:aws:ses:ap-southeast-1:826229823693:identity/ngoctin.me,\
    From=noreply@ngoctin.me \
  --region ap-southeast-1

# Option 2: Sử dụng email verified (tạm thời)
aws cognito-idp update-user-pool \
  --user-pool-id ap-southeast-1_6GzL5k9Fr \
  --email-configuration \
    EmailSendingAccount=DEVELOPER,\
    SourceArn=arn:aws:ses:ap-southeast-1:826229823693:identity/noreply@ngoctin.me,\
    From=noreply@ngoctin.me \
  --region ap-southeast-1
```

**Kiểm tra cấu hình:**
```bash
aws cognito-idp describe-user-pool \
  --user-pool-id ap-southeast-1_6GzL5k9Fr \
  --region ap-southeast-1 \
  --query 'UserPool.EmailConfiguration'
```

---

## 🧪 Testing

### Test 1: Trong Sandbox Mode (hiện tại)

Sau khi verify email `ngoctin.work@gmail.com`, bạn có thể test:

```bash
# Đăng ký với email đã verified
# Frontend: signup với ngoctin.work@gmail.com
# Kiểm tra xem có nhận được email verification không
```

### Test 2: Sau khi có Production Access

```bash
# Đăng ký với bất kỳ email nào
# Tất cả email sẽ được gửi thành công
```

---

## 📊 Kiểm tra Status

### Kiểm tra SES Account Status
```bash
aws sesv2 get-account --region ap-southeast-1
```

**Chờ đợi:**
- `ProductionAccessEnabled: true` (sau 24-48h)

### Kiểm tra Email Identities
```bash
aws sesv2 list-email-identities --region ap-southeast-1
```

**Chờ đợi:**
- Domain `ngoctin.me`: `VerifiedForSendingStatus: true`
- Email `noreply@ngoctin.me`: `VerifiedForSendingStatus: true`

### Kiểm tra DKIM Status
```bash
aws sesv2 get-email-identity --email-identity ngoctin.me --region ap-southeast-1 \
  --query 'DkimAttributes.Status'
```

**Chờ đợi:**
- Status: `SUCCESS` (sau khi DNS propagate, thường 5-30 phút)

---

## 🚨 Troubleshooting

### Vấn đề 1: DKIM Status vẫn PENDING sau 1 giờ

**Nguyên nhân:** DNS chưa propagate hoặc records sai

**Giải pháp:**
```bash
# Kiểm tra DNS records
dig zzc4zaixieaz67x4uvxe5pytnlqtk7gy._domainkey.ngoctin.me CNAME +short

# Nếu không có kết quả, kiểm tra lại DNS configuration
```

### Vấn đề 2: Email verification không nhận được

**Nguyên nhân:** Email có thể vào spam

**Giải pháp:**
- Kiểm tra spam folder
- Resend verification email:
```bash
aws sesv2 create-email-identity --email-identity noreply@ngoctin.me --region ap-southeast-1
```

### Vấn đề 3: Cognito update failed

**Lỗi:** `InvalidParameterException: Invalid email identity`

**Nguyên nhân:** Email/Domain chưa verified

**Giải pháp:**
- Đợi email/domain verified trước
- Kiểm tra SourceArn đúng format

---

## 📝 Checklist

- [ ] Request SES Production Access đã gửi ✓
- [ ] Domain identity `ngoctin.me` đã tạo ✓
- [ ] Email identity `noreply@ngoctin.me` đã tạo ✓
- [ ] DKIM CNAME records đã thêm vào DNS
- [ ] DKIM Status = SUCCESS
- [ ] Email `noreply@ngoctin.me` đã verified
- [ ] Cognito đã cập nhật EmailConfiguration
- [ ] Test đăng ký với email verified (sandbox)
- [ ] Chờ Production Access approval (24-48h)
- [ ] Test đăng ký với email bất kỳ (production)

---

## 🎯 Timeline dự kiến

| Thời gian | Công việc |
|-----------|-----------|
| **Ngay bây giờ** | Thêm DKIM records vào DNS |
| **5-30 phút** | DNS propagate, DKIM verified |
| **Ngay sau đó** | Verify email addresses |
| **Ngay sau đó** | Cập nhật Cognito configuration |
| **Ngay sau đó** | Test với email verified |
| **24-48 giờ** | AWS approve Production Access |
| **Sau approval** | Test với mọi email |

---

## 📞 Support

Nếu có vấn đề:
1. Kiểm tra CloudWatch Logs: `/aws/lambda/lexi-be-AuthModule-*`
2. Kiểm tra SES sending statistics
3. Kiểm tra Cognito User Pool events

```bash
# Xem SES sending statistics
aws sesv2 get-account --region ap-southeast-1

# Xem recent email sends
aws sesv2 list-suppressed-destinations --region ap-southeast-1
```
