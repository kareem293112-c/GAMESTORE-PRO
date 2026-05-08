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
  CheckCircle,
  ImageOff,
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
  ShoppingBag
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { refundOrder } from '../lib/orders';

// --- Types ---
type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled';

interface OrderItem {
  productId?: string;
  name?: string;
  quantity?: number;
  price?: number;
}

interface Order {
  id: string;
  userId?: string;
  totalPrice?: number;
  total?: number;
  amount?: number;
  status?: OrderStatus;
  productId?: string;
  productName?: string;
  items?: OrderItem[];
  createdAt?: any;
  deliveryInfo?: string;
}

interface User {
  uid: string;
  email?: string;
  displayName?: string;
  balance?: number;
  role?: string;
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
  name: '', price: '', stock: '', category: '', imageUrl: '', description: '', discount: '',
};

// --- Helpers ---
const parseMoney = (value: unknown) => {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatDate = (createdAt: any) => {
  try {
    const date = createdAt?.toDate ? createdAt.toDate() : createdAt ? new Date(createdAt) : null;
    if (!date || Number.isNaN(date.getTime())) return 'بدون تاريخ';
    return new Intl.DateTimeFormat('ar', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return 'بدون تاريخ';
  }
};

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
  const productsById = useMemo(() => new Map(products.map((p: any) => [p.id, p])), [products]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsSnap, ordersSnap, usersSnap] = await Promise.all([
        getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'users')),
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

  // --- Functions ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        discount: Number(newProduct.discount || 0),
        isActive: true,
        createdAt: serverTimestamp(),
      });
      toast.success('تمت الإضافة');
      setShowAddProduct(false);
      fetchData();
    } catch { toast.error('خطأ في الإضافة'); } finally { setSaving(false); }
  };

  const handleDeliverOrder = async () => {
    if (!deliveryModal) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'orders', deliveryModal.order.id), {
        status: 'delivered',
        deliveryInfo: deliveryModal.info,
        deliveredAt: serverTimestamp(),
      });
      toast.success('تم التسليم');
      setDeliveryModal(null);
      fetchData();
    } catch { toast.error('خطأ'); } finally { setSaving(false); }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!window.confirm('إلغاء وإرجاع المبلغ؟')) return;
    setSaving(true);
    try {
      await refundOrder(order.id);
      toast.success('تم إلغاء الطلب');
      fetchData();
    } catch { toast.error('فشل الإلغاء'); } finally { setSaving(false); }
  };

  const handleAddBalance = async () => {
    if (!balanceModal) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', balanceModal.user.uid), {
        balance: increment(Number(balanceModal.amount))
      });
      toast.success('تم شحن الرصيد');
      setBalanceModal(null);
      fetchData();
    } catch { toast.error('خطأ'); } finally { setSaving(false); }
  };

  // --- Filter Logic ---
  const getOrderCustomer = (order: Order) => {
    const user = usersById.get(order.userId || '');
    return user?.displayName || user?.email || 'غير معروف';
  };

  const filteredOrders = orders.filter(o => 
    o.id.includes(searchOrder) || getOrderCustomer(o).includes(searchOrder)
  );

  if (authLoading || loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 font-sans text-right text-slate-100" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <LayoutDashboard className="text-indigo-500" /> لوحة الإدارة
          </h1>
          <div className="flex gap-2">
            <button onClick={fetchData} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold">تحديث</button>
            <button onClick={() => setShowAddProduct(true)} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <Plus size={18} /> منتج جديد
            </button>
          </div>
        </header>

        {/* Tabs Navigation */}
        <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-fit">
          {(['products', 'orders', 'users'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'products' ? 'المنتجات' : tab === 'orders' ? 'الطلبات' : 'المستخدمين'}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="bg-slate-900/50 rounded-3xl border border-slate-800 min-h-[500px] overflow-hidden">
          
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img src={product.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <h3 className="font-bold">{product.name}</h3>
                      <p className="text-sm text-slate-400">{product.price} $ • المخزون: {product.stock}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <div className="p-4"><input type="text" placeholder="ابحث في الطلبات..." onChange={(e) => setSearchOrder(e.target.value)} className="w-full bg-slate-800 rounded-xl px-4 py-2 border border-slate-700" /></div>
              <table className="w-full text-right">
                <thead className="bg-slate-800/50 text-slate-400 text-sm">
                  <tr>
                    <th className="p-4">العميل</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">المبلغ</th>
                    <th className="p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                      <td className="p-4">{getOrderCustomer(order)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-indigo-400 font-bold">${parseMoney(order.totalPrice || order.amount)}</td>
                      <td className="p-4 flex gap-2">
                        {order.status !== 'delivered' && (
                          <button onClick={() => setDeliveryModal({ order, info: '' })} className="text-green-400 p-2 bg-green-500/10 rounded-lg"><Truck size={18}/></button>
                        )}
                        <button onClick={() => handleCancelOrder(order)} className="text-red-400 p-2 bg-red-500/10 rounded-lg"><XCircle size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
               {filteredUsers.map(user => (
                 <div key={user.uid} className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{user.displayName || 'بدون اسم'}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <div className="mt-2 flex items-center gap-2 text-indigo-400">
                        <Wallet size={14} /> <span className="font-mono">${user.balance || 0}</span>
                      </div>
                    </div>
                    <button onClick={() => setBalanceModal({ user, amount: '' })} className="bg-indigo-600/10 text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all">
                      شحن رصيد
                    </button>
                 </div>
               ))}
             </div>
          )}
        </main>
      </div>

      {/* Modals (Delivery & Balance) */}
      <AnimatePresence>
        {deliveryModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">تأكيد تسليم الطلب</h2>
              <textarea 
                placeholder="أدخل معلومات الحساب أو كود التسليم هنا..."
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 min-h-[150px] mb-4 outline-none focus:border-indigo-500"
                value={deliveryModal.info}
                onChange={(e) => setDeliveryModal({...deliveryModal, info: e.target.value})}
              />
              <div className="flex gap-2">
                <button onClick={handleDeliverOrder} disabled={saving} className="flex-1 bg-green-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="animate-spin" /> : 'إرسال للعميل'}
                </button>
                <button onClick={() => setDeliveryModal(null)} className="flex-1 bg-slate-800 py-3 rounded-xl font-bold">إلغاء</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
