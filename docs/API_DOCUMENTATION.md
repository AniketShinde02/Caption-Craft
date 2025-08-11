# 🔌 CaptionCraft API Documentation

## 📋 **Overview**

CaptionCraft provides a comprehensive REST API for caption generation, user management, and administrative functions. All endpoints are RESTful and return JSON responses.

## 🔐 **Authentication**

### **Public Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/validate-reset-token` - Token validation
- `POST /api/contact` - Contact form submission

### **Protected Endpoints**
- All other endpoints require valid authentication
- Use NextAuth.js session cookies
- JWT tokens for admin operations

## 🚀 **Core API Endpoints**

### **1. Authentication Endpoints**

#### **POST /api/auth/register**
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "email": "user@example.com"
  },
  "message": "User created successfully"
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - Missing email or password
- `409` - User already exists
- `500` - Server error

#### **POST /api/auth/forgot-password**
Request a password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Rate Limiting:**
- 3 requests per user per day
- 5 requests per IP per day

#### **POST /api/auth/reset-password**
Reset password using token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "reset-token-here",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

#### **GET /api/auth/validate-reset-token**
Validate reset token before showing form.

**Query Parameters:**
- `token` - Reset token
- `email` - User email

**Response:**
```json
{
  "valid": true,
  "message": "Token is valid"
}
```

### **2. Caption Generation Endpoints**

#### **POST /api/generate-captions**
Generate AI-powered captions from image.

**Request Body (FormData):**
```
image: [file] - Image file (PNG, JPG, GIF, max 10MB)
mood: [string] - Caption mood/style
```

**Response:**
```json
{
  "success": true,
  "captions": [
    "Caption 1 with the selected mood",
    "Caption 2 with the selected mood", 
    "Caption 3 with the selected mood"
  ],
  "imageUrl": "https://ik.imagekit.io/...",
  "usage": {
    "remaining": 7,
    "total": 10,
    "resetTime": "2024-01-15T00:00:00Z"
  }
}
```

**Rate Limiting:**
- Anonymous users: 3 generations per day
- Authenticated users: 10 generations per day

**Supported Moods:**
- 🎉 Celebratory / Festive
- 💼 Professional / Business
- 😄 Humorous / Funny
- ❤️ Romantic / Love
- 🌟 Inspirational / Motivational
- 🎨 Creative / Artistic
- 🏃‍♂️ Active / Energetic
- 🧘‍♀️ Calm / Peaceful
- 🎭 Dramatic / Intense
- 🎪 Playful / Whimsical
- 🎓 Educational / Informative
- 🎵 Musical / Rhythmic
- 🍃 Natural / Organic
- 🚀 Futuristic / Modern
- 🏛️ Classic / Timeless
- 🎨 Minimalist / Simple

### **3. User Management Endpoints**

#### **GET /api/user**
Get current user profile.

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username",
    "title": "User Title",
    "bio": "User bio",
    "image": "https://ik.imagekit.io/...",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### **PUT /api/user**
Update user profile.

**Request Body:**
```json
{
  "username": "newusername",
  "title": "New Title",
  "bio": "New bio"
}
```

#### **POST /api/user/profile-image**
Upload profile image.

**Request Body (FormData):**
```
image: [file] - Image file
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://ik.imagekit.io/..."
}
```

#### **DELETE /api/user**
Delete user account.

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### **4. Content Management Endpoints**

#### **GET /api/posts**
Get user's generated captions.

