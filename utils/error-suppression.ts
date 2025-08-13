// Suppress Firebase internal errors in development
export const suppressFirebaseErrors = () => {
  if (__DEV__) {
    // Suppress console errors from Firebase
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0]?.toString() || "";

      // Suppress ALL Firebase internal errors
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

      // Allow other errors to pass through
      originalError.apply(console, args);
    };

    // Suppress console warnings from Firebase
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const message = args[0]?.toString() || "";

      // Suppress specific Firebase warnings
      if (
        message.includes("Firestore") &&
        (message.includes("Unexpected state") ||
          message.includes("INTERNAL ASSERTION FAILED") ||
          message.includes("index not ready"))
      ) {
        return;
      }

      // Allow other warnings to pass through
      originalWarn.apply(console, args);
    };
  }
};

// Restore original console methods
export const restoreConsoleMethods = () => {
  // This will be called when needed to restore original behavior
  // For now, we keep the suppression active in development
};
