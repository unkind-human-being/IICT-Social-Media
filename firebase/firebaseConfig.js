// firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0vSfMUaXr8Qp3euLv7P-vbiSKBKA0mtg",
  authDomain: "jerikkoalovers.firebaseapp.com",
  projectId: "jerikkoalovers",
  storageBucket: "jerikkoalovers.firebasestorage.app",
  messagingSenderId: "144810951580",
  appId: "1:144810951580:web:c23dd98d82381c383fbe59"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
