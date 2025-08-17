/**
 * Format currency to Vietnamese Dong (VND)
 * @param amount - Amount to format (can be string or number)
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatVND = (
  amount: string | number,
  options: {
    showSymbol?: boolean;
    compact?: boolean;
    decimalPlaces?: number;
  } = {}
): string => {
  const { showSymbol = true, compact = false, decimalPlaces = 0 } = options;

  // Convert to number and handle invalid values
  let numAmount: number;
  if (typeof amount === "string") {
    numAmount = parseFloat(amount);
  } else {
    numAmount = amount;
  }

  if (isNaN(numAmount) || numAmount === 0) {
    return showSymbol ? "Liên hệ" : "0";
  }

  // Format with Vietnamese locale
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    notation: compact ? "compact" : "standard",
    compactDisplay: "short",
  });

  return formatter.format(numAmount);
};

/**
 * Format currency to Vietnamese Dong without symbol (just numbers)
 * @param amount - Amount to format
 * @param options - Formatting options
 * @returns Formatted number string
 */
export const formatVNDNumber = (
  amount: string | number,
  options: {
    compact?: boolean;
    decimalPlaces?: number;
  } = {}
): string => {
  const { compact = false, decimalPlaces = 0 } = options;

  let numAmount: number;
  if (typeof amount === "string") {
    numAmount = parseFloat(amount);
  } else {
    numAmount = amount;
  }

  if (isNaN(numAmount) || numAmount === 0) {
    return "0";
  }

  const formatter = new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    notation: compact ? "compact" : "standard",
    compactDisplay: "short",
  });

  return formatter.format(numAmount);
};

/**
 * Format currency to Vietnamese Dong with custom symbol
 * @param amount - Amount to format
 * @param symbol - Custom symbol (default: '₫')
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatVNDCustom = (
  amount: string | number,
  symbol: string = "₫",
  options: {
    compact?: boolean;
    decimalPlaces?: number;
    spaceBeforeSymbol?: boolean;
  } = {}
): string => {
  const {
    compact = false,
    decimalPlaces = 0,
    spaceBeforeSymbol = true,
  } = options;

  let numAmount: number;
  if (typeof amount === "string") {
    numAmount = parseFloat(amount);
  } else {
    numAmount = amount;
  }

  if (isNaN(numAmount) || numAmount === 0) {
    return "Liên hệ";
  }

  const formattedNumber = formatVNDNumber(numAmount, {
    compact,
    decimalPlaces,
  });
  const space = spaceBeforeSymbol ? " " : "";

  return `${formattedNumber}${space}${symbol}`;
};

/**
 * Parse currency string to number
 * @param currencyString - Currency string to parse
 * @returns Parsed number or 0 if invalid
 */
export const parseVND = (currencyString: string): number => {
  if (!currencyString) return 0;

  // Remove all non-numeric characters except decimal point
  const cleaned = currencyString.replace(/[^\d.,]/g, "");

  // Handle Vietnamese number format (comma as decimal separator)
  const normalized = cleaned.replace(/\./g, "").replace(/,/g, ".");

  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Check if amount is valid currency
 * @param amount - Amount to validate
 * @returns True if valid currency
 */
export const isValidVND = (amount: string | number): boolean => {
  let numAmount: number;
  if (typeof amount === "string") {
    numAmount = parseFloat(amount);
  } else {
    numAmount = amount;
  }

  return !isNaN(numAmount) && numAmount > 0;
};

/**
 * Get currency display options based on amount
 * @param amount - Amount to get options for
 * @returns Currency display options
 */
export const getCurrencyDisplayOptions = (amount: string | number) => {
  let numAmount: number;
  if (typeof amount === "string") {
    numAmount = parseFloat(amount);
  } else {
    numAmount = amount;
  }

  if (isNaN(numAmount) || numAmount === 0) {
    return {
      showSymbol: false,
      compact: false,
      decimalPlaces: 0,
      fallback: "Liên hệ",
    };
  }

  // For large amounts, use compact notation
  if (numAmount >= 1000000) {
    return {
      showSymbol: true,
      compact: true,
      decimalPlaces: 1,
      fallback: null,
    };
  }

  // For medium amounts, use standard notation
  if (numAmount >= 1000) {
    return {
      showSymbol: true,
      compact: false,
      decimalPlaces: 0,
      fallback: null,
    };
  }

  // For small amounts, show decimal places
  return {
    showSymbol: true,
    compact: false,
    decimalPlaces: 0,
    fallback: null,
  };
};
