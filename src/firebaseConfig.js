// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLT9O-1GqWjfyjfSF8m0vB5dnePE1rMg0",
  authDomain: "progressor-35b8b.firebaseapp.com",
  projectId: "progressor-35b8b",
  storageBucket: "progressor-35b8b.firebasestorage.app",
  messagingSenderId: "981817094608",
  appId: "1:981817094608:web:93561756fe51ccaad489d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
