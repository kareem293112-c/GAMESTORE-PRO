import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { Package, Trash2, Edit2, LayoutDashboard, ShoppingBag, Users, Loader2, RotateCcw, Plus, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { refundOrder } from '../lib/orders';

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

export const AdminDashboard: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users'>('products');

  // حالات إضافة منتج جديد
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 0, category: '', image: '', description: '' });

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
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // دالة إضافة منتج
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'products'), { ...newProduct, createdAt: serverTimestamp() });
      toast.success('تم إضافة المنتج بنجاح');
      setShowAddProduct(false);
      fetchData();
    } catch (error) {
      toast.error('فشل إضافة المنتج');
    }
  };

  // دالة شحن رصيد مستخدم
  const handleAddBalance = async (userId: string, currentBalance: number) => {
    const amount = prompt('أدخل المبلغ المراد إضافته:');
    if (!amount || isNaN(Number(amount))) return;

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { balance: currentBalance + Number(amount) });
      toast.success('تم تحديث الرصيد بنجاح');
      fetchData();
    } catch (error) {
      toast.error('فشل تحديث الرصيد');
    }
  };

  const handleCancelAndRefund = async (order: Order) => {
    if (!window.confirm('هل أنت متأكد من إلغاء الطلب وإرجاع المبلغ؟')) return;
    try {
      await refundOrder(order.id, order.userId, order.totalPrice, order.productId);
      toast.success('تم الاسترداد بنجاح');
      fetchData();
    } catch (error) {
      toast.error('فشلت العملية');
    }
  };

  if (authLoading || loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><Loader2 className="w-12 h-12 text-indigo-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 sm:p-8 font-sans text-right" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-white flex items-center gap-3"><LayoutDashboard className="w-8 h-8 text-indigo-500" /> لوحة الإدارة</h1>
        </header>

        {/* التابات */}
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 w-fit">
          {(['products', 'orders', 'users'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {tab === 'products' ? 'المنتجات' : tab === 'orders' ? 'الطلبات' : 'العملاء'}
            </button>
          ))}
        </div>

        {/* قسم المنتجات مع ميزة الإضافة */}
        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">إدارة المنتجات</h2>
              <button onClick={() => setShowAddProduct(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg">
                <Plus size={18} /> إضافة منتج جديد
              </button>
            </div>

            {showAddProduct && (
              <form onSubmit={handleAddProduct} className="bg-slate-800/50 p-6 rounded-2xl border border-indigo-500/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="اسم المنتج" className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500" onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                <input type="number" placeholder="السعر" className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500" onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} required />
                <input type="number" placeholder="المخزون (الكمية)" className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500" onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} required />
                <div className="flex gap-2 sm:col-span-2">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold">حفظ المنتج</button>
                  <button type="button" onClick={() => setShowAddProduct(false)} className="bg-slate-700 text-white px-6 py-2 rounded-xl font-bold">إلغاء</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 gap-4">
              {products.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  <span className="text-white font-medium">{product.name} (السعر: {product.price}$ | المخزن: {product.stock})</span>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-red-400"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* قسم الطلبات مع ميزة الإلغاء */}
        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-xl font-bold text-white mb-6">سجل الطلبات</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-white">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="pb-4 px-4">رقم الطلب</th>
                    <th className="pb-4 px-4">المبلغ</th>
                    <th className="pb-4 px-4">الحالة</th>
                    <th className="pb-4 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-slate-800/50">
                      <td className="py-4 px-4 text-xs font-mono">{order.id}</td>
                      <td className="py-4 px-4">{order.totalPrice}$</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>{order.status === 'cancelled' ? 'ملغي' : 'مكتمل'}</span>
                      </td>
                      <td className="py-4 px-4">{order.status !== 'cancelled' && <button onClick={() => handleCancelAndRefund(order)} className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1"><RotateCcw size={14} /> إلغاء واسترداد</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* قسم العملاء مع ميزة إضافة الرصيد */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-xl font-bold text-white mb-6">إدارة العملاء والارصدة</h2>
            <div className="grid grid-cols-1 gap-4">
              {usersList.map(user => (
                <div key={user.uid} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  <div>
                    <p className="text-white font-bold text-sm">{user.displayName}</p>
                    <p className="text-emerald-400 text-xs font-black">الرصيد الحالي: {user.balance}$</p>
                  </div>
                  <button onClick={() => handleAddBalance(user.uid, user.balance)} className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                    <Wallet size={14} /> إضافة رصيد
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
