import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  useRequestOtpMutation,
  useResetPasswordMutation,
} from "../../services/apis";

export default function ResetPasswordScreen() {
  const { userId: userIdParam, email: emailParam } = useLocalSearchParams();
  const [resetPassword] = useResetPasswordMutation();
  const [requestOtp] = useRequestOtpMutation();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300);
  const [isRunning, setIsRunning] = useState(true);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const userId = String(userIdParam || "");
  const email = String(emailParam || "");

  React.useEffect(() => {
    if (!userId || !email) {
      router.replace("/_auth/login");
      return;
    }
  }, [userId, email]);

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRunning && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    if (!isRunning || timer <= 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timer]);

  const validatePassword = (password: string) => {

    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    );
  };

  const handleResetPassword = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP hợp lệ.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        "Lỗi",
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await resetPassword({
        userId,
        otp: code,
        newPassword,
      }).unwrap();

      if (response.statusCode === 200) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Mật khẩu đã được đặt lại",
        });
        router.replace("/_auth/login");
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: response.message || "Không thể đặt lại mật khẩu",
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Đã xảy ra lỗi, vui lòng thử lại",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await requestOtp({ email }).unwrap();
      if (response.statusCode === 200) {
        Toast.show({ type: "success", text1: "Mã OTP đã được gửi lại." });
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
        setTimer(300);
        setIsRunning(true);
      } else {
        Toast.show({
          type: "error",
          text1: "Không thể gửi OTP",
          text2: response.message,
        });
      }
    } catch {
      Toast.show({ type: "error", text1: "Đã xảy ra lỗi khi gửi lại OTP." });
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: "none", color: "#E5E7EB" };
    if (password.length < 8) return { strength: "weak", color: "#EF4444" };
    if (validatePassword(password))
      return { strength: "strong", color: "#10B981" };
    return { strength: "medium", color: "#F59E0B" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Đặt lại mật khẩu</Text>
      <Text style={styles.subtitle}>Nhập mã OTP đã được gửi đến {email}</Text>

      <View style={styles.otpContainer}>
        <Text style={styles.label}>Mã OTP</Text>
        <View style={styles.otpInputContainer}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(val) => {
                const next = [...otp];
                next[idx] = val;
                setOtp(next);

                if (val && idx < 5) {
                  inputRefs.current[idx + 1]?.focus();
                }

                if (!val && idx > 0) {
                  inputRefs.current[idx - 1]?.focus();
                }
              }}
            />
          ))}
        </View>
      </View>

      <Text style={styles.timerText}>
        Mã OTP hết hạn sau: {Math.floor(timer / 60)}:
        {(timer % 60).toString().padStart(2, "0")}
      </Text>

      <TouchableOpacity
        disabled={isRunning}
        onPress={handleResendOtp}
        style={[styles.resendButton, isRunning && { opacity: 0.5 }]}
      >
        <Text style={styles.resendButtonText}>Gửi lại OTP</Text>
      </TouchableOpacity>

      <View style={styles.passwordContainer}>
        <Text style={styles.label}>Mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        {newPassword.length > 0 && (
          <View style={styles.passwordStrengthContainer}>
            <View style={styles.strengthBar}>
              <View
                style={[
                  styles.strengthFill,
                  {
                    width: `${(newPassword.length / 8) * 100}%`,
                    backgroundColor: passwordStrength.color,
                  },
                ]}
              />
            </View>
            <Text
              style={[styles.strengthText, { color: passwordStrength.color }]}
            >
              {passwordStrength.strength === "none" && "Nhập mật khẩu"}
              {passwordStrength.strength === "weak" && "Yếu"}
              {passwordStrength.strength === "medium" && "Trung bình"}
              {passwordStrength.strength === "strong" && "Mạnh"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.passwordContainer}>
        <Text style={styles.label}>Xác nhận mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
          <Text style={styles.errorText}>Mật khẩu không khớp</Text>
        )}
      </View>

      <View style={styles.requirementsContainer}>
        <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
        <Text style={styles.requirement}>• Ít nhất 8 ký tự</Text>
        <Text style={styles.requirement}>• Có chữ hoa và chữ thường</Text>
        <Text style={styles.requirement}>• Có số và ký tự đặc biệt</Text>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  otpContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  otpInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: "center",
    backgroundColor: "#FFFFFF",
  },
  timerText: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    marginBottom: 16,
  },
  resendButton: {
    alignItems: "center",
    marginBottom: 24,
  },
  resendButtonText: {
    color: "#E05C78",
    fontSize: 14,
    fontWeight: "500",
  },
  passwordContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: 4,
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  requirementsContainer: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  requirement: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: "#E05C78",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#E05C78",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    alignItems: "center",
  },
  backButtonText: {
    color: "#E05C78",
    fontSize: 14,
    fontWeight: "500",
  },
});
