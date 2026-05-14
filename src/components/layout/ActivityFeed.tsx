import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  ClipboardList, 
  LogOut, 
  ShieldAlert,
  Key
} from 'lucide-react';

// استدعاء الفايربيز بالمسار الصحيح المعدل لتفادي خطأ الـ Build
import { auth } from '../../lib/firebase';

export const AdminLayout: React.FC = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* القائمة الجانبية للوحة التحكم */}
      <aside className="w-64 bg-slate-900 border-e border-slate-800 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-2 px-2 py-4 mb-6 border-b border-slate-800">
            <ShieldAlert className="w-6 h-6 text-indigo-500" />
            <span className="font-black text-lg tracking-wider">لوحة الإدارة</span>
          </div>

          <nav className="space-y-1">
            <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium">
              <LayoutDashboard className="w-5 h-5 text-slate-400" />
              <span>الرئيسية</span>
            </Link>
            
            <Link to="/admin/products" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium">
              <ShoppingBag className="w-5 h-5 text-slate-400" />
              <span>إدارة المنتجات</span>
            </Link>

            <Link to="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium">
              <ClipboardList className="w-5 h-5 text-slate-400" />
              <span>إدارة الطلبات</span>
            </Link>

            <Link to="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium">
              <Users className="w-5 h-5 text-slate-400" />
              <span>المستخدمين</span>
            </Link>

            <Link to="/admin/recharge" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium">
              <Key className="w-5 h-5 text-slate-400" />
              <span>أكواد الشحن</span>
            </Link>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <div className="px-3 py-2 mb-2 flex flex-col">
            <span className="text-xs text-slate-500 truncate">{user?.email}</span>
            <span className="text-xs text-indigo-400 font-bold mt-0.5">🎮 {profile?.role || 'المسؤول'}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي للوحة */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
