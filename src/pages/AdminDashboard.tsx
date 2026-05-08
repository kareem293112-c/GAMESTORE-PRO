import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  addDoc
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
  Wallet,
  X,
  Users,
  Truck,
  XCircle,
  CheckCircle,
  Clock,
  Send,
  Gamepad2,
  Gift,
  AlertTriangle,
  ImageOff
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// --- الثوابت ---
const CATEGORIES = [
  { id: 'all', name: 'الكل', icon: <Package size={16} /> },
  { id: 'gifts', name: 'قسم الهدايا', icon: <Gift size={16} /> },
  { id: 'steam-accounts', name: 'حسابات ستيم', icon: <Users size={16} /> },
  { id: 'steam-codes', name: 'أكواد ستيم', icon: <Gamepad2 size={16} /> },
  { id: 'problem-accounts', name: 'حسابات مشكلة', icon: <AlertTriangle size={16} /> },
];

type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled';
type Tab = 'products' | 'orders' | 'users';

export const AdminDashboard: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('products');
  
  const [searchOrder, setSearchOrder] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [deliveryModal, setDeliveryModal] = useState<{order: any, info: string} | null>(null);
  const [balanceModal, setBalanceModal] = useState<any>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', stock: '', category: 'steam-accounts', imageUrl: '', description: '', discount: '0'
  });

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
      setOrders(oSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setUsersList(uSnap.docs.map(d => ({ uid: d.id, ...d.data() })));
    } catch { toast.error('خطأ في تحميل البيانات'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- منطق إلغاء الطلب وإرجاع المال ---
  const handleCancelOrder = async (order: any) => {
    if (!window.confirm('هل أنت متأكد من إلغاء الطلب؟ سيتم إرجاع المبلغ فوراً لرصيد العميل.')) return;
    
    setSaving(true);
    try {
      const amountToRefund = Number(order.totalPrice || order.amount || 0);
      
      // 1. تحديث رصيد العميل
      await updateDoc(doc(db, 'users', order.userId), {
        balance: increment(amountToRefund)
      });

      // 2. تحديث حالة الطلب
      await updateDoc(doc(db, 'orders', order.id), {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });

      toast.success(`تم إلغاء الطلب وإرجاع $${amountToRefund} للعميل`);
      fetchData();
    } catch { toast.error('فشل في عملية الإلغاء'); } finally { setSaving(false); }
  };

  // --- منطق تسليم الطلب ---
  const handleDeliverOrder = async () => {
    if (!deliveryModal?.info.trim()) return toast.error('يرجى إدخال تفاصيل الحساب');
    setSaving(true);
    try {
      await updateDoc(doc(db, 'orders', deliveryModal.order.id), {
        status: 'delivered',
        deliveryInfo: deliveryModal.info,
        deliveredAt: serverTimestamp()
      });
      toast.success('تم التسليم وإرسال البيانات للعميل');
      setDeliveryModal(null);
      fetchData();
    } catch { toast.error('فشل في عملية التسليم'); } finally { setSaving(false); }
  };

  // --- الفلاتر ---
  const filteredOrders = orders.filter(o => (orderStatusFilter === 'all' ? true : o.status === orderStatusFilter) && o.id.includes(searchOrder));
  const filteredProducts = products.filter(p => selectedCategory === 'all' ? true : p.category === selectedCategory);
  const filteredUsers = usersList.filter(u => u.email?.toLowerCase().includes(searchUser.toLowerCase()) || u.displayName?.toLowerCase().includes(searchUser.toLowerCase()));

  if (authLoading || loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-right text-slate-100 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800">
          <h1 className="text-xl font-black flex items-center gap-3"><LayoutDashboard className="text-indigo-500" /> لوحة الإدارة</h1>
          <div className="flex gap-2">
            <button onClick={fetchData} className="bg-slate-800 p-2.5 rounded-xl hover:bg-slate-700 transition-all text-xs font-bold">تحديث</button>
            <button onClick={() => setShowAddProduct(true)} className="bg-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-500">
              <Plus size={18} /> منتج جديد
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-fit">
          {([{id:'products', n:'المنتجات'}, {id:'orders', n:'الطلبات'}, {id:'users', n:'المستخدمين'}]).map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id as Tab)} className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
              {t.n}
            </button>
          ))}
        </div>

        <main className="bg-slate-900/20 rounded-[2.5rem] border border-slate-800/50 min-h-[500px] backdrop-blur-sm">
          
          {/* 1. التبويب: المنتجات */}
          {activeTab === 'products' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold transition-all ${selectedCategory === cat.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map(p => (
                  <div key={p.id} className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 flex items-center gap-4 group">
                    <img src={p.imageUrl} className="w-16 h-16 rounded-2xl object-cover border border-slate-700" alt="" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate text-sm">{p.name}</h3>
                      <p className="text-indigo-400 font-black text-sm">${p.price}</p>
                    </div>
                    <button onClick={() => {if(window.confirm('حذف المنتج؟')) deleteDoc(doc(db, 'products', p.id)).then(fetchData)}} className="text-red-500/20 group-hover:text-red-500 p-2 transition-all"><Trash2 size={18}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. التبويب: الطلبات (مع الفلاتر والإلغاء) */}
          {activeTab === 'orders' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="text" placeholder="رقم الطلب..." className="w-full bg-slate-800/40 border border-slate-700 rounded-2xl py-3 pr-11 pl-4 outline-none focus:border-indigo-500" value={searchOrder} onChange={e => setSearchOrder(e.target.value)} />
                </div>
                <div className="flex gap-1.5 bg-slate-800/30 p-1 rounded-xl border border-slate-800 overflow-x-auto">
                  {(['all', 'processing', 'delivered', 'cancelled'] as const).map(st => (
                    <button key={st} onClick={() => setOrderStatusFilter(st)} className={`px-4 py-2 rounded-lg text-[10px] font-black whitespace-nowrap transition-all ${orderStatusFilter === st ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>
                      {st === 'all' ? 'الكل' : st === 'processing' ? 'قيد المعالجة' : st === 'delivered' ? 'تم التسليم' : 'ملغي'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                {filteredOrders.map(order => (
                  <div key={order.id} className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-right flex-1">
                      <span className="text-[10px] font-mono text-slate-600 block mb-1 uppercase">#{order.id.slice(0,8)}</span>
                      <p className="font-bold text-white text-sm">{order.productName || 'طلب متجر'}</p>
                      <p className="text-indigo-400 font-black text-xs mt-1">${order.totalPrice || order.amount}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : order.status === 'processing' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-500'}`}>
                        {order.status === 'processing' ? 'قيد المعالجة' : order.status === 'delivered' ? 'تم التسليم' : 'ملغي'}
                      </span>
                      
                      {order.status === 'processing' && (
                        <>
                          <button onClick={() => setDeliveryModal({ order, info: '' })} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
                             <Send size={14} /> تسليم
                          </button>
                          <button onClick={() => handleCancelOrder(order)} className="bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all">
                             إلغاء
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. التبويب: المستخدمين */}
          {activeTab === 'users' && (
            <div className="p-6 space-y-6">
              <input type="text" placeholder="بحث باسم المستخدم..." className="max-w-xs w-full bg-slate-800/40 border border-slate-700 rounded-2xl px-5 py-3 outline-none focus:border-indigo-500" value={searchUser} onChange={e => setSearchUser(e.target.value)} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map(user => (
                  <div key={user.uid} className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 flex justify-between items-center">
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{user.displayName || 'بدون اسم'}</p>
                      <p className="text-[10px] text-slate-500 truncate mb-2">{user.email}</p>
                      <div className="text-emerald-400 font-black bg-emerald-500/5 px-2 py-0.5 rounded text-xs w-fit">${user.balance || 0}</div>
                    </div>
                    <button onClick={() => setBalanceModal({ user, amount: '' })} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-[10px] font-black">تعديل</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- Modals --- */}

      {/* نافذة التسليم */}
      <AnimatePresence>
        {deliveryModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-lg w-full shadow-2xl">
              <h2 className="text-xl font-black text-white mb-6">إرسال تفاصيل الحساب</h2>
              <textarea placeholder="اكتب بيانات الحساب هنا (إيميل:كلمة سر)..." className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-5 min-h-[180px] mb-6 outline-none focus:border-indigo-500 text-slate-100" value={deliveryModal.info} onChange={e => setDeliveryModal({...deliveryModal, info: e.target.value})} />
              <div className="flex gap-3">
                <button onClick={handleDeliverOrder} className="flex-1 bg-indigo-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-500">
                  {saving ? <Loader2 className="animate-spin" /> : <><Send size={18} /> إرسال للعميل</>}
                </button>
                <button onClick={() => setDeliveryModal(null)} className="flex-1 bg-slate-800 py-4 rounded-2xl font-black">إلغاء</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة تعديل الرصيد */}
      <AnimatePresence>
        {balanceModal && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl text-center">
              <h2 className="text-lg font-black text-white mb-4">تعديل رصيد المستخدم</h2>
              <div className="bg-slate-800 p-4 rounded-2xl mb-6 border border-slate-700">
                <span className="text-slate-500 text-[10px] block mb-1">الرصيد الحالي</span>
                <span className="text-2xl font-black text-emerald-400">${balanceModal.user.balance || 0}</span>
              </div>
              <input type="number" className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 mb-6 text-center text-2xl font-black outline-none focus:border-indigo-500" value={balanceModal.amount} onChange={e => setBalanceModal({...balanceModal, amount: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleUpdateBalance('add')} className="bg-emerald-600 py-3 rounded-xl font-black text-xs">إضافة</button>
                <button onClick={() => handleUpdateBalance('subtract')} className="bg-red-600 py-3 rounded-xl font-black text-xs">سحب</button>
              </div>
              <button onClick={() => setBalanceModal(null)} className="mt-4 text-slate-500 text-xs font-bold">إلغاء</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة إضافة منتج */}
      <AnimatePresence>
        {showAddProduct && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.form onSubmit={handleAddProduct} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-2xl w-full shadow-2xl my-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-white flex items-center gap-3"><Package className="text-indigo-500" /> إضافة منتج جديد</h2>
                <button type="button" onClick={() => setShowAddProduct(false)} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white transition-all"><X /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input required placeholder="اسم المنتج" className="bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <select className="bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 text-slate-400 font-bold" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input required placeholder="رابط الصورة المباشر" className="bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                <input required type="number" placeholder="السعر بالدولار" className="bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                <input required type="number" placeholder="الكمية المتوفرة" className="bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
              </div>
              <button type="submit" disabled={saving} className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-600/20">
                {saving ? <Loader2 className="animate-spin mx-auto" /> : 'حفظ ونشر المنتج'}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
