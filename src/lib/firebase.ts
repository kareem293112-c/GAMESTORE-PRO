import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from './firebase-applet-config.json'; // استيراد ملف الإعدادات

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تهيئة Analytics
const analytics = getAnalytics(app);

// تهيئة Firestore
const db = getFirestore(app);

// تهيئة Firebase Authentication
const auth = getAuth(app);

// تصدير الأدوات لاستخدامها في أجزاء أخرى من الموقع
export { app, db, auth, analytics };
