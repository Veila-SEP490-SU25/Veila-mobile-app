# 🔧 Fix Firebase Console - Step by Step

## ❌ Vấn đề hiện tại:

```
ERROR Firebase Phone Auth error: [FirebaseError: Firebase: Error (auth/invalid-app-credential).]
WARN No native ExpoFirebaseCore module found
```

## ✅ Cách fix từng bước:

### **Bước 1: Vào Firebase Console**

1. Mở browser: https://console.firebase.google.com/
2. Đăng nhập với Google account
3. Chọn project **Veila** (hoặc tạo mới nếu chưa có)

### **Bước 2: Enable Phone Authentication**

1. Trong menu bên trái, click **Authentication**
2. Chọn tab **Sign-in method**
3. Tìm **Phone** trong danh sách providers
4. Click vào **Phone** → **Enable** (nếu chưa enable)
5. Click **Save**

### **Bước 3: Thêm iOS App**

1. Click **Project Settings** (⚙️ icon) ở góc trái
2. Chọn tab **General**
3. Scroll xuống phần **Your apps**
4. Click **Add app** → **iOS**
5. Nhập **Bundle ID:** `com.veila.app`
6. Nhập **App nickname:** `Veila iOS`
7. Click **Register app**

### **Bước 4: Download GoogleService-Info.plist**

1. Sau khi đăng ký app, Firebase sẽ tạo file config
2. Click **Download GoogleService-Info.plist**
3. Copy file này vào `ios/Veila/` folder

### **Bước 5: Kiểm tra App Configuration**

1. Trong **Your apps**, click vào app iOS vừa tạo
2. Kiểm tra **Bundle ID** có đúng `com.veila.app`
3. Kiểm tra **App ID** có khớp với `FIREBASE_APP_ID` trong `.env`

### **Bước 6: Test lại**

1. **Restart app** sau khi thay đổi Firebase Console
2. **Clear Metro cache:**

```bash
npx expo start --clear
```

3. **Test lại Phone Authentication**

## 🔍 Kiểm tra cấu hình:

### **1. Kiểm tra GoogleService-Info.plist:**

```bash
ls -la ios/Veila/GoogleService-Info.plist
```

### **2. Kiểm tra Firebase Console:**

- Phone Authentication: ✅ Enabled
- iOS App: ✅ Added với Bundle ID `com.veila.app`
- GoogleService-Info.plist: ✅ Downloaded

### **3. Kiểm tra logs:**

Sau khi fix, logs sẽ hiển thị:

```
LOG Using expo-firebase-recaptcha verifier
LOG Firebase Phone Auth: SMS sent successfully to +84354019580
```

## 🚨 Các lỗi thường gặp:

### **1. Phone Authentication chưa enable:**

- Vào Authentication → Sign-in method → Phone → Enable

### **2. iOS App chưa được thêm:**

- Vào Project Settings → General → Your apps → Add app → iOS

### **3. Bundle ID sai:**

- Kiểm tra `app.json` có `"bundleIdentifier": "com.veila.app"`
- Kiểm tra Firebase Console có Bundle ID khớp

### **4. GoogleService-Info.plist chưa có:**

- Download từ Firebase Console sau khi thêm app
- Copy vào `ios/Veila/` folder

## 🎯 Kết quả mong đợi:

Sau khi fix Firebase Console:

- ✅ Phone Authentication hoạt động
- ✅ SMS thật được gửi từ Firebase
- ✅ reCAPTCHA verification thành công
- ✅ Không còn lỗi `auth/invalid-app-credential`

## 📞 Hỗ trợ:

Nếu vẫn gặp vấn đề:

1. Chụp màn hình Firebase Console
2. Copy console logs
3. Gửi thông tin cho team dev

## 🎉 Chúc mừng!

Sau khi fix Firebase Console, Phone Authentication sẽ hoạt động hoàn hảo với SMS thật!
