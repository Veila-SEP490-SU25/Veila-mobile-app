import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../../providers/auth.provider";
import { Bank, bankApi } from "../../services/apis/bank.api";
import {
  transactionApi,
  TransactionItem,
} from "../../services/apis/transaction.api";
import { walletApi } from "../../services/apis/wallet.api";
import { Wallet } from "../../services/types";
import { showMessage } from "../../utils/message.util";

export default function WalletScreen() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<
    TransactionItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [showPinForm, setShowPinForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNote, setWithdrawNote] = useState("");
  const [withdrawPin, setWithdrawPin] = useState("");
  const [withdrawOtp, setWithdrawOtp] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [bankNumber, setBankNumber] = useState("");
  const [bankLoading, setBankLoading] = useState(false);
  const { user } = useAuth();

  const loadWallet = async () => {
    try {
      setLoading(true);

      const response = await walletApi.getMyWallet();

      if (response.statusCode === 200) {
        setWallet(response.item);
      }
    } catch {
      showMessage("ERM006");
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const response = await transactionApi.getMyTransactions({
        page: 0,
        size: 5,
      });

      if (response.statusCode === 200 && response.items) {
        setRecentTransactions(response.items);
      } else {
        console.error("Invalid API response:", response);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải giao dịch gần đây",
        visibilityTime: 3000,
      });
    }
  };

  const loadBanks = async () => {
    try {
      const response = await bankApi.getBanks();
      if (response.code === "00") {
        setBanks(response.data);
      }
    } catch (error) {
      console.error("Error loading banks:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải danh sách ngân hàng",
        visibilityTime: 3000,
      });
    }
  };

  useEffect(() => {
    loadWallet();
    loadRecentTransactions();
    loadBanks();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    Toast.show({
      type: "info",
      text1: "Đang làm mới",
      text2: "Vui lòng chờ...",
      visibilityTime: 1500,
    });

    await Promise.all([loadWallet(), loadRecentTransactions()]);

    Toast.show({
      type: "success",
      text1: "Thành công",
      text2: "Đã cập nhật dữ liệu ví",
      visibilityTime: 2000,
    });

    setRefreshing(false);
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const getFullName = () => {
    if (!wallet?.user) return "Người dùng";
    const parts = [
      wallet.user.firstName,
      wallet.user.middleName,
      wallet.user.lastName,
    ].filter(Boolean);
    return parts.join(" ");
  };

  const getInitials = () => {
    if (!wallet?.user) return "U";
    const firstName = wallet.user.firstName || "";
    const lastName = wallet.user.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getPhoneVerificationStatus = () => {
    if (!user?.phone)
      return { label: "Chưa có SĐT", color: "#EF4444", icon: "close-circle" };
    if (user?.isIdentified)
      return {
        label: "Đã xác thực",
        color: "#10B981",
        icon: "checkmark-circle",
      };
    return { label: "Chưa xác thực", color: "#F59E0B", icon: "alert-circle" };
  };

  const handleDeposit = async () => {
    if (!depositAmount) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập số tiền",
        visibilityTime: 3000,
      });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Số tiền không hợp lệ",
        visibilityTime: 3000,
      });
      return;
    }

    if (amount < 1000) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Số tiền tối thiểu là 1,000 VND",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      const requestData = {
        amount: Math.floor(amount),
        note: depositNote || "Nạp tiền vào ví",
        returnUrl: "veila://payment/success",
        cancelUrl: "veila://payment/failure",
      };

      Toast.show({
        type: "info",
        text1: "Đang xử lý nạp tiền",
        text2: "Vui lòng chờ...",
        visibilityTime: 2000,
      });

      const response = await walletApi.deposit(requestData);

      if (response.statusCode === 200) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã tạo yêu cầu nạp tiền",
          visibilityTime: 3000,
        });

        // ✅ Đóng form nạp tiền
        setShowDepositForm(false);
        setDepositAmount("");
        setDepositNote("");

        // ✅ Chuyển hướng trực tiếp đến trang thanh toán PayOS
        if (response.item?.checkoutUrl) {
          await Linking.openURL(response.item.checkoutUrl);
        } else {
          Toast.show({
            type: "error",
            text1: "Lỗi",
            text2: "Không nhận được URL thanh toán",
            visibilityTime: 3000,
          });
        }
      } else {
        const errorMessage = response.message || "Unknown error";
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: `Không thể tạo yêu cầu nạp tiền: ${errorMessage}`,
          visibilityTime: 5000,
        });
      }
    } catch (error) {
      let errorMessage = "Không thể tạo yêu cầu nạp tiền";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }

      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: errorMessage,
        visibilityTime: 5000,
      });
    }
  };

  const handleRequestOtp = async () => {
    if (!withdrawPin || withdrawPin.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Mã PIN phải có 6 chữ số",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setOtpLoading(true);
      Toast.show({
        type: "info",
        text1: "Đang gửi OTP",
        text2: "Vui lòng chờ...",
        visibilityTime: 2000,
      });

      const response = await walletApi.requestSmartOtp({ pin: withdrawPin });

      if (response.statusCode === 201) {
        // Fix: 201 thay vì 0
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: `Mã OTP: ${response.item}`, // Fix: item thay vì items
          visibilityTime: 5000,
        });

        // ✅ Cập nhật OTP và hiển thị input OTP trong form
        setWithdrawOtp(response.item); // Fix: item thay vì items
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể gửi OTP",
          visibilityTime: 3000,
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể gửi OTP",
        visibilityTime: 3000,
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleExecuteWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập số tiền hợp lệ",
        visibilityTime: 3000,
      });
      return;
    }

    if (
      parseFloat(withdrawAmount) >
      parseFloat(String(wallet?.availableBalance || "0"))
    ) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Số tiền vượt quá số dư khả dụng",
        visibilityTime: 3000,
      });
      return;
    }

    if (!withdrawOtp || withdrawOtp.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập mã OTP hợp lệ",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setWithdrawLoading(true);
      Toast.show({
        type: "info",
        text1: "Đang xử lý rút tiền",
        text2: "Vui lòng chờ...",
        visibilityTime: 2000,
      });

      const response = await walletApi.withdrawRequest({
        amount: Math.floor(parseFloat(withdrawAmount)),
        note: withdrawNote || "Rút tiền từ ví điện tử",
        otp: withdrawOtp,
      });

      if (response.statusCode === 200) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Yêu cầu rút tiền đã được gửi",
          visibilityTime: 3000,
        });

        // ✅ Đóng form rút tiền và reset các giá trị
        setShowWithdrawForm(false);
        setWithdrawAmount("");
        setWithdrawNote("");
        setWithdrawPin("");
        setWithdrawOtp("");

        // Refresh wallet data
        await loadWallet();
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể thực hiện rút tiền",
          visibilityTime: 3000,
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể thực hiện rút tiền",
        visibilityTime: 3000,
      });
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleCreatePin = async () => {
    if (!pin || pin.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Mã PIN phải có 6 chữ số",
        visibilityTime: 3000,
      });
      return;
    }

    if (pin !== confirmPin) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Mã PIN xác nhận không khớp",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setPinLoading(true);
      Toast.show({
        type: "info",
        text1: "Đang tạo PIN",
        text2: "Vui lòng chờ...",
        visibilityTime: 2000,
      });

      const response = await walletApi.createPin({ pin });

      if (response.statusCode === 200) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã tạo mã PIN thành công",
          visibilityTime: 3000,
        });
        setShowPinForm(false);
        setPin("");
        setConfirmPin("");

        // Refresh wallet data
        await loadWallet();
      } else {
        const errorMessage = response.message || "Unknown error";
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: `Không thể tạo mã PIN: ${errorMessage}`,
          visibilityTime: 5000,
        });
      }
    } catch (error) {
      let errorMessage = "Không thể tạo mã PIN";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }

      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: errorMessage,
        visibilityTime: 5000,
      });
      console.error("Error creating PIN:", error);
    } finally {
      setPinLoading(false);
    }
  };

  const handleUpdatePin = async () => {
    if (!oldPin || oldPin.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Mã PIN cũ phải có 6 chữ số",
        visibilityTime: 3000,
      });
      return;
    }

    if (!pin || pin.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Mã PIN mới phải có 6 chữ số",
        visibilityTime: 3000,
      });
      return;
    }

    if (pin !== confirmPin) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Mã PIN xác nhận không khớp",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setPinLoading(true);
      Toast.show({
        type: "info",
        text1: "Đang cập nhật PIN",
        text2: "Vui lòng chờ...",
        visibilityTime: 2000,
      });

      const response = await walletApi.updatePin({ oldPin, pin });

      if (response.statusCode === 200) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã cập nhật mã PIN thành công",
          visibilityTime: 3000,
        });
        setShowPinForm(false);
        setOldPin("");
        setPin("");
        setConfirmPin("");

        // Refresh wallet data
        await loadWallet();
      } else {
        const errorMessage = response.message || "Unknown error";
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: `Không thể cập nhật mã PIN: ${errorMessage}`,
          visibilityTime: 5000,
        });
      }
    } catch (error) {
      let errorMessage = "Không thể cập nhật mã PIN";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }

      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: errorMessage,
        visibilityTime: 5000,
      });
      console.error("Error updating PIN:", error);
    } finally {
      setPinLoading(false);
    }
  };

  const handleUpdateBankInfo = async () => {
    if (!selectedBank || !bankNumber) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng chọn ngân hàng và nhập số tài khoản",
        visibilityTime: 3000,
      });
      return;
    }

    if (bankNumber.length < 8) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Số tài khoản phải có ít nhất 8 chữ số",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setBankLoading(true);
      Toast.show({
        type: "info",
        text1: "Đang cập nhật",
        text2: "Vui lòng chờ...",
        visibilityTime: 2000,
      });

      const response = await walletApi.updateBankInfo({
        bin: selectedBank.bin,
        bankNumber: bankNumber,
      });

      if (response.statusCode === 200) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã cập nhật thông tin ngân hàng thành công",
          visibilityTime: 3000,
        });
        setShowBankForm(false);
        setSelectedBank(null);
        setBankNumber("");

        // Check if response has updated wallet data
        if (response.item) {
          setWallet(response.item);
        } else {
          // Refresh wallet data
          await loadWallet();
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể cập nhật thông tin ngân hàng",
          visibilityTime: 3000,
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể cập nhật thông tin ngân hàng",
        visibilityTime: 3000,
      });
    } finally {
      setBankLoading(false);
    }
  };

  const getBankNameByBin = (bin: string) => {
    const bank = banks.find((b) => b.bin === bin);
    return bank ? bank.name : `Ngân hàng (${bin})`;
  };

  const handleViewTransactionDetail = (transactionId: string) => {
    Toast.show({
      type: "info",
      text1: "Chi tiết giao dịch",
      text2: "Đang chuyển đến trang chi tiết...",
      visibilityTime: 2000,
    });
    router.push(`/account/transaction-detail/${transactionId}`);
  };

  const getTransactionDescription = (item: TransactionItem) => {
    if (item.order) {
      const orderTypeLabels: { [key: string]: string } = {
        SELL: "Mua váy",
        RENT: "Thuê váy",
        CUSTOM: "Đặt may",
      };
      const orderType = orderTypeLabels[item.order.type] || item.order.type;
      const shopName = item.to.replace(/_shop_\d+$/, "").replace(/_/g, " ");
      return `${orderType} - ${shopName}`;
    }
    return item.note || `Chuyển khoản - ${item.to}`;
  };

  const renderRecentTransaction = (item: TransactionItem) => {
    const isOutgoing = item.fromTypeBalance === "AVAILABLE";
    const statusColors: { [key: string]: string } = {
      COMPLETED: "#10B981",
      PENDING: "#F59E0B",
      FAILED: "#EF4444",
    };
    const statusColor = statusColors[item.status] || "#6B7280";

    return (
      <TouchableOpacity
        key={item.id}
        className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
        onPress={() => handleViewTransactionDetail(item.id)}
      >
        <View
          className={`w-8 h-8 rounded-full items-center justify-center mr-3`}
          style={{ backgroundColor: `${statusColor}15` }}
        >
          <Ionicons
            name={isOutgoing ? "arrow-up" : "arrow-down"}
            size={16}
            color={statusColor}
          />
        </View>
        <View className="flex-1">
          <Text className="font-medium text-gray-900 text-sm" numberOfLines={1}>
            {getTransactionDescription(item)}
          </Text>
          <Text className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(item.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
          </Text>
        </View>
        <View className="items-end">
          <Text
            className={`font-bold text-sm ${isOutgoing ? "text-red-600" : "text-green-600"}`}
          >
            {isOutgoing ? "-" : "+"} {formatCurrency(item.amount)}
          </Text>
          <View className="flex-row items-center mt-1">
            <View
              className={`w-2 h-2 rounded-full mr-1`}
              style={{ backgroundColor: statusColor }}
            />
            <Text className="text-xs text-gray-500 capitalize">
              {item.status.toLowerCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const phoneStatus = getPhoneVerificationStatus();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E05C78" />
          <Text className="text-lg text-gray-600 mt-4">
            Đang tải thông tin ví...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!wallet) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="wallet-outline" size={80} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-400 mt-4 text-center">
            Không thể tải thông tin ví
          </Text>
          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-3 px-6 mt-4"
            onPress={loadWallet}
          >
            <Text className="text-white font-semibold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            Quản lý ví
          </Text>
          <TouchableOpacity
            onPress={() => console.log("Settings")}
          ></TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* User Profile Section */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-soft">
          <View className="flex-row items-center mb-4">
            <View className="relative">
              {wallet.user.avatarUrl ? (
                <Image
                  source={{ uri: wallet.user.avatarUrl }}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-primary-500 items-center justify-center">
                  <Text className="text-white text-xl font-bold">
                    {getInitials()}
                  </Text>
                </View>
              )}
              {wallet.user.isVerified && (
                <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
              )}
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                {getFullName()}
              </Text>
              <Text className="text-sm text-gray-500">{wallet.user.email}</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons
                  name={phoneStatus.icon as any}
                  size={16}
                  color={phoneStatus.color}
                />
                <Text className="text-sm text-gray-600 ml-1">
                  Số điện thoại:{" "}
                  <Text style={{ color: phoneStatus.color }}>
                    {phoneStatus.label}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bank Info */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-soft">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-medium text-gray-700">
              Thông tin ngân hàng
            </Text>
            <TouchableOpacity
              className="bg-primary-500 rounded-lg px-3 py-1"
              onPress={() => setShowBankForm(!showBankForm)}
            >
              <Text className="text-white text-xs font-medium">
                {wallet.bin ? "Cập nhật" : "Thêm"}
              </Text>
            </TouchableOpacity>
          </View>

          {wallet.bin && wallet.bankNumber ? (
            <View>
              <View className="flex-row items-center mb-2">
                <Text className="text-sm text-gray-600 font-medium">
                  Ngân hàng:
                </Text>
                <Text className="text-sm text-gray-800 ml-2 flex-1">
                  {getBankNameByBin(wallet.bin)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600 font-medium">
                  Số tài khoản:
                </Text>
                <Text className="text-sm text-gray-800 ml-2">
                  {wallet.bankNumber}
                </Text>
              </View>
            </View>
          ) : (
            <View className="items-center py-4">
              <Ionicons name="card-outline" size={32} color="#9CA3AF" />
              <Text className="text-gray-400 text-sm mt-2 text-center">
                Chưa có thông tin ngân hàng
              </Text>
              <Text className="text-gray-400 text-xs text-center">
                Thêm thông tin để nhận tiền
              </Text>
            </View>
          )}

          {/* Bank Information Form */}
          {showBankForm && (
            <View className="mt-4 p-4 bg-gray-50 rounded-xl">
              <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
                {wallet.bin
                  ? "Cập nhật thông tin ngân hàng"
                  : "Thêm thông tin ngân hàng"}
              </Text>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Chọn ngân hàng
                </Text>
                <TouchableOpacity
                  className="border-2 border-gray-300 rounded-xl p-4"
                  onPress={() => {
                    setShowBankPicker(true);
                  }}
                >
                  {selectedBank ? (
                    <View className="flex-row items-center">
                      <Image
                        source={{ uri: selectedBank.logo }}
                        className="w-10 h-10 rounded mr-3"
                      />
                      <Text className="text-gray-800 font-medium flex-1">
                        {selectedBank.name}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#6B7280" />
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      <Ionicons name="card-outline" size={24} color="#9CA3AF" />
                      <Text className="text-gray-400 ml-3">Chọn ngân hàng</Text>
                      <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Số tài khoản
                </Text>
                <TextInput
                  className="border-2 border-gray-300 rounded-xl p-4 text-gray-800 text-lg"
                  value={bankNumber}
                  onChangeText={setBankNumber}
                  placeholder="Nhập số tài khoản"
                  keyboardType="numeric"
                  maxLength={20}
                />
              </View>

              <View className="flex-row space-x-4">
                <TouchableOpacity
                  className="flex-1 bg-gray-300 rounded-xl py-3 items-center"
                  onPress={() => {
                    setShowBankForm(false);
                    setSelectedBank(null);
                    setBankNumber("");
                  }}
                  disabled={bankLoading}
                >
                  <Text className="text-gray-700 font-semibold">Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-primary-500 rounded-xl py-3 items-center"
                  onPress={handleUpdateBankInfo}
                  disabled={bankLoading || !selectedBank || !bankNumber}
                >
                  {bankLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold">
                      {wallet.bin ? "Cập nhật" : "Thêm"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* PIN Security */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-soft">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-medium text-gray-700">
              Bảo mật ví
            </Text>
            <View className="flex-row items-center">
              <Ionicons
                name={wallet.pin ? "lock-closed" : "lock-open"}
                size={16}
                color={wallet.pin ? "#10B981" : "#EF4444"}
              />
              <Text
                className={`text-xs ml-1 ${
                  wallet.pin ? "text-green-600" : "text-red-600"
                }`}
              >
                {wallet.pin ? "Đã bảo mật" : "Chưa bảo mật"}
              </Text>
            </View>
          </View>

          {!wallet?.hasPin ? (
            <TouchableOpacity
              className="bg-primary-500 rounded-xl py-3 px-4 items-center"
              onPress={() => setShowPinForm(!showPinForm)}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">
                Tạo mã PIN bảo mật
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-green-50 rounded-xl p-3 border border-green-200">
              <Text className="text-green-800 text-sm text-center">
                Ví đã được bảo mật bằng mã PIN 6 chữ số
              </Text>
              <TouchableOpacity
                className="bg-primary-500 rounded-lg py-2 px-4 mt-2"
                onPress={() => setShowPinForm(!showPinForm)}
              >
                <Text className="text-white text-xs font-medium text-center">
                  Cập nhật PIN
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* PIN Creation/Update Form */}
          {showPinForm && (
            <View className="mt-4 p-4 bg-gray-50 rounded-xl">
              <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
                {!wallet?.hasPin
                  ? "Tạo mã PIN bảo mật"
                  : "Cập nhật mã PIN bảo mật"}
              </Text>

              {/* Old PIN Input - luôn hiển thị khi cập nhật, ẩn khi tạo mới */}
              {wallet?.hasPin && (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Mã PIN hiện tại
                  </Text>
                  <TextInput
                    className="w-full h-12 border-2 border-gray-300 rounded-lg px-4 text-center text-lg font-bold"
                    value={oldPin}
                    onChangeText={setOldPin}
                    placeholder="Nhập 6 chữ số PIN hiện tại"
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
              )}

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  {!wallet?.hasPin ? "Nhập mã PIN" : "Mã PIN mới"}
                </Text>
                <TextInput
                  className="w-full h-12 border-2 border-gray-300 rounded-lg px-4 text-center text-lg font-bold"
                  value={pin}
                  onChangeText={setPin}
                  placeholder="Nhập 6 chữ số"
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mã PIN
                </Text>
                <TextInput
                  className="w-full h-12 border-2 border-gray-300 rounded-lg px-4 text-center text-lg font-bold"
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  placeholder="Nhập lại 6 chữ số"
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              <View className="flex-row space-x-4">
                <TouchableOpacity
                  className="flex-1 bg-gray-300 rounded-xl py-3 items-center"
                  onPress={() => {
                    setShowPinForm(false);
                    setOldPin("");
                    setPin("");
                    setConfirmPin("");
                  }}
                  disabled={pinLoading}
                >
                  <Text className="text-gray-700 font-semibold">Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-primary-500 rounded-xl py-3 items-center"
                  onPress={!wallet?.hasPin ? handleCreatePin : handleUpdatePin}
                  disabled={
                    pinLoading ||
                    !pin ||
                    !confirmPin ||
                    pin !== confirmPin ||
                    (wallet?.hasPin ? !oldPin : false)
                  }
                >
                  {pinLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold">
                      {!wallet?.hasPin ? "Tạo PIN" : "Cập nhật PIN"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Balance Cards */}
        <View className="mx-4 mt-4">
          {/* Available Balance */}
          <View style={styles.availableBalanceCard}>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-sm font-medium">
                Số dư khả dụng
              </Text>
              <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
            </View>
            <Text className="text-white text-3xl font-bold">
              {formatCurrency(wallet.availableBalance)}
            </Text>
            <Text style={styles.availableBalanceSubtext}>
              Có thể sử dụng ngay
            </Text>
          </View>

          {/* Locked Balance */}
          <View style={styles.lockedBalanceCard}>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-sm font-medium">
                Số dư bị khóa
              </Text>
              <Ionicons name="lock-closed-outline" size={24} color="#FFFFFF" />
            </View>
            <Text className="text-white text-3xl font-bold">
              {formatCurrency(wallet.lockedBalance)}
            </Text>
            <Text style={styles.lockedBalanceSubtext}>
              Đang trong giao dịch
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-4 mt-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Thao tác nhanh
          </Text>

          <View className="bg-white rounded-2xl p-4 shadow-soft">
            <View className="flex-row space-x-4">
              <TouchableOpacity
                className="flex-1 bg-primary-500 rounded-xl py-4 items-center"
                onPress={() => setShowDepositForm(!showDepositForm)}
              >
                <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                <Text className="text-white font-semibold mt-2">Nạp tiền</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-blue-500 rounded-xl py-4 items-center"
                onPress={() => setShowWithdrawForm(!showWithdrawForm)}
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={24}
                  color="#FFFFFF"
                />
                <Text className="text-white font-semibold mt-2">
                  Yêu cầu rút tiền
                </Text>
              </TouchableOpacity>
            </View>

            {/* Deposit Form */}
            {showDepositForm && (
              <View className="mt-6 p-4 bg-gray-50 rounded-xl">
                <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
                  Nạp tiền vào ví
                </Text>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Số tiền nạp (VND)
                  </Text>
                  <TextInput
                    className="border-2 border-gray-300 rounded-xl p-4 text-gray-800 text-lg"
                    value={depositAmount}
                    onChangeText={setDepositAmount}
                    placeholder="Nhập số tiền"
                    keyboardType="numeric"
                    maxLength={12}
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </Text>
                  <TextInput
                    className="border-2 border-gray-300 rounded-xl p-4 text-gray-800"
                    value={depositNote}
                    onChangeText={setDepositNote}
                    placeholder="Ghi chú nạp tiền"
                    maxLength={100}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View className="flex-row space-x-4">
                  <TouchableOpacity
                    className="flex-1 bg-gray-300 rounded-xl py-3 items-center"
                    onPress={() => setShowDepositForm(false)}
                  >
                    <Text className="text-gray-700 font-semibold">Hủy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 bg-primary-500 rounded-xl py-3 items-center"
                    onPress={handleDeposit}
                    disabled={!depositAmount}
                  >
                    <Text className="text-white font-semibold">
                      Xác nhận nạp
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Withdraw Form */}
            {showWithdrawForm && (
              <View className="mt-6 p-4 bg-gray-50 rounded-xl">
                <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
                  Yêu cầu rút tiền
                </Text>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Số tiền rút (VND)
                  </Text>
                  <TextInput
                    className="border-2 border-gray-300 rounded-xl p-4 text-gray-800 text-lg"
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    placeholder="Nhập số tiền"
                    keyboardType="numeric"
                    maxLength={12}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </Text>
                  <TextInput
                    className="border-2 border-gray-300 rounded-xl p-4 text-gray-800"
                    value={withdrawNote}
                    onChangeText={setWithdrawNote}
                    placeholder="Ghi chú rút tiền"
                    maxLength={100}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Mã PIN xác thực
                  </Text>
                  <TextInput
                    className="w-full h-12 border-2 border-gray-300 rounded-lg px-4 text-center text-lg font-bold"
                    value={withdrawPin}
                    onChangeText={setWithdrawPin}
                    placeholder="Nhập 6 chữ số PIN"
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>

                {/* OTP Input - hiển thị sau khi gửi OTP thành công */}
                {withdrawOtp && (
                  <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Mã OTP xác thực
                    </Text>
                    <TextInput
                      className="w-full h-12 border-2 border-gray-300 rounded-lg px-4 text-center text-lg font-bold"
                      value={withdrawOtp}
                      onChangeText={setWithdrawOtp}
                      placeholder="Nhập 6 chữ số OTP"
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>
                )}

                <View className="flex-row space-x-4">
                  <TouchableOpacity
                    className="flex-1 bg-gray-300 rounded-xl py-3 items-center"
                    onPress={() => {
                      setShowWithdrawForm(false);
                      setWithdrawAmount("");
                      setWithdrawNote("");
                      setWithdrawPin("");
                      setWithdrawOtp("");
                    }}
                  >
                    <Text className="text-gray-700 font-semibold">Hủy</Text>
                  </TouchableOpacity>

                  {!withdrawOtp ? (
                    <TouchableOpacity
                      className="flex-1 bg-blue-500 rounded-xl py-3 items-center"
                      onPress={handleRequestOtp}
                      disabled={
                        !withdrawAmount ||
                        !withdrawPin ||
                        withdrawPin.length !== 6
                      }
                    >
                      {otpLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text className="text-blue-700 font-semibold">
                          Gửi OTP
                        </Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      className="flex-1 bg-primary-500 rounded-xl py-3 items-center"
                      onPress={handleExecuteWithdraw}
                      disabled={
                        withdrawLoading ||
                        !withdrawOtp ||
                        withdrawOtp.length !== 6
                      }
                    >
                      {withdrawLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text className="text-white font-semibold">
                          Xác nhận rút tiền
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Transaction History */}
        <View className="mx-4 mt-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Giao dịch gần đây
            </Text>
            <TouchableOpacity
              className="bg-gray-100 rounded-xl px-4 py-2"
              onPress={() => router.push("/account/transactions")}
            >
              <Text className="text-gray-600 font-medium">Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-soft">
            {recentTransactions.length > 0 ? (
              <View>{recentTransactions.map(renderRecentTransaction)}</View>
            ) : (
              <View className="items-center py-6">
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color="#D1D5DB"
                />
                <Text className="text-gray-400 text-center mt-2">
                  Chưa có giao dịch nào
                </Text>
                <Text className="text-sm text-gray-400 text-center">
                  Các giao dịch của bạn sẽ hiển thị ở đây
                </Text>
              </View>
            )}

            {/* Nút "Xem tất cả" luôn hiển thị */}
            <TouchableOpacity
              className="flex-row items-center justify-center py-3 mt-4 border-t border-gray-100"
              onPress={() => router.push("/account/transactions")}
            >
              <Text className="text-primary-500 font-medium">
                Xem tất cả giao dịch
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#E05C78"
                className="ml-1"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bank Picker Modal */}
      {showBankPicker && (
        <View
          className="absolute inset-0 bg-black bg-opacity-50"
          style={{ zIndex: 1000, elevation: 1000 }}
        >
          <View className="bg-white rounded-lg p-4 w-full max-w-md mx-auto mt-40">
            <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Chọn ngân hàng
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {banks.map((bank) => (
                <TouchableOpacity
                  key={bank.bin}
                  className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
                  onPress={() => {
                    setSelectedBank(bank);
                    setShowBankPicker(false);
                  }}
                >
                  <Image
                    source={{ uri: bank.logo }}
                    className="w-10 h-10 rounded mr-3"
                  />
                  <Text className="text-gray-800 font-medium flex-1">
                    {bank.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              className="bg-gray-200 rounded-lg py-3 mt-4"
              onPress={() => setShowBankPicker(false)}
            >
              <Text className="text-center text-gray-700 font-medium">Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  availableBalanceCard: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  availableBalanceSubtext: {
    color: "#D1FAE5",
    fontSize: 14,
    marginTop: 4,
  },
  lockedBalanceCard: {
    backgroundColor: "#F59E0B",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lockedBalanceSubtext: {
    color: "#FEF3C7",
    fontSize: 14,
    marginTop: 4,
  },
});
