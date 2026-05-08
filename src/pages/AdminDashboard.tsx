import React, { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import {
  LayoutDashboard,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  Truck,
  Wallet,
  X,
  XCircle,
  Users,
  ImageOff,
  ChevronLeft
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { refundOrder } from '../lib/orders';

// --- Types ---
type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  userId?: string;
  totalPrice?: number;
  total?: number;
  amount?: number;
  status?: OrderStatus;
  productName?: string;
  items?: any[];
  createdAt?: any;
  deliveryInfo?: string;
}

interface User {
  uid: string;
  email?: string;
  displayName?: string;
  balance?: number;
}

type Tab = 'products' | 'orders' | 'users';

type ProductForm = {
  name: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
  description: string;
  discount: string;
};

const emptyProductForm: ProductForm = {
  name: '', price: '', stock: '', category: '', imageUrl: '', description: '', discount: '0',
};

const parseMoney = (v: any) => Number.isFinite(Number(v)) ? Number(v) : 0;

export const AdminDashboard: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('products');
  
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<ProductForm>(emptyProductForm);
  const [searchUser, setSearchUser] = useState('');
  const [searchOrder, setSearchOrder] = useState('');

  const [deliveryModal, setDeliveryModal] = useState<{ order: Order; info: string } | null>(null);
  const [balanceModal, setBalanceModal] = useState<{ user: User; amount: string } | null>(null);

  const usersById = useMemo(() => new Map(usersList.map((u) => [u.uid, u])), [usersList]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pSnap, oSnap, uSnap] = await Promise.all([
        getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'users')),
      ]);
      setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      setOrders(oSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setUsersList(uSnap.docs.map(d => ({ uid: d.id, ...d.data() } as User)));
    } catch { toast.error('خطأ في التحميل'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Logic Functions ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        discount: Number(newProduct.discount),
        isActive: true,
        createdAt: serverTimestamp(),
      });
      toast.success('تمت إضافة المنتج بنجاح');
      setShowAddProduct(false);
      setNewProduct(emptyProductForm);
      fetchData();
    } catch { toast.error('خطأ في الإضافة'); } finally { setSaving(false); }
  };

  const handleUpdateBalance = async (type: 'add' | 'subtract') => {
    if (!balanceModal || !balanceModal.amount) return;
    const amount = Number(balanceModal.amount);
    const finalAmount = type === 'subtract' ? -amount : amount;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', balanceModal.user.uid), {
        balance: increment(finalAmount),
        updatedAt: serverTimestamp(),
      });
      toast.success(type === 'add' ? 'تمت إضافة الرصيد' : 'تم سحب الرصيد');
      setBalanceModal(null);
      fetchData();
    } catch { toast.error('فشل تعديل الرصيد'); } finally { setSaving(false); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف المنتج؟')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('تم الحذف');
    } catch { toast.error('فشل الحذف'); }
  };

  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(searchUser.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchUser.toLowerCase())
  );

  if (authLoading || loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-right text-slate-100" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <LayoutDashboard className="text-indigo-500" /> لوحة الإدارة
          </h1>
          <div className="flex gap-3">
            <button onClick={fetchData} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors">تحديث</button>
            <button onClick={() => setShowAddProduct(true)} className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20">
              <Plus size={18} /> منتج جديد
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-fit">
          {(['products', 'orders', 'users'] as Tab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
              {tab === 'products' ? 'المنتجات' : tab === 'orders' ? 'الطلبات' : 'المستخدمين'}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="bg-slate-900/20 rounded-[2rem] border border-slate-800/50 min-h-[500px] backdrop-blur-sm">
          
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map(product => (
                <motion.div layout key={product.id} className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all group relative overflow-hidden">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-800 overflow-hidden border border-slate-700">
                      {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" alt="" /> : <ImageOff className="w-full h-full p-5 text-slate-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{product.name}</h3>
                      <p className="text-indigo-400 font-black text-lg">${product.price}</p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">المخزون: {product.stock}</p>
                    </div>
                    <button onClick={() => handleDeleteProduct(product.id)} className="bg-red-500/10 text-red-500 p-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="p-6 space-y-6">
              <div className="relative max-w-md">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input type="text" placeholder="بحث عن مستخدم..." className="w-full bg-slate-800/40 border border-slate-700 rounded-2xl py-3 pr-12 pl-4 outline-none focus:border-indigo-500" value={searchUser} onChange={e => setSearchUser(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map(user => (
                  <div key={user.uid} className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800 flex justify-between items-center group">
                    <div>
                      <p className="font-bold text-white">{user.displayName || 'بدون اسم'}</p>
                      <p className="text-xs text-slate-500 mb-3">{user.email}</p>
                      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded-lg w-fit">
                        <Wallet size={14} /> <span className="font-black">${user.balance || 0}</span>
                      </div>
                    </div>
                    <button onClick={() => setBalanceModal({ user, amount: '' })} className="bg-indigo-600/10 text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all">تعديل الرصيد</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="p-10 text-center text-slate-500 font-medium">
              <div className="bg-slate-800/20 rounded-3xl p-10 border border-dashed border-slate-700">
                 إجمالي الطلبات المسجلة: {orders.length} طلب
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: Add Product */}
      <AnimatePresence>
        {showAddProduct && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.form onSubmit={handleAddProduct} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-2xl w-full shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white flex items-center gap-3"><Package className="text-indigo-500" /> إضافة منتج جديد</h2>
                <button type="button" onClick={() => setShowAddProduct(false)} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700"><X /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 mr-2 uppercase">اسم المنتج</label>
                  <input required type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 mr-2 uppercase">رابط الصورة</label>
                  <input required type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 mr-2 uppercase">السعر ($)</label>
                  <input required type="number" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 mr-2 uppercase">الكمية</label>
                  <input required type="number" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-600/20">
                {saving ? <Loader2 className="animate-spin mx-auto" /> : 'نشر المنتج الآن'}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Update Balance (إضافة وسحب) */}
      <AnimatePresence>
        {balanceModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl">
              <h2 className="text-xl font-black text-white mb-2 text-center">تعديل الرصيد</h2>
              <p className="text-slate-500 text-sm text-center mb-6">{balanceModal.user.displayName || balanceModal.user.email}</p>
              
              <div className="bg-slate-800/50 p-4 rounded-2xl mb-6 text-center border border-slate-700">
                <span className="text-slate-400 text-xs block mb-1">الرصيد الحالي</span>
                <span className="text-2xl font-black text-emerald-400">${balanceModal.user.balance || 0}</span>
              </div>

              <input type="number" placeholder="المبلغ..." className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 mb-6 text-center text-3xl font-black outline-none focus:border-indigo-500 transition-all" value={balanceModal.amount} onChange={e => setBalanceModal({...balanceModal, amount: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleUpdateBalance('add')} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-black transition-all shadow-lg shadow-emerald-600/10 flex flex-col items-center gap-1 uppercase text-xs">
                   <Plus size={20} /> إضافة
                </button>
                <button onClick={() => handleUpdateBalance('subtract')} disabled={saving} className="bg-red-600 hover:bg-red-500 py-4 rounded-2xl font-black transition-all shadow-lg shadow-red-600/10 flex flex-col items-center gap-1 uppercase text-xs">
                   <X size={20} /> سحب
                </button>
              </div>
              <button onClick={() => setBalanceModal(null)} className="w-full mt-4 text-slate-500 text-sm font-bold">إلغاء</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
