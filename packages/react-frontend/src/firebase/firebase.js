import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAi8SSoLul9XC4hiD7RavmThyPU7vtHjn0",
  authDomain: "csc307groupproject-85635.firebaseapp.com",
  projectId: "csc307groupproject-85635",
  storageBucket: "csc307groupproject-85635.firebasestorage.appspot.com",
  messagingSenderId: "895978073651",
  appId: "1:895978073651:web:55d875b8824992da223d46",
  measurementId: "G-9TXC5YDDT3"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
