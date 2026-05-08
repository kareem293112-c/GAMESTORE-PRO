import React, { useState } from 'react';
import { AuthChrome } from '../components/auth/AuthChrome';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toast } from 'react-hot-toast';

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

      <div className="pt-4">
        <p className="text-center text-sm text-slate-400">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300">{t('nav.register')}</Link>
        </p>
      </div>
    </AuthChrome>
  );
};
