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
        className="group relative flex flex-col bg-[#111827] rounded-xl hover:shadow-[0_0_30px_rgba(79,70,229,0.2)] hover:ring-1 hover:ring-indigo-500/50 transition-all duration-500 overflow-hidden border border-slate-800/60 hover:-translate-y-2"
        dir="rtl"
      >
        {/* Wishlist Heart */}
        <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
           <button className="p-2 bg-slate-900/80 backdrop-blur-md rounded-full text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-lg">
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 z-30 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            -{product.discount}%
          </div>
        )}

        {/* Image Section */}
        <div className="relative overflow-hidden aspect-[2/3] bg-slate-900">
          <Link to={`/product/${product.id}`} className="block w-full h-full">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80" />
          </Link>

          {/* Quick Platform Badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-0.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-md">
            <Monitor className="w-3 h-3 text-white/80" />
            <span className="text-[10px] text-white/90 font-bold uppercase tracking-wider">{product.platform}</span>
          </div>

          {/* Hover Actions Overlay */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 pb-6 pointer-events-none">
            <div className="w-full space-y-2 pointer-events-auto">
              <button
                onClick={() => setIsQuickViewOpen(true)}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border border-white/10 shadow-2xl"
              >
                <Eye className="w-4 h-4" />
                عرض السريع
              </button>
              
              <button
                onClick={(e) => isAdded ? navigate('/checkout') : handleAddToCart(e)}
                disabled={product.stock === 0}
                className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-2xl ${
                  product.stock > 0
                    ? isAdded 
                      ? 'bg-emerald-500 text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                 <ShoppingCart className="w-4 h-4" />
                 {product.stock > 0 ? (isAdded ? 'إتمام الشراء' : 'أضف للسلة') : 'نفذت الكمية'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-1 bg-gradient-to-b from-transparent to-slate-950/20">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{product.category}</span>
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] text-slate-400 font-bold">{product.rating}</span>
              </div>
            </div>
            
            <Link to={`/product/${product.id}`}>
              <h3 className="text-[15px] font-bold text-slate-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/50 flex flex-col gap-3">
            {/* Low Stock Indicator inside the card */}
            {product.stock > 0 && product.stock < 10 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-bold">
                  <span className="text-amber-400 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> مخزون منخفض
                  </span>
                  <span className="text-slate-500">{product.stock} متبقي</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                    style={{ width: `${(product.stock / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                {product.discount > 0 && (
                  <span className="text-[11px] text-slate-500 line-through mb-[-2px]">
                    {formatPrice(product.price)}
                  </span>
                )}
                <span className="text-lg font-black text-white tracking-tight">
                  {formatPrice(discountedPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <QuickViewModal 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </>
  );
};
