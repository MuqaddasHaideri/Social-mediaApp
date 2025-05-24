// firebase.ts
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyA4FF80OPsgeALXn9Ckpv-slVsECZn3FpY",
  authDomain: "social-media-8785b.firebaseapp.com",
  projectId: "social-media-8785b",
  storageBucket: "social-media-8785b.firebasestorage.app",
  messagingSenderId: "529603108899",
  appId: "1:529603108899:web:837ac3c11cf79b7d6b9196"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

export { app, auth, db };

