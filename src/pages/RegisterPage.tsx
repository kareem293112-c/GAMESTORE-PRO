import React, { useState } from 'react';
import { AuthChrome } from '../components/auth/AuthChrome';
import { Mail, Lock, User, UserPlus, AlertCircle, Chrome } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { callApi } from '../lib/api';

import { useLanguage } from '../context/LanguageContext';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      // Create user profile via backend API
      try {
        await callApi('/api/me/profile', {
          method: 'POST',
          body: JSON.stringify({ displayName: name })
        });
      } catch (e) { console.error(e); }

      toast.success(t('auth.registerSuccess'));
      navigate('/');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/operation-not-allowed') {
        toast.error(t('auth.emailNotAllowedAlternative'));
      } else {
        toast.error(error.message || t('auth.registerError'));
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

      // Ensure user profile exists via backend API
      try {
        await callApi('/api/me/profile', {
          method: 'POST',
          body: JSON.stringify({ displayName: user.displayName })
        });
      } catch (e) { console.error(e); }

      toast.success(t('auth.googleSuccess'));
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error(t('auth.googleError'));
    }
  };

  return (
    <AuthChrome title={t('nav.register')} subtitle={t('auth.registerSubtitle')}>
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-300 mx-1">{t('auth.fullName')}</label>
          <div className="relative">
            <User className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'ar' ? 'مثال: أحمد محمد' : 'e.g. John Doe'}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 ps-10 pe-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            />
          </div>
        </div>

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
          <label className="text-sm font-bold text-slate-300 mx-1">{t('auth.password')}</label>
          <div className="relative">
            <Lock className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 ps-10 pe-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group"
        >
          {loading ? (language === 'ar' ? 'جاري الإنشاء...' : 'Creating...') : (
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
        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl border border-slate-700 transition-all"
      >
        <Chrome className="w-4 h-4" /> {language === 'ar' ? 'جوجل' : 'Google'}
      </button>

      <p className="text-center text-sm text-slate-400 mt-4">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300">{t('nav.login')}</Link>
      </p>
    </AuthChrome>
  );
};
