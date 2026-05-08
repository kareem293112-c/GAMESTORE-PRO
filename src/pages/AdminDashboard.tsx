import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { Package, Trash2, Edit2, LayoutDashboard, ShoppingBag, Users, Loader2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { refundOrder } from '../orders';

interface Order {
  id: string;
  userId: string;
  totalPrice: number;
  status: string;
  productId: string;
  createdAt: any;
}

interface User {
  uid: string;
  email: string;
  displayName: string;
  balance: number;
  role: string;
}

const StatCard: React.FC<{ 
  icon: React.ElementType; 
  label: string; 
  value: number | string; 
  color: 'indigo' | 'cyan' | 'emerald'; 
  }> = ({ icon: Icon, label, value, color }) => {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  };

  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} backdrop-blur-sm`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-slate-900 ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-400 font-medium">{label}</p>
          <p className="text-2xl font-black text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users'>('products');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsSnap, ordersSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'users'))
      ]);
      setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setUsersList(usersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as User)));
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCancelAndRefund = async (order: Order) => {
    if (!window.confirm('Are you sure you want to refund this order?')) return;
    try {
      await refundOrder(order.id, order.userId, order.totalPrice, order.productId);
      toast.success('Refund successful');
      fetchData();
    } catch (error) {
      toast.error('Refund failed');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 sm:p-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8 text-right">
        <header>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-indigo-500" /> لوحة الإدارة
          </h1>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={ShoppingBag} label="المنتجات" value={products.length} color="indigo" />
          <StatCard icon={Package} label="الطلبات" value={orders.length} color="cyan" />
          <StatCard icon={Users} label="العملاء" value={usersList.length} color="emerald" />
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 w-fit">
          {(['products', 'orders', 'users'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'products' ? 'المنتجات' : tab === 'orders' ? 'الطلبات' : 'العملاء'}
            </button>
          ))}
        </div>

        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-xl font-bold text-white mb-6">إدارة المنتجات</h2>
            <div className="grid grid-cols-1 gap-4">
              {products.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 text-white">
                  <span>{product.name}</span>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-400"><Edit2 size={18}/></button>
                    <button className="p-2 text-slate-400 hover:text-red-400"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-xl font-bold text-white mb-6">سجل الطلبات</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-white">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="pb-4 px-4 font-medium">الطلب</th>
                    <th className="pb-4 px-4 font-medium">المبلع</th>
                    <th className="pb-4 px-4 font-medium">الحالة</th>
                    <th className="pb-4 px-4 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-slate-800/50">
                      <td className="py-4 px-4 text-xs font-mono">{order.id}</td>
                      <td className="py-4 px-4">{order.totalPrice}$</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {order.status === 'cancelled' ? 'ملغي' : 'مكتمل'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {order.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleCancelAndRefund(order)}
                            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-xs font-bold"
                          >
                            <RotateCcw size={14} /> إلغاء واسترداد
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-white">
            <h2 className="text-xl font-bold mb-6">قائمة العملاء</h2>
            <div className="grid grid-cols-1 gap-4">
              {usersList.map(user => (
                <div key={user.uid} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  <div>
                    <p className="font-bold text-sm">{user.displayName}</p>
                    <p className="text-slate-400 text-xs">{user.email}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-emerald-400 font-black text-sm">{user.balance}$</p>
                    <span className="text-[10px] text-slate-500">{user.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
