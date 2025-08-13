import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../providers/auth.provider";
import { useVerifyPhoneMutation } from "../../../services/apis/auth.api";
import { FirebasePhoneAuthService } from "../../../services/firebase-phone-auth";
import InputOTP from "./InputOTP";

export default function PhoneVerificationForm() {
  const router = useRouter();
  const authContext = useAuth();
  const user = authContext?.user || null;
  const { refreshUser } = authContext;
  const [verifyPhone] = useVerifyPhoneMutation();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Update phoneNumber when user changes
  useEffect(() => {
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user?.phone]);

  // Check if phone number has changed
  const hasPhoneChanged = user?.phone && phoneNumber !== user.phone;

  const getPhoneVerificationIcon = () => {
    if (!user?.isIdentified) return "close-circle";
    return "checkmark-circle";
  };

  const getPhoneVerificationColor = () => {
    if (!user?.isIdentified) return "#EF4444";
    return "#10B981";
  };

  const getPhoneVerificationStatus = () => {
    if (!user?.isIdentified) return "Chưa xác thực";
    return "Đã xác thực";
  };

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
    setError("");
  };

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formattedPhone = phoneNumber.startsWith("0")
        ? `+84${phoneNumber.slice(1)}`
        : phoneNumber.startsWith("+84")
          ? phoneNumber
          : `+84${phoneNumber}`;

      console.log("Sending verification code to:", formattedPhone);

      const result =
        await FirebasePhoneAuthService.sendVerificationCode(formattedPhone);

      if (result.success) {
        setConfirmationResult(result);
        setStep("otp");
        setError("");
        console.log("Verification code sent successfully");

        // Show success message for mock mode
        if (result.isMock) {
          Alert.alert(
            "Mã xác thực đã được gửi",
            "Vui lòng kiểm tra tin nhắn SMS và nhập mã 6 số",
            [{ text: "OK" }]
          );
        }
      } else {
        setError("Không thể gửi mã xác thực. Vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error("Error sending code:", error);
      setError(error.message || "Lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim() || code.length !== 6) {
      setError("Vui lòng nhập mã 6 số");
      return;
    }

    if (!confirmationResult) {
      setError("Không có thông tin xác thực. Vui lòng gửi lại mã.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await FirebasePhoneAuthService.verifyCode(
        confirmationResult.verificationId,
        code
      );

      if (result.success) {
        setError("");

        // Call backend API to save verified phone number
        try {
          console.log(
            "Calling backend API to save verified phone number:",
            phoneNumber
          );

          const backendResult = await verifyPhone({
            phone: phoneNumber,
          }).unwrap();

          console.log("Backend API response:", backendResult);

          // Refresh user data to get updated phone verification status
          try {
            await refreshUser();
            console.log("User data refreshed successfully");
          } catch (refreshError) {
            console.error("Error refreshing user data:", refreshError);
          }

          Alert.alert(
            "Xác thực thành công!",
            "Số điện thoại đã được xác thực và lưu vào hệ thống thành công.",
            [
              {
                text: "OK",
                onPress: () => {
                  // Navigate back or to success screen
                  router.back();
                },
              },
            ]
          );
        } catch (backendError: any) {
          console.error("Backend API error:", backendError);

          // Even if backend fails, phone verification was successful
          Alert.alert(
            "Xác thực thành công!",
            "Số điện thoại đã được xác thực với Firebase. Tuy nhiên, có vấn đề khi lưu vào hệ thống. Vui lòng thử lại sau.",
            [
              {
                text: "OK",
                onPress: () => {
                  router.back();
                },
              },
            ]
          );
        }
      } else {
        setError("Xác thực thất bại. Vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error("Error verifying code:", error);
      setError(error.message || "Lỗi xác thực");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCode("");
    setStep("phone");
    setConfirmationResult(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-gradient-to-b from-blue-50 to-white px-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-6 z-10"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <View className="items-center pt-16 pb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Xác thực số điện thoại
            </Text>
            <Text className="text-gray-600 text-center text-sm">
              Nhập số điện thoại để nhận mã xác thực
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 py-4">
          {/* Current Phone Status */}
          {user?.phone && (
            <View className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 mb-4 border border-gray-200 shadow-sm">
              <View className="flex-row items-center mb-2">
                <View className="bg-green-100 rounded-full p-2 mr-3">
                  <Ionicons
                    name={getPhoneVerificationIcon() as any}
                    size={18}
                    color={getPhoneVerificationColor()}
                  />
                </View>
                <Text className="text-gray-700 font-semibold text-sm">
                  Số điện thoại hiện tại
                </Text>
              </View>
              <Text className="text-lg font-bold text-gray-900 mb-2">
                {user.phone}
              </Text>
              <View className="flex-row items-center">
                <View
                  className="w-2.5 h-2.5 rounded-full mr-2"
                  style={{ backgroundColor: getPhoneVerificationColor() }}
                />
                <Text
                  className="text-xs font-medium"
                  style={{ color: getPhoneVerificationColor() }}
                >
                  {getPhoneVerificationStatus()}
                </Text>
              </View>
            </View>
          )}

          {step === "phone" ? (
            /* Phone Input Step */
            <View>
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2 text-sm">
                  Số điện thoại mới
                </Text>
                <TextInput
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  placeholder="Nhập số điện thoại (VD: 0967475325)"
                  keyboardType="phone-pad"
                  className="border border-gray-300 rounded-xl px-3 py-3 text-gray-900 bg-white text-sm shadow-sm"
                  editable={!isLoading}
                />
                {hasPhoneChanged && (
                  <View className="mt-2 bg-blue-50 rounded-lg p-2 border border-blue-200">
                    <Text className="text-blue-700 text-xs font-medium">
                      Số điện thoại đã thay đổi, cần xác thực lại
                    </Text>
                  </View>
                )}
              </View>

              {error && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <View className="flex-row items-start">
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color="#EF4444"
                      style={{ marginTop: 1 }}
                    />
                    <Text className="text-red-700 text-xs ml-2 flex-1">
                      {error}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSendCode}
                disabled={isLoading || !phoneNumber.trim()}
                className={`rounded-xl py-3 px-4 shadow-sm ${
                  isLoading || !phoneNumber.trim()
                    ? "bg-gray-300"
                    : "bg-gradient-to-r from-blue-600 to-blue-700"
                }`}
                style={{
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                }}
              >
                {isLoading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text className="text-white font-semibold text-center ml-2 text-sm">
                      Đang gửi...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold text-center text-sm">
                    Gửi mã xác thực
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* OTP Input Step */
            <View>
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-3 text-center text-sm">
                  Nhập mã 6 số đã được gửi đến
                </Text>
                <Text className="text-base font-bold text-gray-900 text-center mb-4">
                  {phoneNumber}
                </Text>
                <InputOTP value={code} onChange={setCode} maxLength={6} />
              </View>

              {error && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <View className="flex-row items-start">
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color="#EF4444"
                      style={{ marginTop: 1 }}
                    />
                    <Text className="text-red-700 text-xs ml-2 flex-1">
                      {error}
                    </Text>
                  </View>
                </View>
              )}

              <View className="space-y-2">
                <TouchableOpacity
                  onPress={handleVerifyCode}
                  disabled={isLoading || code.length !== 6}
                  className={`rounded-xl py-3 px-4 shadow-sm ${
                    isLoading || code.length !== 6
                      ? "bg-gray-300"
                      : "bg-gradient-to-r from-green-600 to-green-700"
                  }`}
                  style={{
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                  }}
                >
                  {isLoading ? (
                    <View className="flex-row items-center justify-center">
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text className="text-white font-semibold text-center ml-2 text-sm">
                        Đang xác thực...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white font-semibold text-center text-sm">
                      Xác thực
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={isLoading}
                  className="py-3 px-4"
                >
                  <Text className="text-primary-600 font-semibold text-center text-sm">
                    Gửi lại mã
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