**Response:**
```json
{
  "posts": [
    {
      "id": "post-id",
      "imageUrl": "https://ik.imagekit.io/...",
      "captions": ["Caption 1", "Caption 2", "Caption 3"],
      "mood": "🎉 Celebratory / Festive",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### **DELETE /api/posts/[id]**
Delete a specific caption post.

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

### **5. Rate Limiting Endpoints**

#### **GET /api/rate-limit-info**
Get current rate limit status.

**Response:**
```json
{
  "usage": {
    "remaining": 7,
    "total": 10,
    "resetTime": "2024-01-15T00:00:00Z"
  },
  "limits": {
    "anonymous": 3,
    "authenticated": 10
  }
}
```

## 👑 **Admin API Endpoints**

### **1. Admin Setup Endpoints**

#### **GET /api/admin/setup**
Check admin system status.

**Response:**
```json
{
  "success": true,
  "initialized": true,
  "message": "Admin system already initialized"
}
```

#### **POST /api/admin/setup**
Initialize admin system or create admin users.

**Actions:**

**Initialize System:**
```json
{
  "action": "initialize"
}
```

**Create Admin:**
```json
{
  "action": "create-admin",
  "email": "admin@example.com",
  "password": "securepassword123",
  "username": "admin"
}
```

### **2. User Management Endpoints**

#### **GET /api/admin/users**
Get all users (admin only).

**Response:**
```json
{
  "users": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### **PUT /api/admin/users/[id]**
Update user (admin only).

**Request Body:**
```json
{
  "role": "moderator",
  "username": "newusername"
}
```

#### **DELETE /api/admin/users/[id]**
Delete user (admin only).

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### **3. Role Management Endpoints**

#### **GET /api/admin/roles**
Get all roles (admin only).

**Response:**
```json
{
  "roles": [
    {
      "id": "role-id",
      "name": "Administrator",
      "permissions": {
        "users": ["create", "read", "update", "delete"],
        "content": ["create", "read", "update", "delete"],
        "system": ["manage"]
      }
    }
  ]
}
```

### **4. Database Management Endpoints**

#### **GET /api/admin/database/stats**
Get database statistics (admin only).

**Response:**
```json
{
  "stats": {
    "totalUsers": 150,
    "totalPosts": 450,
    "totalStorage": "2.5GB",
    "collections": [
      {
        "name": "users",
        "count": 150,
        "size": "1.2MB"
      }
    ]
  }
}
```

#### **POST /api/admin/database/backup**
Create database backup (admin only).

**Response:**
```json
{
  "success": true,
  "backupId": "backup-123",
  "message": "Backup created successfully"
}
```

#### **POST /api/admin/database/optimize**
Optimize database (admin only).

**Response:**
```json
{
  "success": true,
  "message": "Database optimized successfully"
}
```

### **5. Content Moderation Endpoints**

#### **GET /api/admin/moderation/reports**
Get content reports (admin only).

**Response:**
```json
{
  "reports": [
    {
      "id": "report-id",
      "postId": "post-id",
      "reason": "Inappropriate content",
      "reporter": "user@example.com",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### **POST /api/admin/moderation/reports/[id]/review**
Review content report (admin only).

**Request Body:**
```json
{
  "action": "warn", // warn, suspend, ban
  "reason": "Content violates guidelines"
}
```

### **6. Archived Profiles Endpoints**

#### **GET /api/admin/archived-profiles**
Get deleted user profiles (admin only).

**Response:**
```json
{
  "profiles": [
    {
      "id": "profile-id",
      "email": "deleted@example.com",
      "deletedAt": "2024-01-01T00:00:00Z",
      "recoveryRequested": false
    }
  ]
}
```

#### **POST /api/admin/archived-profiles/[id]/recover**
Recover deleted profile (admin only).

**Response:**
```json
{
  "success": true,
  "message": "Profile recovered successfully"
}
```

#### **POST /api/admin/archived-profiles/[id]/deny**
Deny recovery request (admin only).

**Response:**
```json
{
  "success": true,
  "message": "Recovery request denied"
}
```

### **7. System Management Endpoints**

#### **GET /api/admin/dashboard-stats**
Get dashboard statistics (admin only).

**Response:**
```json
{
  "stats": {
    "totalUsers": 150,
    "activeUsers": 120,
    "totalPosts": 450,
    "todayPosts": 25,
    "systemHealth": "healthy",
    "storageUsed": "2.5GB",
    "storageLimit": "10GB"
  }
}
```

#### **POST /api/admin/send-promotional-emails**
Send promotional emails (admin only).

**Request Body:**
```json
{
  "subject": "New Feature Available!",
  "message": "Check out our latest update...",
  "recipients": ["all", "premium", "inactive"]
}
```

## 🔧 **Utility Endpoints**

### **1. Contact Endpoint**

#### **POST /api/contact**
Submit contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "General Inquiry",
  "message": "Hello, I have a question..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

### **2. Debug Endpoints**

#### **GET /api/debug-session**
Debug session information (development only).

**Response:**
```json
{
  "session": {
    "user": {
      "id": "user-id",
      "email": "user@example.com"
    },
    "expires": "2024-01-08T00:00:00Z"
  }
}
```

#### **GET /api/test-admin**
Test admin system (development only).

**Response:**
```json
{
  "success": true,
  "adminCount": 2,
  "databaseStatus": "connected"
}
```

## 📊 **Error Handling**

### **Standard Error Response Format**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### **Common Error Codes**
- `AUTH_REQUIRED` - Authentication required
- `INSUFFICIENT_PERMISSIONS` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `INVALID_TOKEN` - Invalid or expired token
- `USER_NOT_FOUND` - User not found
- `VALIDATION_ERROR` - Request validation failed
- `INTERNAL_ERROR` - Internal server error

### **HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🔒 **Security Features**

### **Rate Limiting**
- IP-based rate limiting
- User-based rate limiting
- Automatic abuse detection
- Escalating timeouts for violations

### **Input Validation**
- Request body validation
- File type and size validation
- SQL injection prevention
- XSS protection

### **Authentication**
- JWT token-based sessions
- Secure cookie handling
- Session expiration
- Automatic logout on inactivity

## 📱 **Client Integration Examples**

### **JavaScript/TypeScript**
```typescript
// Generate captions
const formData = new FormData();
formData.append('image', imageFile);
formData.append('mood', '🎉 Celebratory / Festive');

const response = await fetch('/api/generate-captions', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.captions);
```

### **Python**
```python
import requests

# Generate captions
files = {'image': open('image.jpg', 'rb')}
data = {'mood': '🎉 Celebratory / Festive'}

response = requests.post(
    'http://localhost:9002/api/generate-captions',
    files=files,
    data=data
)

result = response.json()
print(result['captions'])
```

### **cURL**
```bash
# Generate captions
curl -X POST http://localhost:9002/api/generate-captions \
  -F "image=@image.jpg" \
  -F "mood=🎉 Celebratory / Festive"

# Get user profile (with authentication)
curl -H "Cookie: next-auth.session-token=..." \
  http://localhost:9002/api/user
```

## 🚀 **Performance Considerations**

### **Best Practices**
- Use appropriate image sizes (max 10MB)
- Implement client-side caching
- Use pagination for large datasets
- Monitor rate limits

### **Rate Limits**
- Anonymous: 3 generations/day
- Authenticated: 10 generations/day
- Admin operations: 100 requests/hour

## 📞 **Support & Feedback**

For API support or questions:
- Check this documentation
- Review error responses
- Check server logs
- Contact development team

---

**Last Updated**: January 2025  
**API Version**: v1.0  
**Status**: Production Ready 🚀
