import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Star, ShieldCheck, Zap, Monitor, Globe, Clock, Calendar, Briefcase, Languages } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();

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

  if (!product) return null;

  const discountedPrice = product.price * (1 - (product.discount || 0) / 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" dir="rtl">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-20 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Product Image & Badges (md: 40%) */}
            <div className="relative w-full md:w-[40%] h-64 md:h-auto bg-slate-800">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-[10px] font-bold border border-indigo-500/20 uppercase w-fit">
                  {product.platform}
                </span>
                <span className="px-3 py-1 bg-slate-900 text-slate-400 rounded-full text-[10px] font-bold border border-slate-700 uppercase w-fit">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Right: Product Info (md: 60%) */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-8 text-right">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold">{product.rating} / 5.0</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{product.name}</h2>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-4">
                  {product.description || "لا يوجد وصف متوفر لهذا المنتج حالياً."}
                </p>
              </div>

              {/* Pricing & Cart Action */}
              <div className="p-6 bg-slate-800/30 border border-slate-800 rounded-2xl space-y-6">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{formatPrice(discountedPrice)}</span>
                    {product.discount > 0 && (
                      <span className="text-sm text-slate-500 line-through">{formatPrice(product.price)}</span>
                    )}
                  </div>
                  {product.discount > 0 && (
                    <span className="bg-red-600/10 text-red-500 text-[10px] font-black px-2 py-1 rounded">
                      خصم {product.discount}%
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    addToCart(product);
                    toast.success('تمت الإضافة للسلة');
                  }}
                  disabled={product.stock === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black py-4 rounded-xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.stock > 0 ? 'إضافة إلى السلة' : 'نفذت الكمية'}
                </button>
              </div>

              {/* Specs & Info */}
              <div className="grid grid-cols-2 gap-4 text-right">
                <div className="space-y-3">
                  <QuickInfo icon={Clock} label="التسليم" value="رقمي فوري" />
                  <QuickInfo icon={ShieldCheck} label="الضمان" value="دائم ومضمون" />
                </div>
                <div className="space-y-3">
                  {product.releaseDate && <QuickInfo icon={Calendar} label="تاريخ الإصدار" value={product.releaseDate} />}
                  {product.developer && <QuickInfo icon={Briefcase} label="المطور" value={product.developer} />}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const QuickInfo = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-indigo-400">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-[10px] text-slate-500 font-bold uppercase leading-none">{label}</p>
      <p className="text-xs text-slate-300 font-bold">{value}</p>
    </div>
  </div>
);
