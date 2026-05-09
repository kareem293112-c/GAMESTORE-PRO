import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Gamepad2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSearch } from '../../context/SearchContext';
import { useLanguage } from '../../context/LanguageContext';
import { auth } from '../../lib/firebase';
import { cn, formatPrice } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Languages } from 'lucide-react';

interface NavbarProps {
  onCartClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCartClick }) => {
  const { user, profile, isAdmin, isProductManager, isOrderManager } = useAuth();
  const canAccessAdmin = isAdmin || isProductManager || isOrderManager;
  const { itemCount } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (location.pathname !== '/' && query.trim() !== '') {
      navigate('/');
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = () => auth.signOut();

  return (
    <nav className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 group"
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-500 transition-colors shrink-0">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block truncate">
              GAMESTORE PRO
            </span>
            <span className="hidden xs:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 tracking-tighter uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4 lg:mx-8">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (location.pathname !== '/') {
                  navigate('/');
                } else {
                  document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="relative w-full z-10"
            >
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none rtl:right-3 ltr:left-3 ltr:right-auto">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('nav.search')}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-1.5 px-10 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute inset-y-0 left-3 flex items-center p-0.5 text-slate-500 hover:text-slate-300 transition-colors rtl:left-3 ltr:right-3 ltr:left-auto"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs font-medium"
            >
              <Languages className="w-4 h-4" />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            <motion.button
              key={itemCount}
              initial={{ scale: 1 }}
              animate={itemCount > 0 ? { scale: [1, 1.2, 1] } : {}}
              id="cart-button"
              onClick={onCartClick}
              className="relative p-2 text-slate-300 hover:text-white transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </motion.button>

            {user ? (
              <div className="relative group flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end mr-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="text-[9px] text-emerald-500 font-bold leading-none uppercase tracking-tighter">المحفظة</span>
                  <span className="text-xs font-black text-emerald-400 leading-none mt-0.5">{formatPrice(profile?.balance || 0)}</span>
                </div>
                <Link
                  to={canAccessAdmin ? "/admin" : "/dashboard"}
                  className="flex items-center gap-2 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {profile?.displayName?.[0] || user.email?.[0].toUpperCase()}
                  </div>
                </Link>
                <div className="hidden lg:flex flex-col text-start px-1">
                  <span className="text-[10px] text-slate-400 leading-none">{t('common.welcome')}</span>
                  <span className="text-sm font-medium text-slate-200 truncate max-w-[100px]">
                    {profile?.displayName || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title={t('common.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-slate-300 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-slate-800 bg-[#0f172a] p-4 flex flex-col gap-4"
          >
            {/* Mobile Language Switcher */}
            <button
              onClick={() => {
                toggleLanguage();
                setIsMenuOpen(false);
              }}
              className="flex items-center justify-between px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300"
            >
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                <span>Language / اللغة</span>
              </div>
              <span className="font-bold text-indigo-400">{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Mobile Search */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                if (location.pathname !== '/') {
                  navigate('/');
                } else {
                  document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="relative w-full z-10"
            >
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none rtl:right-3 ltr:left-3 ltr:right-auto">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('nav.search')}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-10 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
              />
            </form>

            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-slate-300 hover:text-white py-2">
              {t('nav.home')}
            </Link>
            <Link to="/games" onClick={() => setIsMenuOpen(false)} className="text-slate-300 hover:text-white py-2">
              {t('nav.games')}
            </Link>
            {canAccessAdmin && (
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-indigo-400 hover:text-indigo-300 py-2">
                {t('nav.dashboard')}
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
