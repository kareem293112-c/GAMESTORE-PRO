import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const firebaseConfig: any = {
  apiKey: import.meta.env.VITE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: import.meta.env.VITE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: import.meta.env.VITE_APP_ID || firebaseAppletConfig.appId,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID || firebaseAppletConfig.measurementId,
  databaseURL: import.meta.env.VITE_DATABASE_URL || (firebaseAppletConfig as any).databaseURL,
};

const app = initializeApp(firebaseConfig);

// Use custom database ID if provided in env or config
const databaseId = import.meta.env.VITE_DATABASE_ID || firebaseAppletConfig.firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const auth = getAuth(app);
