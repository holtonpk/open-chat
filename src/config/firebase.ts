// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwBUrfRPFiOfV1hLB4ph1IlnPEw6u_90w",
  authDomain: "fly-detector-509af.firebaseapp.com",
  projectId: "fly-detector-509af",
  storageBucket: "fly-detector-509af.firebasestorage.app",
  messagingSenderId: "444269465433",
  appId: "1:444269465433:web:f05f8e04351775de460648",
  measurementId: "G-1QCX30F6G2",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
