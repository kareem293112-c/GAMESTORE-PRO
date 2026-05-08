import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

import { useLanguage } from '../../context/LanguageContext';

interface AuthChromeProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthChrome: React.FC<AuthChromeProps> = ({ children, title, subtitle }) => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 inset-inline-end-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-inline-start-1/4" />
      <div className="absolute bottom-0 inset-inline-start-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-inline-start-1/4" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
          <div className="text-center space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
              <Gamepad2 className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-sm">GAMESTORE PRO</span>
            </Link>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-white">{title}</h1>
              {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
            </div>
          </div>

          {children}

          <div className="pt-4 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-xs">
              {t('footer.rights')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
