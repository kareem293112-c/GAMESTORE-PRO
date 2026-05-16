import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Prioritize environment variables from Render/AI Studio settings
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_DATABASE_URL || "",
};

const databaseId = import.meta.env.VITE_DATABASE_ID || "(default)";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);
