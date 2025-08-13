import Constants from "expo-constants";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
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

// Initialize Firebase with compat
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = __DEV__ ? null : firebase.firestore();
const storage = firebase.storage();

export { auth, db, firebase, firebaseConfig, storage };

if (__DEV__) {
  suppressFirebaseErrors();
}

// Export functions for other services
export const enableFirestoreNetwork = () => {
  if (__DEV__ || !db) {
    return;
  }
  try {
    db.enableNetwork();
  } catch (error) {
    console.warn("Error enabling Firestore network:", error);
  }
};

export const disableFirestoreNetwork = () => {
  if (__DEV__ || !db) {
    return;
  }
  try {
    db.disableNetwork();
  } catch (error) {
    console.warn("Error disabling Firestore network:", error);
  }
};

export const checkFirestoreConnection = async () => {
  if (__DEV__ || !db) {
    return false;
  }
  try {
    await db.enableNetwork();
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
