import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // إضافة هذا السطر
import { getFirestore } from "firebase/firestore"; // إضافة هذا السطر

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DATABASE_URL,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تصدير الأدوات لاستخدامها في باقي المشروع
export const auth = getAuth(app); // هذا ما يطلبه الخطأ
export const db = getFirestore(app); // ستحتاجه لقاعدة البيانات
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
