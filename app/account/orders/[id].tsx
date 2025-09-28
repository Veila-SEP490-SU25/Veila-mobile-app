import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "../../../components/Button";
import { useAuth } from "../../../providers/auth.provider";
import { useChatContext } from "../../../providers/chat.provider";
import {
  ComplaintReason,
  CustomerOrderResponse,
  orderApi,
  OrderServiceDetails,
} from "../../../services/apis/order.api";
import { uploadImageToFirebase } from "../../../services/firebase-upload";
import { getTokens } from "../../../utils";
import { formatVNDCustom } from "../../../utils/currency.util";
import { showMessage } from "../../../utils/message.util";

type TabType = "info" | "details" | "progress";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<CustomerOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<TabType>("info");
  const [cancelling, setCancelling] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [dressDetails, setDressDetails] = useState<any>(null);
  const [loadingDress, setLoadingDress] = useState(false);
  const [accessoriesDetails, setAccessoriesDetails] = useState<any[]>([]);
  const [loadingAccessories, setLoadingAccessories] = useState(false);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [orderServiceDetails, setOrderServiceDetails] =
    useState<OrderServiceDetails | null>(null);
  const [loadingOrderService, setLoadingOrderService] = useState(false);
  const [complaintReasons, setComplaintReasons] = useState<ComplaintReason[]>(
    []
  );
  // Removed: loadingComplaintReasons (không sử dụng)
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPin, setCheckoutPin] = useState("");
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [submittingCheckout, setSubmittingCheckout] = useState(false);

  const { createChatRoom, chatRooms } = useChatContext();
  const { user } = useAuth();

  const loadDressDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingDress(true);
      const data = await orderApi.getOrderDressDetails(id);
      const dressData = data.items?.[0] || null;
      setDressDetails(dressData);
    } catch (error) {
      console.error("Error loading dress details:", error);
    } finally {
      setLoadingDress(false);
    }
  }, [id]);

  const loadAccessoriesDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingAccessories(true);
      const data = await orderApi.getOrderAccessoryDetails(id);
      setAccessoriesDetails(data.items || []);
    } catch (error) {
      console.error("Error loading accessories details:", error);
    } finally {
      setLoadingAccessories(false);
    }
  }, [id]);

  const loadMilestones = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingMilestones(true);
      const data = await orderApi.getOrderMilestones(id);
      setMilestones(data.items || []);
    } catch (error) {
      console.error("Error loading milestones:", error);
    } finally {
      setLoadingMilestones(false);
    }
  }, [id]);

  const loadOrderServiceDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingOrderService(true);
      const data = await orderApi.getOrderServiceDetails(id);
      setOrderServiceDetails(data.item);
    } catch (error) {
      console.error("Error loading order service details:", error);
    } finally {
      setLoadingOrderService(false);
    }
  }, [id]);

  const loadComplaintReasons = useCallback(async () => {
    try {
      const response = await orderApi.getComplaintReasons();
      setComplaintReasons(response.items || []);
    } catch (error) {
      console.error("Error loading complaint reasons:", error);
    }
  }, []);

  const submitComplaint = useCallback(
    async (complaintData: {
      title: string; // Code từ API (ví dụ: "REASON_1")
      description: string; // Mô tả chi tiết từ user
      reason: string; // Reason text từ API (ví dụ: "Sản phẩm bị lỗi")
      images?: string; // URLs hình ảnh (tùy chọn)
    }) => {
      if (!id) return;

      try {
        setSubmittingComplaint(true);

        const response = await orderApi.createComplaint(id, {
          ...complaintData,
          status: "SUBMIT",
        });

        if (response.statusCode === 200 || response.statusCode === 201) {
          showMessage("SUC001", "Khiếu nại đã được gửi thành công!");
          setShowComplaintModal(false);
        } else {
          showMessage("ERM006", response.message || "Không thể gửi khiếu nại");
        }
      } catch (error) {
        console.error("Error submitting complaint:", error);
        showMessage("ERM006", "Không thể gửi khiếu nại. Vui lòng thử lại.");
      } finally {
        setSubmittingComplaint(false);
      }
    },
    [id]
  );

  const loadOrderDetail = useCallback(async () => {
    try {
      if (!id) return;
      setLoading(true);

      const response = await orderApi.getOrderById(id);
      setOrder(response.item);

      if (response.item) {
        await loadDressDetails();
        await loadMilestones();
        if (response.item.type === "CUSTOM") {
          await loadOrderServiceDetails();
        }
      }
    } catch (error) {
      console.error("Error loading order detail:", error);
      showMessage("ERM006", "Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [id, loadDressDetails, loadMilestones, loadOrderServiceDetails]);

  useEffect(() => {
    loadOrderDetail();
  }, [loadOrderDetail]);

  // Load complaint reasons when component mounts
  useEffect(() => {
    loadComplaintReasons();
  }, [loadComplaintReasons]);

  // Load accessories khi order được load
  useEffect(() => {
    if (order && order.id) {
      loadAccessoriesDetails();
    }
  }, [order, loadAccessoriesDetails]);

  const handleCancelOrder = useCallback(async () => {
    if (!order) return;

    Alert.alert("Xác nhận hủy đơn", "Bạn có chắc muốn hủy đơn hàng này?", [
      {
        text: "Không",
        style: "cancel",
      },
      {
        text: "Có, hủy đơn",
        style: "destructive",
        onPress: async () => {
          try {
            setCancelling(true);
            await orderApi.cancelOrder(order.id, order.status);

            showMessage("SUC001", "Đã hủy đơn hàng thành công");

            // Reload order detail to update status
            await loadOrderDetail();
          } catch (error: any) {
            showMessage("ERM006", error.message || "Không thể hủy đơn hàng");
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  }, [order, loadOrderDetail]);

  const handleChatWithShop = useCallback(async () => {
    if (!order?.shop?.id || !user) return;

    try {
      setCreatingChat(true);

      // Kiểm tra xem chat room đã tồn tại chưa
      const existingChatRoom = chatRooms.find(
        (room) => room.shopId === order.shop.id && room.customerId === user.id
      );

      if (existingChatRoom) {
        // Nếu đã có chat room, chuyển đến đó
        router.push(`/chat/${existingChatRoom.id}` as any);
        return;
      }

      // Tạo chat room mới với shop
      const chatRoomId = await createChatRoom({
        customerId: user.id,
        shopId: order.shop.id,
        customerName: user.firstName + " " + user.lastName,
        shopName: order.shop.name,
        customerAvatar: user.avatarUrl,
        shopAvatar: order.shop.logoUrl,
        lastMessage: undefined,
        unreadCount: 0,
        isActive: true,
      });

      // Chuyển đến chat room
      router.push(`/chat/${chatRoomId}` as any);
    } catch (error) {
      console.error("Error creating chat room:", error);
      showMessage("ERM006", "Không thể tạo cuộc trò chuyện. Vui lòng thử lại.");

      // Fallback: chuyển đến trang chat chính
      router.push("/_tab/chat" as any);
    } finally {
      setCreatingChat(false);
    }
  }, [order?.shop, user, createChatRoom, chatRooms]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "IN_PROCESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "IN_PROCESS":
        return "Đang xử lý";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "SELL":
        return "Mua";
      case "RENT":
        return "Thuê";
      case "CUSTOM":
        return "Đặt may";
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SELL":
        return "shirt";
      case "RENT":
        return "repeat";
      case "CUSTOM":
        return "cut";
      default:
        return "bag";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SELL":
        return "#E05C78";
      case "RENT":
        return "#10B981";
      case "CUSTOM":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const renderTabButton = (tab: TabType, title: string, icon: string) => (
    <TouchableOpacity
      onPress={() => setSelectedTab(tab)}
      className={`flex-1 px-4 py-3 rounded-lg border ${
        selectedTab === tab
          ? "bg-primary-500 border-primary-500"
          : "bg-white border-gray-300"
      }`}
    >
      <View className="items-center">
        <Ionicons
          name={icon as any}
          size={20}
          color={selectedTab === tab ? "#FFFFFF" : "#6B7280"}
        />
        <Text
          className={`text-sm font-medium mt-1 ${
            selectedTab === tab ? "text-white" : "text-gray-700"
          }`}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderInfoTab = () => (
    <View className="gap-y-6">
      {/* Order Status */}
      <View className="bg-white p-4 rounded-lg border border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Trạng thái đơn hàng
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-x-3">
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{
                backgroundColor: getTypeColor(order?.type || "") + "20",
              }}
            >
              <Ionicons
                name={getTypeIcon(order?.type || "") as any}
                size={24}
                color={getTypeColor(order?.type || "")}
              />
            </View>
            <View>
              <Text className="text-lg font-bold text-gray-800">
                {getTypeText(order?.type || "")}
              </Text>
              <Text className="text-sm text-gray-600">
                #{order?.id.slice(0, 8)}
              </Text>
            </View>
          </View>
          <View
            className={`px-4 py-2 rounded-full border ${getStatusColor(order?.status || "")}`}
          >
            <Text className="text-sm font-medium">
              {getStatusText(order?.status || "")}
            </Text>
          </View>
        </View>
      </View>

      {/* Order Details */}
      <View className="bg-white p-4 rounded-lg border border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Chi tiết đơn hàng
        </Text>
        <View className="gap-y-3">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Ngày đặt:</Text>
            <Text className="text-gray-800 font-medium">
              {order?.createdAt
                ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                : "-"}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Ngày giao:</Text>
            <Text className="text-gray-800 font-medium">
              {order?.dueDate
                ? new Date(order.dueDate).toLocaleDateString("vi-VN")
                : "-"}
            </Text>
          </View>
          {order?.returnDate && (
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Ngày trả:</Text>
              <Text className="text-gray-800 font-medium">
                {new Date(order.returnDate).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          )}
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Tổng tiền:</Text>
            <Text className="text-lg font-bold text-primary-600">
              {formatVNDCustom(order?.amount || "0", "₫")}
            </Text>
          </View>
        </View>
      </View>

      {/* Customer Info */}
      <View className="bg-white p-4 rounded-lg border border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Thông tin khách hàng
        </Text>
        <View className="gap-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Họ tên:</Text>
            <Text className="text-gray-800 font-medium">
              {order?.customerName}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Số điện thoại:</Text>
            <Text className="text-gray-800 font-medium">{order?.phone}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Email:</Text>
            <Text className="text-gray-800 font-medium">{order?.email}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Địa chỉ:</Text>
            <Text className="text-gray-800 font-medium flex-1 text-right ml-2">
              {order?.address}
            </Text>
          </View>
        </View>
      </View>

      {/* Shop Info */}
      {order?.shop && (
        <View className="bg-white p-4 rounded-lg border border-gray-200">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Thông tin shop
          </Text>
          <View className="flex-row items-center gap-x-3 mb-3">
            <Image
              source={{
                uri:
                  order.shop.logoUrl ||
                  "https://via.placeholder.com/60x60?text=Logo",
              }}
              className="w-16 h-16 rounded-full bg-gray-100"
            />
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800 mb-1">
                {order.shop.name}
              </Text>
              <Text className="text-sm text-gray-600 mb-1">
                {order.shop.phone}
              </Text>
              <Text className="text-sm text-gray-600">
                {order.shop.address}
              </Text>
            </View>
          </View>

          {/* Chat with Shop Button */}
          <Button
            title="Nhắn tin với shop"
            onPress={handleChatWithShop}
            variant="outline"
            size="small"
            icon="chatbubble-outline"
            loading={creatingChat}
            fullWidth
          />
        </View>
      )}
    </View>
  );

  const renderDetailsTab = () => (
    <View className="gap-y-6">
      {/* Dress Information */}
      {dressDetails ? (
        <View className="bg-white p-4 rounded-lg border border-gray-200">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Thông tin váy
          </Text>

          {/* Dress Image and Basic Info */}
          <View className="mb-4">
            <Image
              source={{
                uri:
                  dressDetails.dress?.images ||
                  "https://via.placeholder.com/300x400?text=Váy",
              }}
              className="w-full h-48 rounded-lg bg-gray-100 mb-3"
              resizeMode="cover"
            />
            <Text className="text-lg font-bold text-gray-800 mb-2">
              {dressDetails.dressName || dressDetails.dress?.name || "Tên váy"}
            </Text>
            <Text className="text-gray-600 text-sm mb-2">
              {dressDetails.dress?.description || "Không có mô tả"}
            </Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-primary-600">
                {formatVNDCustom(dressDetails.price || "0", "₫")}
              </Text>
              <View className="flex-row items-center gap-x-1">
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text className="text-sm text-gray-600">
                  {dressDetails.dress?.ratingAverage || "0.0"}
                </Text>
                <Text className="text-sm text-gray-500">
                  ({dressDetails.dress?.ratingCount || 0})
                </Text>
              </View>
            </View>
          </View>

          {/* Dress Specifications */}
          <View className="mb-4">
            <Text className="text-md font-semibold text-gray-800 mb-3">
              Thông số kỹ thuật
            </Text>
            <View className="grid grid-cols-2 gap-3">
              {dressDetails.dress?.material && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Chất liệu:</Text>
                  <Text className="text-gray-800 font-medium">
                    {dressDetails.dress.material}
                  </Text>
                </View>
              )}
              {dressDetails.dress?.color && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Màu sắc:</Text>
                  <Text className="text-gray-800 font-medium">
                    {dressDetails.dress.color}
                  </Text>
                </View>
              )}
              {dressDetails.dress?.length && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Độ dài:</Text>
                  <Text className="text-gray-800 font-medium">
                    {dressDetails.dress.length}
                  </Text>
                </View>
              )}
              {dressDetails.dress?.neckline && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Cổ áo:</Text>
                  <Text className="text-gray-800 font-medium">
                    {dressDetails.dress.neckline}
                  </Text>
                </View>
              )}
              {dressDetails.dress?.sleeve && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Tay áo:</Text>
                  <Text className="text-gray-800 font-medium">
                    {dressDetails.dress.sleeve}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Body Measurements */}
          <View className="mb-4">
            <Text className="text-md font-semibold text-gray-800 mb-3">
              Số đo cơ thể
            </Text>
            <View className="grid grid-cols-2 gap-3">
              {dressDetails.height > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Chiều cao:</Text>
                  <Text className="text-gray-800 font-medium">
                    {dressDetails.height} cm
                  </Text>
                </View>
              )}
              {dressDetails.weight > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Cân nặng:</Text>
                  <Text className="text-gray-800 font-medium">
                    {dressDetails.weight} kg
                  </Text>
                </View>
              )}
              {dressDetails.bust > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Vòng ngực:</Text>
                  <Text className="text-gray-800 font-medium">
                    {dressDetails.bust} cm
                  </Text>
                </View>
              )}
              {dressDetails.waist > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Vòng eo:</Text>
                  <Text className="text-gray-800 font-medium">
                    {dressDetails.waist} cm
                  </Text>
                </View>
              )}
              {dressDetails.hip > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Vòng mông:</Text>
                  <Text className="text-gray-800 font-medium">
                    {dressDetails.hip} cm
                  </Text>
                </View>
              )}
              {dressDetails.neck > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Vòng cổ:</Text>
                  <Text className="text-gray-800 font-medium">
                    {dressDetails.neck} cm
                  </Text>
                </View>
              )}
              {dressDetails.shoulderWidth > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Vai:</Text>
                  <Text className="text-gray-800 font-medium">
                    {dressDetails.shoulderWidth} cm
                  </Text>
                </View>
              )}
              {dressDetails.sleeveLength > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Tay áo:</Text>
                  <Text className="text-gray-800 font-medium">
                    {dressDetails.sleeveLength} cm
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Additional Notes */}
          {dressDetails.description && (
            <View>
              <Text className="text-md font-semibold text-gray-800 mb-2">
                Ghi chú thêm
              </Text>
              <Text className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                {dressDetails.description}
              </Text>
            </View>
          )}
        </View>
      ) : loadingDress ? (
        <View className="bg-white p-8 rounded-lg border border-gray-200 items-center">
          <ActivityIndicator size="large" color="#E05C78" />
          <Text className="text-gray-600 mt-4">Đang tải thông tin váy...</Text>
        </View>
      ) : (
        <View className="bg-white p-8 rounded-lg border border-gray-200 items-center">
          <Ionicons name="shirt-outline" size={48} color="#9CA3AF" />
          <Text className="text-gray-600 mt-4 text-center">
            Không có thông tin chi tiết váy
          </Text>
        </View>
      )}

      {/* Accessories Information */}
      <View className="bg-white p-4 rounded-lg border border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Phụ kiện kèm theo
        </Text>

        {loadingAccessories ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#E05C78" />
            <Text className="text-gray-600 mt-4">
              Đang tải thông tin phụ kiện...
            </Text>
          </View>
        ) : accessoriesDetails.length > 0 ? (
          <View className="gap-y-4">
            {accessoriesDetails.map((accessory, index) => (
              <View
                key={index}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-md font-semibold text-gray-800">
                    {accessory.name || `Phụ kiện ${index + 1}`}
                  </Text>
                  <Text className="text-sm font-medium text-primary-600">
                    {formatVNDCustom(accessory.price || "0", "₫")}
                  </Text>
                </View>

                {accessory.description && (
                  <Text className="text-sm text-gray-600 mb-2">
                    {accessory.description}
                  </Text>
                )}

                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-500">
                    Số lượng: {accessory.quantity || 1}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Loại: {accessory.type || "Không xác định"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="py-8 items-center">
            <Ionicons name="bag-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-600 mt-4 text-center">
              Không có phụ kiện kèm theo
            </Text>
          </View>
        )}
      </View>

      {/* Custom Request Details (for CUSTOM orders) */}
      {order?.type === "CUSTOM" && (
        <View className="bg-white p-4 rounded-lg border border-gray-200">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Thông tin đặt may
          </Text>

          {loadingOrderService ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#E05C78" />
              <Text className="text-gray-600 mt-4">
                Đang tải thông tin đặt may...
              </Text>
            </View>
          ) : orderServiceDetails ? (
            <View className="gap-y-4">
              {/* Service Information */}
              <View className="mb-4">
                <Text className="text-md font-semibold text-gray-800 mb-2">
                  Dịch vụ đặt may
                </Text>
                <View className="bg-gray-50 p-3 rounded-lg">
                  <Text className="text-lg font-bold text-gray-800 mb-2">
                    {orderServiceDetails.service.name}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-2">
                    {orderServiceDetails.service.description}
                  </Text>
                  <View className="flex-row items-center gap-x-4">
                    <View className="flex-row items-center gap-x-1">
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text className="text-sm text-gray-600">
                        {orderServiceDetails.service.ratingAverage}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        ({orderServiceDetails.service.ratingCount})
                      </Text>
                    </View>
                    <Text className="text-lg font-bold text-primary-600">
                      {formatVNDCustom(orderServiceDetails.price, "₫")}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Custom Request Details */}
              <View className="mb-4">
                <Text className="text-md font-semibold text-gray-800 mb-2">
                  Yêu cầu đặt may
                </Text>
                <View className="bg-gray-50 p-3 rounded-lg">
                  <Text className="text-lg font-bold text-gray-800 mb-2">
                    {orderServiceDetails.request.title}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-3">
                    {orderServiceDetails.request.description}
                  </Text>

                  {/* Request Image */}
                  {orderServiceDetails.request.images && (
                    <Image
                      source={{ uri: orderServiceDetails.request.images }}
                      className="w-full h-48 rounded-lg bg-gray-100 mb-3"
                      resizeMode="cover"
                    />
                  )}

                  {/* Body Measurements */}
                  <Text className="text-sm font-semibold text-gray-800 mb-2">
                    Số đo cơ thể:
                  </Text>
                  <View className="grid grid-cols-2 gap-2">
                    {orderServiceDetails.request.height > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 text-sm">
                          Chiều cao:
                        </Text>
                        <Text className="text-gray-800 font-medium text-sm">
                          {orderServiceDetails.request.height} cm
                        </Text>
                      </View>
                    )}
                    {orderServiceDetails.request.weight > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 text-sm">Cân nặng:</Text>
                        <Text className="text-gray-800 font-medium text-sm">
                          {orderServiceDetails.request.weight} kg
                        </Text>
                      </View>
                    )}
                    {orderServiceDetails.request.bust > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 text-sm">
                          Vòng ngực:
                        </Text>
                        <Text className="text-gray-800 font-medium text-sm">
                          {orderServiceDetails.request.bust} cm
                        </Text>
                      </View>
                    )}
                    {orderServiceDetails.request.waist > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 text-sm">Vòng eo:</Text>
                        <Text className="text-gray-800 font-medium text-sm">
                          {orderServiceDetails.request.waist} cm
                        </Text>
                      </View>
                    )}
                    {orderServiceDetails.request.hip > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 text-sm">
                          Vòng mông:
                        </Text>
                        <Text className="text-gray-800 font-medium text-sm">
                          {orderServiceDetails.request.hip} cm
                        </Text>
                      </View>
                    )}
                    {orderServiceDetails.request.neck > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 text-sm">Vòng cổ:</Text>
                        <Text className="text-gray-800 font-medium text-sm">
                          {orderServiceDetails.request.neck} cm
                        </Text>
                      </View>
                    )}
                    {orderServiceDetails.request.shoulderWidth > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 text-sm">Vai:</Text>
                        <Text className="text-gray-800 font-medium text-sm">
                          {orderServiceDetails.request.shoulderWidth} cm
                        </Text>
                      </View>
                    )}
                    {orderServiceDetails.request.sleeveLength > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 text-sm">Tay áo:</Text>
                        <Text className="text-gray-800 font-medium text-sm">
                          {orderServiceDetails.request.sleeveLength} cm
                        </Text>
                      </View>
                    )}
                    {orderServiceDetails.request.backLength > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 text-sm">Lưng:</Text>
                        <Text className="text-gray-800 font-medium text-sm">
                          {orderServiceDetails.request.backLength} cm
                        </Text>
                      </View>
                    )}
                    {orderServiceDetails.request.lowerWaist > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 text-sm">Eo dưới:</Text>
                        <Text className="text-gray-800 font-medium text-sm">
                          {orderServiceDetails.request.lowerWaist} cm
                        </Text>
                      </View>
                    )}
                    {orderServiceDetails.request.waistToFloor > 0 && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 text-sm">
                          Eo đến sàn:
                        </Text>
                        <Text className="text-gray-800 font-medium text-sm">
                          {orderServiceDetails.request.waistToFloor} cm
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Additional Specifications */}
                  {(orderServiceDetails.request.material ||
                    orderServiceDetails.request.color ||
                    orderServiceDetails.request.length ||
                    orderServiceDetails.request.neckline ||
                    orderServiceDetails.request.sleeve) && (
                    <View className="mt-3">
                      <Text className="text-sm font-semibold text-gray-800 mb-2">
                        Thông số kỹ thuật:
                      </Text>
                      <View className="grid grid-cols-2 gap-2">
                        {orderServiceDetails.request.material && (
                          <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-600">
                              Chất liệu:
                            </Text>
                            <Text className="text-gray-800 font-medium text-sm">
                              {orderServiceDetails.request.material}
                            </Text>
                          </View>
                        )}
                        {orderServiceDetails.request.color && (
                          <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-600">
                              Màu sắc:
                            </Text>
                            <Text className="text-gray-800 font-medium text-sm">
                              {orderServiceDetails.request.color}
                            </Text>
                          </View>
                        )}
                        {orderServiceDetails.request.length && (
                          <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-600">
                              Độ dài:
                            </Text>
                            <Text className="text-gray-800 font-medium text-sm">
                              {orderServiceDetails.request.length}
                            </Text>
                          </View>
                        )}
                        {orderServiceDetails.request.neckline && (
                          <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-600">
                              Cổ áo:
                            </Text>
                            <Text className="text-gray-800 font-medium text-sm">
                              {orderServiceDetails.request.neckline}
                            </Text>
                          </View>
                        )}
                        {orderServiceDetails.request.sleeve && (
                          <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-600">
                              Tay áo:
                            </Text>
                            <Text className="text-gray-800 font-medium text-sm">
                              {orderServiceDetails.request.sleeve}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Request Status */}
                  <View className="mt-3 pt-3 border-t border-gray-200">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-600">
                        Trạng thái yêu cầu:
                      </Text>
                      <View
                        className={`px-2 py-1 rounded-full ${
                          orderServiceDetails.request.status === "ACCEPTED"
                            ? "bg-green-100 text-green-800"
                            : orderServiceDetails.request.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <Text className="text-xs font-medium">
                          {orderServiceDetails.request.status === "ACCEPTED"
                            ? "Đã chấp nhận"
                            : orderServiceDetails.request.status === "PENDING"
                              ? "Chờ xử lý"
                              : orderServiceDetails.request.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <Text className="text-gray-600 text-sm">
              Không có thông tin chi tiết đặt may
            </Text>
          )}
        </View>
      )}

      {/* Debug Info - Hiển thị thông tin để kiểm tra */}
      <View className="bg-white p-4 rounded-lg border border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Thông tin debug
        </Text>
        <View className="gap-y-2">
          <Text className="text-sm text-gray-600">
            Order Type:{" "}
            <Text className="font-medium">{order?.type || "N/A"}</Text>
          </Text>
          <Text className="text-sm text-gray-600">
            Order Status:{" "}
            <Text className="font-medium">{order?.status || "N/A"}</Text>
          </Text>
          <Text className="text-sm text-gray-600">
            Has Order Service Details:{" "}
            <Text className="font-medium">
              {orderServiceDetails ? "Yes" : "No"}
            </Text>
          </Text>
          <Text className="text-sm text-gray-600">
            Loading Order Service:{" "}
            <Text className="font-medium">
              {loadingOrderService ? "Yes" : "No"}
            </Text>
          </Text>
          {orderServiceDetails && (
            <Text className="text-sm text-gray-600">
              Service Name:{" "}
              <Text className="font-medium">
                {orderServiceDetails.service?.name || "N/A"}
              </Text>
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderProgressTab = () => (
    <View className="gap-y-6">
      {/* Progress Timeline */}
      <View className="bg-white p-4 rounded-lg border border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Tiến độ đơn hàng
        </Text>

        {loadingMilestones ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#E05C78" />
            <Text className="text-gray-600 mt-4">
              Đang tải tiến độ đơn hàng...
            </Text>
          </View>
        ) : milestones.length > 0 ? (
          <View className="gap-y-6">
            {milestones
              .sort((a, b) => a.index - b.index)
              .map((milestone) => (
                <View key={milestone.id} className="gap-y-3">
                  {/* Milestone Header */}
                  <View className="flex-row items-center gap-x-3">
                    <View
                      className={`w-6 h-6 rounded-full items-center justify-center ${
                        milestone.status === "COMPLETED"
                          ? "bg-green-500"
                          : milestone.status === "IN_PROCESS"
                            ? "bg-blue-500"
                            : "bg-gray-400"
                      }`}
                    >
                      {milestone.status === "COMPLETED" ? (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      ) : milestone.status === "IN_PROCESS" ? (
                        <Ionicons name="time" size={16} color="#FFFFFF" />
                      ) : (
                        <Ionicons name="ellipse" size={16} color="#FFFFFF" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-800 font-medium">
                        {milestone.title}
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        {milestone.description}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-1">
                        Hạn:{" "}
                        {new Date(milestone.dueDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Text>
                    </View>
                    <View
                      className={`px-2 py-1 rounded-full ${
                        milestone.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : milestone.status === "IN_PROCESS"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <Text className="text-xs font-medium">
                        {milestone.status === "COMPLETED"
                          ? "Hoàn thành"
                          : milestone.status === "IN_PROCESS"
                            ? "Đang thực hiện"
                            : "Chờ thực hiện"}
                      </Text>
                    </View>
                  </View>

                  {/* Tasks */}
                  {milestone.tasks && milestone.tasks.length > 0 && (
                    <View className="ml-9 gap-y-2">
                      {milestone.tasks
                        .sort((a: any, b: any) => a.index - b.index)
                        .map((task: any) => (
                          <View
                            key={task.id}
                            className="flex-row items-center gap-x-3"
                          >
                            <View
                              className={`w-4 h-4 rounded-full items-center justify-center ${
                                task.status === "COMPLETED"
                                  ? "bg-green-500"
                                  : task.status === "IN_PROCESS"
                                    ? "bg-blue-500"
                                    : "bg-gray-300"
                              }`}
                            >
                              {task.status === "COMPLETED" ? (
                                <Ionicons
                                  name="checkmark"
                                  size={12}
                                  color="#FFFFFF"
                                />
                              ) : task.status === "IN_PROCESS" ? (
                                <Ionicons
                                  name="time"
                                  size={12}
                                  color="#FFFFFF"
                                />
                              ) : (
                                <View className="w-2 h-2 bg-gray-400 rounded-full" />
                              )}
                            </View>
                            <View className="flex-1">
                              <Text
                                className={`text-sm ${
                                  task.status === "COMPLETED"
                                    ? "text-gray-600 line-through"
                                    : "text-gray-800"
                                }`}
                              >
                                {task.title}
                              </Text>
                              <Text className="text-gray-500 text-xs">
                                {task.description}
                              </Text>
                            </View>
                            <View
                              className={`px-2 py-1 rounded-full ${
                                task.status === "COMPLETED"
                                  ? "bg-green-50 text-green-700"
                                  : task.status === "IN_PROCESS"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-gray-50 text-gray-600"
                              }`}
                            >
                              <Text className="text-xs">
                                {task.status === "COMPLETED"
                                  ? "✓"
                                  : task.status === "IN_PROCESS"
                                    ? "⏳"
                                    : "○"}
                              </Text>
                            </View>
                          </View>
                        ))}
                    </View>
                  )}
                </View>
              ))}
          </View>
        ) : (
          <View className="py-8 items-center">
            <Ionicons name="time-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-600 mt-4 text-center">
              Chưa có thông tin tiến độ
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-2">
              Shop sẽ cập nhật tiến độ khi bắt đầu xử lý đơn hàng
            </Text>
          </View>
        )}
      </View>

      {/* Order Status Summary */}
      <View className="bg-white p-4 rounded-lg border border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Tóm tắt trạng thái
        </Text>
        <View className="gap-y-3">
          {/* Order Created */}
          <View className="flex-row items-center gap-x-3">
            <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center">
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">
                Đơn hàng đã được tạo
              </Text>
              <Text className="text-gray-600 text-sm">
                {order?.createdAt
                  ? new Date(order.createdAt).toLocaleString("vi-VN")
                  : "-"}
              </Text>
            </View>
          </View>

          {/* Order Confirmed */}
          {order?.status !== "PENDING" && (
            <View className="flex-row items-center gap-x-3">
              <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center">
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium">
                  Shop đã xác nhận đơn hàng
                </Text>
                <Text className="text-gray-600 text-sm">
                  Đơn hàng đang được xử lý
                </Text>
              </View>
            </View>
          )}

          {/* Order In Process */}
          {order?.status === "IN_PROCESS" && (
            <View className="flex-row items-center gap-x-3">
              <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center">
                <Ionicons name="time" size={16} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium">Đang xử lý</Text>
                <Text className="text-gray-600 text-sm">
                  Shop đang thực hiện đơn hàng
                </Text>
              </View>
            </View>
          )}

          {/* Order Completed */}
          {order?.status === "COMPLETED" && (
            <View className="flex-row items-center gap-x-3">
              <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center">
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium">Hoàn thành</Text>
                <Text className="text-gray-600 text-sm">
                  Đơn hàng đã được giao thành công
                </Text>
              </View>
            </View>
          )}

          {/* Order Cancelled */}
          {order?.status === "CANCELLED" && (
            <View className="flex-row items-center gap-x-3">
              <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center">
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium">Đã hủy</Text>
                <Text className="text-gray-600 text-sm">
                  Đơn hàng đã bị hủy
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  // Checkout Modal Component
  const CheckoutModal = () => {
    return (
      <Modal
        visible={showCheckoutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCheckoutModal(false)}
        statusBarTranslucent={true}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-800">
                Thanh toán đơn hàng
              </Text>
              <TouchableOpacity
                onPress={() => setShowCheckoutModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-sm text-gray-600 mb-4 text-center">
                Để thanh toán đơn hàng, bạn cần nhập mã PIN bảo mật
              </Text>

              {/* PIN Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Mã PIN bảo mật
                </Text>
                <TextInput
                  value={checkoutPin}
                  onChangeText={setCheckoutPin}
                  placeholder="Nhập 6 chữ số PIN"
                  keyboardType="numeric"
                  maxLength={6}
                  secureTextEntry
                  className="border-2 border-gray-300 rounded-lg px-4 py-3 text-center text-lg font-bold"
                  style={{ minHeight: 50 }}
                />
              </View>

              {/* Info Text */}
              <Text className="text-xs text-gray-500 text-center">
                Sau khi nhập PIN, hệ thống sẽ tự động xác thực và xử lý thanh
                toán
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-x-3">
              <View className="flex-1">
                <Button
                  title="Hủy"
                  onPress={() => {
                    setShowCheckoutModal(false);
                    setCheckoutPin("");
                  }}
                  variant="outline"
                  fullWidth
                />
              </View>
              <View className="flex-1">
                <Button
                  title="Thanh toán"
                  onPress={handleRequestCheckoutOtp}
                  variant="primary"
                  loading={requestingOtp || submittingCheckout}
                  disabled={!checkoutPin || checkoutPin.length !== 6}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Complaint Modal Component
  const ComplaintModal = () => {
    const [selectedReason, setSelectedReason] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [images, setImages] = useState<string[]>([]);
    const [showReasonDropdown, setShowReasonDropdown] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    const handleImagePick = async () => {
      try {
        // TODO: Implement image picker with Expo ImagePicker
        // For now, we'll simulate image selection with a placeholder
        // In a real implementation, you would use:
        // import * as ImagePicker from 'expo-image-picker';
        // const result = await ImagePicker.launchImageLibraryAsync({...});

        Alert.alert(
          "Chọn hình ảnh",
          "Tính năng chọn hình ảnh sẽ được implement sớm với Expo ImagePicker!",
          [
            { text: "Hủy", style: "cancel" },
            {
              text: "Demo Upload",
              onPress: () => {
                // Demo: Simulate uploading a placeholder image (vẫn upload qua API /upload)
                const demoImageUri =
                  "https://picsum.photos/400/300?random=" + Date.now();
                handleImageUpload(demoImageUri);
              },
            },
          ]
        );
      } catch (error) {
        console.error("Error picking image:", error);
        showMessage("ERM006", "Không thể chọn hình ảnh");
      }
    };

    const handleImageUpload = async (imageUri: string) => {
      try {
        setUploadingImages(true);
        const result = await uploadImageToFirebase(imageUri, "complaints");

        if (result.success && result.url) {
          setImages((prev) => [...prev, result.url!]);
          showMessage("SUC001", "Hình ảnh đã được tải lên thành công!");
        } else {
          showMessage("ERM006", result.error || "Không thể tải lên hình ảnh");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        showMessage("ERM006", "Không thể tải lên hình ảnh");
      } finally {
        setUploadingImages(false);
      }
    };

    const removeImage = (index: number) => {
      setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
      if (!selectedReason) {
        Alert.alert("Lỗi", "Vui lòng chọn lý do khiếu nại");
        return;
      }

      if (!description.trim()) {
        Alert.alert("Lỗi", "Vui lòng nhập mô tả khiếu nại");
        return;
      }

      const selectedReasonData = complaintReasons.find(
        (r) => r.code === selectedReason
      );

      submitComplaint({
        title: selectedReason, // Truyền code từ API (ví dụ: "REASON_1", "REASON_2")
        description: description.trim(),
        reason: selectedReasonData?.reason || "", // Truyền reason text từ API (ví dụ: "Sản phẩm bị lỗi", "Giao hàng chậm")
        images: images.length > 0 ? images.join(",") : undefined,
      });
    };

    return (
      <Modal
        visible={showComplaintModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowComplaintModal(false)}
        statusBarTranslucent={true}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-800">
                Gửi khiếu nại
              </Text>
              <TouchableOpacity
                onPress={() => setShowComplaintModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* Reason Dropdown */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Lý do khiếu nại *
                </Text>
                <View className="border border-gray-300 rounded-lg">
                  <TouchableOpacity
                    onPress={() => setShowReasonDropdown(!showReasonDropdown)}
                    className="flex-row items-center justify-between p-3"
                    style={{ minHeight: 50 }}
                  >
                    <Text
                      className={
                        selectedReason ? "text-gray-800" : "text-gray-500"
                      }
                    >
                      {selectedReason
                        ? complaintReasons.find(
                            (r) => r.code === selectedReason
                          )?.reason || selectedReason
                        : "Chọn lý do khiếu nại"}
                    </Text>
                    <Ionicons
                      name={showReasonDropdown ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>

                  {/* Dropdown Options */}
                  {showReasonDropdown && (
                    <View className="border-t border-gray-200 max-h-40">
                      {complaintReasons.map((reason) => (
                        <TouchableOpacity
                          key={reason.id}
                          onPress={() => {
                            setSelectedReason(reason.code);
                            setShowReasonDropdown(false);
                          }}
                          className="p-3 border-b border-gray-100 last:border-b-0"
                        >
                          <Text className="text-gray-800">{reason.reason}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Description */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết *
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Mô tả chi tiết về vấn đề gặp phải..."
                  multiline
                  numberOfLines={4}
                  className="border border-gray-300 rounded-lg p-3 text-gray-800"
                  textAlignVertical="top"
                  style={{ minHeight: 100 }}
                />
              </View>

              {/* Images Upload */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh (tùy chọn)
                </Text>

                {/* Image Upload Button */}
                <TouchableOpacity
                  onPress={handleImagePick}
                  disabled={uploadingImages}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 items-center mb-3"
                  style={{ minHeight: 80 }}
                >
                  {uploadingImages ? (
                    <View className="items-center">
                      <ActivityIndicator size="small" color="#E05C78" />
                      <Text className="text-gray-600 mt-2">
                        Đang tải lên...
                      </Text>
                    </View>
                  ) : (
                    <View className="items-center">
                      <Ionicons
                        name="cloud-upload-outline"
                        size={32}
                        color="#9CA3AF"
                      />
                      <Text className="text-gray-600 mt-2">Chọn hình ảnh</Text>
                      <Text className="text-xs text-gray-500 mt-1">
                        Hỗ trợ JPG, PNG (tối đa 5MB)
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Uploaded Images Preview */}
                {images.length > 0 && (
                  <View className="gap-y-2">
                    <Text className="text-sm text-gray-600">
                      Hình ảnh đã chọn:
                    </Text>
                    {images.map((imageUrl, index) => (
                      <View
                        key={index}
                        className="flex-row items-center gap-x-2 p-2 bg-gray-50 rounded-lg"
                      >
                        <Image
                          source={{ uri: imageUrl }}
                          className="w-12 h-12 rounded-lg bg-gray-200"
                          resizeMode="cover"
                        />
                        <View className="flex-1">
                          <Text
                            className="text-sm text-gray-800"
                            numberOfLines={1}
                          >
                            Hình {index + 1}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {imageUrl.length > 50
                              ? imageUrl.substring(0, 50) + "..."
                              : imageUrl}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeImage(index)}
                          className="w-6 h-6 rounded-full bg-red-100 items-center justify-center"
                        >
                          <Ionicons name="close" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row gap-x-3 mt-4">
              <View className="flex-1">
                <Button
                  title="Hủy"
                  onPress={() => setShowComplaintModal(false)}
                  variant="outline"
                  fullWidth
                />
              </View>
              <View className="flex-1">
                <Button
                  title="Gửi khiếu nại"
                  onPress={handleSubmit}
                  variant="primary"
                  loading={submittingComplaint}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Xử lý thanh toán đơn hàng với OTP
  const handleCheckoutOrder = useCallback(
    async (otp: string) => {
      if (!otp || otp.length !== 6) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Mã OTP không hợp lệ",
          visibilityTime: 3000,
        });
        return;
      }

      try {
        setSubmittingCheckout(true);
        Toast.show({
          type: "info",
          text1: "Đang xử lý thanh toán",
          text2: "Vui lòng chờ...",
          visibilityTime: 2000,
        });

        const response = await orderApi.checkoutOrder(order!.id, {
          otp: otp,
        });

        if (response.statusCode === 200) {
          Toast.show({
            type: "success",
            text1: "Thành công",
            text2: "Đơn hàng đã được thanh toán thành công!",
            visibilityTime: 3000,
          });
          setShowCheckoutModal(false);
          setCheckoutPin("");

          // Reload order detail để cập nhật status
          await loadOrderDetail();
        } else {
          Toast.show({
            type: "error",
            text1: "Lỗi",
            text2: response.message || "Không thể thanh toán đơn hàng",
            visibilityTime: 3000,
          });
        }
      } catch (error) {
        console.error("Error checking out order:", error);
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể thanh toán đơn hàng. Vui lòng thử lại.",
          visibilityTime: 3000,
        });
      } finally {
        setSubmittingCheckout(false);
      }
    },
    [order, loadOrderDetail]
  );

  const handleRequestCheckoutOtp = useCallback(async () => {
    if (!checkoutPin || checkoutPin.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập mã PIN 6 chữ số",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setRequestingOtp(true);
      Toast.show({
        type: "info",
        text1: "Đang xác thực PIN",
        text2: "Vui lòng chờ...",
        visibilityTime: 2000,
      });

      // Gọi API request smart OTP
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/wallets/request-smart-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await getTokens()).accessToken}`,
          },
          body: JSON.stringify({
            pin: checkoutPin,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.statusCode === 201) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đang xử lý thanh toán...",
          visibilityTime: 2000,
        });

        // Tự động gọi API thanh toán với OTP vừa nhận được
        await handleCheckoutOrder(data.item);
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: data.message || "Không thể xác thực PIN",
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể xác thực PIN. Vui lòng thử lại.",
        visibilityTime: 3000,
      });
    } finally {
      setRequestingOtp(false);
    }
  }, [checkoutPin, handleCheckoutOrder]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E05C78" />
          <Text className="mt-4 text-gray-600">
            Đang tải thông tin đơn hàng...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="alert-circle-outline" size={64} color="#E05C78" />
          <Text className="mt-4 text-lg font-semibold text-gray-800">
            Không tìm thấy thông tin đơn hàng
          </Text>
          <Button
            title="Quay lại"
            onPress={() => router.back()}
            className="mt-4"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 flex-1 text-center mx-4">
            Chi tiết đơn hàng
          </Text>
          <View className="w-8" />
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row gap-x-4">
          {renderTabButton("info", "Thông tin", "information-circle")}
          {renderTabButton("details", "Chi tiết", "document-text")}
          {renderTabButton("progress", "Tiến độ", "time")}
        </View>
      </View>

      {/* Tab Content */}
      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {selectedTab === "info" && renderInfoTab()}
        {selectedTab === "details" && renderDetailsTab()}
        {selectedTab === "progress" && renderProgressTab()}
      </ScrollView>

      {/* Action Buttons */}
      <View className="bg-white p-6 border-t border-gray-200">
        <View className="flex-row gap-x-4">
          {/* Chat with Shop Button */}
          {order?.shop && (
            <View className="flex-1">
              <Button
                title="Nhắn tin với shop"
                onPress={handleChatWithShop}
                variant="primary"
                icon="chatbubble-outline"
                loading={creatingChat}
                fullWidth
              />
            </View>
          )}

          {/* Checkout Button for PAYING orders */}
          {order?.status === "PAYING" && (
            <View className="flex-1">
              <Button
                title="Thanh toán đơn hàng"
                onPress={() => setShowCheckoutModal(true)}
                variant="primary"
                icon="card-outline"
                fullWidth
              />
            </View>
          )}

          {/* Cancel Button for orders before "Đang giao hàng" milestone */}
          {(() => {
            // Kiểm tra xem có milestone "Đang giao hàng" nào đang IN_PROCESS không
            // const hasShippingMilestoneInProgress = milestones.some(
            //   (milestone) =>
            //     milestone.title?.toLowerCase().includes("giao hàng") &&
            //     milestone.status === "IN_PROCESS"
            // );

            // Kiểm tra xem có milestone "Đang giao hàng" nào đang PENDING không
            const hasShippingMilestonePending = milestones.some(
              (milestone) =>
                milestone.title?.toLowerCase().includes("giao hàng") &&
                milestone.status === "PENDING"
            );

            // Chỉ hiển thị nút hủy khi:
            // 1. Đơn hàng đang PENDING (chờ xác nhận)
            // 2. Hoặc đơn hàng đang IN_PROCESS nhưng milestone giao hàng vẫn đang PENDING
            const canCancel =
              order.status === "PENDING" ||
              (order.status === "IN_PROCESS" && hasShippingMilestonePending);

            return canCancel ? (
              <View className="flex-1">
                <Button
                  title="Hủy đơn hàng"
                  onPress={handleCancelOrder}
                  variant="danger"
                  loading={cancelling}
                  fullWidth
                />
              </View>
            ) : null;
          })()}
        </View>
      </View>

      <Toast />
      <ComplaintModal />
      <CheckoutModal />
    </SafeAreaView>
  );
}
