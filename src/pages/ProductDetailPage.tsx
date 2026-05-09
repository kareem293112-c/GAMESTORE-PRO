import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Review, OperationType } from '../types';
import { SAMPLE_PRODUCTS } from '../constants';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/utils';
import { ShoppingCart, Star, ShieldCheck, Zap, ArrowRight, Monitor, Globe, Clock, Cpu, HardDrive, Cpu as Gpu, Layout, Calendar, Briefcase, Languages, Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [flyIcon, setFlyIcon] = useState<{ x: number, y: number } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const { addToCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: { userId: user?.uid, email: user?.email },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    if (product) {
      const btn = e.currentTarget as HTMLButtonElement;
      const rect = btn.getBoundingClientRect();
      const cartBtn = document.getElementById('cart-button');
      
      if (cartBtn) {
        const cartRect = cartBtn.getBoundingClientRect();
        setFlyIcon({
          x: cartRect.left - rect.left,
          y: cartRect.top - rect.top
        });
      }

      addToCart(product);
      setIsAdded(true);
      toast.success('تمت الإضافة للسلة');
      setTimeout(() => {
        setIsAdded(false);
        setFlyIcon(null);
      }, 5000);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          // Fallback to sample products for demo
          const sample = SAMPLE_PRODUCTS.find(p => p.id === id);
          if (sample) {
            setProduct(sample);
          } else {
            toast.error('المنتج غير موجود');
            navigate('/');
          }
        }
      } catch (error) {
        console.error(error);
        toast.error('خطأ في تحميل بيانات المنتج');
      } finally {
        setLoading(false);
      }
    };

    const checkPurchaseStatus = async () => {
      if (!user || !id) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          where('status', '==', 'completed')
        );
        const querySnapshot = await getDocs(q);
        const hasBought = querySnapshot.docs.some(doc => {
          const orderData = doc.data();
          return orderData.items?.some((item: any) => item.id === id);
        });
        setHasPurchased(hasBought);
      } catch (error) {
        console.error('Error checking purchase status:', error);
      }
    };

    fetchProduct();
    fetchReviews();
    checkPurchaseStatus();
    window.scrollTo(0, 0);
  }, [id, navigate, user]);

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', id),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) {
      toast.error('يجب تسجيل الدخول لإضافة تقييم');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('يرجى كتابة تعليق');
      return;
    }

    setSubmittingReview(true);
    const path = 'reviews';
    try {
      await addDoc(collection(db, path), {
        productId: id,
        userId: user.uid,
        userName: profile?.displayName || user.email?.split('@')[0] || 'مستخدم',
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: serverTimestamp()
      });

      setNewReview({ rating: 5, comment: '' });
      toast.success('تمت إضافة التقييم بنجاح');
      fetchReviews();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const discountedPrice = product.price * (1 - (product.discount || 0) / 100);

  return (
    <div className="min-h-screen bg-[#0f172a] pb-20" dir="rtl">
      {/* Hero Header */}
      <div className="relative h-[300px] md:h-[450px] overflow-hidden">
        <img 
          src={product.imageUrl} 
          className="w-full h-full object-cover blur-sm scale-105 opacity-30" 
          alt="" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 w-full pb-12">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
            >
              <ArrowRight className="w-5 h-5" /> عودة للمتجر
            </button>
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-48 h-64 md:w-64 md:h-80 shrink-0 bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700"
              >
                <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name} />
              </motion.div>
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-xs font-bold border border-indigo-500/20 uppercase">
                    {product.platform}
                  </span>
                  <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-bold border border-slate-700 uppercase">
                    {product.category}
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white">{product.name}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-lg font-bold">{product.rating}</span>
                  </div>
                  <span className="text-slate-500 text-sm">|</span>
                  <span className={`text-sm font-bold ${product.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {product.stock > 0 ? `متوفر (${product.stock} قطعة)` : 'نفذت الكمية'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">وصف المنتج</h2>
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl leading-relaxed text-slate-400">
              {product.description || "لا يوجد وصف متوفر لهذا المنتج حالياً."}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureItem icon={ShieldCheck} title="ضمان دائم" desc="نضمن عمل الكود 100%" />
            <FeatureItem icon={Zap} title="تسليم سريع" desc="تلقائي فور الدفع" />
            <FeatureItem icon={Globe} title="تفعيل عالمي" desc="يعمل في جميع المناطق" />
          </section>

          {product.requirements && (
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Monitor className="w-6 h-6 text-indigo-500" /> متطلبات التشغيل
              </h2>
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-x-reverse divide-slate-800">
                  <div className="p-6 space-y-4">
                    <RequirementRow icon={Layout} label="نظام التشغيل" value={product.requirements.os} />
                    <RequirementRow icon={Cpu} label="المعالج" value={product.requirements.processor} />
                  </div>
                  <div className="p-6 space-y-4">
                    <RequirementRow icon={Cpu} label="الذاكرة" value={product.requirements.memory} />
                    <RequirementRow icon={Gpu} label="بطاقة العرض" value={product.requirements.graphics} />
                  </div>
                  <div className="p-6 space-y-4">
                    <RequirementRow icon={HardDrive} label="مساحة التخزين" value={product.requirements.storage} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Reviews Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-indigo-500" /> تقييمات اللاعبين ({reviews.length})
              </h2>
            </div>

            {/* Review Form */}
            {user ? (
              hasPurchased ? (
                <form onSubmit={handleSubmitReview} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-slate-400 font-bold">تقييمك:</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="transition-transform active:scale-90"
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="شاركنا رأيك حول اللعبة..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-32 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="absolute bottom-4 left-4 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {submittingReview ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      نشر التقييم
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-900/30 border border-dashed border-slate-800 p-8 rounded-3xl text-center">
                  <ShieldCheck className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500">يجب عليك شراء هذا المنتج لتتمكن من إضافة تقييم</p>
                </div>
              )
            ) : (
              <div className="bg-slate-900/30 border border-dashed border-slate-800 p-8 rounded-3xl text-center">
                <p className="text-slate-500">يجب عليك تسجيل الدخول لتتمكن من إضافة تقييم</p>
                <button 
                  onClick={() => navigate('/login')}
                  className="mt-4 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                >
                  تسجيل الدخول الآن
                </button>
              </div>
            )}

            {/* List of Reviews */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/30 border border-slate-800/50 p-6 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-500 font-bold">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{review.userName}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('ar-SA') : 'منذ قليل'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{review.comment}</p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-600 italic">كن أول من يقيم هذا المنتج!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl sticky top-24 space-y-8">
            <div className="space-y-2">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">السعر النهائي</p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-white">{formatPrice(discountedPrice)}</span>
                {product.discount > 0 && (
                  <span className="text-lg text-slate-500 line-through">{formatPrice(product.price)}</span>
                )}
              </div>
              {product.discount > 0 && (
                <div className="inline-block bg-red-600/10 text-red-500 text-[10px] font-black px-2 py-1 rounded">
                  تم توفير {formatPrice(product.price - discountedPrice)} ({product.discount}%)
                </div>
              )}
            </div>

            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAdded}
                className={`relative w-full font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
                  product.stock > 0
                    ? isAdded
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <AnimatePresence>
                  {flyIcon && (
                    <motion.div
                      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                      animate={{ 
                        x: flyIcon.x, 
                        y: flyIcon.y, 
                        scale: 0.2, 
                        opacity: 0,
                        rotate: 360
                      }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute z-[100] pointer-events-none"
                    >
                      <img src={product.imageUrl} className="w-16 h-20 rounded-xl object-cover shadow-2xl border-2 border-white" alt="" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <ShoppingCart className="w-6 h-6" />
                {isAdded ? 'تمت الإضافة بنجاح!' : (product.stock > 0 ? 'إضافة إلى السلة' : 'نفذت الكمية')}
              </button>

              {isAdded && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => navigate('/checkout')}
                  className="w-full font-black py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <ShoppingCart className="w-6 h-6" />
                  إتمام الشراء
                </motion.button>
              )}
              
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  تسليم رقمي فوري لبريدك الإلكتروني
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Monitor className="w-4 h-4 text-indigo-500" />
                  نوع المنتج: مفتاح رقمي (CD Key)
                </div>
              </div>

              {(product.releaseDate || product.developer || product.languages) && (
                <div className="pt-6 mt-6 border-t border-slate-800 space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase">معلومات إضافية</p>
                  {product.releaseDate && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-3 h-3" /> تاريخ الإصدار</span>
                      <span className="text-slate-300 font-bold">{product.releaseDate}</span>
                    </div>
                  )}
                  {product.developer && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-2"><Briefcase className="w-3 h-3" /> المطور</span>
                      <span className="text-slate-300 font-bold">{product.developer}</span>
                    </div>
                  )}
                  {product.languages && product.languages.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/50">
                      <span className="text-slate-500 flex items-center gap-2 text-[10px]"><Languages className="w-3 h-3" /> اللغات المدعومة</span>
                      <div className="flex flex-wrap gap-1">
                        {product.languages.map(lang => (
                          <span key={lang} className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] border border-slate-700">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon: Icon, title, desc }: any) => (
  <div className="bg-slate-900/30 border border-slate-800/50 p-6 rounded-2xl space-y-2 text-center group hover:bg-indigo-600/5 transition-colors">
    <div className="w-12 h-12 bg-indigo-600/10 text-indigo-500 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="text-white font-bold text-sm">{title}</h4>
    <p className="text-slate-500 text-xs">{desc}</p>
  </div>
);

const RequirementRow = ({ icon: Icon, label, value }: any) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
      <Icon className="w-3 h-3 text-indigo-500" /> {label}
    </p>
    <p className="text-sm text-slate-300 font-medium">{value || 'غير محدد'}</p>
  </div>
);
