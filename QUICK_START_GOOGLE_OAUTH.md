# 🚀 Quick Start - Google OAuth Setup

## Frontend ✅ (Hoàn thành)

Toàn bộ UI và logic đã được triển khai:
- ✅ Google login button trên `/login` và `/signup`
- ✅ OAuth callback handler
- ✅ Amplify config với OAuth support
- ✅ Error handling và loading states

**Không cần thay đổi gì thêm trên FE!**

---

## Backend 🔧 (Cần cấu hình)

### Bước 1: Tạo Google OAuth Credentials (5 phút)

1. Đi tới [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện tại
3. Đi tới **APIs & Services** → **OAuth consent screen**
4. Chọn **External** → Điền app info → Save
5. Đi tới **Credentials** → **Create Credentials** → **OAuth client ID**
6. Chọn **Web application**
7. Thêm authorized origins:
   ```
   http://localhost:3000
   https://lexi-auth.auth.ap-southeast-1.amazoncognito.com
   ```
8. Thêm authorized redirect URIs:
   ```
   http://localhost:3000/oauth-callback
   https://lexi-auth.auth.ap-southeast-1.amazoncognito.com/oauth2/idpresponse
   ```
9. **Lưu Client ID và Client Secret**

### Bước 2: Cấu hình Cognito (5 phút)

**Option A: Dùng AWS CLI**

```bash
# 1. Thêm Google Identity Provider
aws cognito-idp create-identity-provider \
  --user-pool-id ap-southeast-1_VhFl3NxNy \
  --provider-name Google \
  --provider-type Google \
  --provider-details \
    client_id=YOUR_GOOGLE_CLIENT_ID,\
    client_secret=YOUR_GOOGLE_CLIENT_SECRET,\
    authorize_scopes="email openid profile" \
  --region ap-southeast-1

# 2. Cập nhật App Client để thêm Google
aws cognito-idp update-user-pool-client \
  --user-pool-id ap-southeast-1_VhFl3NxNy \
  --client-id 4krhiauplon0iei1f5r4cgpq7i \
  --supported-identity-providers Google COGNITO \
  --allowed-o-auth-flows code \
  --allowed-o-auth-scopes email openid profile \
  --allowed-o-auth-flows-user-pool-client \
  --callback-urls \
    http://localhost:3000/dashboard \
    http://localhost:3000/oauth-callback \
  --logout-urls \
    http://localhost:3000/login \
  --region ap-southeast-1

# 3. Tạo Cognito Domain (nếu chưa có)
aws cognito-idp create-user-pool-domain \
  --domain lexi-auth \
  --user-pool-id ap-southeast-1_VhFl3NxNy \
  --region ap-southeast-1
```

**Option B: Dùng AWS Console**

1. Đi tới AWS Cognito Console
2. Chọn User Pool: `ap-southeast-1_VhFl3NxNy`
3. **Social and external providers** → **Add an identity provider** → **Google**
4. Điền Client ID và Client Secret
5. Scopes: `email openid profile`
6. Save
7. Đi tới **App integration** → **App clients** → Edit client
8. Thêm Google vào **Identity providers**
9. Cập nhật **Callback URLs** và **Logout URLs**
10. Save

### Bước 3: Deploy SAM Template (10 phút)

Sử dụng template từ `GOOGLE_OAUTH_SETUP.md` (Bước 4)

```bash
sam build
sam deploy --guided \
  --parameter-overrides \
    GoogleClientId=YOUR_GOOGLE_CLIENT_ID \
    GoogleClientSecret=YOUR_GOOGLE_CLIENT_SECRET
```

---

## ✅ Verification Checklist

Sau khi cấu hình xong, kiểm tra:

- [ ] Google credentials được tạo
- [ ] Google Identity Provider được thêm vào Cognito
- [ ] Cognito Domain được tạo
- [ ] App Client callback URLs được cập nhật
- [ ] SAM template được deploy

---

## 🧪 Test Google Login

1. Chạy FE: `npm run dev`
2. Đi tới `http://localhost:3000/login`
3. Nhấn "Đăng nhập bằng Google"
4. Đăng nhập với Google account
5. Kiểm tra redirect đến dashboard
6. Kiểm tra user được tạo trong Cognito User Pool

---

## 🐛 Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-----------|----------|
| `redirect_uri_mismatch` | Redirect URI không khớp | Kiểm tra lại redirect URIs ở Google Cloud và Cognito |
| `invalid_client` | Client ID/Secret sai | Kiểm tra lại credentials từ Google Cloud |
| `invalid_scope` | Scopes không được phép | Đảm bảo scopes được cấu hình trong OAuth Consent Screen |
| `Cognito domain not found` | Domain chưa được tạo | Tạo Cognito domain |

---

## 📚 Tài liệu Chi Tiết

- `GOOGLE_OAUTH_SETUP.md` - Hướng dẫn chi tiết từng bước
- `GOOGLE_OAUTH_FE_CHANGES.md` - Danh sách thay đổi FE
- [AWS Cognito Docs](https://docs.aws.amazon.com/cognito/)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)

---

## 💬 Cần Giúp?

Nếu gặp vấn đề:
1. Kiểm tra CloudWatch Logs của Cognito
2. Mở Browser Console (F12) để xem lỗi
3. Kiểm tra Network tab để xem OAuth flow
4. Xem troubleshooting section trong `GOOGLE_OAUTH_SETUP.md`

---

**Tất cả FE code đã sẵn sàng! Bây giờ chỉ cần cấu hình BE thôi! 🎉**
