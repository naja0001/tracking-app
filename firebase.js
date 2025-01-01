// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"
import { getStorage } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCcxWvOYI8E6uD8gd1tbPm1IC4w9R6cbi8",
  authDomain: "myproject-b9dfb.firebaseapp.com",
  projectId: "myproject-b9dfb",
  storageBucket: "myproject-b9dfb.firebasestorage.app",
  messagingSenderId: "580700668198",
  appId: "1:580700668198:web:f87cb921a94df5446241e7",
  measurementId: "G-WZLHPR8N3V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app)
const storage = getStorage(app)

export { app, database, storage }
