import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { Package, Clock, CreditCard, Loader2, Search, ArrowRight, Calendar } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { useNavigate } from 'react-router-dom';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      setOrders(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (date: any) => {
    if (!date) return '...';
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleString('ar-SA');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-indigo-500" /> طلباتي
            </h1>
            <p className="text-slate-400 mt-1">تتبع حالة منتجاتك وطلباتك الرقمية السابقة</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="بحث في الطلبات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pr-10 pl-4 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </div>

        <div className="grid gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-slate-500 font-medium">جاري تحميل قائمة الطلبات...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 p-16 rounded-3xl text-center space-y-6">
              <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-600">
                <Package className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">لا توجد طلبات مطابقة</h3>
                <p className="text-slate-500">ابدأ بشراء منتجاتك المفضلة لتظهر هنا.</p>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={order.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all group"
              >
                <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-800/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">رقم الطلب</p>
                      <h4 className="text-sm font-black text-white">#{order.id.toUpperCase()}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left">الحالة</p>
                      <div className={`flex items-center gap-2 mt-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        order.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                      }`}>
                        {order.status === 'completed' ? 'تم التنفيذ' : order.status === 'cancelled' ? 'ملغي' : 'قيد المعالجة'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 group/item">
                        <img 
                          src={item.imageUrl} 
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-800 group-hover/item:border-indigo-500/30 transition-all" 
                          alt="" 
                        />
                        <div className="flex-1 space-y-1">
                          <h5 className="text-sm font-bold text-slate-200">{item.name}</h5>
                          <p className="text-xs text-slate-500">الكمية: {item.quantity} × {formatPrice(item.price)}</p>
                        </div>
                        <div className="text-indigo-400 font-black text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.status === 'completed' && order.deliveryInfo && (
                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-tighter">
                        <CreditCard className="w-4 h-4" /> معطيات المنتج / كود التفعيل
                      </div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <pre className="text-emerald-400 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                          {typeof order.deliveryInfo === 'string' ? order.deliveryInfo : JSON.stringify(order.deliveryInfo, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-800/30 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-slate-500 text-[10px] font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> 
                    {formatDate(order.createdAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">إجمالي الطلب:</span>
                    <span className="text-xl font-black text-white">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
