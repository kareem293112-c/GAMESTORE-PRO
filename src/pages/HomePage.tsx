import React, { useEffect, useState } from 'react';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { SAMPLE_PRODUCTS } from '../constants';
import { ProductCard } from '../components/ui/ProductCard';
import { useSearch } from '../context/SearchContext';
import { useLanguage } from '../context/LanguageContext';
import { ActivityFeed } from '../components/layout/ActivityFeed';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Gamepad2, Gift, MousePointer2, Percent, TrendingUp, Search, X, User } from 'lucide-react';
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
      title: "أقوى عروض شدات ببجي",
      subtitle: "خصم يصل إلى 20% على باقات الـ UC الكبيرة",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000",
      color: "from-indigo-600 to-purple-600"
    },
    {
      id: 2,
      title: "اشتراكات نتفليكس وشاهد",
      subtitle: "حسابات رسمية ومضمونة بأرخص الأسعار",
      image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=2000",
      color: "from-rose-600 to-orange-600"
    }
  ];

  const bannersEn = [
    {
      id: 1,
      title: "Best PUBG UC Offers",
      subtitle: "Up to 20% discount on large UC packages",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000",
      color: "from-indigo-600 to-purple-600"
    },
    {
      id: 2,
      title: "Netflix & Shahid Subscriptions",
      subtitle: "Official and guaranteed accounts at the lowest prices",
      image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=2000",
      color: "from-rose-600 to-orange-600"
    }
  ];

  const banners = language === 'ar' ? bannersAr : bannersEn;

  const categories = [
    { id: 'all', name: language === 'ar' ? 'الكل' : 'All', icon: Sparkles },
    { id: 'قسم الهدايا', name: language === 'ar' ? 'قسم الهدايا' : 'Gifts', icon: Gift },
    { id: 'حسابات ستيم', name: language === 'ar' ? 'حسابات ستيم' : 'Steam Accounts', icon: User },
    { id: 'أكواد ستيم', name: language === 'ar' ? 'أكواد ستيم' : 'Steam Keys', icon: Gamepad2 },
    { id: 'حسابات مشكلة', name: language === 'ar' ? 'حسابات مشكلة' : 'Mixed Accounts', icon: MousePointer2 },
  ];

  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || (
      (product.name?.toLowerCase() || '').includes(query) ||
      (product.description?.toLowerCase() || '').includes(query) ||
      (product.category?.toLowerCase() || '').includes(query) ||
      (product.platform?.toLowerCase() || '').includes(query)
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
    <div className="space-y-16 pb-20 overflow-hidden bg-[#0f172a]">
      {/* Hero Slider Section */}
      <section className="relative h-[400px] md:h-[550px] overflow-hidden -mt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <div className={`absolute inset-0 bg-gradient-to-l ${banners[currentBanner].color} opacity-40 mix-blend-overlay z-10`} />
            <img 
              src={banners[currentBanner].image} 
              alt={banners[currentBanner].title}
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent z-20" />
            
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center p-4">
              <motion.span 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-indigo-600/20 text-indigo-400 px-4 py-1 rounded-full text-xs font-bold mb-4 border border-indigo-500/20"
              >
                {t('banner.exclusive')}
              </motion.span>
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl"
              >
                {banners[currentBanner].title}
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-slate-300 text-lg md:text-xl max-w-2xl"
              >
                {banners[currentBanner].subtitle}
              </motion.p>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-4 mt-8"
              >
                <button 
                  onClick={() => {
                    const el = document.getElementById('products-grid');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/30 hover:scale-105"
                >
                  {t('banner.shopNow')}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Slider Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === currentBanner ? 'bg-indigo-500 w-12' : 'bg-slate-700 w-6 hover:bg-slate-500'}`}
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
              onClick={() => {
                setSelectedCategory(cat.id);
                const el = document.getElementById('products-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
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

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {[
          { icon: Gamepad2, label: t('features.instant'), desc: t('features.instantDesc') },
          { icon: Gift, label: t('features.bestPrice'), desc: t('features.bestPriceDesc') },
          { icon: Percent, label: t('features.secure'), desc: t('features.secureDesc') },
          { icon: TrendingUp, label: t('features.support'), desc: t('features.supportDesc') }
        ].map((f, i) => (
          <div key={i} className="group p-6 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <f.icon className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-slate-100 font-bold mb-1">{f.label}</h3>
            <p className="text-slate-500 text-xs">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Products Grid */}
      <section id="products-grid" className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {searchQuery ? (
                language === 'ar' ? <>نتائج البحث عن: "{searchQuery}"</> : <>Search results for: "{searchQuery}"</>
              ) : selectedCategory !== 'all' ? (
                <>{categories.find(c => c.id === selectedCategory)?.name}</>
              ) : (
                <><Sparkles className="w-6 h-6 text-yellow-400" /> {t('products.trending')}</>
              )}
            </h2>
            <p className="text-slate-500 text-sm">{t('products.trendingDesc')}</p>
          </div>
          <button className="text-indigo-400 hover:text-indigo-300 font-bold text-sm hidden sm:block">
            {t('products.viewAll')}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-[380px] bg-slate-800/20 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {filteredProducts.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </Masonry>
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 text-slate-500">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-white">لم يتم العثور على نتائج</p>
                <p className="text-slate-500 text-sm">جرّب كلمات بحث أخرى</p>
              </div>
            </div>
          )}
      </section>
      <ActivityFeed />
      <WhatsAppButton />
    </div>
  );
};
