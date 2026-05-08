
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
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { refundOrder } from '../lib/orders';

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
  name: '',
  price: '',
  stock: '',
  category: '',
  imageUrl: '',
  description: '',
  discount: '',
};

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

  const usersById = useMemo(() => {
    return new Map(usersList.map((user) => [user.uid, user]));
  }, [usersList]);

  const productsById = useMemo(() => {
    return new Map(products.map((product: any) => [product.id, product]));
  }, [products]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsSnap, ordersSnap, usersSnap] = await Promise.all([
        getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'users')),
      ]);

      setProducts(productsSnap.docs.map((document) => ({ id: document.id, ...document.data() } as Product)));
      setOrders(ordersSnap.docs.map((document) => ({ id: document.id, ...document.data() } as Order)));
      setUsersList(usersSnap.docs.map((document) => ({ uid: document.id, ...document.data() } as User)));
    } catch (error) {
      console.error('fetchData error:', error);
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateProductForm = () => {
    const price = Number(newProduct.price);
    const stock = Number(newProduct.stock);
    const discount = Number(newProduct.discount || 0);

    if (!newProduct.name.trim()) return 'اسم المنتج مطلوب';
    if (!Number.isFinite(price) || price <= 0) return 'السعر لازم يكون أكبر من صفر';
    if (!Number.isInteger(stock) || stock < 0) return 'الكمية لازم تكون رقم صحيح 0 أو أكثر';
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) return 'الخصم لازم يكون بين 0 و 100';
    return null;
  };

  const handleAddProduct = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validateProductForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, 'products'), {
        name: newProduct.name.trim(),
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        category: newProduct.category.trim(),
        imageUrl: newProduct.imageUrl.trim(),
        description: newProduct.description.trim(),
        discount: Number(newProduct.discount || 0),
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('تم إضافة المنتج بنجاح');
      setNewProduct(emptyProductForm);
      setShowAddProduct(false);
      await fetchData();
    } catch (error) {
      console.error('handleAddProduct error:', error);
      toast.error('فشل إضافة المنتج، تأكد من صلاحيات Firestore');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm('هل أنت متأكد من حذف المنتج؟');
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
      toast.success('تم حذف المنتج');
      setProducts((previous) => previous.filter((product: any) => product.id !== productId));
    } catch (error) {
      console.error('handleDeleteProduct error:', error);
      toast.error('فشل حذف المنتج');
    }
  };

  const handleAddBalance = async () => {
    if (!balanceModal) return;

    const amount = Number(balanceModal.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('أدخل مبلغ صحيح أكبر من صفر');
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', balanceModal.user.uid), {
        balance: increment(amount),
        updatedAt: serverTimestamp(),
      });

      toast.success('تم إضافة الرصيد');
      setBalanceModal(null);
      await fetchData();
    } catch (error) {
      console.error('handleAddBalance error:', error);
      toast.error('فشل إضافة الرصيد، تأكد من صلاحيات Firestore');
    } finally {
      setSaving(false);
    }
  };

  const handleDeliverOrder = async () => {
    if (!deliveryModal) return;

    if (!deliveryModal.info.trim()) {
      toast.error('أدخل معلومات التسليم أولاً');
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, 'orders', deliveryModal.order.id), {
        status: 'delivered',
        deliveryInfo: deliveryModal.info.trim(),
        deliveredAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('تم تسليم الطلب وإرسال المعلومات للعميل');
      setDeliveryModal(null);
      await fetchData();
    } catch (error) {
      console.error('handleDeliverOrder error:', error);
      toast.error('فشل عملية التسليم');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    const confirmed = window.confirm('هل تريد إلغاء الطلب وإرجاع المبلغ؟');
    if (!confirmed) return;

    setSaving(true);
    try {
      if (typeof refundOrder === 'function') {
        await refundOrder(order.id);
      } else {
        await updateDoc(doc(db, 'orders', order.id), {
          status: 'cancelled',
          updatedAt: serverTimestamp(),
        });
      }

      toast.success('تم إلغاء الطلب');
      await fetchData();
    } catch (error) {
      console.error('handleCancelOrder error:', error);
      toast.error('فشل إلغاء الطلب');
    } finally {
      setSaving(false);
    }
  };

  const getOrderTotal = (order: Order) => parseMoney(order.totalPrice ?? order.total ?? order.amount);

  const getOrderCustomer = (order: Order) => {
    const user = order.userId ? usersById.get(order.userId) : undefined;
    return user?.displayName || user?.email || order.userId || 'عميل غير معروف';
  };

  const getOrderProducts = (order: Order) => {
    if (order.items?.length) {
      return order.items
        .map((item) => `${item.name || (item.productId ? (productsById.get(item.productId) as any)?.name : '') || 'منتج'} × ${item.quantity || 1}`)
        .join('، ');
    }

    if (order.productName) return order.productName;

    if (order.productId) {
      const product = productsById.get(order.productId) as any;
      return product?.name || order.productId;
    }

    return 'بدون تفاصيل منتج';
  };

  const filteredUsers = usersList.filter((user) => {
    const queryText = searchUser.trim().toLowerCase();
    if (!queryText) return true;

    return (
      user.displayName?.toLowerCase().includes(queryText) ||
      user.email?.toLowerCase().includes(queryText) ||
      user.uid.toLowerCase().includes(queryText)
    );
  });

  const filteredOrders = orders.filter((order) => {
    const queryText = searchOrder.trim().toLowerCase();
    if (!queryText) return true;

    return (
      order.id.toLowerCase().includes(queryText) ||
      getOrderCustomer(order).toLowerCase().includes(queryText) ||
      getOrderProducts(order).toLowerCase().includes(queryText)
    );
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 font-sans text-right text-slate-100" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <LayoutDashboard className="text-indigo-500" />
            لوحة الإدارة
          </h1>
          <button
            onClick={fetchData}
            className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            تحديث البيانات
          </button>
        </header>
      </div>
    </div>
  );
};

