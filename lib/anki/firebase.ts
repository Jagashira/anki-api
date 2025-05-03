// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDErwO0wc6uWaOy_QTOP5aOMSdw-D51x6Y",
  authDomain: "anki-firebase-9b600.firebaseapp.com",
  projectId: "anki-firebase-9b600",
  storageBucket: "anki-firebase-9b600.firebasestorage.app",
  messagingSenderId: "135909392493",
  appId: "1:135909392493:web:d959119c184801ef46bf64",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
