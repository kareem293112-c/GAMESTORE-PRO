import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Mail, 
  ShieldCheck, 
  Zap, 
  MessageCircle,
  Gamepad2,
  ShoppingCart,
  Tag
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'motion/react';

const VisaLogo = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 6.182h-2.181l-3.327 9.873h2.364L22 6.182zM15.455 6.182h-4.364l-3.2 7.745L6.618 7c-.364-1.455-1.636-2.545-3.055-2.618v.073L5.964 16h2.363l3.782-9.818h3.346l.001-.001zm6.545 0h-2.182L16.49 16.055h2.364L22 6.182z" fill="#FFF"/>
    <path d="M4.618 6.182H.11l-.037.182C3.127 7.127 4.182 8.545 4.727 10l-.836-4.182.727.182z" fill="#FFF"/>
  </svg>
);

const MastercardLogo = () => (
  <svg className="h-8 w-auto" viewBox="0 0 44 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="15" r="15" fill="#EB001B"/>
    <circle cx="29" cy="15" r="15" fill="#F79E1B" fillOpacity="0.8"/>
    <path d="M22 6.5C20 8.5 18.7 11.5 18.7 15C18.7 18.5 20 21.5 22 23.5C24 21.5 25.3 18.5 25.3 15C25.3 11.5 24 8.5 22 6.5Z" fill="#FF5F00"/>
  </svg>
);

