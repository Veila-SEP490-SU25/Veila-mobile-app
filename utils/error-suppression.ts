export const suppressFirebaseErrors = () => {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  console.error = (...args) => {
    const message = args[0]?.toString() || "";

    // Suppress Firebase errors in production
    if (message.includes("FIRESTORE") || message.includes("Firestore")) {
      if (
        message.includes("INTERNAL ASSERTION FAILED") ||
        message.includes("Unexpected state") ||
        message.includes("INTERNAL UNHANDLED ERROR") ||
        message.includes("WebChannelConnection") ||
        message.includes("transport errored") ||
        message.includes("Error loading unread count")
      ) {
        return;
      }
    }
  };

  console.warn = (...args) => {
    const message = args[0]?.toString() || "";

    // Suppress common warnings in production
    if (
      message.includes("Firestore") ||
      message.includes("AsyncStorage has been extracted") ||
      message.includes("@react-native-async-storage") ||
      message.includes("packages should be updated") ||
      message.includes("cache is empty")
    ) {
      return;
    }
  };

  console.log = (...args) => {
    const message = args[0]?.toString() || "";

    // Suppress debug logs in production
    if (
      message.includes("Token hợp lệ") ||
      message.includes("env: load") ||
      message.includes("env: export") ||
      (message.includes("[") && message.includes("]"))
    ) {
      return;
    }
  };
};

export const restoreConsoleMethods = () => {};
