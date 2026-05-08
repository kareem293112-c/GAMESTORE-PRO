import React, { useState } from 'react';
import { AuthChrome } from '../components/auth/AuthChrome';
import { Mail, Lock, User, UserPlus, AlertCircle, Chrome } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { useLanguage } from '../context/LanguageContext';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  // دالة مساعدة لإنشاء مستخدم في الفايرستور (لتجنب التكرار)
  const createUserProfile = async (user: any, displayName: string) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const role = user.email === 'karmo2931@gmail.com' ? 'admin' : 'customer';
      await setDoc(userDocRef, {
        email: user.email,
        displayName: displayName || user.displayName,
        role: role,
        balance: 0,
        createdAt: serverTimestamp()
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      
      try {
        await createUserProfile(user, name);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
      }

      toast.success(t('auth.registerSuccess'));
      navigate('/');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error(language === 'ar' ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email already in use');
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error(t('auth.emailNotAllowedAlternative'));
      } else {
        toast.error(error.message || t('auth.registerError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (googleLoading) return;
    
    const provider = new GoogleAuthProvider();
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      // التأكد من إنشاء مستخدم في الفايرستور حتى لو دخل بجوجل
      await createUserProfile(result.user, result.user.displayName || '');
      
      toast.success(t('auth.googleSuccess'));
      navigate('/');
    } catch (error: any) {
      console.error(error);
      toast.error(t('auth.googleError'));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthChrome title={t('nav.register')} subtitle={t('auth.registerSubtitle')}>
      <form onSubmit={handleRegister} className="space-y-4">
        {/* Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-300 mx-1">{t('auth.fullName')}</label>
          <div className="relative">
            <User className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'ar' ? 'مثال: أحمد محمد' : 'e.g. John Doe'}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 ps-10 pe-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-300 mx-1">{t('auth.email')}</label>
          <div className="relative">
            <Mail className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 ps-10 pe-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-300 mx-1">{t('auth.password')}</label>
          <div className="relative">
            <Lock className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 ps-10 pe-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              required
              minLength={6}
            />
          </div>
          <p className="text-[10px] text-slate-500 mx-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {t('auth.passwordHint')}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {language === 'ar' ? 'جاري الإنشاء...' : 'Creating...'}
            </span>
          ) : (
            <>
              <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {t('nav.register')}
            </>
          )}
        </button>
      </form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#121c2f] px-2 text-slate-500">{language === 'ar' ? 'أو عبر' : 'Or via'}</span>
        </div>
      </div>

      <button
        onClick={signInWithGoogle}
        disabled={loading || googleLoading}
        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white py-3 rounded-xl border border-slate-700 transition-all"
      >
        {googleLoading ? (
           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Chrome className="w-4 h-4" />
        )}
        {language === 'ar' ? 'جوجل' : 'Google'}
      </button>

      <p className="text-center text-sm text-slate-400 mt-4">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300">
          {t('nav.login')}
        </Link>
      </p>
    </AuthChrome>
  );
};
