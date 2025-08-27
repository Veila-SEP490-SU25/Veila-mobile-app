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

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

let auth: Auth;
try {
  auth = initializeAuth(app);
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, firebaseConfig, storage };

suppressFirebaseErrors();

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
