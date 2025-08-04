import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "providers/auth.provider";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useRequestOtpMutation } from "services/apis";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { userId: userIdParam, email: emailParam } = useLocalSearchParams();

  const { verifyOtp, isLoading } = useAuth();
  const [requestOtp] = useRequestOtpMutation();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(300);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!userIdParam || !emailParam) {
      router.replace("/_auth/login");
      return;
    }
    setUserId(String(userIdParam));
    setEmail(String(emailParam));
    setIsRunning(true);
  }, [userIdParam, emailParam, router]);

  useEffect(() => {
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

  const handleVerify = useCallback(async () => {
    const code = otp.join("");
    if (code.length < 6) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP hợp lệ.");
      return;
    }
    await verifyOtp({ userId, otp: code });
  }, [otp, userId, verifyOtp]);

  const handleResendOtp = useCallback(async () => {
    try {
      const res = await requestOtp({ email }).unwrap();
      if (res.statusCode === 200) {
        Toast.show({ type: "success", text1: "Mã OTP đã được gửi lại." });
        setUserId(res.item);
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
        setTimer(300);
        setIsRunning(true);
      } else {
        Toast.show({
          type: "error",
          text1: "Không thể gửi OTP",
          text2: res.message,
        });
      }
    } catch {
      Toast.show({ type: "error", text1: "Đã xảy ra lỗi khi gửi lại OTP." });
    }
  }, [email, requestOtp]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhập mã xác thực</Text>

      <View style={styles.otpContainer}>
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

      <Text style={styles.timerText}>
        Mã OTP hết hạn sau: {Math.floor(timer / 60)}:
        {(timer % 60).toString().padStart(2, "0")}
      </Text>

      <TouchableOpacity
        disabled={isRunning}
        onPress={handleResendOtp}
        style={[styles.linkBtn, isRunning && { opacity: 0.5 }]}
      >
        <Text style={styles.linkText}>Gửi lại OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleVerify}
        style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
        disabled={isLoading}
      >
        <Text style={styles.submitText}>
          {isLoading ? "Đang xác thực..." : "Xác thực"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  otpContainer: { flexDirection: "row", gap: 8, marginBottom: 20 },
  otpInput: {
    borderBottomWidth: 1,
    width: 40,
    textAlign: "center",
    fontSize: 20,
    marginHorizontal: 4,
  },
  timerText: { marginTop: 10, fontSize: 14, color: "#333" },
  linkBtn: { marginTop: 10 },
  linkText: { color: "#800000", fontWeight: "bold" },
  submitBtn: {
    marginTop: 20,
    backgroundColor: "#800000",
    padding: 12,
    borderRadius: 6,
    width: "100%",
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "bold" },
});
