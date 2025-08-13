import { auth, firebase } from "./firebase";

export class FirebasePhoneAuthService {
  private static lastRequestTime: number = 0;
  private static readonly RATE_LIMIT_INTERVAL = 60000; // 60 seconds

  static async sendVerificationCode(phoneNumber: string): Promise<any> {
    // Rate limiting check
    const now = Date.now();
    if (this.lastRequestTime && now - this.lastRequestTime < 60000) {
      throw new Error("Vui lòng đợi 1 phút trước khi gửi lại mã xác thực");
    }

    // Phone number validation
    if (!phoneNumber || phoneNumber.length < 10) {
      throw new Error("Số điện thoại không hợp lệ");
    }

    try {
      console.log("Attempting to send verification code to:", phoneNumber);

      // Check Firebase connection
      if (!firebase.apps.length) {
        throw new Error("Firebase chưa được khởi tạo. Vui lòng restart app.");
      }

      // Use native phone auth (no reCAPTCHA needed)
      const phoneProvider = new firebase.auth.PhoneAuthProvider();

      console.log("Using native Firebase Phone Auth (no reCAPTCHA)");

      // For iOS Simulator, we'll use a mock approach
      if (__DEV__) {
        console.log(
          "Development mode: Using mock phone verification for iOS Simulator"
        );

        // Simulate successful SMS sending
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockVerificationId = `mock_verification_${Date.now()}`;

        console.log("Mock SMS sent successfully to", phoneNumber);
        this.lastRequestTime = now;

        return {
          success: true,
          verificationId: mockVerificationId,
          message: "Mã xác thực đã được gửi thành công (Mock Mode)",
          isMock: true,
        };
      }

      // For production, use real Firebase Phone Auth
      // Pass `null` as the second argument to satisfy the method signature (required by Firebase JS SDK)
      // For native (React Native) Firebase Phone Auth, the second argument must be an ApplicationVerifier.
      // However, on React Native, reCAPTCHA is not required, so we can use a dummy verifier.
      // We'll create a minimal ApplicationVerifier to satisfy the type requirement.
      const dummyVerifier = {
        type: "recaptcha",
        verify: () => Promise.resolve(""),
      } as firebase.auth.ApplicationVerifier;

      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        dummyVerifier
      );

      console.log("Firebase Phone Auth: SMS sent successfully to", phoneNumber);
      this.lastRequestTime = now;

      return {
        success: true,
        verificationId,
        message: "Mã xác thực đã được gửi thành công",
        isMock: false,
      };
    } catch (firebaseError: any) {
      console.error("Firebase Phone Auth error:", firebaseError);

      let errorMessage = "Lỗi không xác định";

      if (firebaseError.code) {
        switch (firebaseError.code) {
          case "auth/invalid-phone-number":
            errorMessage = "Số điện thoại không hợp lệ";
            break;
          case "auth/too-many-requests":
            errorMessage = "Quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ";
            break;
          case "auth/quota-exceeded":
            errorMessage = "Đã vượt quá giới hạn gửi SMS. Vui lòng thử lại sau";
            break;
          case "auth/operation-not-allowed":
            errorMessage =
              "Phone authentication chưa được kích hoạt trong Firebase Console";
            break;
          case "auth/network-request-failed":
            errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra internet";
            break;
          case "auth/invalid-app-credential":
            errorMessage =
              "Lỗi xác thực ứng dụng. Vui lòng kiểm tra Firebase Console và restart app.";
            break;
          case "auth/operation-not-supported-in-this-environment":
            errorMessage =
              "Phone authentication không được hỗ trợ trong môi trường này. Vui lòng kiểm tra cấu hình Firebase.";
            break;
          case "auth/argument-error":
            errorMessage =
              "Lỗi tham số. Vui lòng kiểm tra cấu hình Firebase và restart app.";
            break;
          case "auth/app-not-authorized":
            errorMessage =
              "Ứng dụng chưa được ủy quyền. Vui lòng kiểm tra Firebase Console.";
            break;
          case "auth/captcha-check-failed":
            errorMessage = "reCAPTCHA verification thất bại. Vui lòng thử lại.";
            break;
          default:
            errorMessage = `Lỗi Firebase: ${firebaseError.message || firebaseError.code}`;
        }
      } else if (firebaseError.message) {
        errorMessage = firebaseError.message;
      }

      throw new Error(`Lỗi Firebase: ${errorMessage}`);
    }
  }

  static async verifyCode(verificationId: string, code: string): Promise<any> {
    try {
      console.log(
        "Verifying code:",
        code,
        "for verification ID:",
        verificationId
      );

      // For mock mode in development
      if (verificationId.startsWith("mock_verification_")) {
        console.log("Development mode: Using mock verification");

        // Simulate verification delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Mock verification logic
        if (code === "123456") {
          console.log("Mock verification successful");
          return {
            success: true,
            user: {
              uid: `mock_user_${Date.now()}`,
              phoneNumber: "+84946420600",
              isVerified: true,
            },
            message: "Xác thực thành công (Mock Mode)",
          };
        } else {
          throw new Error("Mã xác thực không đúng. Vui lòng thử lại.");
        }
      }

      // For production, use real Firebase verification
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        code
      );

      const result = await auth.signInWithCredential(credential);

      console.log("Phone verification successful:", result.user?.uid);

      return {
        success: true,
        user: result.user,
        message: "Xác thực thành công",
      };
    } catch (error: any) {
      console.error("Error verifying code:", error);

      if (error.code === "auth/invalid-verification-code") {
        throw new Error("Mã xác thực không đúng. Vui lòng thử lại.");
      } else if (error.code === "auth/invalid-verification-id") {
        throw new Error("Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới.");
      } else if (error.code === "auth/code-expired") {
        throw new Error("Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới.");
      }

      throw new Error(`Lỗi xác thực: ${error.message || "Vui lòng thử lại"}`);
    }
  }

  static async isPhoneVerified(phoneNumber: string): Promise<boolean> {
    try {
      if (!auth) {
        return false;
      }
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.phoneNumber === phoneNumber) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking phone verification:", error);
      return false;
    }
  }

  static formatPhoneToInternational(phoneNumber: string): string {
    if (phoneNumber.startsWith("0")) {
      phoneNumber = phoneNumber.substring(1);
    }
    if (!phoneNumber.startsWith("+84")) {
      phoneNumber = `+84${phoneNumber}`;
    }
    return phoneNumber;
  }

  static formatPhoneToVietnamese(internationalPhone: string): string {
    if (internationalPhone.startsWith("+84")) {
      return `0${internationalPhone.substring(3)}`;
    }
    return internationalPhone;
  }

  static validateVietnamesePhone(phoneNumber: string): boolean {
    const phoneRegex =
      /^(0|\+84)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/;
    return phoneRegex.test(phoneNumber);
  }

  static checkRateLimit(): { canSend: boolean; remainingTime: number } {
    const currentTime = Date.now();
    const timeSinceLastRequest = currentTime - this.lastRequestTime;
    if (
      timeSinceLastRequest < this.RATE_LIMIT_INTERVAL &&
      this.lastRequestTime > 0
    ) {
      const remainingTime = Math.ceil(
        (this.RATE_LIMIT_INTERVAL - timeSinceLastRequest) / 1000
      );
      return { canSend: false, remainingTime };
    }
    return { canSend: true, remainingTime: 0 };
  }

  static resetRateLimit(): void {
    this.lastRequestTime = 0;
  }

  static isFirebaseReady(): boolean {
    return !!auth;
  }

  static getFirebaseStatus() {
    return {
      isReady: !!firebase.apps.length,
      hasAuth: !!auth,
      currentUser: auth.currentUser,
      projectId: (firebase.apps[0]?.options as { projectId?: string })
        ?.projectId,
    };
  }
}
