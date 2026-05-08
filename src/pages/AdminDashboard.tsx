import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { Package, Trash2, LayoutDashboard, ShoppingBag, Users, Loader2, RotateCcw, Plus, Wallet, Search, CheckCircle, Truck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { refundOrder } from '../lib/orders';

// --- الأنواع ---
interface Order {
  id: string;
  userId: string;
  totalPrice: number;
  status: 'pending' | 'delivered' | 'cancelled';
  productId: string;
  createdAt: any;
  deliveryInfo?: string;
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

  // حالات
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 0, category: '', imageUrl: '', description: '', discount: 0 });
  const [searchUser, setSearchUser] = useState('');
  
  // حالة Delivery Modal
  const [deliveryModal, setDeliveryModal] = useState<{ order: Order, info: string } | null>(null);

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
      console.error(error);
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'products'), { ...newProduct, createdAt: serverTimestamp() });
      toast.success('تم إضافة المنتج بنجاح');
      setShowAddProduct(false);
      setNewProduct({ name: '', price: 0, stock: 0, category: '', imageUrl: '', description: '', discount: 0 });
      fetchData();
    } catch (error) { toast.error('فشل إضافة المنتج'); }
  };

  const handleAddBalance = async (userId: string, currentBalance: number) => {
    const amount = prompt('أدخل المبلغ المراد إضافته:');
    if (!amount || isNaN(Number(amount))) return;
    try {
      await updateDoc(doc(db, 'users', userId), { balance: currentBalance + Number(amount) });
      toast.success('تم تحديث الرصيد');
      fetchData();
    } catch (error) { toast.error('فشل التحديث'); }
  };

  const handleDeliverOrder = async () => {
    if (!deliveryModal) return;
    try {
      await updateDoc(doc(db, 'orders', deliveryModal.order.id), {
        status: 'delivered',
        deliveryInfo: deliveryModal.info,
        updatedAt: serverTimestamp()
      });
      toast.success('تم تسليم الطلب وإرسال المعلومات للعميل');
      setDeliveryModal(null);
      fetchData();
    } catch (error) { toast.error('فشل عملية التسليم'); }
  };

  const filteredUsers = usersList.filter(u => 
    u.displayName?.toLowerCase().includes(searchUser.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  if (authLoading || loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans text-right text-slate-100" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
          <h1 className="text-2xl font-black text-white flex items-center gap-3"><LayoutDashboard className="text-indigo-500" /> لوحة الإدارة</h1>
        </header>

        {/* التابات */}
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 w-fit">
          {(['products', 'orders', 'users'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {tab === 'products' ? 'المنتجات' : tab === 'orders' ? 'الطلبات' : 'العملاء'}
            </button>
          ))}
        </div>

        {/* 1. المنتجات */}
        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">إدارة المنتجات</h2>
              <button onClick={() => setShowAddProduct(!showAddProduct)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-indigo-500/20">
                <Plus size={18} /> إضافة منتج جديد
              </button>
            </div>

            {showAddProduct && (
              <form onSubmit={handleAddProduct} className="bg-slate-900 p-6 rounded-2xl border border-indigo-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input placeholder="اسم المنتج" className="bg-slate-950 p-3 rounded-lg border border-slate-800" onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                <input type="number" placeholder="السعر" className="bg-slate-950 p-3 rounded-lg border border-slate-800" onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} required />
                <input type="number" placeholder="الكمية" className="bg-slate-950 p-3 rounded-lg border border-slate-800" onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} required />
                <input placeholder="رابط الصورة" className="bg-slate-950 p-3 rounded-lg border border-slate-800 col-span-full" onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                <textarea placeholder="الوصف" className="bg-slate-950 p-3 rounded-lg border border-slate-800 col-span-full" onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                <input type="number" placeholder="الخصم" className="bg-slate-950 p-3 rounded-lg border border-slate-800" onChange={e => setNewProduct({...newProduct, discount: Number(e.target.value)})} />
                <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold col-span-full">حفظ المنتج</button>
              </form>
            )}

            <div className="space-y-3">
              {products.map(product => (
                <div key={product.id} className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{product.name}</h3>
                    <p className="text-xs text-slate-400">الكمية: {product.stock} | السعر: {product.price}$</p>
                  </div>
                  <button className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 2. الطلبات */}
        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-lg font-bold mb-6">سجل الطلبات</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-mono text-xs text-slate-400">ID: {order.id.slice(0, 8)}...</div>
                  <div className="font-bold">{order.totalPrice}$</div>
                  <div>
                    {order.status === 'delivered' ? <span className="text-emerald-500 text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> تم التسليم</span> 
                    : <button onClick={() => setDeliveryModal({ order, info: '' })} className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><Truck size={14} /> تسليم الطلب</button>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 3. العملاء */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="relative">
              <Search className="absolute right-3 top-3 text-slate-500" size={18} />
              <input placeholder="بحث عن عميل..." className="w-full bg-slate-900 p-3 pr-10 rounded-xl border border-slate-800 text-white" onChange={e => setSearchUser(e.target.value)} />
            </div>
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <div key={user.uid} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800 text-sm">
                  <div>
                    <p className="font-bold">{user.displayName}</p>
                    <p className="text-[10px] text-emerald-400">الرصيد: {user.balance}$</p>
                  </div>
                  <button onClick={() => handleAddBalance(user.uid, user.balance)} className="text-emerald-400 border border-emerald-900 px-3 py-1 rounded-md text-[10px] font-bold hover:bg-emerald-900 hover:text-white">إضافة رصيد</button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* مودال التسليم */}
      <AnimatePresence>
        {deliveryModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0 }} className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-sm border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">تفاصيل الحساب</h3>
                <button onClick={() => setDeliveryModal(null)}><X size={20}/></button>
              </div>
              <textarea placeholder="أدخل معلومات الحساب هنا..." className="w-full bg-slate-950 p-3 rounded-lg border border-slate-800 h-32 mb-4" onChange={e => setDeliveryModal({...deliveryModal, info: e.target.value})} />
              <button onClick={handleDeliverOrder} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold">تسليم الطلب للعميل</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