const TroyLogo = () => (
  <svg viewBox="0 0 100 35" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
    <text x="10" y="25" fill="#FFF" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="22" letterSpacing="1">TROY</text>
  </svg>
);

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-900/50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-16 border-b border-slate-800">
          <motion.div 
            whileHover={{ y: -5 }}
            className="flex items-center gap-4 group bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800/50 hover:border-indigo-500/30 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-indigo-600/10 text-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.1)]">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">{language === 'ar' ? 'ألعاب رقمية مميزة' : 'Premium Digital Games'}</h4>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                {language === 'ar' 
                  ? 'تصفح أحدث وأقوى الألعاب الرقمية داخل متجر منظم وسريع.' 
                  : 'Browse the latest and greatest digital games in an organized and fast store.'}
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="flex items-center gap-4 group bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800/50 hover:border-emerald-500/30 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-emerald-600/10 text-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-[0_0_20_px_rgba(16,185,129,0.1)]">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">{language === 'ar' ? 'تجربة شراء سلسة' : 'Seamless Shopping'}</h4>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                {language === 'ar'
                  ? 'واجهة سهلة وسريعة تساعد المستخدم يوصل للعبة المطلوبة مباشرة.'
                  : 'A simple and fast interface that helps users reach their desired games directly.'}
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="flex items-center gap-4 group bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800/50 hover:border-amber-500/30 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-amber-600/10 text-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">{language === 'ar' ? 'تفعيل وتسليم فوري' : 'Instant Activation'}</h4>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                {language === 'ar'
                  ? 'استلم المفتاح أو المنتج الرقمي فور انتهاء عملية الدفع.'
                  : 'Receive your digital key or product immediately after payment completion.'}
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="flex items-center gap-4 group bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800/50 hover:border-rose-500/30 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-rose-600/10 text-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
              <Tag className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">{language === 'ar' ? 'أسعار منافسة' : 'Competitive Prices'}</h4>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                {language === 'ar'
                  ? 'نوفر أفضل الأسعار والعروض على مجموعة كبيرة من الألعاب.'
                  : 'We provide the best prices and offers on a wide range of games.'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Main Footer Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 py-16">
          {/* Logo & About */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-indigo-500 fill-indigo-500" />
              <span className="text-2xl font-bold text-white tracking-tight">Gamestore Pro</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t('footer.about')}
            </p>
          </div>

          {/* Column 1: Popular Categories */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">{t('footer.categories')}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/?category=برايم" className="text-slate-400 hover:text-indigo-400 transition-colors">{language === 'ar' ? 'فالورانت برايم' : 'Valorant Prime'}</Link></li>
              <li><Link to="/?category=PUBG Mobile" className="text-slate-400 hover:text-indigo-400 transition-colors">{language === 'ar' ? 'شدات PUBG Mobile' : 'PUBG Mobile UC'}</Link></li>
              <li><Link to="/?category=steam" className="text-slate-400 hover:text-indigo-400 transition-colors">{language === 'ar' ? 'بطاقات ستيم' : 'Steam Gift Cards'}</Link></li>
              <li><Link to="/?category=roblox" className="text-slate-400 hover:text-indigo-400 transition-colors">{language === 'ar' ? 'روبلوكس روبوكس' : 'Roblox Robux'}</Link></li>
              <li><Link to="/?category=GTA" className="text-slate-400 hover:text-indigo-400 transition-colors">{language === 'ar' ? 'GTA 5 أونلاين' : 'GTA 5 Online'}</Link></li>
            </ul>
          </div>

          {/* Column 2: Quick Access */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">{t('footer.quickAccess')}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="text-slate-400 hover:text-indigo-400 transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/checkout" className="text-slate-400 hover:text-indigo-400 transition-colors">{language === 'ar' ? 'إتمام الطلب' : 'Checkout'}</Link></li>
              <li><Link to="/register" className="text-slate-400 hover:text-indigo-400 transition-colors">{language === 'ar' ? 'انضم إلينا' : 'Join Us'}</Link></li>
              <li><Link to="/dashboard" className="text-slate-400 hover:text-indigo-400 transition-colors">{language === 'ar' ? 'حسابي' : 'My Account'}</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal Information */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">{language === 'tr' ? 'Yasal Bilgiler' : (language === 'ar' ? 'معلومات قانونية' : 'Legal Information')}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/distance-sales" className="text-slate-400 hover:text-indigo-400 transition-colors text-xs">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link to="/return-policy" className="text-slate-400 hover:text-indigo-400 transition-colors text-xs">İptal ve İade Koşulları</Link></li>
              <li><Link to="/privacy" className="text-slate-400 hover:text-indigo-400 transition-colors text-xs">{language === 'tr' ? 'Gizlilik Politikası' : t('footer.links.privacy')}</Link></li>
              <li><Link to="/terms" className="text-slate-400 hover:text-indigo-400 transition-colors text-xs">{language === 'tr' ? 'Kullanım Koşulları' : t('footer.links.terms')}</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Social */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">{t('footer.follow')}</h4>
            <div className="flex gap-3 mb-8">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, idx) => (
                <button key={idx} className="w-10 h-10 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all">
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>karmo2931@gmail.com</span>
              </div>
              <div className="flex items-start gap-3 text-slate-400 text-sm">
                <MessageCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div>
                   <p className="font-bold text-slate-200">+90 536 016 76 64</p>
                   <p className="text-xs">{language === 'ar' ? 'متجر: Gamestore Pro' : 'Store: Gamestore Pro'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-800 flex flex-col items-center gap-8">
          <div className="flex items-center gap-8 justify-center transition-all flex-wrap">
            <div className="opacity-80 hover:opacity-100 transition-all cursor-pointer">
              <VisaLogo />
            </div>
            <div className="opacity-80 hover:opacity-100 transition-all cursor-pointer">
              <MastercardLogo />
            </div>
            <div className="opacity-80 hover:opacity-100 transition-all cursor-pointer">
              <TroyLogo />
            </div>
            <div className="flex items-center gap-2 text-[12px] text-slate-300 border border-slate-700/50 px-4 py-2 rounded-xl font-black bg-slate-800/50 opacity-80 hover:opacity-100 transition-all cursor-pointer h-10 shadow-lg">
               <ShieldCheck className="w-5 h-5 text-indigo-500" />
               3D SECURE
            </div>
          </div>

          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.2em] text-center px-2 pb-4">
            © {new Date().getFullYear()} Gamestore Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
