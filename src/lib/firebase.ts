
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "studio-8755947463-6e0d7",
  appId: "1:1077088778997:web:3e18618f7adaa47b3c23bc",
  apiKey: "AIzaSyCXX1QhWGciPvteQ8mCrUdu-S3HGoIfSxE",
  authDomain: "studio-8755947463-6e0d7.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "1077088778997"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
