# 🔧 Fix reCAPTCHA Token Response Issue

## ❌ Lỗi hiện tại:

```
ERROR Firebase: The phone verification request contains an invalid application verifier. The reCAPTCHA token response is either invalid or expired. (auth/invalid-app-credential).
```

## 🔍 Nguyên nhân:

reCAPTCHA token response không hợp lệ hoặc đã hết hạn. Điều này xảy ra khi:

1. **reCAPTCHA verifier chưa được khởi tạo đúng cách**
2. **Token đã hết hạn trước khi gửi request**
3. **Firebase Console chưa được cấu hình đúng cho reCAPTCHA**
4. **Authorized Domains thiếu các domain cần thiết**

## ✅ Cách fix từng bước:

### **Bước 1: Fix Firebase Console Configuration**

#### **1.1 Enable Phone Authentication**

1. Vào Firebase Console: https://console.firebase.google.com/
2. Chọn project **Veila**
3. Authentication → Sign-in method → Phone → **Enable**
4. Click **Save**

#### **1.2 Thêm Authorized Domains (QUAN TRỌNG!)**

1. Authentication → Settings → **Authorized domains**
2. Thêm các domains sau:
   ```
   localhost
   127.0.0.1
   exp.host (BẮT BUỘC cho Expo)
   auth.expo.io (BẮT BUỘC cho Expo)
   [LAN IP của máy]
   ```

#### **1.3 Thêm iOS App**

1. Project Settings → General → **Your apps**
2. Click **"Add app"** → iOS
3. Bundle ID: `com.veila.app`
4. App nickname: `Veila iOS`
5. Click **Register app**

#### **1.4 Download GoogleService-Info.plist**

1. Sau khi đăng ký app, click **"Download GoogleService-Info.plist"**
2. Copy file vào `ios/Veila/` folder

#### **1.5 Cấu hình Phone Numbers for Testing**

1. Authentication → Sign-in method → Phone
2. Tab **"Phone numbers for testing"**
3. Thêm số: `+84354019580` với OTP: `123456`

#### **1.6 Tắt Enterprise reCAPTCHA**

1. Authentication → Settings → Phone numbers
2. Vô hiệu hóa **Enterprise reCAPTCHA** → để mặc định v2

### **Bước 2: Fix Code Issues**

#### **2.1 Reset reCAPTCHA verifier**

Code đã được fix để:

- Reset reCAPTCHA verifier trước khi sử dụng
- Đợi reCAPTCHA khởi tạo (1 giây)
- Kiểm tra reCAPTCHA verifier có sẵn sàng không

#### **2.2 Handle reCAPTCHA token errors**

- Thông báo lỗi chi tiết hơn
- Gợi ý restart app nếu cần

### **Bước 3: Test và Troubleshooting**

#### **3.1 Restart App**

1. **Stop app** (Ctrl+C trong terminal)
2. **Clear Metro cache:**

```bash
npx expo start --clear
```

3. **Restart app**

#### **3.2 Test Phone Authentication**

1. Vào Account → Xác thực số điện thoại
2. Nhập số: `+84354019580`
3. Nhấn "Gửi mã xác thực"
4. Sử dụng OTP test: `123456`

#### **3.3 Kiểm tra logs**

Sau khi fix, logs sẽ hiển thị:

```
LOG reCAPTCHA verifier ref set successfully
LOG reCAPTCHA verifier reset
LOG reCAPTCHA verifier ready: true
LOG Using firebase/compat with expo-firebase-recaptcha verifier
LOG Firebase Phone Auth: SMS sent successfully to +84354019580
```

## 🚨 Nếu vẫn gặp lỗi:

### **1. Kiểm tra Firebase Console:**

- Phone Authentication đã enable chưa?
- Authorized Domains có `exp.host` và `auth.expo.io` chưa?
- iOS App đã được thêm chưa?
- GoogleService-Info.plist đã có chưa?

### **2. Kiểm tra Code:**

- reCAPTCHA verifier ref có được set đúng không?
- Firebase config có đúng không?
- Dependencies có đầy đủ không?

### **3. Kiểm tra Environment:**

- App có chạy trên iOS simulator không?
- Có dùng Expo Go không?
- Network có ổn định không?

## 🎯 Kết quả mong đợi:

Sau khi fix:

- ✅ reCAPTCHA token response hợp lệ
- ✅ Firebase Phone Auth hoạt động
- ✅ SMS test được gửi thành công
- ✅ OTP verification thành công

## 📞 Hỗ trợ:

Nếu vẫn gặp vấn đề:

1. Chụp màn hình Firebase Console
2. Copy console logs
3. Gửi thông tin cho team dev

## 🎉 Chúc mừng!

Sau khi fix reCAPTCHA token response issue, Firebase Phone Auth sẽ hoạt động hoàn hảo!
