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
  RefreshCcw,
  ImageOff
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// --- الأقسام الثابتة ---
const CATEGORIES = [
  { id: 'all', name: 'الكل', icon: <Package size={16} /> },
  { id: 'gifts', name: 'قسم الهدايا', icon: <Gift size={16} /> },
  { id: 'steam-accounts', name: 'حسابات ستيم', icon: <Users size={16} /> },
  { id: 'steam-codes', name: 'أكواد ستيم', icon: <Gamepad2 size={16} /> },
  { id: 'problem-accounts', name: 'حسابات مشكلة', icon: <AlertTriangle size={16} /> },
];

export const AdminDashboard: React.FC = () => {
  const { loading: authLoading } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users'>('products');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'processing' | 'delivered' | 'cancelled'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // بيانات المنتج الجديد
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', stock: '', category: 'steam-accounts', imageUrl: '', description: '', discount: '0'
  });

  // التحكم في النوافذ (Modals)
  const [modals, setModals] = useState<{
    addOrderInfo: any | null;
    editBalance: { user: any, amount: string } | null;
    addProduct: boolean;
  }>({ addOrderInfo: null, editBalance: null, addProduct: false });

  const usersMap = useMemo(() => {
    const map = new Map();
    usersList.forEach(u => map.set(u.uid, u));
    return map;
  }, [usersList]);

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
    } catch { toast.error("خطأ في الاتصال بقاعدة البيانات"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- العمليات ---

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        isActive: true,
        createdAt: serverTimestamp(),
      });
      toast.success("تم إضافة المنتج");
      setModals({ ...modals, addProduct: false });
      setNewProduct({ name: '', price: '', stock: '', category: 'steam-accounts', imageUrl: '', description: '', discount: '0' });
      fetchData();
    } catch { toast.error("فشل إضافة المنتج"); } finally { setSaving(false); }
  };

  const handleUpdateBalance = async (type: 'add' | 'subtract') => {
    if (!modals.editBalance || !modals.editBalance.amount) return;
    const amount = Number(modals.editBalance.amount);
    const finalAmount = type === 'subtract' ? -amount : amount;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', modals.editBalance.user.uid), { balance: increment(finalAmount) });
      toast.success(type === 'add' ? "تمت الإضافة" : "تم السحب");
      setModals({ ...modals, editBalance: null });
      fetchData();
    } catch { toast.error("خطأ في التعديل"); } finally { setSaving(false); }
  };

  const handleCancelAndRefund = async (order: any) => {
    if (!window.confirm("إلغاء وإرجاع المال للعميل؟")) return;
    setSaving(true);
    try {
      const amount = Number(order.totalPrice || order.amount || 0);
      await Promise.all([
        updateDoc(doc(db, 'users', order.userId), { balance: increment(amount) }),
        updateDoc(doc(db, 'orders', order.id), { status: 'cancelled', updatedAt: serverTimestamp() })
      ]);
      toast.success("تم الإلغاء واسترجاع المبلغ");
      fetchData();
    } catch { toast.error("فشل الإلغاء"); } finally { setSaving(false); }
  };

  const handleDeliver = async (info: string) => {
    if (!modals.addOrderInfo || !info.trim()) return toast.error("أدخل بيانات الحساب");
    setSaving(true);
    try {
      await updateDoc(doc(db, 'orders', modals.addOrderInfo.id), {
        status: 'delivered', deliveryInfo: info, deliveredAt: serverTimestamp()
      });
      toast.success("تم التسليم");
      setModals({ ...modals, addOrderInfo: null });
      fetchData();
    } catch { toast.error("خطأ في التسليم"); } finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-right text-slate-100 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 backdrop-blur-md">
          <h1 className="text-xl font-black flex items-center gap-3"><LayoutDashboard className="text-indigo-500" /> لوحة الإدارة</h1>
          <button onClick={() => setModals({...modals, addProduct: true})} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 transition-all">
            <Plus size={18} /> منتج جديد
          </button>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-fit">
          {([{id:'products', n:'المخزون'}, {id:'orders', n:'الطلبات'}, {id:'users', n:'المستخدمين'}]).map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
              {t.n}
            </button>
          ))}
        </div>

        <main className="bg-slate-900/20 rounded-[2.5rem] border border-slate-800/50 min-h-[500px] backdrop-blur-sm">
          
          {/* View: Orders */}
          {activeTab === 'orders' && (
            <div className="p-8 space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <input type="text" placeholder="بحث برقم الطلب..." className="bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 outline-none focus:border-indigo-500 max-w-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <div className="flex gap-1.5 bg-slate-800/40 p-1 rounded-xl">
                  {([{id:'all', n:'الكل'}, {id:'processing', n:'قيد المعالجة'}, {id:'delivered', n:'تم التسليم'}, {id:'cancelled', n:'ملغي'}] as const).map(s => (
                    <button key={s.id} onClick={() => setOrderStatusFilter(s.id)} className={`px-4 py-2 rounded-lg text-[10px] font-black ${orderStatusFilter === s.id ? 'bg-indigo-600' : ''}`}>{s.n}</button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4">
                {orders.filter(o => (orderStatusFilter === 'all' || o.status === orderStatusFilter) && o.id.includes(searchQuery)).map(order => (
                  <div key={order.id} className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-600 block uppercase">#{order.id.slice(0,10)}</span>
                      <h3 className="font-bold text-white">{order.productName}</h3>
                      <p className="text-indigo-400 font-black text-sm">${order.totalPrice || order.amount}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{order.status}</span>
                      {order.status === 'processing' && (
                        <>
                          <button onClick={() => setModals({...modals, addOrderInfo: order})} className="bg-emerald-600 px-4 py-2 rounded-xl text-xs font-black">تم التسليم</button>
                          <button onClick={() => handleCancelAndRefund(order)} className="bg-red-600/10 text-red-500 px-4 py-2 rounded-xl text-xs font-black">إلغاء</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View: Products */}
          {activeTab === 'products' && (
            <div className="p-8 space-y-6">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setCategoryFilter(c.id)} className={`px-5 py-2 rounded-xl border text-xs font-black ${categoryFilter === c.id ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800/40 border-slate-700 text-slate-500'}`}>{c.name}</button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.filter(p => categoryFilter === 'all' || p.category === categoryFilter).map(p => (
                  <div key={p.id} className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800 flex items-center gap-4">
                    <img src={p.imageUrl} className="w-16 h-16 rounded-xl object-cover" alt="" />
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-sm">{p.name}</h4>
                      <p className="text-indigo-400 font-black">${p.price}</p>
                    </div>
                    <button onClick={() => {if(window.confirm('حذف؟')) deleteDoc(doc(db, 'products', p.id)).then(fetchData)}} className="text-red-500/30 hover:text-red-500"><Trash2 size={18}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View: Users */}
          {activeTab === 'users' && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usersList.map(u => (
                <div key={u.uid} className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-sm">{u.displayName || 'بدون اسم'}</h3>
                    <p className="text-emerald-400 font-black text-xs">${u.balance || 0}</p>
                  </div>
                  <button onClick={() => setModals({...modals, editBalance: { user: u, amount: '' }})} className="bg-indigo-600/10 text-indigo-400 px-4 py-2 rounded-xl text-[10px] font-black transition-all hover:bg-indigo-600 hover:text-white">تعديل الرصيد</button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* --- النوافذ (Modals) --- */}

      {/* نافذة إضافة منتج */}
      <AnimatePresence>
        {modals.addProduct && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.form onSubmit={handleAddProduct} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-2xl w-full">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-white">إضافة منتج جديد</h2>
                <button type="button" onClick={() => setModals({...modals, addProduct: false})} className="bg-slate-800 p-2 rounded-full"><X/></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="اسم المنتج" className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <select className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input required placeholder="رابط الصورة" className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                <input required type="number" placeholder="السعر" className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                <input required type="number" placeholder="المخزون" className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
              </div>
              <button disabled={saving} className="w-full mt-6 bg-indigo-600 py-4 rounded-xl font-black text-lg transition-all">{saving ? 'جاري الحفظ...' : 'حفظ المنتج'}</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة التسليم */}
      <AnimatePresence>
        {modals.addOrderInfo && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-center">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-lg w-full">
              <h2 className="text-xl font-black text-white mb-6">إرسال بيانات التسليم للعميل</h2>
              <textarea id="del_info" placeholder="اكتب بيانات الحساب هنا..." className="w-full bg-slate-800 border border-slate-700 rounded-3xl p-5 min-h-[180px] mb-6 text-slate-100 outline-none focus:border-indigo-500 resize-none"></textarea>
              <div className="flex gap-4">
                <button onClick={() => {
                  const val = (document.getElementById('del_info') as HTMLTextAreaElement).value;
                  handleDeliver(val);
                }} className="flex-1 bg-indigo-600 py-4 rounded-2xl font-black">إرسال للعميل</button>
                <button onClick={() => setModals({...modals, addOrderInfo: null})} className="flex-1 bg-slate-800 py-4 rounded-2xl font-black">إلغاء</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة تعديل الرصيد */}
      <AnimatePresence>
        {modals.editBalance && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 text-center">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-sm w-full">
              <h2 className="text-xl font-black text-white mb-6">تعديل الرصيد</h2>
              <div className="bg-slate-800 p-4 rounded-2xl mb-6">
                 <span className="text-slate-500 text-xs block">الرصيد الحالي</span>
                 <span className="text-2xl font-black text-emerald-400">${modals.editBalance.user.balance || 0}</span>
              </div>
              <input type="number" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 text-center text-2xl font-black outline-none" value={modals.editBalance.amount} onChange={e => setModals({...modals, editBalance: {...modals.editBalance!, amount: e.target.value}})} />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleUpdateBalance('add')} className="bg-emerald-600 py-4 rounded-2xl font-black">إضافة</button>
                <button onClick={() => handleUpdateBalance('subtract')} className="bg-red-600 py-4 rounded-2xl font-black">سحب</button>
              </div>
              <button onClick={() => setModals({...modals, editBalance: null})} className="mt-4 text-slate-500 font-bold">إلغاء</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
