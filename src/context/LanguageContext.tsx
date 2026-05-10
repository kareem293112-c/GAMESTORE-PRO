import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    'nav.home': 'الرئيسية',
    'nav.games': 'الألعاب',
    'nav.login': 'دخول',
    'nav.register': 'سجل الآن',
    'nav.dashboard': 'لوحة التحكم',
    'nav.search': 'ابحث هنا...',
    'banner.exclusive': 'عروض حصرية لفترة محدودة',
    'banner.shopNow': 'تسوق الآن',
    'features.membership': 'انضم لعضويتنا',
    'features.membershipDesc': 'تمتع بتسوق آمن وسهل بضغطة زر.',
    'features.listing': 'إضافة إعلان',
    'features.listingDesc': 'اعرض حسابك أو أغراضك للبيع ووصلها لآلاف اللاعبين.',
    'features.secureSell': 'بيع موثوق',
    'features.secureSellDesc': 'صفقات آمنة تماماً تضمن حقوقك وحقوق المشتري.',
    'features.withdraw': 'استلم أرباحك',
    'features.withdrawDesc': 'حول أرباحك من المبيعات لحسابك البنكي بكل سهولة.',
    'products.trending': 'الألعاب الأكثر مبيعاً',
    'products.trendingDesc': 'العناوين الأكثر طلباً هذا الأسبوع',
    'products.viewAll': 'عرض الكل',
    'products.noResults': 'لم يتم العثور على نتائج',
    'products.tryAgain': 'جرّب كلمات بحث أخرى',
    'footer.about': 'سوق آمن لحسابات الألعاب، العملات، والعناصر. المكان الأمثل لشراء E-pins والألعاب بأسعار مخفضة وتوصيل سريع.',
    'footer.categories': 'الفئات الشائعة',
    'footer.quickAccess': 'الوصول السريع',
    'footer.information': 'معلومات',
    'footer.follow': 'تابعنا',
    'footer.rights': '© 2026 جميع الحقوق محفوظة لشركة ITACC ECOM AND WEBSOL LTD.',
    'common.welcome': 'مرحباً',
    'common.logout': 'تسجيل الخروج',
    'auth.loginSubtitle': 'أهلاً بك مجدداً في متجر الألعاب المفضل لديك',
    'auth.loginSuccess': 'تم تسجيل الدخول بنجاح',
    'auth.loginError': 'خطأ في البريد الإلكتروني أو كلمة المرور',
    'auth.emailNotAllowed': 'تسجيل الدخول بالبريد الإلكتروني غير مفعل في إعدادات Firebase.',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.registerSubtitle': 'انضم إلى مجتمع اللاعبين المتميزين',
    'auth.fullName': 'الاسم الكامل',
    'auth.passwordHint': 'يجب أن لا تقل عن 6 خانات',
    'auth.alreadyHaveAccount': 'لديك حساب بالفعل؟',
    'auth.registerSuccess': 'تم إنشاء الحساب بنجاح',
    'auth.registerError': 'حدث خطأ أثناء إنشاء الحساب',
    'auth.googleSuccess': 'تم تسجيل الدخول بجوجل',
    'auth.googleError': 'حدث خطأ أثناء تسجيل الدخول بجوجل',
    'activity.fallbackUser': 'عميل محترم',
    'activity.fallbackProduct': 'منتج مميز',
    'activity.purchased': 'قام بشراء',
    'footer.links.about': 'من نحن',
    'footer.links.delivery': 'شروط التوصيل والإرجاع',
    'footer.links.privacy': 'سياسة الخصوصية',
    'footer.links.distance': 'اتفاقية البيع عن بعد',
  },
  en: {
    'nav.home': 'Home',
    'nav.games': 'Games',
    'nav.login': 'Login',
    'nav.register': 'Register Now',
    'nav.dashboard': 'Dashboard',
    'nav.search': 'Search here...',
    'banner.exclusive': 'Exclusive Limited Time Offers',
    'banner.shopNow': 'Shop Now',
    'features.membership': 'Join Membership',
    'features.membershipDesc': 'Enjoy secure and easy shopping with one click.',
    'features.listing': 'Add Listing',
    'features.listingDesc': 'List your account or items and reach thousands of players.',
    'features.secureSell': 'Trusted Selling',
    'features.secureSellDesc': 'Safe deals that ensure your rights and the buyer\'s rights.',
    'features.withdraw': 'Withdraw Earnings',
    'features.withdrawDesc': 'Easily transfer your sales earnings to your bank account.',
    'products.trending': 'Trending Games',
    'products.trendingDesc': 'Most requested titles this week',
    'products.viewAll': 'View All',
    'products.noResults': 'No results found',
    'products.tryAgain': 'Try other search keywords',
    'footer.about': 'A secure market for gaming accounts, currencies, and items. The perfect place to buy E-pins and games at discounted prices with fast delivery.',
    'footer.categories': 'Popular Categories',
    'footer.quickAccess': 'Quick Access',
    'footer.information': 'Information',
    'footer.follow': 'Follow Us',
    'footer.rights': '© 2026 All rights reserved by ITACC ECOM AND WEBSOL LTD.',
    'common.welcome': 'Welcome',
    'common.logout': 'Logout',
    'auth.loginSubtitle': 'Welcome back to your favorite game store',
    'auth.loginSuccess': 'Logged in successfully',
    'auth.loginError': 'Invalid email or password',
    'auth.emailNotAllowed': 'Email login is not enabled in Firebase settings.',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.registerSubtitle': 'Join our community of elite gamers',
    'auth.fullName': 'Full Name',
    'auth.passwordHint': 'Must be at least 6 characters',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.registerSuccess': 'Account created successfully',
    'auth.registerError': 'An error occurred during registration',
    'auth.googleSuccess': 'Signed in with Google',
    'auth.googleError': 'An error occurred while signing in with Google',
    'activity.fallbackUser': 'Valued Customer',
    'activity.fallbackProduct': 'Featured Product',
    'activity.purchased': 'purchased',
    'footer.links.about': 'About Us',
    'footer.links.delivery': 'Delivery & Returns',
    'footer.links.privacy': 'Privacy Policy',
    'footer.links.distance': 'Distance Sales Agreement',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'ar';
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
