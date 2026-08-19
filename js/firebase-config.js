// Firebase project configuration.
// NOTE: this reuses the sample "playground-bdfdb" project config that was
// shared in the Gamify_PedECG repo (playground_login.html). Firebase web
// API keys are not secret, but you should still lock down Firestore with
// security rules (see README.md) and swap in your own project config if
// this is going to production.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtLmzOCv0yPrBQ6I0CK5M6UBBNyPaUX5s",
  authDomain: "playground-bdfdb.firebaseapp.com",
  projectId: "playground-bdfdb",
  storageBucket: "playground-bdfdb.firebasestorage.app",
  messagingSenderId: "586869845092",
  appId: "1:586869845092:web:5d94bedd9de47cc4164371"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
// Without this, Google silently signs the user into whatever account the
// browser already has an active session for, skipping the account-picker
// screen entirely. Forcing `select_account` makes it always show the
// chooser so players can pick a different Google account than the one
// their browser is currently logged into.
googleProvider.setCustomParameters({ prompt: "select_account" });
