import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyCcxWvOYI8E6uD8gd1tbPm1IC4w9R6cbi8",
  authDomain: "myproject-b9dfb.firebaseapp.com",
  projectId: "myproject-b9dfb",
  storageBucket: "myproject-b9dfb.firebasestorage.app",
  messagingSenderId: "580700668198",
  appId: "1:580700668198:web:f87cb921a94df5446241e7",
  measurementId: "G-WZLHPR8N3V",
};

// Initialiser Firebase app, hvis den ikke allerede er initialiseret
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]; // Brug den eksisterende Firebase-app
}

// Initialiser Authentication, Firestore og Storage
const auth = getAuth(app); // Firebase Authentication
const database = getFirestore(app); // Firebase Firestore
const storage = getStorage(app); // Firebase Storage

export { app, auth, database, storage };
