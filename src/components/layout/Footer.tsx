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

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-900/50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-16 border-b border-slate-800">
          <div className="flex items-center gap-4 group bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800/50 hover:border-indigo-500/30 transition-all duration-300">
            <div className="w-14 h-14 bg-indigo-600/10 text-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(79,70,229,0.1)]">
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
          </div>

          <div className="flex items-center gap-4 group bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800/50 hover:border-emerald-500/30 transition-all duration-300">
            <div className="w-14 h-14 bg-emerald-600/10 text-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
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
          </div>

          <div className="flex items-center gap-4 group bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800/50 hover:border-amber-500/30 transition-all duration-300">
            <div className="w-14 h-14 bg-amber-600/10 text-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
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
          </div>

          <div className="flex items-center gap-4 group bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800/50 hover:border-rose-500/30 transition-all duration-300">
            <div className="w-14 h-14 bg-rose-600/10 text-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
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
          </div>
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
              <li><Link to="/privacy" className="text-slate-400 hover:text-indigo-400 transition-colors text-xs">{language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link></li>
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
                   <p className="font-bold text-slate-200" dir="ltr">+90 536 016 76 64</p>
                   <p className="text-xs">{language === 'ar' ? 'متجر: Gamestore Pro' : 'Store: Gamestore Pro'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto">
          <p className="text-slate-500 text-sm text-center md:text-start px-2">
            © {new Date().getFullYear()} Gamestore Pro. All rights reserved.
          </p>
          
          {/* ربط شبكات الدفع المستخرجة مباشرة من الرابط المعتمد مع توحيد الأبعاد البصرية */}
          <div className="flex items-center gap-5 justify-center flex-wrap bg-slate-900/40 px-4 py-2 rounded-2xl border border-slate-800/40">
            {/* 3D Secure */}
            <div className="border border-slate-700/60 rounded-xl px-2.5 py-1 text-[10px] text-slate-400 font-black flex items-center gap-1.5 bg-slate-950/40 tracking-wider h-7">
              <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              3D SECURE
            </div>

            {/* Visa */}
            <img 
              src="https://wikimedia.org" 
              alt="Visa" 
              className="h-4 w-auto brightness-110"
              referrerPolicy="no-referrer" 
            />

            {/* Mastercard */}
            <img 
              src="https://wikimedia.org" 
              alt="Mastercard" 
              className="h-5 w-auto"
              referrerPolicy="no-referrer" 
            />

            {/* Cirrus */}
            <img 
              src="https://wikimedia.org" 
              alt="Cirrus" 
              className="h-5 w-auto"
              referrerPolicy="no-referrer" 
            />

            {/* Maestro */}
            <img 
              src="https://wikimedia.org" 
              alt="Maestro" 
              className="h-5 w-auto"
              referrerPolicy="no-referrer" 
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
