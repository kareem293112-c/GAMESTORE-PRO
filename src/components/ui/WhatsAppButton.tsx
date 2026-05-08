import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const WhatsAppButton: React.FC = () => {
  const whatsappNumber = "+905360167664";
  const message = "مرحباً، أريد الاستفسار عن منتج في متجركم.";

  return (
    <motion.a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-24 left-6 z-[100] bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-600 transition-colors flex items-center justify-center group"
      id="whatsapp-float-button"
    >
      <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-800">
        تحدث معنا مباشرة
      </span>
      <MessageCircle className="w-6 h-6" />
    </motion.a>
  );
};
