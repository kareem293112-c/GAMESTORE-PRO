import React from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { formatPrice } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { items, removeItem: removeFromCart, updateQuantity, total, itemCount } = useCartStore();

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-md z-[60]"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-slate-900 shadow-2xl z-[70] flex flex-col border-l border-slate-800"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-100">سلة المشتريات</h2>
                <span className="text-xs bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                  {itemCount} قطع
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="bg-slate-800 p-6 rounded-full">
                    <ShoppingCart className="w-12 h-12 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-slate-200 font-bold">السلة فارغة</h3>
                    <p className="text-slate-500 text-sm">لم تقم بإضافة أي منتجات بعد</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center gap-1 group"
                  >
                    تسوق الآن <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 group"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-slate-200 line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-indigo-400 font-bold">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-700">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-indigo-400"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-indigo-400"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">الإجمالي:</span>
                  <span className="text-xl font-bold text-white">{formatPrice(total)}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 block text-center"
                >
                  إتمام الطلب
                </Link>
                <p className="text-[10px] text-slate-500 text-center">
                  * قد تطلب بعض الألعاب تفعيل في مناطق محددة. يرجى التأكد قبل الشراء.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
