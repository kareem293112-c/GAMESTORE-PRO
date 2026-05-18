import React, { useEffect, useState } from 'react';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { SAMPLE_PRODUCTS } from '../constants';
import { ProductCard } from '../components/ui/ProductCard';
import { useSearch } from '../context/SearchContext';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Sparkles, Gamepad2, Gift, MousePointer2, Percent, TrendingUp, Search, X, User, Plus, ShieldCheck, Wallet, ChevronRight, Rocket, Headphones, Ticket } from 'lucide-react';
import { Footer } from '../components/layout/Footer';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';
import Masonry from 'react-masonry-css';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentBanner, setCurrentBanner] = useState(0);
  const { searchQuery, setSearchQuery } = useSearch();
  const { language, t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  const bannersAr = [
    {
      id: 1,
      title: "عالم الألعاب بين يديك",
      subtitle: "استكشف أحدث الألعاب، البطاقات الرقمية، واشتراكات ترفيهية بأسعار لا تقبل المنافسة.",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000",
      color: "from-indigo-900 to-purple-900"
    },
    {
      id: 2,
      title: "عروض الموسم الحصرية",
      subtitle: "خصومات تصل إلى 70% على أفضل العناوين العالمية لهذا الأسبوع.",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000",
      color: "from-blue-900 to-indigo-900"
    }
  ];

  const bannersEn = [
    {
      id: 1,
      title: "World of Gaming in Your Hands",
      subtitle: "Explore the latest games, digital cards, and entertainment subscriptions at unbeatable prices.",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000",
      color: "from-indigo-900 to-purple-900"
    },
    {
      id: 2,
      title: "Exclusive Season Offers",
      subtitle: "Up to 70% discounts on top global titles this week.",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000",
      color: "from-blue-900 to-indigo-900"
    }
  ];

  const banners = language === 'ar' ? bannersAr : bannersEn;

  const categories = [
    { id: 'all', name: language === 'ar' ? 'الكل' : 'All', icon: Sparkles },
    { id: 'حسابات ستيم', name: language === 'ar' ? 'حسابات ستيم' : 'Steam Accounts', icon: Gamepad2 },
    { id: 'قسم الهدايا', name: language === 'ar' ? 'بطاقات هدايا' : 'Gift Cards', icon: Ticket },
    { id: 'أكواد ستيم', name: language === 'ar' ? 'مفاتيح وأكواد ألعاب' : 'Game Keys & Codes', icon: Rocket },
    { id: 'حسابات مشكلة', name: language === 'ar' ? 'اشتراكات ترفيهية' : 'Subscriptions', icon: Headphones },
  ];

  const filteredProducts = products.filter(product => {
    const queryStr = searchQuery.toLowerCase().trim();
    const matchesSearch = !queryStr || (
      (product.name?.toLowerCase() || '').includes(queryStr) ||
      (product.description?.toLowerCase() || '').includes(queryStr) ||
      (product.category?.toLowerCase() || '').includes(queryStr) ||
      (product.platform?.toLowerCase() || '').includes(queryStr)
    );

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), limit(50));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        // Use fallback if empty
        if (productsData.length === 0) {
          setProducts(SAMPLE_PRODUCTS);
        } else {
          setProducts(productsData);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts(SAMPLE_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-16 pb-20 overflow-hidden bg-[#0a0f1d]">
      {/* Hero Slider Section */}
      <section className="relative h-[450px] md:h-[650px] overflow-hidden -mt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <div className={`absolute inset-0 bg-gradient-to-l ${banners[currentBanner].color} opacity-60 mix-blend-multiply z-10`} />
            <img 
              src={banners[currentBanner].image} 
              alt={banners[currentBanner].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/20 to-transparent z-20" />
            
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center p-6 sm:p-12">
              <div className="max-w-4xl space-y-6">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-2 border border-indigo-500/30 backdrop-blur-md"
                >
                  <TrendingUp className="w-4 h-4" />
                  {t('banner.exclusive')}
                </motion.div>
                <motion.h1 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="text-4xl md:text-8xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  {banners[currentBanner].title}
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-slate-300 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium"
                >
                  {banners[currentBanner].subtitle}
                </motion.p>
                
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
                >
                  <button 
                    onClick={() => {
                      const el = document.getElementById('products-grid');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4.5 rounded-2xl font-black text-lg transition-all shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Gamepad2 className="w-6 h-6" />
                    {t('banner.shopNow')}
                  </button>
                  <button 
                    className="w-full sm:w-auto bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white px-10 py-4.5 rounded-2xl font-black text-lg transition-all border border-white/10 hover:border-white/20"
                  >
                    اكتشف المزيد
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Slider Indicators */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 flex gap-3">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`h-2 rounded-full transition-all duration-500 ${idx === currentBanner ? 'bg-indigo-500 w-16 shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'bg-slate-700 w-8 hover:bg-slate-500'}`}
            />
          ))}
        </div>
      </section>

      {/* Categories Tabs */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-30">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-800 shadow-2xl">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-bold transition-all border text-sm sm:text-base",
                selectedCategory === cat.id
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 scale-105"
                  : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-indigo-500/30 hover:text-slate-200"
              )}
            >
              <cat.icon className={cn("w-4 h-4", selectedCategory === cat.id ? "text-white" : "text-indigo-400")} />
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Quick Stats / Trust Section */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "ألعاب أصلية", value: "100%", desc: "جميع المنتجات رسمية", color: "text-emerald-400" },
          { label: "توصيل فوري", value: "⚡", desc: "استلم كودك في لحظات", color: "text-amber-400" },
          { label: "دعم فني", value: "24/7", desc: "متواجدون دائماً لمساعدتك", color: "text-indigo-400" },
          { label: "ضمان كامل", value: "Safe", desc: "حماية كاملة لمشترياتك", color: "text-rose-400" },
        ].map((s, i) => (
          <div key={i} className="text-center p-8 bg-slate-900/30 rounded-[2rem] border border-slate-800/40">
            <div className={cn("text-3xl font-black mb-1", s.color)}>{s.value}</div>
            <div className="text-slate-100 font-bold text-sm mb-1">{s.label}</div>
            <div className="text-slate-500 text-[10px] uppercase font-black tracking-widest">{s.desc}</div>
          </div>
        ))}
      </section>

      {/* Grid Header */}
      <div className="max-w-7xl mx-auto px-4 border-b border-slate-800 pb-6">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              <Percent className="w-3.5 h-3.5" />
              أفضل الأسعار
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              {searchQuery ? (
                language === 'ar' ? <>نتائج: {searchQuery}</> : <>Results: {searchQuery}</>
              ) : selectedCategory !== 'all' ? (
                <>{categories.find(c => c.id === selectedCategory)?.name}</>
              ) : (
                <>اكتشف <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">الألعاب</span></>
              )}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-64 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder={t('nav.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 py-2 pl-10 pr-4 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
              />
            </div>
            <div className="hidden lg:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
               <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">كل الألعاب</button>
               <button className="px-4 py-2 hover:bg-slate-800 text-slate-400 rounded-lg text-xs font-bold transition-all">الأعلى تقييماً</button>
             </div>
          </div>
        </div>
      </div>

      {/* Grid Content - Refactored to Category Rows */}
      <section id="products-grid" className="max-w-7xl mx-auto px-4 pb-20 space-y-16">
        {loading ? (
          <div className="space-y-12">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-6">
                <div className="h-8 bg-slate-800/40 w-48 rounded-xl animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-7">
                  {Array(6).fill(0).map((_, j) => (
                    <div key={j} className="aspect-[3/4] bg-slate-800/40 rounded-2xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-7">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="py-20 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 text-slate-700 border border-slate-800">
                  <Search className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-black text-white">{t('products.noResults')}</p>
                  <p className="text-slate-500">{t('products.tryAgain')}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-16">
            {categories.filter(c => c.id !== 'all').map((category) => {
              const categoryProducts = products.filter(p => p.category === category.id);
              if (categoryProducts.length === 0) return null;

              return (
                <div key={category.id} className="space-y-6">
                  <div className="flex items-end justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-8 bg-[#ff6000] rounded-full" />
                      <div>
                        <h3 className="text-xl md:text-2xl font-black text-white">{category.name}</h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">{t('banner.exclusive')}</p>
                      </div>
                    </div>
                    <Link 
                      to={`/category/${encodeURIComponent(category.id)}`}
                      className="text-xs font-black text-[#ff6000] hover:text-[#ff7900] flex items-center gap-1.5 group transition-all bg-[#ff6000]/5 px-4 py-2 rounded-lg border border-[#ff6000]/10"
                    >
                      عرض الكل
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-7">
                    {categoryProducts.slice(0, 6).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <WhatsAppButton />
    </div>
  );
};
