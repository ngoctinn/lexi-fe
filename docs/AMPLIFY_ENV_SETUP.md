# Amplify Environment Variables Setup

## Overview
This document describes how to configure environment variables for the Amplify hosted application.

## Required Environment Variables

All `NEXT_PUBLIC_*` variables must be configured in Amplify Console or via AWS CLI for the application to work correctly in production.

### Cognito Configuration
```bash
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-southeast-1_I9ri7n518
NEXT_PUBLIC_COGNITO_CLIENT_ID=2ldrbcns1pqk6llkum42n50rqi
NEXT_PUBLIC_COGNITO_DOMAIN=lexi-app-826229823693-prod.auth.ap-southeast-1.amazoncognito.com
NEXT_PUBLIC_IDENTITY_POOL_ID=ap-southeast-1:f13ded3f-beba-4050-8b81-5592704ec792
```

### AWS Configuration
```bash
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
```

### API Endpoints
```bash
NEXT_PUBLIC_API_URL=https://mnjxcw3o1e.execute-api.ap-southeast-1.amazonaws.com/Prod/
NEXT_PUBLIC_WS_URL=wss://zxb7hmt5c4.execute-api.ap-southeast-1.amazonaws.com/Prod
```

### OAuth Configuration
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=227669726469-knlofr128dnehh7eu05ig31hg3r0i27g.apps.googleusercontent.com
```

### Feature Flags
```bash
NEXT_PUBLIC_USE_STREAMING=true
```

## Setup Methods

### Method 1: AWS CLI (Recommended for Automation)

1. **Get Amplify App ID:**
```bash
aws amplify list-apps --query "apps[?name=='lexife'].{appId:appId,name:name}"
```

2. **Update Environment Variables:**
```bash
aws amplify update-app \
  --app-id do08vxm6ounn6 \
  --environment-variables '{
    "NEXT_PUBLIC_COGNITO_USER_POOL_ID": "ap-southeast-1_I9ri7n518",
    "NEXT_PUBLIC_COGNITO_CLIENT_ID": "2ldrbcns1pqk6llkum42n50rqi",
    "NEXT_PUBLIC_COGNITO_DOMAIN": "lexi-app-826229823693-prod.auth.ap-southeast-1.amazoncognito.com",
    "NEXT_PUBLIC_IDENTITY_POOL_ID": "ap-southeast-1:f13ded3f-beba-4050-8b81-5592704ec792",
    "NEXT_PUBLIC_AWS_REGION": "ap-southeast-1",
    "NEXT_PUBLIC_API_URL": "https://mnjxcw3o1e.execute-api.ap-southeast-1.amazonaws.com/Prod/",
    "NEXT_PUBLIC_WS_URL": "wss://zxb7hmt5c4.execute-api.ap-southeast-1.amazonaws.com/Prod",
    "NEXT_PUBLIC_GOOGLE_CLIENT_ID": "227669726469-knlofr128dnehh7eu05ig31hg3r0i27g.apps.googleusercontent.com",
    "NEXT_PUBLIC_USE_STREAMING": "true"
  }'
```

3. **Trigger New Build:**
```bash
aws amplify start-job \
  --app-id do08vxm6ounn6 \
  --branch-name main \
  --job-type RELEASE
```

### Method 2: AWS Console (Manual)

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app: **lexife**
3. Go to **App settings** → **Environment variables**
4. Click **Manage variables**
5. Add each variable from the list above
6. Click **Save**
7. Redeploy the app

## Verification

After deployment, check browser console for:
```
[Amplify Config] COGNITO_DOMAIN: lexi-app-826229823693-prod.auth.ap-southeast-1.amazoncognito.com
```

If you see `undefined`, the environment variables are not properly configured.

## Troubleshooting

### Error: "Auth UserPool not configured"
**Cause:** Missing Cognito environment variables  
**Solution:** Verify all `NEXT_PUBLIC_COGNITO_*` variables are set

### Error: "NEXT_PUBLIC_API_URL is not defined"
**Cause:** Missing API URL environment variable  
**Solution:** Set `NEXT_PUBLIC_API_URL` in Amplify environment variables

### Changes Not Applied
**Cause:** Environment variables require a new build to take effect  
**Solution:** Trigger a new deployment after updating variables

## Security Notes

- Never commit `.env.local` to Git (it's in `.gitignore`)
- AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) should NOT be added to Amplify - they're for local development only
- Use AWS IAM roles for Amplify service permissions instead

## Last Updated
2026-04-30 - Initial setup with all required environment variables
