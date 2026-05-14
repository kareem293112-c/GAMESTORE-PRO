import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isProductManager: boolean;
  isOrderManager: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isProductManager: false,
  isOrderManager: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: () => void = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      // Cleanup previous profile listener
      unsubscribeProfile();

      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        
        unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile({ uid: firebaseUser.uid, ...docSnap.data() } as UserProfile);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
