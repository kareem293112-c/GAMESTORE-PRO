import React, { useState } from 'react';
import { AuthChrome } from '../components/auth/AuthChrome';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Chrome } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

import { useLanguage } from '../context/LanguageContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success(t('auth.loginSuccess'));
      navigate('/');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/operation-not-allowed') {
        toast.error(t('auth.emailNotAllowed'));
      } else {
        toast.error(t('auth.loginError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists, if not create it
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const role = user.email === 'karmo2931@gmail.com' ? 'admin' : 'customer';
        try {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName,
            role: role,
            balance: 0,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
        }
      }

      toast.success(t('auth.googleSuccess'));
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error(t('auth.googleError'));
    }
  };

  return (
    <AuthChrome title={t('nav.login')} subtitle={t('auth.loginSubtitle')}>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-300 mx-1">{t('auth.email')}</label>
          <div className="relative">
            <Mail className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 ps-10 pe-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center mx-1">
            <label className="text-sm font-bold text-slate-300">{t('auth.password')}</label>
            <Link to="/forgot-password" title={t('auth.forgotPassword')} className="text-xs text-indigo-400 hover:text-indigo-300">{t('auth.forgotPassword')}؟</Link>
          </div>
          <div className="relative">
            <Lock className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 ps-10 pe-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group"
        >
          {loading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : (
            <>
              <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {t('nav.login')}
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
        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl border border-slate-700 transition-all font-bold"
      >
        <Chrome className="w-4 h-4" /> {language === 'ar' ? 'جوجل' : 'Google'}
      </button>

      <div className="pt-4">
        <p className="text-center text-sm text-slate-400">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300">{t('nav.register')}</Link>
        </p>
      </div>
    </AuthChrome>
  );
};
