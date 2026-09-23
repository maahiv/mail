
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCOi1Qf4lKwZnT9tmGFXTWFf8DarL_diss",
  authDomain: "mail-eb2bc.firebaseapp.com",
  projectId: "mail-eb2bc",
  storageBucket: "mail-eb2bc.firebasestorage.app",
  messagingSenderId: "416702589201",
  appId: "1:416702589201:web:037139b4c4ca5843da04b0"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication
export const auth = getAuth(app);

// Firebase Realtime Database
export const db = getDatabase(app);