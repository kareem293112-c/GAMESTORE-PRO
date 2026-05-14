import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { User, Package, Calendar, Clock, CreditCard, Loader2 } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { callApi } from '../lib/api';

export const DashboardPage: React.FC = () => {
  const { profile, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const data = await callApi('/api/me/orders');
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 sm:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* User Profile and Wallet Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-8 rounded-3xl relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-black border-4 border-slate-800 shadow-2xl shrink-0">
                {profile?.displayName?.[0] || user?.email?.[0].toUpperCase()}
              </div>
              <div className="text-center md:text-right space-y-2">
                <h1 className="text-3xl font-black text-white">{profile?.displayName || 'لاعب مجهول'}</h1>
                <p className="text-slate-400 font-medium">{user?.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full">
                    <User className="w-3.5 h-3.5" /> {
                      profile?.role === 'admin' ? 'مدير النظام' :
                      profile?.role === 'productManager' ? 'مدير المنتجات' :
                      profile?.role === 'orderManager' ? 'مدير الطلبات' :
                      'عميل متميز'
                    }
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-500/10 px-3 py-1 rounded-full">
                    <Calendar className="w-3.5 h-3.5" /> انضم في {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ar-SA') : 'قريباً'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-full flex flex-col justify-between gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-100 font-black text-lg">محفظتي</h3>
                <CreditCard className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-bold">الرصيد المتاح:</p>
                <p className="text-4xl font-black text-emerald-400">{formatPrice(profile?.balance || 0)}</p>
              </div>
              <button 
                onClick={() => {
                  const message = encodeURIComponent(`مرحباً، أريد شحن محفظتي في المنصة.\nالإيميل: ${user?.email}\nالمبلغ المطلوب: `);
                  window.open(`https://wa.me/905360167664?text=${message}`, '_blank');
                }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group/btn active:scale-95"
              >
                شحن الرصيد
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  ←
                </motion.span>
              </button>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-500" /> طلباتي السابقة
            </h2>
            <p className="text-slate-500 text-sm">{orders.length} طلبات</p>
          </div>

          <div className="grid gap-4">
            {loading ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-slate-800/20 rounded-2xl animate-pulse" />
              ))
            ) : orders.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 p-12 rounded-3xl text-center space-y-4">
                <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-600">
                  <Package className="w-8 h-8" />
                </div>
                <p className="text-slate-500 font-bold">لا توجد طلبات حتى الآن</p>
                <button className="text-indigo-400 hover:text-indigo-300 font-bold border border-indigo-400/30 px-6 py-2 rounded-xl transition-all">ابدأ التسوق</button>
              </div>
            ) : (
              orders.map((order) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  key={order.id}
                  className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/30 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        <img src={order.items[0]?.imageUrl} className="w-full h-full object-cover" alt="" />
                        {order.items.length > 1 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs">
                            +{order.items.length - 1}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-indigo-400 text-xs font-bold">رقم الطلب: #{order.id.slice(-6).toUpperCase()}</p>
                        <h3 className="text-slate-100 font-bold">{order.items[0]?.name}</h3>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(order.createdAt?.seconds * 1000).toLocaleDateString('ar-SA')}</span>
                          <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> دفع إلكتروني</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4">
                      <p className="text-lg font-black text-white">{formatPrice(order.total)}</p>
                      
                      <div className="flex flex-col items-end gap-1">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={order.status}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase ${
                              order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                              order.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            }`}
                          >
                            {order.status === 'pending' && <Loader2 className="w-3 h-3 animate-spin" />}
                            {order.status === 'completed' ? 'تم التسليم' : order.status === 'cancelled' ? 'ملغي' : 'قيد المعالجة'}
                          </motion.div>
                        </AnimatePresence>
                        
                        {order.status === 'pending' && (
                          <span className="text-[9px] text-slate-500 animate-pulse font-bold">بانتظار تأكيد الدفع...</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info Section */}
                  {order.status === 'completed' && order.deliveryInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 pt-6 border-t border-slate-800"
                    >
                      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                          <CreditCard className="w-4 h-4" />
                          معلومات الاستلام والمنتج:
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                          <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed font-mono">
                            {typeof order.deliveryInfo === 'string' 
                              ? order.deliveryInfo 
                              : order.deliveryInfo && typeof order.deliveryInfo === 'object'
                                ? Object.entries(order.deliveryInfo)
                                    .map(([key, val]) => `${key}: ${val}`)
                                    .join('\n')
                                : ''}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-500 italic">
                          * يرجى الحفاظ على سرية هذه المعلومات وعدم مشاركتها مع أي شخص.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
