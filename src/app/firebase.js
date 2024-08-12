// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBllHCPsFvAi8wKx26OpI9e16Vnhaa8QRI",
  authDomain: "inventory-system-tracker.firebaseapp.com",
  projectId: "inventory-system-tracker",
  storageBucket: "inventory-system-tracker.appspot.com",
  messagingSenderId: "682371381788",
  appId: "1:682371381788:web:4ce83d87d5c81efff5fdd9",
  measurementId: "G-QP7Z3PCLKL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Conditionally initialize Firebase Analytics
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { firestore, analytics };
