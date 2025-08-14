import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
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
  const [resendCountdown, setResendCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update phoneNumber when user changes
  useEffect(() => {
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user?.phone]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startResendTimer = (seconds: number = 60) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendCountdown(seconds);
    timerRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

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

  const formatToE164VN = (raw: string) => {
    const t = raw.trim();
    if (!t) return "";
    if (t.startsWith("+84")) return t;
    if (t.startsWith("0")) return `+84${t.slice(1)}`;
    return `+84${t}`;
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
      const formattedPhone = formatToE164VN(phoneNumber);
      const result =
        await FirebasePhoneAuthService.sendVerificationCode(formattedPhone);

      if (result.success) {
        setConfirmationResult(result);
        setStep("otp");
        setError("");
        startResendTimer(60);

        if (result.isMock) {
          Toast.show({
            type: "info",
            text1: "Mã xác thực đã được gửi",
            text2: "Vui lòng kiểm tra SMS và nhập mã 6 số",
          });
        }
      } else {
        setError("Không thể gửi mã xác thực. Vui lòng thử lại.");
        Toast.show({ type: "error", text1: "Gửi mã thất bại" });
      }
    } catch (error: any) {
      setError(error.message || "Lỗi không xác định");
      Toast.show({
        type: "error",
        text1: "Gửi mã thất bại",
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim() || code.length !== 6) {
      setError("Vui lòng nhập mã 6 số");
      Toast.show({ type: "warning", text1: "Mã OTP không hợp lệ" });
      return;
    }

    if (!confirmationResult) {
      setError("Không có thông tin xác thực. Vui lòng gửi lại mã.");
      Toast.show({ type: "error", text1: "Thiếu thông tin xác thực" });
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

        try {
          await verifyPhone({ phone: phoneNumber }).unwrap();
          try {
            await refreshUser();
          } catch {}

          Toast.show({
            type: "success",
            text1: "Xác thực thành công",
            text2: "Số điện thoại đã được lưu vào hệ thống",
          });
          setTimeout(() => router.back(), 400);
        } catch {
          Toast.show({
            type: "warning",
            text1: "Xác thực Firebase thành công",
            text2: "Lưu vào hệ thống thất bại. Vui lòng thử lại",
          });
          setTimeout(() => router.back(), 600);
        }
      } else {
        setError("Xác thực thất bại. Vui lòng thử lại.");
        Toast.show({ type: "error", text1: "Xác thực thất bại" });
      }
    } catch (error: any) {
      setError(error.message || "Lỗi xác thực");
      Toast.show({
        type: "error",
        text1: "Xác thực thất bại",
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;
    setIsLoading(true);
    setError("");
    try {
      const formattedPhone = formatToE164VN(phoneNumber);
      const result =
        await FirebasePhoneAuthService.sendVerificationCode(formattedPhone);
      if (result.success) {
        setConfirmationResult(result);
        setCode("");
        startResendTimer(60);
        Toast.show({
          type: "info",
          text1: "Đã gửi lại mã",
          text2: "Vui lòng kiểm tra SMS",
        });
      } else {
        setError("Không thể gửi lại mã. Vui lòng thử lại.");
        Toast.show({ type: "error", text1: "Gửi lại mã thất bại" });
      }
    } catch (e: any) {
      setError(e.message || "Lỗi gửi lại mã");
      Toast.show({
        type: "error",
        text1: "Gửi lại mã thất bại",
        text2: e.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToPhoneStep = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendCountdown(0);
    setCode("");
    setStep("phone");
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
        {/* Content */}
        <View className="px-4 ">
          {/* Step Indicator moved here to avoid duplicate header */}
          <View className="flex-row items-center justify-center mb-4">
            <View className="flex-row items-center">
              <View
                className={`w-6 h-6 rounded-full items-center justify-center ${
                  step === "phone" ? "bg-blue-600" : "bg-blue-200"
                }`}
              >
                <Text className="text-white text-xs font-bold">1</Text>
              </View>
              <View className="w-10 h-0.5 bg-blue-300 mx-2" />
              <View
                className={`w-6 h-6 rounded-full items-center justify-center ${
                  step === "otp" ? "bg-blue-600" : "bg-blue-200"
                }`}
              >
                <Text className="text-white text-xs font-bold">2</Text>
              </View>
            </View>
          </View>

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
              <View className="mb-2">
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
                className={`rounded-xl py-3 px-4 shadow-sm`}
                style={{
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  backgroundColor:
                    isLoading || !phoneNumber.trim() ? "#D1D5DB" : "#2563EB",
                  borderWidth: 1,
                  borderColor:
                    isLoading || !phoneNumber.trim() ? "#D1D5DB" : "#1D4ED8",
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
              <View className="mb-3">
                <Text className="text-gray-700 font-semibold mb-3 text-center text-sm">
                  Nhập mã 6 số đã được gửi đến
                </Text>
                <Text className="text-base font-bold text-gray-900 text-center mb-4">
                  {formatToE164VN(phoneNumber)}
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
                  className={`rounded-xl py-3 px-4 shadow-sm`}
                  style={{
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    backgroundColor:
                      isLoading || code.length !== 6 ? "#D1D5DB" : "#059669",
                    borderWidth: 1,
                    borderColor:
                      isLoading || code.length !== 6 ? "#D1D5DB" : "#047857",
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

                <View className="flex-row items-center justify-center">
                  <TouchableOpacity
                    onPress={goBackToPhoneStep}
                    disabled={isLoading}
                  >
                    <Text className="text-gray-600 text-sm underline">
                      Đổi số điện thoại
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={isLoading || resendCountdown > 0}
                  className="py-3 px-4"
                >
                  <Text
                    className={`font-semibold text-center text-sm ${
                      isLoading || resendCountdown > 0
                        ? "text-gray-400"
                        : "text-primary-600"
                    }`}
                  >
                    {resendCountdown > 0
                      ? `Gửi lại mã (${resendCountdown}s)`
                      : "Gửi lại mã"}
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
