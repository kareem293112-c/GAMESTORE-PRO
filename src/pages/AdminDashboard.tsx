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
import { refundOrder } from '../lib/orders';  // تم تعديل المسار هنا

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

        {activeTab === 'products' ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-bold">تصفية حسب:</span>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">جميع التصنيفات</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">جميع المنصات</option>
                {platforms.map(plat => (
                  <option key={plat} value={plat}>{plat}</option>
                ))}
              </select>

              {(categoryFilter || platformFilter) && (
                <button
                  onClick={() => {
                    setCategoryFilter('');
                    setPlatformFilter('');
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  إعادة تعيين
                </button>
              )}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-800/50 text-slate-400 text-sm">
                    <tr>
                      <th className="p-4 mr-2">المنتج</th>
                      <th className="p-4">التصنيف</th>
                      <th className="p-4">السعر</th>
                      <th className="p-4">المخزون</th>
                      <th className="p-4">الإجراءات</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {loading ? (
                      Array(3).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="p-8 h-20 bg-slate-800/10"></td>
                        </tr>
                      ))
                    ) : filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={product.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="" />
                              <div>
                                <p className="font-bold text-slate-200">{product.name}</p>
                                <p className="text-xs text-slate-500">{product.platform}</p>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 text-sm text-slate-400">{product.category}</td>

                          <td className="p-4">
                            <p className="font-bold text-indigo-400">{formatPrice(product.price)}</p>
                            {product.discount > 0 && (
                              <p className="text-[10px] text-red-400">-{product.discount}% خصم</p>
                            )}
                          </td>

                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                              product.stock > 0
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {product.stock} متبقي
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setCurrentProduct(product);
                                  setIsModalOpen(true);
                                }}
                                className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeleteConfirm({ id: product.id, type: 'product', name: product.name })}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-500 font-bold">
                          {products.length === 0 ? 'لا يوجد منتجات حالياً' : 'لم يتم العثور على منتجات تطابق البحث'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'orders' ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div class
