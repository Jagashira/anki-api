// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFthBRdU0xdLprG-Ol-aFwZcqY7Evt4Ug",
  authDomain: "speech-api-9af6c.firebaseapp.com",
  projectId: "speech-api-9af6c",
  storageBucket: "speech-api-9af6c.firebasestorage.app",
  messagingSenderId: "286413454385",
  appId: "1:286413454385:web:7e59e09c20d0ede0366910",
  measurementId: "G-ZCWY622ZF5",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
