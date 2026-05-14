import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Product, Review } from '../types';
import { Package, Plus, Trash2, Edit2, LayoutDashboard, ShoppingBag, Users, Settings, X, Save, Filter, CreditCard } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { refundOrder } from '../lib/orders';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { callApi } from '../lib/api';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, isProductManager, isOrderManager, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAdmin && !isProductManager && !isOrderManager) {
      navigate('/');
      toast.error('ليس لديك صلاحية للوصول لهذه الصفحة');
    }
  }, [authLoading, isAdmin, isProductManager, isOrderManager, navigate]);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users' | 'reviews'>(
    isProductManager || isAdmin ? 'products' : 
    isOrderManager ? 'orders' : 'products'
  );
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled' | 'on_hold'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'product' | 'order', name?: string } | null>(null);
  const [walletModal, setWalletModal] = useState<{ userId: string, email: string, currentBalance: number, amount: string } | null>(null);
  const [confirmInput, setConfirmInput] = useState('');

  // Reset confirmation input when modal opens/closes
  useEffect(() => {
    setConfirmInput('');
  }, [deleteConfirm]);
  
  // Filter Orders
  const filteredOrders = orders.filter(order => orderStatusFilter === 'all' || order.status === orderStatusFilter);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState(''); // New name search
  const [categories, setCategories] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    const matchesPlatform = platformFilter === '' || product.platform === platformFilter;
    const matchesName = product.name.toLowerCase().includes(productSearchQuery.toLowerCase()); // Name search logic
    return matchesCategory && matchesPlatform && matchesName;
  });

  const productsById = React.useMemo(() => new Map(products.map(p => [p.id, p])), [products]);


  const isInitialLoad = useRef(true);

  // New order listener
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
      }
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          toast.success('طلب جديد وصل!');
          fetchOrders(); // Refresh orders list
        }
      });
    });
    return () => unsub();
  }, []);

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

  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    costPrice: 0,
    discount: 0,
    stock: 0,
    category: '',
    platform: '',
    imageUrl: '',
    rating: 5,
    featured: false
  });

  // Calculate Total Profits
  const totalProfits = React.useMemo(() => {
    return orders
      .filter(order => ['completed', 'delivered', 'paid'].includes(order.status))
      .reduce((acc, order) => {
        const orderProfit = (order.items || []).reduce((itemAcc: number, item: any) => {
          const product = productsById.get(item.productId);
          const costPrice = product?.costPrice || 0;
          // Use item.price which is the final price paid at checkout
          const profitPerItem = item.price - costPrice;
          return itemAcc + (profitPerItem * (item.quantity || 1));
        }, 0);
        return acc + orderProfit;
      }, 0);
  }, [orders, productsById]);

  const fetchProducts = async () => {
    try {
      const data = await callApi('/api/products');
      setProducts(data);
      
      const uniqueCategories = Array.from(new Set(data.map((p: any) => p.category))).filter(Boolean) as string[];
      const uniquePlatforms = Array.from(new Set(data.map((p: any) => p.platform))).filter(Boolean) as string[];
      setCategories(uniqueCategories);
      setPlatforms(uniquePlatforms);
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل المنتجات');
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await callApi('/api/orders');
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await callApi('/api/users');
      setUsersList(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await callApi('/api/reviews');
      setReviews(data);
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل التقييمات');
    }
  };

  const updateWalletBalance = async (userId: string, newBalance: number) => {
    if (isNaN(newBalance)) {
      toast.error('الرصيد المدخل غير صحيح');
      return;
    }

    try {
      await callApi(`/api/users/${userId}/balance`, {
        method: 'PUT',
        body: JSON.stringify({ balance: Number(newBalance) })
      });
      toast.success('تم تحديث الرصيد بنجاح');
      setWalletModal(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Wallet update error:", error);
      toast.error('حدث خطأ أثناء تحديث الرصيد');
    }
  };

  const [editingDelivery, setEditingDelivery] = useState<{ id: string, info: string } | null>(null);
  const [deliveryModal, setDeliveryModal] = useState<{ id: string, status: string, info: string } | null>(null);

  const updateOrderStatus = async (orderId: string, status: string, deliveryInfo?: string) => {
    try {
      const updateData: any = { status };
      if (deliveryInfo !== undefined) {
        updateData.deliveryInfo = deliveryInfo;
      }
      await callApi(`/api/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      toast.success('تم تحديث الطلب');
      fetchOrders();
      setEditingDelivery(null);
    } catch (error) {
      toast.error('فشل تحديث الطلب');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchOrders(), fetchUsers(), fetchReviews()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentProduct.id) {
        const { id, ...data } = currentProduct;
        await callApi(`/api/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        toast.success('تم تحديث المنتج');
      } else {
        await callApi('/api/products', {
          method: 'POST',
          body: JSON.stringify(currentProduct)
        });
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
      await callApi(`/api/products/${id}`, {
        method: 'DELETE'
      });
      toast.success('تم الحذف بنجاح');
      fetchProducts();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('خطأ في الحذف');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await callApi(`/api/orders/${id}`, {
        method: 'DELETE'
      });
      toast.success('تم حذف الطلب بنجاح');
      fetchOrders();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف الطلب');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await callApi(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
      });
      toast.success('تم حذف التقييم');
      fetchReviews();
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف التقييم');
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
            {(isAdmin || isProductManager) && (
              <button
                onClick={() => {
                  setCurrentProduct({
                    name: '', description: '', price: 0, costPrice: 0, discount: 0, stock: 0,
                    category: '', platform: '', imageUrl: '', rating: 5, featured: false
                  });
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Plus className="w-5 h-5" /> إضافة منتج جديد
              </button>
            )}
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(isAdmin || isProductManager) && <StatCard icon={ShoppingBag} label="المنتجات" value={products.length} color="indigo" />}
          {(isAdmin || isOrderManager) && <StatCard icon={Package} label="إجمالي الطلبات" value={orders.length} color="cyan" />}
          {isAdmin && <StatCard icon={Users} label="العملاء" value={usersList.length} color="emerald" />}
          {isAdmin && <StatCard icon={CreditCard} label="إجمالي الأرباح" value={formatPrice(totalProfits)} color="amber" />}
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 w-fit">
          {(isAdmin || isProductManager) && (
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
                activeTab === 'products' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              المنتجات
            </button>
          )}
          {(isAdmin || isOrderManager) && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
                activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              الطلبات
            </button>
          )}
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
                  activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                العملاء
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
                  activeTab === 'reviews' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                التقييمات
              </button>
            </>
          )}
        </div>

        {/* Content */}
        {activeTab === 'products' ? (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-bold">تصفية حسب:</span>
              </div>
              
              <input
                type="text"
                placeholder="بحث باسم المنتج..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 w-48"
              />

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

              {(categoryFilter || platformFilter || productSearchQuery) && (
                <button
                  onClick={() => {
                    setCategoryFilter('');
                    setPlatformFilter('');
                    setProductSearchQuery('');
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
                          {product.discount > 0 && <p className="text-[10px] text-red-400">-{product.discount}% خصم</p>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {product.stock} متبقي
                          </span>
                        </td>
                        <td className="p-4">
                          {(isAdmin || isProductManager) && (
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
                          )}
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
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-white font-bold">إدارة الطلبات</h2>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">الكل</option>
                <option value="pending">قيد المعالجة</option>
                <option value="on_hold">قيد الانتظار</option>
                <option value="completed">تم التسليم</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-800/50 text-slate-400 text-sm">
                  <tr>
                    <th className="p-4 mr-2">طلب ID</th>
                    <th className="p-4">العميل</th>
                    <th className="p-4">المبلغ</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">معلومات التسليم</th>
                    <th className="p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-500 font-bold">لا توجد طلبات بهذا التصنيف</td>
                    </tr>
                  ) : filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-xs font-mono text-slate-400">{order.id}</td>
                      <td className="p-4">
                        <p className="font-bold text-slate-200">{order.customerName}</p>
                        <p className="text-xs text-slate-500">{order.customerEmail}</p>
                      </td>
                      <td className="p-4 font-black text-white">{formatPrice(order.total)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          order.status === 'on_hold' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {order.status === 'completed' ? 'تم التسليم' : 
                          order.status === 'cancelled' ? 'ملغي' : 
                          order.status === 'on_hold' ? 'قيد الانتظار' : 'قيد المعالجة'}
                        </span>
                      </td>
                      <td className="p-4">
                        {editingDelivery?.id === order.id ? (
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <textarea
                              value={editingDelivery.info}
                              onChange={(e) => setEditingDelivery({ ...editingDelivery, info: e.target.value })}
                              placeholder="أدخل معلومات التسليم هنا..."
                              className="bg-slate-800 border border-slate-700 text-xs rounded-lg p-2 text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 resize-none h-20"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateOrderStatus(order.id, order.status, editingDelivery.info)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-1 rounded-md transition-colors"
                              >
                                حفظ المعلومات
                              </button>
                              <button
                                onClick={() => setEditingDelivery(null)}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold py-1 rounded-md transition-colors"
                              >
                                إلغاء
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="max-w-[200px]">
                            {order.deliveryInfo ? (
                              <div className="group relative">
                                <p className="text-xs text-slate-400 truncate">
                                  {typeof order.deliveryInfo === 'string' 
                                    ? order.deliveryInfo 
                                    : order.deliveryInfo && typeof order.deliveryInfo === 'object'
                                      ? JSON.stringify(order.deliveryInfo)
                                      : ''}
                                </p>
                                <button
                                  onClick={() => setEditingDelivery({ 
                                    id: order.id, 
                                    info: typeof order.deliveryInfo === 'string' 
                                      ? order.deliveryInfo 
                                      : order.deliveryInfo && typeof order.deliveryInfo === 'object'
                                        ? Object.entries(order.deliveryInfo).map(([k, v]) => `${k}: ${v}`).join('\n')
                                        : '' 
                                  })}
                                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold mt-1"
                                >
                                  تعديل
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingDelivery({ id: order.id, info: '' })}
                                className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                              >
                                <Plus className="w-3 h-3" /> إضافة معلومات
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {(isAdmin || isOrderManager) && (
                          <div className="flex items-center gap-2">
                            <select 
                              value={order.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                if (newStatus === 'cancelled') {
                                  if (window.confirm('إلغاء الطلب سيؤدي لاسترداد المبلغ للعميل. هل أنت متأكد؟')) {
                                    try {
                                      await refundOrder(order.id, order.userId!, order.total);
                                      await fetchOrders();
                                      toast.success('تم إلغاء الطلب واسترداد المبلغ');
                                    } catch (e) {
                                      console.error(e);
                                      toast.error('فشل إلغاء الطلب');
                                    }
                                  }
                                } else if (newStatus === 'completed') {
                                  setDeliveryModal({ 
                                    id: order.id, 
                                    status: 'completed', 
                                    info: typeof order.deliveryInfo === 'string'
                                      ? order.deliveryInfo
                                      : order.deliveryInfo && typeof order.deliveryInfo === 'object'
                                        ? Object.entries(order.deliveryInfo).map(([k, v]) => `${k}: ${v}`).join('\n')
                                        : ''
                                  });
                                } else {
                                  updateOrderStatus(order.id, newStatus);
                                }
                              }}
                              className="bg-slate-800 border border-slate-700 text-xs rounded-lg p-1 text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
                            >
                              <option value="pending">قيد المعالجة</option>
                              <option value="on_hold">قيد الانتظار</option>
                              <option value="completed">تم التسليم</option>
                              <option value="cancelled">ملغي</option>
                            </select>
                            <button
                              onClick={() => setDeleteConfirm({ id: order.id, type: 'order', name: order.id })}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'reviews' ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-800/50 text-slate-400 text-sm">
                  <tr>
                    <th className="p-4 mr-2">المنتج</th>
                    <th className="p-4">العميل</th>
                    <th className="p-4">التقييم</th>
                    <th className="p-4">التعليق</th>
                    <th className="p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-500 font-bold">لا توجد تقييمات حالياً</td>
                    </tr>
                  ) : reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-slate-200">{productsById.get(review.productId)?.name || review.productId}</td>
                      <td className="p-4 text-slate-200">{review.userName || 'غير معروف'}</td>
                      <td className="p-4 font-bold text-amber-400">{review.rating} / 5</td>
                      <td className="p-4 text-slate-500 text-sm">{review.comment}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-white font-bold">إدارة العملاء</h2>
              <input 
                  type="text"
                  placeholder="بحث بالبريد الإلكتروني..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 w-64"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-800/50 text-slate-400 text-sm">
                  <tr>
                    <th className="p-4 mr-2">العميل</th>
                    <th className="p-4">البريد الإلكتروني</th>
                    <th className="p-4">الرتبة</th>
                    <th className="p-4">الرصيد</th>
                    <th className="p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {usersList.filter(u => u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-500 font-bold">لا يوجد مستخدمين حالياً</td>
                    </tr>
                  ) : usersList.filter(u => u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())).map((userItem) => (
                    <tr key={userItem.uid} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-bold text-slate-200">{userItem.displayName || 'بدون اسم'}</td>
                      <td className="p-4 text-xs text-slate-400 font-mono">{userItem.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          userItem.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {userItem.role}
                        </span>
                      </td>
                      <td className="p-4 font-black text-emerald-400">
                        {formatPrice(userItem.balance || 0)}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setWalletModal({ 
                            userId: userItem.uid, 
                            email: userItem.email, 
                            currentBalance: userItem.balance || 0,
                            amount: (userItem.balance || 0).toString()
                          })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-[10px] font-black rounded-lg transition-all"
                        >
                          <Save className="w-3 h-3" /> تعديل الرصيد
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
              dir="rtl"
            >
              <form onSubmit={handleSave}>
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    {currentProduct.id ? 'تعديل منتج' : 'إضافة منتج جديد'}
                  </h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                  <FormField label="اسم المنتج" required>
                    <input
                      type="text"
                      value={currentProduct.name}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                      className="admin-input"
                      required
                    />
                  </FormField>
                  <FormField label="التصنيف" required>
                    <select
                      value={currentProduct.category}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                      className="admin-input"
                      required
                    >
                      <option value="">اختر التصنيف</option>
                      <option value="قسم الهدايا">قسم الهدايا</option>
                      <option value="حسابات ستيم">حسابات ستيم</option>
                      <option value="أكواد ستيم">أكواد ستيم</option>
                      <option value="حسابات مشكلة">حسابات مشكلة</option>
                    </select>
                  </FormField>
                  <FormField label="المنصة" placeholder="مثل Steam, PS5">
                    <input
                      type="text"
                      value={currentProduct.platform}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, platform: e.target.value })}
                      className="admin-input"
                    />
                  </FormField>
                  <FormField label="السعر (ليرة)" required>
                    <input
                      type="number"
                      value={currentProduct.price}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                      className="admin-input"
                      required
                    />
                  </FormField>
                  <FormField label="سعر الشراء / سعر التكلفة" required>
                    <input
                      type="number"
                      value={currentProduct.costPrice}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, costPrice: Number(e.target.value) })}
                      className="admin-input"
                      required
                    />
                  </FormField>
                  <FormField label="الخصم (%)">
                    <input
                      type="number"
                      value={currentProduct.discount}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, discount: Number(e.target.value) })}
                      className="admin-input"
                    />
                  </FormField>
                  <FormField label="المخزون" required>
                    <input
                      type="number"
                      value={currentProduct.stock}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })}
                      className="admin-input"
                      required
                    />
                  </FormField>
                  <div className="sm:col-span-2">
                    <FormField label="رابط الصورة" required>
                      <input
                        type="url"
                        value={currentProduct.imageUrl}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, imageUrl: e.target.value })}
                        className="admin-input text-left"
                        dir="ltr"
                        required
                      />
                    </FormField>
                  </div>
                  <div className="sm:col-span-2">
                    <FormField label="الوصف">
                      <textarea
                        value={currentProduct.description}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                        className="admin-input resize-none h-24"
                      />
                    </FormField>
                  </div>

                  <div className="sm:col-span-2 border-t border-slate-800 pt-6 mt-2">
                    <h4 className="text-white font-bold mb-4">معلومات إضافية</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="تاريخ الإصدار">
                        <input
                          type="date"
                          value={currentProduct.releaseDate}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, releaseDate: e.target.value })}
                          className="admin-input"
                        />
                      </FormField>
                      <FormField label="المطور">
                        <input
                          type="text"
                          value={currentProduct.developer}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, developer: e.target.value })}
                          className="admin-input"
                        />
                      </FormField>
                      <FormField label="اللغات (مفصولة بفاصلة)">
                        <input
                          type="text"
                          value={currentProduct.languages?.join(', ')}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, languages: e.target.value.split(',').map(s => s.trim()) })}
                          className="admin-input"
                        />
                      </FormField>
                    </div>
                  </div>

                  <div className="sm:col-span-2 border-t border-slate-800 pt-6 mt-2">
                    <h4 className="text-white font-bold mb-4">متطلبات التشغيل</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="نظام التشغيل">
                        <input
                          type="text"
                          value={currentProduct.requirements?.os}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, requirements: { ...currentProduct.requirements, os: e.target.value } })}
                          className="admin-input"
                        />
                      </FormField>
                      <FormField label="المعالج">
                        <input
                          type="text"
                          value={currentProduct.requirements?.processor}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, requirements: { ...currentProduct.requirements, processor: e.target.value } })}
                          className="admin-input"
                        />
                      </FormField>
                      <FormField label="الذاكرة">
                        <input
                          type="text"
                          value={currentProduct.requirements?.memory}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, requirements: { ...currentProduct.requirements, memory: e.target.value } })}
                          className="admin-input"
                        />
                      </FormField>
                      <FormField label="بطاقة العرض">
                        <input
                          type="text"
                          value={currentProduct.requirements?.graphics}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, requirements: { ...currentProduct.requirements, graphics: e.target.value } })}
                          className="admin-input"
                        />
                      </FormField>
                      <FormField label="التخزين">
                        <input
                          type="text"
                          value={currentProduct.requirements?.storage}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, requirements: { ...currentProduct.requirements, storage: e.target.value } })}
                          className="admin-input"
                        />
                      </FormField>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-800/50 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 text-slate-400 hover:text-white font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20"
                  >
                    <Save className="w-4 h-4" /> حفظ المنتج
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">
                  هل أنت متأكد من حذف هذا {deleteConfirm.type === 'product' ? 'المنتج' : 'الطلب'}؟
                </h3>
                {deleteConfirm.name && (
                  <p className="text-indigo-400 font-bold text-sm bg-indigo-500/10 py-1 px-3 rounded-full inline-block">
                    {deleteConfirm.name}
                  </p>
                )}
                <p className="text-slate-400">لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.</p>
                {deleteConfirm.type === 'product' && (
                  <input
                    type="text"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder={`اكتب "${deleteConfirm.name}" للتأكيد`}
                    className="admin-input"
                  />
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all"
                >
                  إلغاء
                </button>
                <button
                  disabled={deleteConfirm.type === 'product' && confirmInput !== deleteConfirm.name}
                  onClick={() => {
                    if (deleteConfirm.type === 'product') {
                      handleDelete(deleteConfirm.id);
                    } else {
                      handleDeleteOrder(deleteConfirm.id);
                    }
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                    deleteConfirm.type === 'product' && confirmInput !== deleteConfirm.name
                      ? 'bg-red-900/50 text-slate-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-500 shadow-red-600/20'
                  }`}
                >
                  حذف {deleteConfirm.type === 'product' ? 'المنتج' : 'الطلب'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delivery Info Modal */}
      <AnimatePresence>
        {deliveryModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeliveryModal(null)}
              className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6"
              dir="rtl"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">تسليم الطلب</h3>
                  <p className="text-xs text-slate-400">رقم الطلب: <span className="font-mono">{deliveryModal.id}</span></p>
                </div>
                <button onClick={() => setDeliveryModal(null)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">معلومات الحساب والمنتج</label>
                  <textarea
                    value={deliveryModal.info}
                    onChange={(e) => setDeliveryModal({ ...deliveryModal, info: e.target.value })}
                    placeholder="أدخل البريد الإلكتروني، كلمة السر، وأي تعليمات إضافية للعميل..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px] resize-none leading-relaxed"
                    autoFocus
                  />
                  <p className="text-[10px] text-slate-500">هذه المعلومات ستظهر للعميل فوراً بعد الضغط على "تم الإرسال".</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeliveryModal(null)}
                  className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(deliveryModal.id, 'completed', deliveryModal.info);
                    setDeliveryModal(null);
                  }}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> تم الإرسال والتسليم
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wallet Modal */}
      <AnimatePresence>
        {walletModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWalletModal(null)}
              className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-6"
              dir="rtl"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">تعديل رصيد المحفظة</h3>
                <p className="text-xs text-slate-400">{walletModal.email}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400">الرصيد الحالي: {formatPrice(walletModal.currentBalance)}</label>
                  <input
                    type="number"
                    value={walletModal.amount}
                    onChange={(e) => setWalletModal({ ...walletModal, amount: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="أدخل الرصيد الجديد..."
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setWalletModal(null)}
                  className="flex-1 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all text-sm"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => updateWalletBalance(walletModal.userId, Number(walletModal.amount))}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all text-sm shadow-lg shadow-emerald-600/20"
                >
                  حفظ الرصيد
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .admin-input {
          width: 100%;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .admin-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full blur-3xl`} />
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  </div>
);

const FormField = ({ label, children, required, placeholder }: any) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-slate-400 flex items-center gap-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);
