import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useVerifyPhoneMutation } from "../services/apis";
import { FirebasePhoneAuthService } from "../services/firebase-phone-auth";

export const usePhoneVerification = () => {
  const [phone, setPhone] = useState("");
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string>("");

  const [verifyPhone, { isLoading: isApiLoading }] = useVerifyPhoneMutation();

  // Countdown timer for rate limiting
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Validate phone number format (Vietnamese format)
  const validatePhone = (phoneNumber: string) => {
    return FirebasePhoneAuthService.validateVietnamesePhone(phoneNumber);
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    setIsValidPhone(validatePhone(text));
    setError(""); // Clear error when user types
  };

  const handleCodeChange = (text: string) => {
    // Chỉ cho phép nhập số và tối đa 6 ký tự
    const numericCode = text.replace(/[^0-9]/g, "");
    setCode(numericCode);
    setError(""); // Clear error when user types
  };

  const formatPhoneForFirebase = (phoneNumber: string): string => {
    return FirebasePhoneAuthService.formatPhoneToInternational(phoneNumber);
  };

  const sendVerificationCode = async (): Promise<boolean> => {
    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return false;
    }

    if (!isValidPhone) {
      setError("Số điện thoại không hợp lệ");
      return false;
    }

    // Check rate limiting
    const rateLimit = FirebasePhoneAuthService.checkRateLimit();
    if (!rateLimit.canSend) {
      setCountdown(rateLimit.remainingTime);
      setError(
        `Vui lòng đợi ${rateLimit.remainingTime} giây trước khi gửi OTP tiếp theo.`
      );
      return false;
    }

    try {
      const formattedPhone = formatPhoneForFirebase(phone.trim());
      const verId =
        await FirebasePhoneAuthService.sendVerificationCode(formattedPhone);

      setVerificationId(verId);
      setStep("code");
      setError("");

      Alert.alert("Thành công", `Mã xác thực đã được gửi đến ${phone.trim()}`, [
        { text: "OK" },
      ]);
      return true;
    } catch (error: any) {
      console.error("Error sending code:", error);

      // Handle specific error types
      if (error.message.includes("đợi")) {
        // Rate limiting error
        const match = error.message.match(/(\d+)/);
        if (match) {
          setCountdown(parseInt(match[1]));
        }
      }

      setError(error.message || "Không thể gửi mã xác thực. Vui lòng thử lại.");
      return false;
    }
  };

  const verifyCode = async (onSuccess?: () => void): Promise<boolean> => {
    if (!code.trim() || code.length !== 6) {
      setError("Vui lòng nhập mã xác thực 6 số");
      return false;
    }

    if (!verificationId) {
      setError("Không có verification ID. Vui lòng gửi lại mã.");
      return false;
    }

    try {
      // Xác thực mã với Firebase
      const isVerified = await FirebasePhoneAuthService.verifyCode(
        verificationId,
        code
      );

      if (isVerified) {
        // Nếu Firebase xác thực thành công, gửi số điện thoại xuống BE
        const result = await verifyPhone({ phone: phone.trim() }).unwrap();

        if (result.statusCode === 200) {
          setIsVerified(true);
          setError("");
          Alert.alert(
            "Thành công",
            result.message || "Xác minh số điện thoại thành công",
            [
              {
                text: "OK",
                onPress: () => {
                  onSuccess?.();
                },
              },
            ]
          );
          return true;
        } else {
          setError(result.message || "Xác minh số điện thoại thất bại");
          return false;
        }
      } else {
        setError("Mã xác thực không đúng. Vui lòng kiểm tra lại.");
        return false;
      }
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
    setVerificationId(null);
    setCode("");
    setStep("phone");
    setIsVerified(false);
    setCountdown(0);
    setError("");
    if (
      FirebasePhoneAuthService &&
      typeof (FirebasePhoneAuthService as any).resetVerificationId ===
        "function"
    ) {
      (FirebasePhoneAuthService as any).resetVerificationId();
    }
    if (
      FirebasePhoneAuthService &&
      typeof (FirebasePhoneAuthService as any).resetRateLimit === "function"
    ) {
      (FirebasePhoneAuthService as any).resetRateLimit();
    }
    setStep("phone");
    setCode("");
    setVerificationId(null);
    setError("");
    // Removed duplicate and incorrect resetVerificationId call
    return isValidPhone && phone.trim() && countdown === 0;
  };

  const canVerifyCode = () => {
    return code.length === 6 && verificationId !== null;
  };

  return {
    // State
    phone,
    isValidPhone,
    verificationId,
    code,
    step,
    isVerified,
    countdown,
    error,
    isLoading: isApiLoading,

    // Actions
    handlePhoneChange,
    handleCodeChange,
    sendVerificationCode,
    verifyCode,
    resendCode,
    resetVerification,

    // Computed
    canSendCode: () => {
      return isValidPhone && phone.trim() && countdown === 0;
    },
    canVerifyCode: canVerifyCode,
  };
};
