import React, { useState } from 'react';
import { ShoppingCart, Star, Heart, Monitor, Zap, Eye } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useCartStore } from '../../store/useCartStore';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem: addToCart } = useCartStore();
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
        className="group relative flex flex-col bg-[#111827] rounded-2xl transition-all duration-500 overflow-hidden border border-slate-800/60 hover:border-indigo-500/50 hover:shadow-[0_0_40px_rgba(79,70,229,0.2)]"
        dir="rtl"
      >
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-500 pointer-events-none" />

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 z-30 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
            -{product.discount}%
          </div>
        )}

        {/* Image Section - Strict Vertical Aspect Ratio */}
        <div className="relative overflow-hidden aspect-[3/4] bg-slate-900">
          <Link to={`/product/${product.id}`} className="block w-full h-full">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Elegant Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
          </Link>

          {/* Hover Actions - GameSatış Style */}
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <div className="w-full max-w-[85%] space-y-2 pointer-events-auto scale-90 group-hover:scale-100 transition-transform duration-300">
              <button
                onClick={(e) => isAdded ? navigate('/checkout') : handleAddToCart(e)}
                disabled={product.stock === 0}
                className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-2xl shadow-orange-500/20 ${
                  product.stock > 0
                    ? isAdded 
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#ff6000] text-white hover:bg-[#ff7900] hover:scale-105 active:scale-95'
                    : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                }`}
              >
                 <ShoppingCart className="w-4 h-4" />
                 {product.stock > 0 ? (isAdded ? 'إتمام الشراء' : 'شراء الآن') : 'نفذت الكمية'}
              </button>
            </div>
          </div>

          {/* Platform Badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg">
            <Monitor className="w-3 h-3 text-white/80" />
            <span className="text-[10px] text-white/90 font-bold uppercase tracking-wider">{product.platform}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-1 bg-slate-900/40">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest bg-indigo-500/5 px-2 py-0.5 rounded-md border border-indigo-500/10">{product.category}</span>
              <div className="flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] text-slate-400 font-bold">{product.rating}</span>
              </div>
            </div>
            
            <Link to={`/product/${product.id}`}>
              <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors line-clamp-2 leading-tight">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/50">
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                {product.discount > 0 && (
                  <span className="text-[10px] text-slate-500 line-through mb-[-2px]">
                    {formatPrice(product.price)}
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-white tracking-tight">
                    {formatPrice(discountedPrice)}
                  </span>
                </div>
              </div>
              <div className="p-1.5 bg-slate-800/50 rounded-lg text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                <Eye className="w-4 h-4" />
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
