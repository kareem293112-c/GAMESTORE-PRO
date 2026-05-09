import React, { useState } from 'react';
import { ShoppingCart, Star, Heart, Monitor, Zap, Eye } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [flyIcon, setFlyIcon] = useState<{ x: number, y: number } | null>(null);

  const discountedPrice = product.price * (1 - (product.discount || 0) / 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    const btn = e.currentTarget as HTMLButtonElement;
    const rect = btn.getBoundingClientRect();
    const cartBtn = document.getElementById('cart-button');
    
    if (cartBtn) {
      const cartRect = cartBtn.getBoundingClientRect();
      setFlyIcon({
        x: cartRect.left - rect.left,
        y: cartRect.top - rect.top
      });
    }

    addToCart(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setFlyIcon(null);
    }, 5000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group relative bg-[#1e293b]/60 rounded-none hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 p-0"
        dir="rtl"
      >
        {product.discount > 0 && (
          <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg">
            -{product.discount}%
          </div>
        )}

        <div className="relative overflow-hidden aspect-[4/3] bg-slate-800">
          <div className="absolute top-2 -left-2 z-20">
            <div className="relative bg-[#3b82f6] text-white text-[10px] font-bold px-3 py-1 shadow-md
              after:content-[''] after:absolute after:top-full after:left-0 after:border-t-[5px] after:border-t-[#1d4ed8] after:border-l-[5px] after:border-l-transparent">
              مراجعة التسليم
            </div>
          </div>

          <Link to={`/product/${product.id}`} className="block w-full h-full">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-500"
            />
          </Link>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60 pointer-events-none"></div>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/40 backdrop-blur-[2px]">
            <button
              onClick={() => setIsQuickViewOpen(true)}
              className="px-3 py-1.5 bg-white text-slate-900 rounded-lg font-bold text-[10px] flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              <Eye className="w-3.5 h-3.5" />
              عرض سريع
            </button>
          </div>

          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-indigo-600/20 backdrop-blur-md border border-indigo-500/30 rounded-md">
            <Monitor className="w-2.5 h-2.5 text-indigo-400" />
            <span className="text-[9px] text-indigo-300 font-bold uppercase">{product.platform}</span>
          </div>
        </div>

        <div className="absolute top-2 right-2 z-10 p-1.5 bg-slate-900/60 backdrop-blur-md rounded-lg text-slate-400 hover:text-red-400 transition-colors">
          <Heart className="w-3.5 h-3.5" />
        </div>

      <div className="p-3 space-y-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
            <span className="bg-slate-800 px-1 py-0 rounded uppercase">{product.category}</span>
          </div>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-0.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 ${
                    i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-[9px] text-slate-500 font-bold">({product.rating})</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                {product.discount > 0 && (
                  <span className="text-[9px] text-slate-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
                <span className="text-sm font-black text-white">
                  {formatPrice(discountedPrice)}
                </span>
              </div>
              <button
                onClick={(e) => isAdded ? navigate('/checkout') : handleAddToCart(e)}
                disabled={product.stock === 0}
                className={`relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-lg ${
                  product.stock > 0
                    ? isAdded 
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                {product.stock > 0 ? (
                  <>
                    <AnimatePresence>
                      {flyIcon && (
                        <motion.div
                          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                          animate={{ 
                            x: flyIcon.x, 
                            y: flyIcon.y, 
                            scale: 0.2, 
                            opacity: 0,
                            rotate: 360
                          }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute z-[100] pointer-events-none"
                        >
                          <img src={product.imageUrl} className="w-10 h-10 rounded-full object-cover shadow-2xl border-2 border-white" alt="" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {isAdded ? (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        إتمام الشراء
                      </motion.div>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        إضافة إلى السلة
                      </>
                    )}
                  </>
                ) : (
                  'نفذت الكمية'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {product.stock > 0 && product.stock < 10 && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-1 text-[10px]">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" /> مخزون منخفض
            </span>
            <span className="text-slate-500 font-bold">{product.stock} متبقي</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-amber-500 rounded-full ${product.stock < 10 ? 'animate-pulse shadow-[0_0_10px_2px_rgba(245,158,11,0.6)]' : ''}`} 
              style={{ width: `${Math.min((product.stock / 20) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>

      <QuickViewModal 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </>
  );
};
