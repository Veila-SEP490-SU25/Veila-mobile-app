// AsyncStorage is auto-detected by Firebase in React Native/Expo when installed
import Constants from "expo-constants";
import { getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from "firebase/auth";
import {
  disableNetwork,
  enableNetwork,
  getFirestore,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { suppressFirebaseErrors } from "../utils/error-suppression";

const extra = Constants.expoConfig?.extra || {};

const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY,
  authDomain: extra.FIREBASE_AUTH_DOMAIN,
  projectId: extra.FIREBASE_PROJECT_ID,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: extra.FIREBASE_APP_ID,
  measurementId: extra.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase v9
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with AsyncStorage persistence for React Native
// Note: Firebase v9 in Expo automatically uses AsyncStorage when installed
// The warning about AsyncStorage can be safely ignored in Expo environment
let auth: Auth;
try {
  // AsyncStorage is automatically detected and used by Firebase in React Native/Expo
  auth = initializeAuth(app, {
    // Empty config lets Firebase auto-detect React Native environment
  });
} catch {
  // If auth is already initialized, get the existing instance
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, firebaseConfig, storage };

if (__DEV__) {
  suppressFirebaseErrors();
}

// Export functions for other services

export const enableFirestoreNetwork = async () => {
  if (!db) {
    return;
  }
  try {
    await enableNetwork(db);
  } catch (error) {
    console.warn("Error enabling Firestore network:", error);
  }
};

export const disableFirestoreNetwork = async () => {
  if (!db) {
    return;
  }
  try {
    await disableNetwork(db);
  } catch (error) {
    console.warn("Error disabling Firestore network:", error);
  }
};

export const checkFirestoreConnection = async () => {
  if (!db) {
    return false;
  }
  try {
    await enableNetwork(db);
    return true;
  } catch (error) {
    console.warn("Firestore connection check failed:", error);
  }
  return false;
};

export const checkFirebaseAuthStatus = () => {
  return {
    isInitialized: !!auth,
    hasConfig: !!firebaseConfig.apiKey,
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
  };
};
