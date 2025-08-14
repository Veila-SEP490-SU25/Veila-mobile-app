import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { WebView } from "react-native-webview";

export default function PaymentCheckoutScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [webViewError, setWebViewError] = useState(false);
  const [, setCurrentUrl] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const checkoutUrl = Array.isArray(url) ? url[0] : url;

  // Auto-show fallback after 30 seconds if no navigation detected
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setShowFallback(true);
        setLoading(false);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [loading]);

  const onNavChange = useCallback(
    (event: any) => {
      const newUrl: string = event?.url || "";
      setCurrentUrl(newUrl);
      console.log("Navigation change:", newUrl);

      // More comprehensive URL pattern matching for PayOS
      if (
        newUrl.includes("/payment/success") ||
        newUrl.includes("success") ||
        newUrl.includes("thanh-cong") ||
        newUrl.includes("complete") ||
        newUrl.includes("done")
      ) {
        console.log("Payment success detected, navigating...");
        setShowFallback(false);
        Toast.show({
          type: "success",
          text1: "Thanh toán thành công",
          text2: "Đang chuyển về trang ví...",
        });

        // Use setTimeout to ensure WebView state is stable
        setTimeout(() => {
          try {
            router.replace("/payment/success");
          } catch (error) {
            console.error("Navigation error:", error);
            router.push("/payment/success");
          }
        }, 1500);
      } else if (
        newUrl.includes("/payment/failure") ||
        newUrl.includes("failure") ||
        newUrl.includes("cancel") ||
        newUrl.includes("huy") ||
        newUrl.includes("error")
      ) {
        console.log("Payment failure/cancel detected, navigating...");
        setShowFallback(false);
        Toast.show({
          type: "info",
          text1: "Thanh toán bị hủy",
          text2: "Đang chuyển về trang ví...",
        });

        setTimeout(() => {
          try {
            router.replace("/payment/failure");
          } catch (error) {
            console.error("Navigation error:", error);
            router.push("/payment/failure");
          }
        }, 1500);
      }
    },
    [router]
  );

  const onLoadStart = () => {
    setLoading(true);
    setWebViewError(false);
    setShowFallback(false);
  };

  const onLoadEnd = () => {
    setLoading(false);
  };

  const onError = (error: any) => {
    console.error("WebView error:", error);
    setWebViewError(true);
    setLoading(false);
    Toast.show({
      type: "error",
      text1: "Lỗi tải trang thanh toán",
      text2: "Vui lòng thử lại",
    });
  };

  const onHttpError = (error: any) => {
    console.error("HTTP error:", error);
    if (error.nativeEvent.statusCode >= 400) {
      setWebViewError(true);
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Lỗi kết nối thanh toán",
        text2: "Vui lòng kiểm tra kết nối mạng",
      });
    }
  };

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("WebView message:", data);

      // Handle messages from PayOS iframe
      if (data.type === "payment_success") {
        setShowFallback(false);
        Toast.show({
          type: "success",
          text1: "Thanh toán thành công",
          text2: "Đang chuyển về trang ví...",
        });
        setTimeout(() => router.replace("/payment/success"), 1000);
      } else if (data.type === "payment_failure") {
        setShowFallback(false);
        Toast.show({
          type: "info",
          text1: "Thanh toán thất bại",
          text2: "Đang chuyển về trang ví...",
        });
        setTimeout(() => router.replace("/payment/failure"), 1000);
      }
    } catch {
      console.log("Non-JSON message from WebView:", event.nativeEvent.data);
    }
  };

  const handleBackToWallet = () => {
    Alert.alert("Hủy thanh toán", "Bạn có chắc muốn hủy thanh toán này?", [
      {
        text: "Tiếp tục thanh toán",
        style: "cancel",
      },
      {
        text: "Hủy và về ví",
        style: "destructive",
        onPress: () => {
          Toast.show({
            type: "info",
            text1: "Đã hủy thanh toán",
            text2: "Chuyển về trang ví",
          });
          router.replace("/account/wallet");
        },
      },
    ]);
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
      setWebViewError(false);
      setLoading(true);
      setShowFallback(false);
    }
  };

  const handleManualSuccess = () => {
    Toast.show({
      type: "success",
      text1: "Chuyển đến trang thành công",
      text2: "Vui lòng xác nhận kết quả thanh toán",
    });
    router.replace("/payment/success");
  };

  const handleManualFailure = () => {
    Toast.show({
      type: "info",
      text1: "Chuyển đến trang thất bại",
      text2: "Vui lòng kiểm tra trạng thái thanh toán",
    });
    router.replace("/payment/failure");
  };

  if (!checkoutUrl) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle" size={80} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-400 mt-4 text-center">
            Không có link thanh toán
          </Text>
          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-3 px-6 mt-4"
            onPress={() => router.replace("/account/wallet")}
          >
            <Text className="text-white font-semibold">Về trang ví</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={handleBackToWallet}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            Thanh toán
          </Text>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={handleRefresh}
          >
            <Ionicons name="refresh" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        {loading && !showFallback && (
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-white items-center justify-center z-10">
            <ActivityIndicator size="large" color="#E05C78" />
            <Text className="text-gray-600 mt-4">
              Đang tải trang thanh toán...
            </Text>
          </View>
        )}

        {showFallback && (
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-white items-center justify-center z-10">
            <View className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200 mx-6">
              <View className="items-center">
                <Ionicons name="time-outline" size={48} color="#F59E0B" />
                <Text className="text-lg font-semibold text-yellow-800 mt-4 text-center">
                  Thanh toán đang xử lý
                </Text>
                <Text className="text-yellow-700 text-center mt-2 leading-5">
                  Nếu bạn đã hoàn thành thanh toán, vui lòng chọn kết quả phù
                  hợp bên dưới
                </Text>

                <View className="mt-6 w-full space-y-3">
                  <TouchableOpacity
                    className="bg-green-600 rounded-xl py-4 px-6 items-center"
                    onPress={handleManualSuccess}
                  >
                    <Text className="text-white font-semibold">
                      Thanh toán thành công
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-red-600 rounded-xl py-4 px-6 items-center"
                    onPress={handleManualFailure}
                  >
                    <Text className="text-white font-semibold">
                      Thanh toán thất bại
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-gray-200 rounded-xl py-4 px-6 items-center"
                    onPress={handleRefresh}
                  >
                    <Text className="text-gray-700 font-medium">
                      Tiếp tục chờ
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {webViewError ? (
          <View className="flex-1 justify-center items-center px-6">
            <Ionicons name="wifi-outline" size={80} color="#EF4444" />
            <Text className="text-xl font-semibold text-gray-400 mt-4 text-center">
              Không thể tải trang thanh toán
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              Vui lòng kiểm tra kết nối mạng và thử lại
            </Text>
            <View className="flex-row mt-6 space-x-3">
              <TouchableOpacity
                className="bg-gray-200 rounded-xl px-6 py-3"
                onPress={handleRefresh}
              >
                <Text className="text-gray-800 font-semibold">Thử lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-primary-500 rounded-xl px-6 py-3"
                onPress={() => router.replace("/account/wallet")}
              >
                <Text className="text-white font-semibold">Về ví</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ uri: checkoutUrl }}
            onNavigationStateChange={onNavChange}
            onLoadStart={onLoadStart}
            onLoadEnd={onLoadEnd}
            onError={onError}
            onHttpError={onHttpError}
            onMessage={onMessage}
            startInLoadingState={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsBackForwardNavigationGestures={false}
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
            injectedJavaScript={`
              // Listen for PayOS events
              window.addEventListener('message', function(event) {
                if (event.data && event.data.type) {
                  window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
                }
              });
              
              // Monitor URL changes
              let currentUrl = window.location.href;
              setInterval(function() {
                if (window.location.href !== currentUrl) {
                  currentUrl = window.location.href;
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'url_change',
                    url: currentUrl
                  }));
                }
              }, 1000);
            `}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
