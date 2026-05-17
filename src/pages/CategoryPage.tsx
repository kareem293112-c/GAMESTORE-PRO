import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { SAMPLE_PRODUCTS } from '../constants';
import { ProductCard } from '../components/ui/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { ChevronRight, Filter, SortAsc, LayoutGrid, List } from 'lucide-react';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';

export const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  // Map slug back to category name if needed, or use slug directly if it matches the DB
  const categoryName = decodeURIComponent(categorySlug || '');

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'products'), where('category', '==', categoryName));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        if (productsData.length === 0) {
          // Fallback to sample data for demo
          setProducts(SAMPLE_PRODUCTS.filter(p => p.category === categoryName));
        } else {
          setProducts(productsData);
        }
      } catch (error) {
        console.error("Error fetching category products:", error);
        setProducts(SAMPLE_PRODUCTS.filter(p => p.category === categoryName));
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchCategoryProducts();
    }
  }, [categoryName]);

  return (
    <div className="min-h-screen bg-[#0a0f1d] pb-20">
      {/* Breadcrumbs */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-slate-400">
          <Link to="/" className="hover:text-indigo-400 transition-colors">الرئيسية</Link>
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          <span className="text-white font-bold">{categoryName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-2 text-white font-bold border-b border-slate-800 pb-4">
                <Filter className="w-4 h-4 text-indigo-500" />
                <span>الفلاتر</span>
              </div>
              
              <div className="space-y-4">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">السعر</p>
                <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500" />
                     <span className="text-sm text-slate-300">أقل من 100 TRY</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500" />
                     <span className="text-sm text-slate-300">100 - 500 TRY</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500" />
                     <span className="text-sm text-slate-300">أكثر من 500 TRY</span>
                   </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">نوع المنتج</p>
                <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <input type="checkbox" checked readOnly className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500" />
                     <span className="text-sm text-slate-300">{categoryName}</span>
                   </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-white">{categoryName}</h1>
                <p className="text-slate-500 text-sm">{products.length} منتج تم العثور عليه</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button className="p-2 bg-indigo-600 text-white rounded-lg"><LayoutGrid className="w-4 h-4" /></button>
                  <button className="p-2 text-slate-500 hover:text-slate-300 rounded-lg"><List className="w-4 h-4" /></button>
                </div>
                <div className="relative">
                  <SortAsc className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select className="bg-slate-900 border border-slate-800 text-white text-sm rounded-xl py-2 pr-10 pl-4 focus:ring-indigo-500 focus:border-indigo-500 appearance-none">
                    <option>الأحدث أولاً</option>
                    <option>السعر: من الأقل للأعلى</option>
                    <option>السعر: من الأعلى للأقل</option>
                    <option>الأكثر مبيعاً</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-slate-900 rounded-2xl animate-pulse border border-slate-800" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 bg-slate-900/50 rounded-[2rem] border border-slate-800/50">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
                   <Filter className="w-10 h-10" />
                </div>
                <p className="text-xl font-bold text-white">لا توجد منتجات في هذا القسم حالياً</p>
                <Link to="/" className="inline-block text-indigo-400 font-bold hover:underline">العودة للرئيسية</Link>
              </div>
            )}
          </main>
        </div>
      </div>
      <WhatsAppButton />
    </div>
  );
};
