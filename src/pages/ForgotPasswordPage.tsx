import React, { useState } from 'react';
import { AuthChrome } from '../components/auth/AuthChrome';
import { Mail, ArrowRight, Send, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { language, t } = useLanguage();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(language === 'ar' ? 'تم إرسال رابط استعادة كلمة المرور لبريدك' : 'Password reset link sent to your email');
    } catch (error) {
      toast.error(language === 'ar' ? 'لم نتمكن من العثور على هذا الحساب' : 'We could not find this account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthChrome title={language === 'ar' ? 'استعادة الحساب' : 'Reset Password'} subtitle={language === 'ar' ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور' : 'Enter your email and we will send you a reset link'}>
      <form onSubmit={handleReset} className="space-y-4">
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group"
        >
          {loading ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (
            <>
              <Send className="w-4 h-4" /> {language === 'ar' ? 'إرسال الرابط' : 'Send Link'}
            </>
          )}
        </button>
      </form>

      <div className="text-center">
        <Link to="/login" className="text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2">
          {language === 'ar' ? (
            <>عودة لتسجيل الدخول <ArrowRight className="w-4 h-4 rotate-180" /></>
          ) : (
            <><ArrowLeft className="w-4 h-4" /> Back to login</>
          )}
        </Link>
      </div>
    </AuthChrome>
  );
};
