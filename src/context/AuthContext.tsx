import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isProductManager: boolean;
  isOrderManager: boolean;
  smartAuth: (email: string, password: string, mode: 'login' | 'signup') => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isProductManager: false,
  isOrderManager: false,
  smartAuth: async () => ({ success: false, message: '' }),
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // دالة تسجيل وتوجيه المستخدم الذكية (Smart Auth)
  const smartAuth = async (email: string, password: string, mode: 'login' | 'signup') => {
    try {
      if (mode === 'signup') {
        // حاول إنشاء الحساب أولاً
        await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, message: "تم إنشاء الحساب بنجاح!" };
      } else {
        // حاول تسجيل الدخول بالحساب
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true, message: "تم تسجيل الدخول بنجاح!" };
      }
    } catch (error: any) {
      // 1. إذا كبس إنشاء حساب والحساب موجود مسبقاً، يحوله تلقائياً لتسجيل دخول
      if (mode === 'signup' && error.code === 'auth/email-already-in-use') {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          return { success: true, message: "هذا الحساب موجود بالفعل، تم تسجيل دخولك تلقائياً!" };
        } catch (loginError: any) {
          return { success: false, message: "الحساب موجود بالفعل، ولكن كلمة المرور التي أدخلتها خاطئة!" };
        }
      }

      // 2. إذا كبس تسجيل دخول والحساب غير موجود، يسجله حساب جديد تلقائياً
      if (mode === 'login' && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          return { success: true, message: "لم نجد حساباً مسجلاً، تم إنشاء حساب جديد لك تلقائياً!" };
        } catch (signUpError: any) {
          return { success: false, message: "فشل إنشاء الحساب التلقائي: " + signUpError.message };
        }
      }

      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    let unsubscribeProfile: () => void = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      unsubscribeProfile();

      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);

        unsubscribeProfile = onSnapshot(docRef, async (docSnap) => {
          if (docSnap.exists()) {
            setProfile({ uid: firebaseUser.uid, ...docSnap.data() } as UserProfile);
          } else {
            // حل مشكلة الصلاحيات المفقودة: نقوم بالإنشاء فقط من خلال تجميع البيانات مسبقاً
            const newProfile: any = {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
              role: 'user', 
              balance: 0,
              createdAt: serverTimestamp()
            };
            
            try {
              await setDoc(docRef, newProfile);
            } catch (err) {
              console.error("خطأ حماية Firestore أثناء الحفظ الأوتوماتيكي:", err);
            }
          }
        }, (error) => {
          console.error("Error in profile snapshot:", error);
          setProfile(null);
        });
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  const isSuperAdmin = profile?.role === 'admin' || user?.email === 'karmo2931@gmail.com';

  const value = {
    user,
    profile,
    loading,
    isAdmin: isSuperAdmin,
    isProductManager: isSuperAdmin || profile?.role === 'productManager',
    isOrderManager: isSuperAdmin || profile?.role === 'orderManager',
    smartAuth,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
