import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// المكون الآن معطل تماماً ولن يظهر في الموقع
export const ActivityFeed: React.FC = () => {
  // بإرجاع null، نحن نخبر React ألا يرسم أي شيء على الشاشة
  return null;
};

// في حال كنت تستخدم export default في أماكن أخرى
export default ActivityFeed;
