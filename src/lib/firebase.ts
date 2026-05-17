import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import fileConfig from '../../firebase-applet-config.json';

// Prioritize environment variables from Render/AI Studio settings, fallback to fileConfig
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY || fileConfig.apiKey,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || fileConfig.authDomain,
  projectId: import.meta.env.VITE_PROJECT_ID || fileConfig.projectId,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET || fileConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID || fileConfig.messagingSenderId,
  appId: import.meta.env.VITE_APP_ID || fileConfig.appId,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID || fileConfig.measurementId,
  databaseURL: import.meta.env.VITE_DATABASE_URL || fileConfig.databaseURL || "",
};

const databaseId = import.meta.env.VITE_DATABASE_ID || fileConfig.firestoreDatabaseId || "(default)";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);
