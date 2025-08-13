# 🔧 Fix reCAPTCHA Connection Issues

## 🚨 Vấn đề hiện tại:

```
ERROR Cannot contact reCAPTCHA. Check your connection and try again.
ERROR Firebase Phone Auth error: [Error: Cancelled by user]
ERROR Error code: ERR_FIREBASE_RECAPTCHA_CANCEL
```

## 🎯 Nguyên nhân:

1. **Firebase Console chưa được cấu hình đúng cho reCAPTCHA**
2. **Authorized Domains thiếu**
3. **Phone Authentication chưa được enable**
4. **App credentials không đúng**

## 🔧 Cách fix từng bước:

### **Bước 1: Enable Phone Authentication**

1. Vào: https://console.firebase.google.com/
2. Chọn project **Veila**
3. Authentication → Sign-in method
4. Tìm **Phone** → Click **Enable**
5. ✅ **Phone numbers for testing** → Thêm số test:
   - Phone number: `+84937961828`
   - Code: `123456`

### **Bước 2: Thêm Authorized Domains (QUAN TRỌNG!)**

1. Authentication → Settings → **Authorized domains**
2. Thêm các domain sau:
   ```
   localhost
   127.0.0.1
   exp.host (BẮT BUỘC cho Expo)
   auth.expo.io (BẮT BUỘC cho Expo)
   ```

### **Bước 3: Kiểm tra App Configuration**

1. Project Settings → General → **Your apps**
2. Nếu chưa có iOS app → Add app → iOS
3. Bundle ID: `com.veila.app`
4. Download `GoogleService-Info.plist`

### **Bước 4: Disable Enterprise reCAPTCHA**

1. Authentication → Settings → **Advanced**
2. Tìm **reCAPTCHA Enterprise** → **Disable**
3. Chọn **reCAPTCHA v3** thay thế

### **Bước 5: Kiểm tra Network Rules**

1. Firestore → Rules
2. Đảm bảo có rule cho Phone Auth:
   ```
   allow read, write: if request.auth != null;
   ```

## 🧪 Test sau khi fix:

1. **Restart app:**

   ```bash
   npx expo start --clear
   ```

2. **Kiểm tra logs:**

   ```
   LOG reCAPTCHA verifier ref set successfully
   LOG reCAPTCHA verifier reset
   LOG reCAPTCHA verifier ready: true
   LOG Firebase Phone Auth: SMS sent successfully to +84937961828
   ```

3. **Không còn lỗi:**
   - ❌ "Cannot contact reCAPTCHA"
   - ❌ "ERR_FIREBASE_RECAPTCHA_CANCEL"
   - ✅ reCAPTCHA hiển thị bình thường
   - ✅ SMS được gửi thành công

## 🚀 Nếu vẫn lỗi:

### **Option 1: Test với số thật**

1. Thay vì dùng số test, dùng số điện thoại thật
2. Firebase sẽ gửi SMS thật

### **Option 2: Kiểm tra Internet**

1. Đảm bảo kết nối internet ổn định
2. Thử với WiFi khác hoặc 4G

### **Option 3: Clear Cache**

1. Xóa cache Expo:
   ```bash
   npx expo start --clear
   ```
2. Xóa cache Firebase:
   ```bash
   npx expo start --clear --reset-cache
   ```

## 📱 Kết quả mong đợi:

Sau khi fix Firebase Console:

- ✅ reCAPTCHA hiển thị bình thường
- ✅ Không có lỗi connection
- ✅ SMS được gửi thành công
- ✅ Phone Authentication hoạt động

## 🔍 Debug thêm:

Nếu vẫn lỗi, kiểm tra:

1. **Firebase Console logs**
2. **Network tab trong browser**
3. **Expo logs**
4. **Device logs**

---

**Lưu ý:** reCAPTCHA connection issues thường do Firebase Console configuration, không phải code. Hãy làm theo từng bước trên một cách cẩn thận!
