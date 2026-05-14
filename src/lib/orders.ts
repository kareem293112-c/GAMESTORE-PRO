import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const refundOrder = async (orderId: string, userId: string, amount: number) => {
  if (!orderId || !userId || !amount || amount <= 0) {
    throw new Error('Invalid input for refund');
  }

  const orderRef = doc(db, 'orders', orderId);
  const userRef = doc(db, 'users', userId);

  await runTransaction(db, async (transaction) => {
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists()) {
      throw new Error('Order does not exist');
    }

    const orderData = orderDoc.data();
    if (orderData.status === 'cancelled') {
        throw new Error('Order is already cancelled');
    }

    // Update user balance
    transaction.update(userRef, {
      balance: (await transaction.get(userRef)).data()?.balance + amount,
      updatedAt: serverTimestamp(),
    });

    // Update order status
    transaction.update(orderRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
  });
};
