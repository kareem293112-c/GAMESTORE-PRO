import { callApi } from './api';

export const refundOrder = async (orderId: string, userId: string, amount: number) => {
  if (!orderId || !userId || !amount || amount <= 0) {
    throw new Error('Invalid input for refund');
  }

  await callApi(`/api/orders/${orderId}/refund`, {
    method: 'POST',
    body: JSON.stringify({ userId, amount })
  });
};
