import { Ionicons } from "@expo/vector-icons";
import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  retryCount?: number;
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
  isRetrying: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeout?: ReturnType<typeof setTimeout>;
  private fadeAnim: Animated.Value;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      isRetrying: false,
    };
    this.fadeAnim = new Animated.Value(1);
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.startFadeAnimation();
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  startFadeAnimation = () => {
    Animated.sequence([
      Animated.timing(this.fadeAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(this.fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        retryCount: 0,
        isRetrying: false,
      });
      return;
    }

    this.setState({
      isRetrying: true,
      retryCount: retryCount + 1,
    });

    this.retryTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        isRetrying: false,
      });
    }, 1000);
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      retryCount: 0,
      isRetrying: false,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, retryCount, isRetrying } = this.state;
      const { maxRetries = 3 } = this.props;

      return (
        <Animated.View
          style={[styles.container, { opacity: this.fadeAnim }]}
          className="flex-1 justify-center items-center p-6 bg-red-50"
        >
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle" size={48} color="#DC2626" />
          </View>

          <Text style={styles.errorTitle}>Đã xảy ra lỗi</Text>

          <Text style={styles.errorMessage}>
            {error?.message ||
              "Có vấn đề xảy ra khi tải dữ liệu. Vui lòng thử lại."}
          </Text>

          {retryCount > 0 && (
            <Text style={styles.retryInfo}>
              Đã thử lại {retryCount}/{maxRetries} lần
            </Text>
          )}

          <View style={styles.buttonContainer}>
            {retryCount < maxRetries && (
              <TouchableOpacity
                style={[styles.button, styles.retryButton]}
                onPress={this.handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="refresh" size={16} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Đang thử...</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="refresh" size={16} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Thử lại</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={this.handleReset}
            >
              <Ionicons name="home" size={16} color="#DC2626" />
              <Text style={[styles.buttonText, styles.resetButtonText]}>
                Về trang chủ
              </Text>
            </TouchableOpacity>
          </View>

          {error && __DEV__ && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>{error.stack}</Text>
            </View>
          )}
        </Animated.View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FEF2F2",
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#7F1D1D",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
    maxWidth: 300,
  },
  retryInfo: {
    fontSize: 14,
    color: "#991B1B",
    marginBottom: 24,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
  },
  retryButton: {
    backgroundColor: "#DC2626",
  },
  resetButton: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  resetButtonText: {
    color: "#DC2626",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  debugInfo: {
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    maxWidth: 350,
    maxHeight: 200,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#991B1B",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#7F1D1D",
    fontFamily: "monospace",
  },
});
