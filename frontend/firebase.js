// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "vibeeats-food-delivery-app.firebaseapp.com",
  projectId: "vibeeats-food-delivery-app",
  storageBucket: "vibeeats-food-delivery-app.firebasestorage.app",
  messagingSenderId: "250424093425",
  appId: "1:250424093425:web:33685f6113b4dbb1ddd750"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)

export {app,auth} 