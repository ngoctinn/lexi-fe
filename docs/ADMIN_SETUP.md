# Admin Setup Guide

**Date**: April 25, 2026  
**Status**: Production

---

## 🔐 Problem

Admin endpoints (`/admin/users`, `/admin/scenarios`) require **admin role** in JWT token.

**Error you might see:**
```
[admin] getAdminUsers failed: "Forbidden"
```

This means your current user has `role: "user"` instead of `role: "admin"`.

---

## ✅ Solution: Create Admin User

### Option 1: Via AWS Cognito Console (Recommended)

1. **Go to AWS Cognito Console**
   ```
   https://ap-southeast-1.console.aws.amazon.com/cognito/v2/idp/user-pools
   ```

2. **Select User Pool**
   - User Pool ID: `ap-southeast-1_VhFl3NxNy`

3. **Find Your User**
   - Go to "Users" tab
   - Search for your email

4. **Add Admin Attribute**
   - Click on your user
   - Go to "Attributes" section
   - Add custom attribute:
     - Name: `custom:role`
     - Value: `admin`
   - Save changes

5. **Sign Out & Sign In Again**
   - Your new JWT token will include `role: "admin"`

### Option 2: Via AWS CLI

```bash
# Set your user email
USER_EMAIL="your-email@example.com"

# Update user attributes
aws cognito-idp admin-update-user-attributes \
  --user-pool-id ap-southeast-1_VhFl3NxNy \
  --username $USER_EMAIL \
  --user-attributes Name=custom:role,Value=admin \
  --region ap-southeast-1
```

### Option 3: Via Backend Lambda (Automatic)

Update `PostConfirmation` Lambda to automatically make first user admin:

```python
import boto3
import os

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table(os.environ['USERS_TABLE_NAME'])

def lambda_handler(event, context):
    # Check if this is the first user
    response = users_table.scan(Limit=1)
    is_first_user = response['Count'] == 0
    
    # If first user, make them admin
    role = 'admin' if is_first_user else 'user'
    
    # Create user in DynamoDB with role
    users_table.put_item(
        Item={
            'user_id': event['request']['userAttributes']['sub'],
            'email': event['request']['userAttributes']['email'],
            'role': role,
            # ... other fields
        }
    )
    
    return event
```

---

## 🧪 Verify Admin Access

After setting up admin user:

1. **Sign out and sign in again** (to get new JWT token)

2. **Check JWT token** (optional):
   ```javascript
   // In browser console
   const token = localStorage.getItem('CognitoIdentityServiceProvider.xxx.idToken');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Role:', payload['custom:role']); // Should be "admin"
   ```

3. **Test admin endpoints**:
   ```bash
   # Get your token
   TOKEN=$(aws cognito-idp admin-initiate-auth \
     --user-pool-id ap-southeast-1_VhFl3NxNy \
     --client-id 4krhiauplon0iei1f5r4cgpq7i \
     --auth-flow ADMIN_NO_SRP_AUTH \
     --auth-parameters USERNAME=your-email@example.com,PASSWORD=your-password \
     --region ap-southeast-1 \
     --query 'AuthenticationResult.IdToken' \
     --output text)

   # Test admin users endpoint
   curl -X GET https://yz8fyx7zub.execute-api.ap-southeast-1.amazonaws.com/Prod/admin/users \
     -H "Authorization: Bearer $TOKEN"
   ```

---

## 🔄 Fallback Behavior (Development)

While you don't have admin access, the app uses **fallback data**:

### Admin Users Page
- Shows **mock data** (2 sample users)
- Warning banner displayed
- Read-only mode

### Admin Scenarios Page
- Shows **public scenarios** from `/scenarios` endpoint
- Warning banner displayed
- Limited functionality

**This is temporary** - once you have admin role, real data will be used.

---

## 🚨 Troubleshooting

### Still getting "Forbidden" after setting admin role?

1. **Clear browser cache and cookies**
2. **Sign out completely** (not just close tab)
3. **Sign in again** to get new JWT token
4. **Verify token** has `custom:role: "admin"`

### Backend not checking role correctly?

Check Lambda authorizer:

```python
# In your Lambda authorizer
def lambda_handler(event, context):
    token = event['authorizationToken']
    # Decode JWT
    payload = jwt.decode(token, ...)
    
    # Check role
    role = payload.get('custom:role', 'user')
    
    # For admin endpoints, require admin role
    if event['methodArn'].endswith('/admin/*'):
        if role != 'admin':
            raise Exception('Unauthorized')
    
    return generate_policy(payload['sub'], 'Allow', event['methodArn'])
```

---

## 📚 Related Documentation

- [API Documentation](../API_DOCUMENTATION.md) - Admin endpoints spec
- [Refactor Summary](../REFACTOR_SUMMARY.md) - Recent changes
- [AWS Cognito Docs](https://docs.aws.amazon.com/cognito/)

---

**Last Updated**: April 25, 2026  
**Status**: Production Ready ✅
