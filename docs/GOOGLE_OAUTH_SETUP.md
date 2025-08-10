# Hướng dẫn cấu hình Google OAuth với Firebase

## 1. Cấu hình Firebase

### Bước 1: Truy cập Firebase Console

- Vào [Firebase Console](https://console.firebase.google.com/)
- Chọn project của bạn hoặc tạo project mới

### Bước 2: Bật Google Authentication

1. Vào **Authentication** > **Sign-in method**
2. Click vào **Google** provider
3. Bật **Enable**
4. Nhập **Project support email**
5. Click **Save**

### Bước 3: Lấy Client IDs

1. Trong Google provider settings, click **Web SDK configuration**
2. Copy các Client IDs:
   - **Web client ID**: `123456789-abcdef.apps.googleusercontent.com`
   - **iOS client ID**: `123456789-ios.apps.googleusercontent.com`
   - **Android client ID**: `123456789-android.apps.googleusercontent.com`

### Bước 4: Cập nhật cấu hình

Mở `utils/google-auth.config.ts` và cập nhật:

```typescript
CLIENT_IDS: {
  WEB: 'your-web-client-id.apps.googleusercontent.com',
  IOS: 'your-ios-client-id.apps.googleusercontent.com',
  ANDROID: 'your-android-client-id.apps.googleusercontent.com',
},
```

## 2. Cài đặt Dependencies

```bash
npm install expo-auth-session expo-web-browser
```

## 3. Cấu hình app.config.js

Đảm bảo Firebase config đã được cấu hình trong `app.config.js`:

```javascript
extra: {
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
},
```

## 4. Environment Variables

Tạo file `.env` với Firebase config:

```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 5. Backend API

Đảm bảo backend có endpoint:

```
POST /api/auth/google/login
Content-Type: application/json

{
  "email": "user@gmail.com",
  "fullname": "User Name"
}
```

Response:

```json
{
  "message": "Đăng nhập thành công",
  "statusCode": 200,
  "item": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

## 6. Test

### Test Google OAuth thật

1. Cài đặt dependencies: `npm install expo-auth-session expo-web-browser`
2. Cấu hình Firebase và lấy Client IDs
3. Cập nhật `CLIENT_IDS` trong `google-auth.config.ts`
4. Đảm bảo `USE_MOCK: false`
5. Test trên device thật

### Chuyển về Mock Mode (nếu cần)

1. Mở `utils/google-auth.config.ts`
2. Thay đổi `USE_MOCK: true`
3. Thay đổi import trong `app/_auth/login.tsx`:
   ```typescript
   import { GoogleLoginButton } from "../../components/auth/login/GoogleLoginButton";
   ```

## 7. Troubleshooting

### Lỗi thường gặp

1. **"Cannot find module 'expo-auth-session'"**
   - Chạy: `npm install expo-auth-session expo-web-browser`

2. **"Invalid client ID"**
   - Kiểm tra Client ID trong Firebase Console
   - Đảm bảo Google provider đã được bật

3. **"Firebase config error"**
   - Kiểm tra environment variables
   - Đảm bảo Firebase project đã được cấu hình đúng

4. **"Network error"**
   - Kiểm tra kết nối internet
   - Kiểm tra Firebase project settings

## 8. Lưu ý

- Đảm bảo Firebase project đã được cấu hình đúng
- Test trên device thật, không chỉ simulator
- Kiểm tra network requests và error handling
- Backup Firebase config và Client IDs trước khi deploy
- Đảm bảo Google provider đã được bật trong Firebase Authentication
