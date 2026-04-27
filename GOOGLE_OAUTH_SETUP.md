# Google OAuth Setup Guide

Hướng dẫn hoàn chỉnh để cấu hình Google OAuth cho ứng dụng Lexi.

## 📋 Tổng quan

Ứng dụng đã được cấu hình hoàn toàn trên FE để hỗ trợ Google OAuth. Bây giờ bạn cần:

1. **Tạo Google OAuth credentials** trên Google Cloud Console
2. **Cấu hình Cognito User Pool** để sử dụng Google làm Identity Provider
3. **Cấu hình Cognito Domain** cho OAuth flow
4. **Cập nhật SAM template** để tạo/cập nhật các tài nguyên này

---

## 🔧 Bước 1: Tạo Google OAuth Credentials

### 1.1 Truy cập Google Cloud Console

1. Đi tới [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện tại
3. Đi tới **APIs & Services** → **Credentials**

### 1.2 Cấu hình OAuth Consent Screen

1. Chọn **OAuth consent screen** từ menu bên trái
2. Chọn **External** (hoặc **Internal** nếu chỉ dùng nội bộ)
3. Điền thông tin:
   - **App name**: Lexi
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
4. Nhấn **Save and Continue**
5. Ở bước **Scopes**, thêm các scopes sau:
   - `email`
   - `profile`
   - `openid`
6. Nhấn **Save and Continue** cho đến khi hoàn thành

### 1.3 Tạo OAuth 2.0 Client ID

1. Quay lại **Credentials**
2. Nhấn **Create Credentials** → **OAuth client ID**
3. Chọn **Web application**
4. Điền thông tin:
   - **Name**: Lexi Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://yourdomain.com
     https://lexi-auth.auth.ap-southeast-1.amazoncognito.com
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/oauth-callback
     https://yourdomain.com/oauth-callback
     https://lexi-auth.auth.ap-southeast-1.amazoncognito.com/oauth2/idpresponse
     ```
5. Nhấn **Create**
6. **Lưu lại Client ID và Client Secret** - bạn sẽ cần chúng

---

## 🔐 Bước 2: Cấu hình Cognito User Pool

### 2.1 Thêm Google làm Identity Provider

Sử dụng AWS CLI hoặc Console:

```bash
aws cognito-idp create-identity-provider \
  --user-pool-id ap-southeast-1_VhFl3NxNy \
  --provider-name Google \
  --provider-type Google \
  --provider-details \
    client_id=YOUR_GOOGLE_CLIENT_ID,\
    client_secret=YOUR_GOOGLE_CLIENT_SECRET,\
    authorize_scopes="email openid profile" \
  --region ap-southeast-1
```

**Hoặc qua Console:**

1. Đi tới AWS Cognito Console
2. Chọn User Pool: `ap-southeast-1_VhFl3NxNy`
3. Chọn **Social and external providers** → **Add an identity provider**
4. Chọn **Google**
5. Điền:
   - **Client ID**: (từ Google Cloud)
   - **Client Secret**: (từ Google Cloud)
   - **Authorized scopes**: `email openid profile`
6. Nhấn **Save changes**

### 2.2 Thêm Google vào App Client

1. Đi tới **App integration** → **App clients and analytics**
2. Chọn app client: `4krhiauplon0iei1f5r4cgpq7i`
3. Chọn **Edit**
4. Ở phần **Identity providers**, chọn **Google**
5. Nhấn **Save changes**

---

## 🌐 Bước 3: Cấu hình Cognito Domain

### 3.1 Tạo Cognito Domain (nếu chưa có)

```bash
aws cognito-idp create-user-pool-domain \
  --domain lexi-auth \
  --user-pool-id ap-southeast-1_VhFl3NxNy \
  --region ap-southeast-1
```

**Hoặc qua Console:**

1. Đi tới User Pool
2. Chọn **App integration** → **Domain name**
3. Nhấn **Create Cognito domain**
4. Điền domain name: `lexi-auth`
5. Nhấn **Create Cognito domain**

Domain sẽ là: `https://lexi-auth.auth.ap-southeast-1.amazoncognito.com`

### 3.2 Cấu hình App Client Callback URLs

1. Đi tới **App integration** → **App clients and analytics**
2. Chọn app client
3. Chọn **Edit**
4. Ở phần **Allowed callback URLs**, thêm:
   ```
   http://localhost:3000/dashboard
   http://localhost:3000/oauth-callback
   https://yourdomain.com/dashboard
   https://yourdomain.com/oauth-callback
   ```
5. Ở phần **Allowed sign-out URLs**, thêm:
   ```
   http://localhost:3000/login
   https://yourdomain.com/login
   ```
6. Nhấn **Save changes**

---

## 📝 Bước 4: Cập nhật SAM Template

Tạo/cập nhật file `template.yaml` trong backend SAM project:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Parameters:
  GoogleClientId:
    Type: String
    Description: Google OAuth Client ID
    NoEcho: true
  GoogleClientSecret:
    Type: String
    Description: Google OAuth Client Secret
    NoEcho: true
  CognitoDomain:
    Type: String
    Default: lexi-auth
    Description: Cognito Domain Name

Resources:
  # Cognito User Pool (nếu chưa có)
  CognitoUserPool:
    Type: AWS::Cognito::UserPool
    Properties:
      UserPoolName: lexi-user-pool
      Policies:
        PasswordPolicy:
          MinimumLength: 8
          RequireUppercase: true
          RequireLowercase: true
          RequireNumbers: true
          RequireSymbols: true
      Schema:
        - Name: email
          AttributeDataType: String
          Required: true
          Mutable: true
        - Name: name
          AttributeDataType: String
          Mutable: true
        - Name: picture
          AttributeDataType: String
          Mutable: true

  # Google Identity Provider
  GoogleIdentityProvider:
    Type: AWS::Cognito::UserPoolIdentityProvider
    Properties:
      UserPoolId: !Ref CognitoUserPool
      ProviderName: Google
      ProviderType: Google
      ProviderDetails:
        client_id: !Ref GoogleClientId
        client_secret: !Ref GoogleClientSecret
        authorize_scopes: "email openid profile"
      AttributeMapping:
        email: email
        name: name
        picture: picture
        username: sub

  # Cognito User Pool Client
  CognitoUserPoolClient:
    Type: AWS::Cognito::UserPoolClient
    DependsOn: GoogleIdentityProvider
    Properties:
      UserPoolId: !Ref CognitoUserPool
      ClientName: lexi-web-client
      ExplicitAuthFlows:
        - ALLOW_USER_PASSWORD_AUTH
        - ALLOW_REFRESH_TOKEN_AUTH
      AllowedOAuthFlows:
        - code
      AllowedOAuthScopes:
        - email
        - openid
        - profile
      AllowedOAuthFlowsUserPoolClient: true
      SupportedIdentityProviders:
        - Google
        - COGNITO
      CallbackURLs:
        - http://localhost:3000/dashboard
        - http://localhost:3000/oauth-callback
        - https://yourdomain.com/dashboard
        - https://yourdomain.com/oauth-callback
      LogoutURLs:
        - http://localhost:3000/login
        - https://yourdomain.com/login

  # Cognito Domain
  CognitoUserPoolDomain:
    Type: AWS::Cognito::UserPoolDomain
    Properties:
      Domain: !Ref CognitoDomain
      UserPoolId: !Ref CognitoUserPool

Outputs:
  UserPoolId:
    Value: !Ref CognitoUserPool
    Description: Cognito User Pool ID
  UserPoolClientId:
    Value: !Ref CognitoUserPoolClient
    Description: Cognito User Pool Client ID
  CognitoDomainUrl:
    Value: !Sub "https://${CognitoDomain}.auth.${AWS::Region}.amazoncognito.com"
    Description: Cognito Domain URL
```

### 4.1 Deploy SAM Template

```bash
# Build
sam build

# Deploy (interactive)
sam deploy --guided

# Hoặc deploy với parameters
sam deploy \
  --parameter-overrides \
    GoogleClientId=YOUR_GOOGLE_CLIENT_ID \
    GoogleClientSecret=YOUR_GOOGLE_CLIENT_SECRET \
    CognitoDomain=lexi-auth
```

---

## 🔄 Bước 5: Cập nhật FE Environment Variables

Cập nhật `.env.local` với các giá trị từ Cognito:

```env
# Cognito Domain
NEXT_PUBLIC_COGNITO_DOMAIN=https://lexi-auth.auth.ap-southeast-1.amazoncognito.com

# OAuth Redirect URLs
NEXT_PUBLIC_REDIRECT_SIGN_IN=http://localhost:3000/dashboard
NEXT_PUBLIC_REDIRECT_SIGN_OUT=http://localhost:3000/login
```

---

## ✅ Bước 6: Test Google Login

1. Chạy FE: `npm run dev`
2. Đi tới `/login` hoặc `/signup`
3. Nhấn button "Đăng nhập bằng Google"
4. Bạn sẽ được redirect tới Google login
5. Sau khi đăng nhập, sẽ redirect về `/dashboard`

---

## 🐛 Troubleshooting

### Lỗi: "redirect_uri_mismatch"
- **Nguyên nhân**: Redirect URI không khớp giữa Google Cloud và Cognito
- **Giải pháp**: Kiểm tra lại redirect URIs ở cả Google Cloud Console và Cognito

### Lỗi: "invalid_client"
- **Nguyên nhân**: Client ID hoặc Client Secret không chính xác
- **Giải pháp**: Kiểm tra lại credentials từ Google Cloud Console

### Lỗi: "invalid_scope"
- **Nguyên nhân**: Scopes không được phép
- **Giải pháp**: Đảm bảo scopes được cấu hình trong OAuth Consent Screen

### Lỗi: "Cognito domain not found"
- **Nguyên nhân**: Domain chưa được tạo
- **Giải pháp**: Tạo Cognito domain theo Bước 3.1

---

## 📚 Tài liệu tham khảo

- [AWS Cognito Google Identity Provider](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-provider.html)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Amplify Auth with Social Providers](https://docs.amplify.aws/javascript/build-a-backend/auth/add-social-provider/)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. CloudWatch Logs của Cognito
2. Browser Console (F12) để xem lỗi JavaScript
3. Network tab để kiểm tra OAuth flow
