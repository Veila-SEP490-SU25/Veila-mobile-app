# 🔍 Avatar Upload Flow Debug Guide

## Current Setup

✅ **Firebase Upload**: Enhanced with detailed logging
✅ **API Request**: Logging avatarUrl field in request body  
✅ **API Response**: Checking if avatarUrl is returned in response
✅ **Debug Components**: Real-time logging in development mode

## Debug Steps

### 1. Check Console Output

When uploading avatar, look for these logs:

```
🔥 Firebase Upload Success: {
  originalUri: "file://...",
  firebaseUrl: "https://firebasestorage.googleapis.com/...",
  path: "avatars/avatar_1234567890.jpg"
}

🚀 Sending API Update: {
  avatarUrl: "https://firebasestorage.googleapis.com/..."
}

👤 Profile Update Data: {
  avatarUrl: "https://firebasestorage.googleapis.com/..."
}

🖼️ Avatar Upload - API Request - Profile Update: {
  avatarUrl: "https://firebasestorage.googleapis.com/..."
}

✅ avatarUrl found in request body: https://firebasestorage.googleapis.com/...

📡 API Response: {
  statusCode: 200,
  message: "...",
  item: { ... }
}

🖼️ Avatar Upload - API Response - User Updated: {
  requestedAvatarUrl: "https://firebasestorage.googleapis.com/...",
  responseAvatarUrl: "https://firebasestorage.googleapis.com/...", // Should match
  isAvatarUpdated: true, // Should be true
  fullUserObject: { ... }
}

✅ API Update Result: true
```

### 2. Debug Checklist

- [ ] Firebase upload generates valid URL
- [ ] `avatarUrl` field is in API request body  
- [ ] API responds with 200 status
- [ ] Response contains updated user with new `avatarUrl`
- [ ] Local user state is updated
- [ ] UI shows new avatar

### 3. Common Issues

**❌ "Form data không có avatarUrl"**
- Check: Console shows "✅ avatarUrl found in request body"
- Fix: Verify API endpoint accepts `avatarUrl` field

**❌ "Upload thành công nhưng không hiển thị"**  
- Check: `responseAvatarUrl` matches `requestedAvatarUrl`
- Fix: Backend might not be saving/returning the field

**❌ "Firebase upload lỗi"**
- Check: Firebase Storage rules allow write access
- Fix: Update Firestore/Storage security rules

### 4. Backend Verification

Check if backend API:
- Accepts `avatarUrl` in PUT /auth/me
- Saves `avatarUrl` to database  
- Returns updated user with `avatarUrl` in response

### 5. Quick Test

Use debug component on profile screen:
1. Tap "🔍 Debug" button
2. Tap "Check User" to see current avatarUrl
3. Upload new avatar
4. Check logs for detailed flow

