import { doc, runTransaction, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * دالة إلغاء الطلب وإرجاع المال للمستخدم وتحديث المخزون
 * @param orderId معرف الطلب
 * @param userId معرف المستخدم صاحب الطلب
 * @param amount المبلغ المراد استرداده
 * @param productId معرف المنتج لإعادة القطعة للمخزن
 */
export const refundOrder = async (orderId: string, userId: string, amount: number, productId: string) => {
  try {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', userId);
      const orderRef = doc(db, 'orders', orderId);
      const productRef = doc(db, 'products', productId);

      // 1. إعادة المبلغ لرصيد المستخدم (باستخدام increment للزيادة)
      transaction.update(userRef, {
        balance: increment(amount)
      });

      // 2. تحديث حالة الطلب إلى ملغي
      transaction.update(orderRef, {
        status: 'cancelled',
        refunded: true,
        updatedAt: serverTimestamp()
      });

      // 3. إعادة القطعة للمخزن (العداد الذي يظهر في PES 2013 سيزيد 1)
      transaction.update(productRef, {
        stock: increment(1) 
      });
    });
    
    return { success: true };
  } catch (error) {
    console.error("خطأ في عملية الاسترداد:", error);
    throw error;
  }
};
