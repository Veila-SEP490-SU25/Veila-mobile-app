# Hướng dẫn lấy Google Client IDs từ Firebase Console

## Thông tin Firebase hiện tại:

- **App ID**: `1:406297796172:ios:37bdd1db3a4250d6d4dee9`
- **Bundle ID**: `com.veila.app`
- **App nickname**: `Veila`

## Bước 1: Truy cập Firebase Console

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn (có App ID: 406297796172)

## Bước 2: Bật Google Authentication

1. Vào **Authentication** trong sidebar
2. Click tab **Sign-in method**
3. Tìm **Google** provider và click vào
4. Bật **Enable** switch
5. Nhập **Project support email** (email của bạn)
6. Click **Save**

## Bước 3: Lấy Client IDs

1. Trong Google provider settings, click **Web SDK configuration**
2. Bạn sẽ thấy các Client IDs:
   - **Web client ID**: `406297796172-xxxxxxxxxx.apps.googleusercontent.com`
   - **iOS client ID**: `406297796172-xxxxxxxxxx.apps.googleusercontent.com`
   - **Android client ID**: `406297796172-xxxxxxxxxx.apps.googleusercontent.com`

## Bước 4: Cập nhật cấu hình

Mở file `utils/google-auth.config.ts` và thay thế:

```typescript
CLIENT_IDS: {
  WEB: '406297796172-ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com',
  IOS: '406297796172-ACTUAL_IOS_CLIENT_ID.apps.googleusercontent.com',
  ANDROID: '406297796172-ACTUAL_ANDROID_CLIENT_ID.apps.googleusercontent.com',
},
```

## Bước 5: Cài đặt Dependencies

```bash
npm install expo-auth-session expo-web-browser
```

## Bước 6: Test

1. Chạy app: `npm start`
2. Vào màn hình login
3. Click "Đăng nhập với Google"
4. Chọn tài khoản Google
5. Kiểm tra API call đến `/api/auth/google/login`

## Lưu ý:

- Đảm bảo Google provider đã được bật trong Firebase Authentication
- Client IDs sẽ có format: `406297796172-xxxxxxxxxx.apps.googleusercontent.com`
- Test trên device thật, không chỉ simulator
- Kiểm tra console logs để debug nếu có lỗi

## Troubleshooting:

- Nếu không thấy Google provider: Đảm bảo đã bật trong Firebase Console
- Nếu lỗi "Invalid client ID": Kiểm tra lại Client ID đã copy đúng chưa
- Nếu lỗi network: Kiểm tra kết nối internet và Firebase project settings
