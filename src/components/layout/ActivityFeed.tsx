import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, CheckCircle } from 'lucide-react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Activity {
  id: string;
  user: string;
  product: string;
  timestamp: Date;
}

import { useLanguage } from '../../context/LanguageContext';

export const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { language, t } = useLanguage();

  useEffect(() => {
    // 1. Fetch real activity logs from the public 'activity' collection
    const q = query(
      collection(db, 'activity'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // ... same logic ...
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newActivities = snapshot.docs.map(doc => {
        const data = doc.data();
        const rawName = data.customerName || t('activity.fallbackUser');
        const product = data.productName || t('activity.fallbackProduct');
        const timestamp = data.createdAt?.toDate() || new Date();
        
        if (timestamp < thirtyDaysAgo) return null;

        const nameParts = rawName.trim().split(' ');
        let maskedName = rawName;
        if (nameParts.length > 1) {
          const lastChar = nameParts[nameParts.length - 1][0];
          maskedName = `${nameParts[0]} ${lastChar}.`;
        }

        return { id: doc.id, user: maskedName, product: product, timestamp: timestamp };
      }).filter((activity): activity is Activity => activity !== null);

      setActivities(newActivities);
      if (newActivities.length >= 1) setIsVisible(true);
    }, (error) => {
      // Gracefully handle common setup errors without flooding the console
      if (error.code === 'permission-denied') {
        process.env.NODE_ENV === 'development' && console.log("ActivityFeed: Permissions denied (check Firestore setup or rules).");
      } else {
        console.warn("ActivityFeed error:", error.message);
      }
      setIsVisible(false);
    });

    return () => unsubscribe();
  }, [t]);

  useEffect(() => {
    // Hide if no activities
    if (activities.length < 1) {
      setIsVisible(false);
      return;
    }

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 500);
    }, 7000);

    return () => clearInterval(interval);
  }, [activities.length]);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (language === 'ar') {
      if (diffInSeconds < 60) return 'منذ ثوانٍ';
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
      const diffInDays = Math.floor(diffInHours / 24);
      return `منذ ${diffInDays} يوم`;
    } else {
      if (diffInSeconds < 60) return 'Just now';
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (activities.length < 1) return null;

  const current = activities[currentIndex];

  return (
    <div className="fixed bottom-6 inset-inline-end-6 z-50 pointer-events-none">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={`${current.id}-${currentIndex}`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] pointer-events-auto"
          >
            <div className="bg-indigo-600/20 p-2 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-slate-200 text-xs font-bold">{current.user}</span>
                <span className="text-slate-500 text-[10px]">{t('activity.purchased')}</span>
              </div>
              <p className="text-white text-sm font-black truncate max-w-[200px]">
                {current.product}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <span className="text-slate-500 text-[10px]">{getTimeAgo(current.timestamp)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
