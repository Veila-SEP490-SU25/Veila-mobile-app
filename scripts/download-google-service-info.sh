#!/bin/bash

echo "📥 Tự động copy GoogleService-Info.plist..."

# Tạo thư mục ios/Veila nếu chưa có
mkdir -p ios/Veila

# Kiểm tra file có tồn tại không
if [ -f "ios/Veila/GoogleService-Info.plist" ]; then
    echo "✅ GoogleService-Info.plist đã tồn tại"
else
    echo "❌ GoogleService-Info.plist chưa có"
    echo "📋 Hãy làm theo các bước sau:"
    echo "1. Download GoogleService-Info.plist từ Firebase Console"
    echo "2. Copy file vào thư mục ios/Veila/"
    echo "3. Chạy lại script này"
fi

echo "🔍 Kiểm tra cấu hình..."
if [ -f "ios/Veila/GoogleService-Info.plist" ]; then
    echo "✅ File tồn tại"
    echo "📱 Bundle ID trong file:"
    grep -o 'com\.[^<]*' ios/Veila/GoogleService-Info.plist || echo "❌ Không tìm thấy Bundle ID"
else
    echo "❌ File không tồn tại"
fi
