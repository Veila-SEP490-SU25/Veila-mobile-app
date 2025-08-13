import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface InputOTPProps {
  maxLength: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface InputOTPSlotProps {
  index: number;
  value: string;
  isFocused: boolean;
  onPress: () => void;
  className?: string;
}

const InputOTPSlot: React.FC<InputOTPSlotProps> = ({
  index,
  value,
  isFocused,
  onPress,
  className,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.slot,
        isFocused && styles.slotFocused,
        className ===
          "w-12 h-12 text-lg font-bold border-2 focus:border-rose-500" &&
          styles.slotStyled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.slotText,
          value ? styles.slotTextFilled : styles.slotTextEmpty,
        ]}
      >
        {value || "•"}
      </Text>
    </TouchableOpacity>
  );
};

const InputOTP: React.FC<InputOTPProps> = ({
  maxLength,
  value,
  onChange,
  className,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const inputRefs = useRef<TextInput[]>([]);

  const handleSlotPress = (index: number) => {
    setFocusedIndex(index);
    inputRefs.current[index]?.focus();
  };

  const handleInputChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, "");

    if (numericText.length > 0) {
      // Update current slot
      const newValue = value.split("");
      newValue[index] = numericText[0];
      onChange(newValue.join("").slice(0, maxLength));

      // Move to next slot if available
      if (index < maxLength - 1) {
        setFocusedIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      // Move to previous slot on backspace
      setFocusedIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const renderSlots = () => {
    const slots = [];
    for (let i = 0; i < maxLength; i++) {
      slots.push(
        <InputOTPSlot
          key={i}
          index={i}
          value={value[i] || ""}
          isFocused={focusedIndex === i}
          onPress={() => handleSlotPress(i)}
          className={className}
        />
      );
    }
    return slots;
  };

  return (
    <View style={styles.container}>
      {/* Hidden text inputs for actual input handling */}
      {Array.from({ length: maxLength }, (_, index) => (
        <TextInput
          key={`input-${index}`}
          ref={(ref) => {
            if (ref) inputRefs.current[index] = ref;
          }}
          style={styles.hiddenInput}
          value={value[index] || ""}
          onChangeText={(text) => handleInputChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(-1)}
        />
      ))}

      {/* Visual OTP slots */}
      <View style={styles.slotsContainer}>{renderSlots()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  slotsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  slot: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  slotStyled: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: "#F43F5E",
  },
  slotFocused: {
    borderColor: "#F43F5E",
    borderWidth: 2,
  },
  slotText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  slotTextEmpty: {
    color: "#9CA3AF",
  },
  slotTextFilled: {
    color: "#111827",
  },
});

export default InputOTP;
