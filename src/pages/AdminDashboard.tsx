import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { 
  Package, Plus, Trash2, Edit2, LayoutDashboard, ShoppingBag, Users, X, Save, Filter, Search, Wallet, Truck
} from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export const AdminDashboard: React.FC = () => {
  // ... (تم الحفاظ على منطق Fetching والـ States مع تحسينها للبحث)
  
  // البحث عن العملاء
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  // تصفية المستخدمين
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => 
      u.displayName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [usersList, userSearchTerm]);

  // ... (بقية منطق تعديل الطلبات ومعلومات التسليم)

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 sm:p-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* هيدر اللوحة */}
        <header className="flex justify-between items-center bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-indigo-500" />
                لوحة الإدارة
            </h1>
        </header>

        {/* ... (التابات كما هي) ... */}

        {/* قسم العملاء مع شريط البحث */}
        {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <Search className="text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="بحث عن عميل..." 
                        className="bg-transparent w-full text-white outline-none"
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                    {filteredUsers.map(user => (
                        <div key={user.uid} className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                            <div className="text-right">
                                <p className="text-white font-bold text-sm">{user.displayName}</p>
                                <p className="text-slate-400 text-[10px]">{user.email}</p>
                            </div>
                            <button 
                                onClick={() => setWalletModal({ userId: user.uid, email: user.email, currentBalance: user.balance || 0, amount: '0' })}
                                className="bg-emerald-600/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1"
                            >
                                <Wallet size={12}/> إضافة رصيد
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>
        )}

        {/* نموذج إضافة منتج (مع الترتيب المطلوب: صورة، اسم، سعر، كمية، خصم، وصف) */}
        {showAddProduct && (
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800 p-6 rounded-2xl">
                {/* تم ترتيب المدخلات حسب طلبك */}
                <input type="url" placeholder="رابط الصورة" className="col-span-2 p-3 bg-slate-900 rounded-lg text-white" onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                <input type="text" placeholder="اسم المنتج" className="p-3 bg-slate-900 rounded-lg text-white" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <input type="number" placeholder="السعر" className="p-3 bg-slate-900 rounded-lg text-white" onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                <input type="number" placeholder="الكمية" className="p-3 bg-slate-900 rounded-lg text-white" onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
                <input type="number" placeholder="الخصم" className="p-3 bg-slate-900 rounded-lg text-white" onChange={e => setNewProduct({...newProduct, discount: Number(e.target.value)})} />
                <textarea placeholder="الوصف" className="col-span-2 p-3 bg-slate-900 rounded-lg text-white" onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
                <button type="submit" className="col-span-2 bg-indigo-600 p-3 rounded-lg text-white font-bold">حفظ المنتج</button>
            </form>
        )}
      </div>
      
      {/* مودال تسليم الطلب (خانة بنص الشاشة) */}
       {deliveryModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
             <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-lg border border-slate-700">
                <h2 className="text-white font-black mb-4">معلومات تسليم الحساب</h2>
                <textarea 
                    placeholder="ادخل معلومات الحساب هنا لإرسالها للعميل..."
                    className="w-full bg-slate-800 p-4 rounded-xl text-white h-40 mb-4"
                    onChange={(e) => setDeliveryModal({...deliveryModal, info: e.target.value})}
                />
                <div className="flex gap-2">
                    <button onClick={() => updateOrderStatus(deliveryModal.id, 'completed', deliveryModal.info)} className="flex-1 bg-emerald-600 p-3 rounded-xl font-bold text-white">إرسال التسليم</button>
                    <button onClick={() => setDeliveryModal(null)} className="flex-1 bg-slate-700 p-3 rounded-xl font-bold text-white">إلغاء</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
