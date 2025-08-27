import { IAddress, IUpdateProfile } from "../services/types";

/**
 * Parse address string into components
 * Expected format: "Số nhà, đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành"
 */
export const parseAddressString = (
  addressString: string
): {
  streetAddress: string;
  ward: string;
  district: string;
  province: string;
} => {
  if (!addressString) {
    return {
      streetAddress: "",
      ward: "",
      district: "",
      province: "",
    };
  }

  const parts = addressString.split(",").map((part) => part.trim());

  if (parts.length >= 4) {

    const [streetAddress, ward, district, province] = parts;
    return {
      streetAddress: streetAddress || "",
      ward: ward || "",
      district: district || "",
      province: province || "",
    };
  } else if (parts.length === 3) {

    const [ward, district, province] = parts;
    return {
      streetAddress: "",
      ward: ward || "",
      district: district || "",
      province: province || "",
    };
  } else if (parts.length === 2) {

    const [district, province] = parts;
    return {
      streetAddress: "",
      ward: "",
      district: district || "",
      province: province || "",
    };
  } else if (parts.length === 1) {

    return {
      streetAddress: "",
      ward: "",
      district: "",
      province: parts[0] || "",
    };
  }

  return {
    streetAddress: "",
    ward: "",
    district: "",
    province: "",
  };
};

/**
 * Format address components into a string
 */
export const formatAddressString = (address: IAddress): string => {
  const parts = [];

  if (address.streetAddress?.trim()) {
    parts.push(address.streetAddress.trim());
  }

  if (address.ward?.name) {
    parts.push(address.ward.name);
  }

  if (address.district?.name) {
    parts.push(address.district.name);
  }

  if (address.province?.name) {
    parts.push(address.province.name);
  }

  return parts.join(", ");
};

/**
 * Check if address is complete (has all required components)
 */
export const isAddressComplete = (address: IAddress): boolean => {
  return !!(address.province && address.district && address.ward);
};

/**
 * Get address display text for UI
 */
export const getAddressDisplayText = (
  address: IAddress,
  compact: boolean = false
): string => {
  if (!address.province) {
    return "Chưa chọn địa chỉ";
  }

  const parts = [];

  if (address.streetAddress?.trim()) {
    parts.push(address.streetAddress.trim());
  }

  if (address.ward?.name) {
    parts.push(address.ward.name);
  }

  if (address.district?.name) {
    parts.push(address.district.name);
  }

  if (address.province?.name) {
    parts.push(address.province.name);
  }

  if (compact) {
    return parts.join(", ");
  }

  return parts.join("\n");
};

/**
 * Validate address data
 */
export const validateAddress = (
  address: IAddress
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!address.province) {
    errors.push("Vui lòng chọn tỉnh/thành phố");
  }

  if (!address.district) {
    errors.push("Vui lòng chọn quận/huyện");
  }

  if (!address.ward) {
    errors.push("Vui lòng chọn phường/xã");
  }

  if (!address.streetAddress?.trim()) {
    errors.push("Vui lòng nhập địa chỉ chi tiết");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Merge profile data with address update to ensure all required fields are included
 */
export const mergeProfileWithAddress = (
  profileData: Partial<IUpdateProfile>,
  addressData: Partial<IUpdateProfile>
): IUpdateProfile => {
  return {
    firstName: profileData.firstName || "",
    lastName: profileData.lastName || "",
    middleName: profileData.middleName,
    address: addressData.address || "",
    birthDate: profileData.birthDate,
    avatarUrl: profileData.avatarUrl,
    coverUrl: profileData.coverUrl,
    images: profileData.images,
  };
};

/**
 * Create a complete profile update object from address data
 */
export const createProfileUpdateFromAddress = (
  address: IAddress,
  existingProfile?: Partial<IUpdateProfile>
): IUpdateProfile => {
  const fullAddress = formatAddressString(address);

  return {
    firstName: existingProfile?.firstName || "",
    lastName: existingProfile?.lastName || "",
    middleName: existingProfile?.middleName,
    address: fullAddress,
    birthDate: existingProfile?.birthDate,
    avatarUrl: existingProfile?.avatarUrl,
    coverUrl: existingProfile?.coverUrl,
    images: existingProfile?.images,
  };
};
