import { useCallback, useEffect, useRef, useState } from "react";
import { checkFirestoreConnection } from "../services/firebase";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(__DEV__ ? false : true);
  const [isChecking, setIsChecking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const checkConnection = useCallback(async () => {
    if (!isMountedRef.current) return;

    if (__DEV__) {
      if (isMountedRef.current) {
        setIsOnline(false);
        setIsChecking(false);
      }
      return;
    }

    setIsChecking(true);
    try {
      const connected = await checkFirestoreConnection();
      if (isMountedRef.current) {
        setIsOnline(connected);
      }
    } catch (error) {
      console.warn("Error checking network status:", error);
      if (isMountedRef.current) {
        setIsOnline(false);
      }
    } finally {
      if (isMountedRef.current) {
        setIsChecking(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    checkConnection();

    if (!__DEV__) {

      intervalRef.current = setInterval(checkConnection, 60000);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [checkConnection]);

  return {
    isOnline,
    isChecking,
    checkConnection,
  };
};
