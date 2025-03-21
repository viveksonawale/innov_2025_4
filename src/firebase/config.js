// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBDY6ug9RkAmzy2PRuP5hfSuCbkBQ1kba0",
    authDomain: "training-82b84.firebaseapp.com",
    projectId: "training-82b84",
    storageBucket: "training-82b84.firebasestorage.app",
    messagingSenderId: "465983621188",
    appId: "1:465983621188:web:56a93628a54e9a657fd411",
    measurementId: "G-MFLZD1JDTM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 