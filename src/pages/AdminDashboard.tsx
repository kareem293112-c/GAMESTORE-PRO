import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { Package, Plus, Trash2, Edit2, LayoutDashboard, ShoppingBag, Users, X, Save, Filter } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { refundOrder } from '../lib/orders'; // تم تعديل المسار هنا

export const AdminDashboard: React.FC = () => {
  const { loading: authLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users'>('products');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'product' | 'order', name?: string } | null>(null);
  const [walletModal, setWalletModal] = useState<{ userId: string, email: string, currentBalance: number, amount: string } | null>(null);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);

  const [editingDelivery, setEditingDelivery] = useState<{ id: string, info: string } | null>(null);
  const [deliveryModal, setDeliveryModal] = useState<{ id: string, status: string, info: string } | null>(null);

  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    discount: 0,
    stock: 0,
    category: '',
    platform: '',
    imageUrl: '',
    rating: 5,
    featured: false
  });

  const filteredProducts = products.filter(product => {
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    const matchesPlatform = platformFilter === '' || product.platform === platformFilter;
    return matchesCategory && matchesPlatform;
  });

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];

      setProducts(data);

      const uniqueCategories = Array.from(new Set(data.map(p => p.category))).filter(Boolean);
      const uniquePlatforms = Array.from(new Set(data.map(p => p.platform))).filter(Boolean);

      setCategories(uniqueCategories);
      setPlatforms(uniquePlatforms);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'products');
      toast.error('حدث خطأ أثناء تحميل المنتجات');
    }
  };

  const fetchOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setOrders(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const data = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        balance: doc.data().balance || 0,
        role: doc.data().role || 'customer'
      }));

      setUsersList(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const updateWalletBalance = async (userId: string, newBalance: number) => {
    if (isNaN(newBalance)) {
      toast.error('الرصيد المدخل غير صحيح');
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        balance: Number(newBalance),
        updatedAt: serverTimestamp()
      });

      toast.success('تم تحديث الرصيد بنجاح');
      setWalletModal(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Wallet update error:', error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      toast.error('حدث خطأ أثناء تحديث الرصيد: ' + (error.message || 'خطأ غير معروف'));
    }
  };

  const handleCancelAndRefund = async (order: any) => {
    if (!window.confirm('هل أنت متأكد من إلغاء الطلب وإرجاع المبلغ؟')) {
      return;
    }

    const refundAmount = Number(order.totalPrice ?? order.total ?? 0);
    const productId =
      order.productId ||
      order.product?.id ||
      order.items?.[0]?.productId ||
      order.items?.[0]?.id;

    if (!order.id || !order.userId || !productId || refundAmount <= 0) {
      toast.error('بيانات الطلب غير مكتملة لإتمام عملية الاسترداد');
      return;
    }

    try {
      await refundOrder(order.id, order.userId, refundAmount, productId);

      toast.success('تم إلغاء الطلب وإرجاع المال بنجاح');

      await Promise.all([
        fetchOrders(),
        fetchUsers(),
        fetchProducts()
      ]);
    } catch (error) {
      console.error(error);
      toast.error('فشلت عملية الاسترداد');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, deliveryInfo?: string) => {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (deliveryInfo !== undefined) {
        updateData.deliveryInfo = deliveryInfo;
      }

      await updateDoc(doc(db, 'orders', orderId), {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      toast.success('تم تحديث الطلب');
      fetchOrders();
      setEditingDelivery(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
      toast.error('فشل تحديث الطلب');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchOrders(), fetchUsers()]);
      setLoading(false);
    };

    init();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (currentProduct.id) {
        const { id, ...data } = currentProduct;

        try {
          await updateDoc(doc(db, 'products', id as string), data);
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
        }

        toast.success('تم تحديث المنتج');
      } else {
        try {
          await addDoc(collection(db, 'products'), {
            ...currentProduct,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'products');
        }

        toast.success('تم إضافة المنتج');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));

      toast.success('تم الحذف بنجاح');
      fetchProducts();
      setDeleteConfirm(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      toast.error('خطأ في الحذف');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'orders', id));

      toast.success('تم حذف الطلب بنجاح');
      fetchOrders();
      setDeleteConfirm(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
      toast.error('حدث خطأ أثناء حذف الطلب');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 sm:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8 text-indigo-500" /> لوحة الإدارة
            </h1>
            <p className="text-slate-400">إدارة المنتجات، الطلبات، والعملاء</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                setCurrentProduct({
                  name: '',
                  description: '',
                  price: 0,
                  discount: 0,
                  stock: 0,
                  category: '',
                  platform: '',
                  imageUrl: '',
                  rating: 5,
                  featured: false
                });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-5 h-5" /> إضافة منتج جديد
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={ShoppingBag} label="المنتجات" value={products.length} color="indigo" />
          <StatCard icon={Package} label="إجمالي الطلبات" value={orders.length} color="cyan" />
          <StatCard icon={Users} label="العملاء" value={new Set(orders.map(o => o.userId)).size} color="emerald" />
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
              activeTab === 'products'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            المنتجات
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            الطلبات
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            العملاء
          </button>
        </div>
