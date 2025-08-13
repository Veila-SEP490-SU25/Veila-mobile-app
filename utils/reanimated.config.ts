// Reanimated configuration to reduce warnings
export const reanimatedConfig = {
  strict: false, // Disable strict mode to reduce warnings
  level: "warn", // Only show warnings and errors
};

// Apply configuration globally
if (typeof global !== "undefined") {
  // Suppress Reanimated warnings
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === "string" &&
      message.includes("Reading from `value` during component render")
    ) {
      return; // Suppress this specific warning
    }
    if (
      typeof message === "string" &&
      message.includes("get method of a shared value while React is rendering")
    ) {
      return; // Suppress this specific warning
    }
    originalWarn.apply(console, args);
  };
}

export default reanimatedConfig;
