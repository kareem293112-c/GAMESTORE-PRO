import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { 
  Package, Trash2, Edit2, LayoutDashboard, ShoppingBag, Users, 
  Loader2, RotateCcw, Plus, Wallet, Search, TrendingUp, DollarSign, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  
  // Search state
  const [userSearch, setUserSearch] = useState('');

  // UI States
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 0, category: '', imageUrl: '', description: '' });
  const [addingBalance, setAddingBalance] = useState<{ userId: string, amount: string } | null>(null);

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

  // Filter users based on search
  const filteredUsers = useMemo(() => 
    usersList.filter(u => 
      u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
    ), [usersList, userSearch]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'products'), { ...newProduct, createdAt: serverTimestamp() });
      toast.success('تم إضافة المنتج بنجاح');
      setShowAddProduct(false);
      setNewProduct({ name: '', price: 0, stock: 0, category: '', imageUrl: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error('فشل إضافة المنتج');
    }
  };

  const handleUpdateBalance = async (userId: string, currentBalance: number) => {
    if (!addingBalance || !addingBalance.amount) return;
    const amount = Number(addingBalance.amount);
    if (isNaN(amount)) return toast.error('مبلغ غير صالح');

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { balance: currentBalance + amount });
      toast.success('تم تحديث الرصيد بنجاح');
      setAddingBalance(null);
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
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <LayoutDashboard className="w-9 h-9 text-indigo-500" /> لوحة التحكم
          </h1>
          <div className="flex gap-2">
            <div className="bg-slate-900/80 px-4 py-2 rounded-xl text-indigo-400 font-bold border border-slate-700">
              {products.length} منتج
            </div>
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-fit gap-1">
          {(['products', 'orders', 'users'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              {tab === 'products' ? <ShoppingBag size={18}/> : tab === 'orders' ? <Package size={18}/> : <Users size={18}/>}
              {tab === 'products' ? 'المنتجات' : tab === 'orders' ? 'الطلبات' : 'العملاء'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* Products Tab */}
            {activeTab === 'products' && (
              <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <h2 className="text-xl font-bold text-white">إدارة المنتجات</h2>
                  <button onClick={() => setShowAddProduct(!showAddProduct)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg transition-all">
                    {showAddProduct ? <X size={18}/> : <Plus size={18}/>} {showAddProduct ? 'إغلاق' : 'إضافة منتج جديد'}
                  </button>
                </div>

                {showAddProduct && (
                  <form onSubmit={handleAddProduct} className="bg-slate-800/50 p-6 rounded-2xl border border-indigo-500/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="اسم المنتج" className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500" onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                    <input type="number" placeholder="السعر" className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500" onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} required />
                    <input type="number" placeholder="الكمية" className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500" onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} required />
                    <input type="text" placeholder="الرابط الصورة" className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500 sm:col-span-2" onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold sm:col-span-2">حفظ المنتج</button>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map(product => (
                    <div key={product.id} className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-600 transition-all">
                      <h3 className="text-white font-bold mb-2">{product.name}</h3>
                      <div className="flex justify-between items-center text-sm text-slate-400 mb-4">
                        <span>السعر: {product.price}$</span>
                        <span>الكمية: {product.stock}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-white"><Edit2 size={16}/></button>
                        <button className="flex-1 bg-red-900/20 hover:bg-red-900/40 p-2 rounded-lg text-red-400"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-right text-white">
                  <thead className="bg-slate-800/50 text-slate-400 text-sm">
                    <tr>
                      <th className="p-4">المنتج</th>
                      <th className="p-4">المبلغ</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-800/20">
                        <td className="p-4 font-mono text-xs text-slate-300">{order.productId.slice(0, 10)}...</td>
                        <td className="p-4 font-bold text-emerald-400">{order.totalPrice}$</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {order.status === 'cancelled' ? 'ملغي' : 'مكتمل'}
                          </span>
                        </td>
                        <td className="p-4">
                          {order.status !== 'cancelled' && <button onClick={() => handleCancelAndRefund(order)} className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1"><RotateCcw size={14} /> إلغاء</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="relative">
                  <Search className="absolute right-3 top-3 text-slate-500" size={20} />
                  <input type="text" placeholder="بحث عن عميل..." onChange={(e) => setUserSearch(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 p-3 pr-10 rounded-2xl text-white outline-none focus:border-indigo-500" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.map(user => (
                    <div key={user.uid} className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold">{user.displayName}</p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                        <p className="text-emerald-500 font-black mt-2 text-sm">{user.balance}$</p>
                      </div>
                      
                      {addingBalance?.userId === user.uid ? (
                        <div className="flex gap-2">
                           <input type="number" className="w-20 bg-slate-800 p-2 rounded-lg text-white text-sm" placeholder="المبلغ" onChange={(e) => setAddingBalance({...addingBalance, amount: e.target.value})}/>
                           <button onClick={() => handleUpdateBalance(user.uid, user.balance)} className="bg-emerald-600 px-3 rounded-lg text-white font-bold">تأكيد</button>
                        </div>
                      ) : (
                        <button onClick={() => setAddingBalance({userId: user.uid, amount: ''})} className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 p-2 rounded-xl transition-all">
                          <Wallet size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
