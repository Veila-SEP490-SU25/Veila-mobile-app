import { useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  useSendSmsMutation,
  useVerifyPhoneOtpMutation,
} from "../services/apis/auth.api";

export const usePhoneVerification = () => {
  const [phone, setPhone] = useState("");
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string>("");
  const [otpSent, setOtpSent] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [blockUntil, setBlockUntil] = useState<number>(0);

  const [sendSms, { isLoading: isSendingSms }] = useSendSmsMutation();
  const [verifyPhoneOtp, { isLoading: isVerifying }] =
    useVerifyPhoneOtpMutation();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (isBlocked && blockUntil > 0) {
      const now = Date.now();
      if (now >= blockUntil) {
        setIsBlocked(false);
        setBlockUntil(0);
        setAttemptCount(0);
      } else {
        const remaining = Math.ceil((blockUntil - now) / 1000);
        setCountdown(remaining);
      }
    }
  }, [isBlocked, blockUntil]);

  const validatePhone = (phoneNumber: string) => {
    // Vietnamese phone validation: starts with 0, followed by 3,5,7,8,9, then 8 digits
    const phoneRegex = /^(0[3|5|7|8|9])\d{8}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    setIsValidPhone(validatePhone(text));
    setError("");
  };

  const handleCodeChange = (text: string) => {
    const numericCode = text.replace(/[^0-9]/g, "");
    setCode(numericCode);
    setError("");
  };

  const sendVerificationCode = async (): Promise<boolean> => {
    const currentTime = Date.now();

    // Check if user is blocked
    if (isBlocked && blockUntil > 0) {
      const now = Date.now();
      if (now < blockUntil) {
        const remainingTime = Math.ceil((blockUntil - now) / 1000);
        setCountdown(remainingTime);
        setError(
          `Vui lòng đợi ${remainingTime} giây trước khi gửi OTP tiếp theo.`
        );
        return false;
      }
    }

    // Check rate limiting (30 seconds between requests)
    if (currentTime - lastRequestTime < 30000) {
      const remainingTime = Math.ceil(
        (30000 - (currentTime - lastRequestTime)) / 1000
      );
      setCountdown(remainingTime);
      setError(
        `Vui lòng đợi ${remainingTime} giây trước khi gửi OTP tiếp theo.`
      );
      return false;
    }

    // Increment attempt count
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    // Block after 5 attempts for 1 hour
    if (newAttemptCount >= 5) {
      const blockTime = 60 * 60 * 1000; // 1 hour
      setIsBlocked(true);
      setBlockUntil(Date.now() + blockTime);
      setError("Quá nhiều lần thử gửi OTP. Tài khoản bị khóa trong 1 giờ.");
      return false;
    }

    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return false;
    }

    if (!isValidPhone) {
      setError("Số điện thoại không hợp lệ");
      return false;
    }

    setLastRequestTime(currentTime);
    setError("");

    try {
      let phoneNumber = phone.trim();

      // Đảm bảo số điện thoại có số 0 ở đầu
      if (!phoneNumber.startsWith("0")) {
        phoneNumber = `0${phoneNumber}`;
      }

      // Chuyển đổi sang format +84 để gửi SMS
      const vonagePhone = phoneNumber.startsWith("0")
        ? `+84${phoneNumber.substring(1)}`
        : `+84${phoneNumber}`;

      // Gửi SMS qua Vonage API
      const result = await sendSms({ to: vonagePhone }).unwrap();

      if (result) {
        setOtpSent(true);
        setStep("code");
        setError("");
        Alert.alert("Thành công", `Mã OTP đã được gửi đến ${phoneNumber}`, [
          { text: "OK" },
        ]);
        return true;
      }
      return false;
    } catch (error: any) {
      setError(
        error?.data?.message || "Không thể gửi mã xác thực. Vui lòng thử lại."
      );
      return false;
    }
  };

  const verifyCode = async (onSuccess?: () => void): Promise<boolean> => {
    if (!code.trim() || code.length !== 6) {
      setError("Vui lòng nhập mã xác thực 6 số");
      return false;
    }

    if (!phone.trim()) {
      setError("Không có số điện thoại để xác thực");
      return false;
    }

    try {
      let phoneNumber = phone.trim();

      // Đảm bảo số điện thoại có số 0 ở đầu
      if (!phoneNumber.startsWith("0")) {
        phoneNumber = `0${phoneNumber}`;
      }

      // Gọi API verify OTP qua vonage API
      const result = await verifyPhoneOtp({
        phone: phoneNumber, // Số điện thoại có số 0 ở đầu
        otp: code,
      }).unwrap();

      if (result) {
        setIsVerified(true);
        setError("");
        Alert.alert("Thành công", "Xác thực số điện thoại thành công", [
          {
            text: "OK",
            onPress: () => {
              onSuccess?.();
            },
          },
        ]);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Phone verification error:", error);
      setError(
        error?.data?.message ||
          "Không thể xác minh số điện thoại. Vui lòng thử lại."
      );
      return false;
    }
  };

  const resendCode = async (): Promise<boolean> => {
    if (!phone.trim() || !isValidPhone) {
      setError("Vui lòng kiểm tra số điện thoại trước");
      return false;
    }

    return await sendVerificationCode();
  };

  const resetVerification = () => {
    setPhone("");
    setIsValidPhone(false);
    setCode("");
    setStep("phone");
    setIsVerified(false);
    setCountdown(0);
    setError("");
    setOtpSent(false);
    setLastRequestTime(0);
    setAttemptCount(0);
    setIsBlocked(false);
    setBlockUntil(0);
  };

  const canVerifyCode = () => {
    return code.length === 6 && phone.trim() !== "";
  };

  return {
    phone,
    isValidPhone,
    code,
    step,
    isVerified,
    countdown,
    error,
    isLoading: isSendingSms || isVerifying,
    otpSent,
    isBlocked,
    attemptCount,

    handlePhoneChange,
    handleCodeChange,
    sendVerificationCode,
    verifyCode,
    resendCode,
    resetVerification,

    canSendCode: () => {
      return isValidPhone && phone.trim() && countdown === 0 && !isBlocked;
    },
    canVerifyCode: canVerifyCode,
  };
};
