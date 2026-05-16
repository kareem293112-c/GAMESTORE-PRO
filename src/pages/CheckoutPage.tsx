import React, { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, doc, serverTimestamp, runTransaction, addDoc } from 'firebase/firestore';
import { formatPrice } from '../lib/utils';
import { CreditCard, ShoppingBag, ShieldCheck, Truck, ArrowRight, CheckCircle2, Loader2, Lock, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export const CheckoutPage: React.FC = () => {
  const { items, clearCart } = useCartStore();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'whatsapp' | 'crypto'>('whatsapp');

  const cartTotal = items.reduce(
    (sum, item) => sum + (item.price * (1 - (item.discount || 0) / 100)) * item.quantity,
    0
  );

  const canUseWallet = (profile?.balance || 0) >= cartTotal;

  const [formData, setFormData] = useState({
    name: profile?.displayName || '',
    email: user?.email || '',
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setLoading(true);
    try {
      const orderId = `ORD-${Date.now()}`;

      // Run Transaction to ensure atomic operations (stock check & balance deduction)
      await runTransaction(db, async (transaction) => {
        // 1. Read necessary documents
        const userDocRef = doc(db, 'users', user!.uid);
        const userDoc = await transaction.get(userDocRef);
        const userData = userDoc.data();
        
        if (!userData) throw new Error('User not found');
        
        const balance = userData.balance || 0;
        if (balance < cartTotal) {
          throw new Error('insufficient_balance');
        }

        // 2. Check stock for each item
        const productRefs = items.map(item => doc(db, 'products', item.id));
        const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

        for (let i = 0; i < productDocs.length; i++) {
            const product = productDocs[i].data();
            if (!product) throw new Error(`Product ${items[i].name} not found`);
            if (product.stock < items[i].quantity) {
                throw new Error(`insufficient_stock_${items[i].name}`);
            }
        }

        // 3. Update Balance
        transaction.update(userDocRef, {
            balance: balance - cartTotal,
            updatedAt: serverTimestamp()
        });

        // 4. Update Stock
        productRefs.forEach((ref, i) => {
           transaction.update(ref, {
               stock: productDocs[i].data()!.stock - items[i].quantity
           });
        });

        // 5. Create Order
        transaction.set(doc(db, 'orders', orderId), {
            userId: user?.uid,
            items: items.map(item => ({
              productId: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.imageUrl
            })),
            total: cartTotal,
            status: 'pending',
            paymentMethod: 'wallet',
            createdAt: serverTimestamp(),
            customerEmail: formData.email,
            customerName: formData.name,
        });
      });

      toast.success('تم الدفع بنجاح من المحفظة');
      
      clearCart();
      setSuccess(true);
    } catch (error: any) {
        if (error.message === 'insufficient_balance') {
            toast.error('رصيدك الحالي غير كافٍ، يرجى التواصل مع الإدارة لشحن محفظتك.');
        } else if (error.message.startsWith('insufficient_stock_')) {
            const productName = error.message.replace('insufficient_stock_', '');
            toast.error(`عذراً، الكمية المتوفرة من ${productName} غير كافية.`);
        } else {
            toast.error('حدث خطأ أثناء إتمام الطلب');
        }
        console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/50 border border-slate-800 p-12 rounded-3xl text-center space-y-6 max-w-md"
        >
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">شكراً لطلبك!</h1>
            <p className="text-slate-400">تمت معالجة طلبك بنجاح. يمكنك مراجعة تفاصيل طلبك في لوحة التحكم.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 transition-all"
          >
            انتقل إلى لوحة التحكم
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12" dir="rtl">
      {/* Payment Processing Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              <div className="relative w-24 h-24 mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CreditCard className="w-10 h-10 text-indigo-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">جاري معالجة طلبك</h3>
                <p className="text-slate-400 text-sm">يرجى عدم إغلاق الصفحة أو الضغط على زر الرجوع</p>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/50 py-2 rounded-full">
                <Lock className="w-3 h-3" />
                اتصال آمن ومحمي
              </div>

              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-white">إتمام الطلب</h1>
            <p className="text-slate-400">يرجى إدخال تفاصيل الدفع لإكمال عملية الشراء</p>
          </div>

          <form onSubmit={handleCheckout} className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" /> الدفع عبر المحفظة
              </h2>

              <div className="p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-600/10 text-right relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-200">محفظة المنصة</span>
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-[10px] text-slate-400 leading-tight">سيتم خصم المبلغ من رصيدك الحالي تلقائياً.</p>
                  <div className="text-left">
                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1">الرصيد المتاح</p>
                    <span className={`text-base font-black ${canUseWallet ? 'text-emerald-500' : 'text-red-500'}`}>
                      {formatPrice(profile?.balance || 0)}
                    </span>
                  </div>
                </div>
                {!canUseWallet && (
                  <div className="mt-4 pt-4 border-t border-red-500/20 space-y-4">
                    <p className="text-red-400 text-xs font-bold flex items-center justify-center gap-1 bg-red-500/5 py-2 rounded-lg">
                      رصيدك الحالي غير كافٍ لإتمام هذا الطلب
                    </p>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button 
                          type="button"
                          onClick={() => setSelectedMethod('whatsapp')}
                          className={`p-2.5 rounded-xl border transition-all flex flex-col items-center gap-1 ${selectedMethod === 'whatsapp' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-800/30 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                        >
                          <MessageCircle className="w-3.5 h-3.5 opacity-80" />
                          <span className="text-[9px] font-black leading-none">واتساب مباشر</span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => setSelectedMethod('crypto')}
                          className={`p-2.5 rounded-xl border transition-all flex flex-col items-center gap-1 ${selectedMethod === 'crypto' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-800/30 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                        >
                          <CreditCard className="w-3 h-3 opacity-80" />
                          <span className="text-[9px] font-black leading-none">عملات رقمية</span>
                        </button>
                      </div>

                      <div className="relative">
                        <input 
                          type="number" 
                          min={Math.max(1, cartTotal - (profile?.balance || 0))}
                          step="1"
                          placeholder="مبلغ الشحن المطلوب (USD)"
                          className="w-full bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all pr-12 text-sm"
                          id="checkout-topup-amount"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                      </div>

                      <button 
                        type="button"
                        onClick={async () => {
                          const amountInput = document.getElementById('checkout-topup-amount') as HTMLInputElement;
                          const amount = parseFloat(amountInput.value);
                          
                          if (!amount || amount < 1) {
                            toast.error('يرجى إدخال مبلغ صالح (حد أدنى $1)');
                            return;
                          }

                          if (selectedMethod === 'whatsapp') {
                            const message = `مرحباً، أرغب في شحن رصيد محفظتي بمبلغ $${amount} لإتمام عملية شراء. بريدي الإلكتروني: ${user?.email}`;
                            window.open(`https://wa.me/905360167664?text=${encodeURIComponent(message)}`, '_blank');
                            return;
                          }

                          const loadingToast = toast.loading('جاري إنشاء فاتورة الدفع...');
                          
                          try {
                            const token = await user?.getIdToken();
                            const response = await fetch('/api/wallet/topup', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ amount, method: 'crypto' })
                            });

                            const data = await response.json();
                            
                            if (data.invoice_url) {
                              toast.success('تم إنشاء الفاتورة بنجاح. سيتم توجيهك للدفع.', { id: loadingToast });
                              setTimeout(() => {
                                window.location.href = data.invoice_url;
                              }, 1500);
                            } else {
                              const errorMsg = data.details || data.error || 'فشل إنشاء الفاتورة';
                              throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
                            }
                          } catch (error: any) {
                            toast.error(error.message, { id: loadingToast });
                          }
                        }}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-xl shadow-emerald-600/20 transition-all flex flex-col items-center justify-center gap-0.5 group/btn active:scale-95 text-sm"
                      >
                        <span className="flex items-center gap-2 text-base">
                           {selectedMethod === 'whatsapp' ? 'تواصل للشحن والدفع' : 'شحن رقمي والدفع'}
                          <ArrowRight className="w-4 h-4 rotate-180" />
                        </span>
                        <span className="text-[10px] opacity-80 font-medium tracking-tight">
                           {selectedMethod === 'whatsapp' ? 'تواصل عبر WhatsApp' : 'USDT / Bitcoin / Ethereum'}
                        </span>
                      </button>
                      <p className="text-[9px] text-slate-500 text-center font-bold px-2">
                        {selectedMethod === 'whatsapp' 
                          ? '* سيتم تحويلك للدردشة مع الدعم الفني لإتمام عملية الشحن يدوياً.' 
                          : '* سيتم تحويلك لصفحة الدفع المشفرة المباشرة عبر Plisio.'}
                      </p>
                    </div>
                  </div>
                )}
                <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-600 flex items-center justify-center rounded-bl-xl">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-slate-300">معلومات التواصل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-400">الاسم الكامل</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="checkout-input"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-400">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="checkout-input"
                      required
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 p-4 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl w-full">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  يتم الدفع بشكل آمن وسريع عبر محفظتك الإلكترونية الخاصة بالمنصة.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>إتمام الدفع {formatPrice(cartTotal)} <ArrowRight className="w-5 h-5 rotate-180" /></>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[400px] space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 sticky top-24">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" /> ملخص الطلب
            </h2>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img src={item.imageUrl} className="w-16 h-16 rounded-xl object-cover" alt="" />
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-bold text-slate-200 line-clamp-1">{item.name}</h4>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">الكمية: {item.quantity}</span>
                      <span className="text-indigo-400 font-bold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">المجموع الفرعي</span>
                <span className="text-slate-200 font-bold">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">ضريبة القيمة المضافة (15%)</span>
                <span className="text-slate-200 font-bold">مشمولة</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <span className="text-lg font-bold text-white">شامل الضريبة:</span>
                <span className="text-2xl font-black text-indigo-400">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-500 justify-center">
              <Truck className="w-3.5 h-3.5" /> تسليم رقمي فوري لجميع المنتجات
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .checkout-input {
          width: 100%;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 1rem;
          padding: 1rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .checkout-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </div>
  );
};
