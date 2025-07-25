// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB80_TewPPSQ4zpXhoHvn7M7kIkTem08lI",
  authDomain: "AIzaSyB80_TewPPSQ4zpXhoHvn7M7kIkTem08lI",
  projectId: "devconnect-8a05f",
  storageBucket: "devconnect-8a05f.firebasestorage.app",
  messagingSenderId: "83709235822",
  appId: "1:83709235822:web:6b2cc810472b62a8178c7f"
};

const app = initializeApp(firebaseConfig);

// ✅ Export all 3 services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


