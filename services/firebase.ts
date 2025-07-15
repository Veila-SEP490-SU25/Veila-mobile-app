import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
} from "firebase/auth";
import { getFirebaseConfig } from "utils";

const getFirebase = () => {
  const firebaseConfig = getFirebaseConfig();

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  firestore.app.automaticDataCollectionEnabled = true;
  const storage = getStorage(app);
  const analytics = getAnalytics(app);
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();

  return {
    app,
    auth,
    firestore,
    storage,
    analytics,
    googleProvider,
    facebookProvider,
    signInWithPopup,
  };
};

export const firebase = getFirebase();
