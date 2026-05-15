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
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-sm text-center md:text-start px-2">
            © {new Date().getFullYear()} Gamestore Pro. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 w-auto" referrerPolicy="no-referrer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 w-auto" referrerPolicy="no-referrer" />
            <div className="flex items-center gap-1 font-black text-white text-xs italic">
               <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center not-italic mr-1">
                 <span className="text-[8px] text-blue-950 font-bold">TROY</span>
               </span>
               TROY
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 border border-slate-700 px-2 py-1 rounded font-bold">
               <ShieldCheck className="w-3 h-3 text-indigo-500" />
               3D SECURE
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
