import api from './api';

export async function createOrder(amount, userId) {
  try {
    if (!amount || amount <= 0) {
      return {
        success: false,
        orderId: null,
        amount: null,
        error: 'Invalid amount',
      };
    }

    const response = await api.post('/api/payment/order', {
      amount: Math.round(amount),
    });

    if (response.data && response.data.data) {
      return {
        success: true,
        orderId: response.data.data.id,
        amount: response.data.data.amount,
        currency: response.data.data.currency,
        receipt: response.data.data.receipt,
        error: null,
      };
    }

    return {
      success: false,
      orderId: null,
      amount: null,
      error: 'Unexpected response from server',
    };
  } catch (error) {
    const apiError = error.response?.data?.message || error.message || 'Network error';
    return {
      success: false,
      orderId: null,
      amount: null,
      error: apiError,
    };
  }
}

export async function verifyPayment(orderId, paymentId, signature, userId, bookName, transactionDetails, deliveryAddress) {
  try {
    if (!orderId || !paymentId || !signature) {
      return {
        success: false,
        message: null,
        error: 'Missing payment verification parameters',
      };
    }

    const response = await api.post('/api/payment/verify', {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      user: userId,
      book_name: bookName || 'Multiple items',
      transaction_details: transactionDetails || 'Voice order',
      delivery_address: deliveryAddress || 'Address pending',
    });

    if (response.data) {
      return {
        success: true,
        message: response.data.message || 'Payment verified successfully',
        error: null,
      };
    }

    return {
      success: false,
      message: null,
      error: 'Payment verification failed',
    };
  } catch (error) {
    const apiError = error.response?.data?.message || error.message || 'Network error';
    return {
      success: false,
      message: null,
      error: apiError,
    };
  }
}

export function handlePaymentError(error) {
  if (!error) return 'An unknown payment error occurred. Please try again.';

  const errorLower = typeof error === 'string' ? error.toLowerCase() : '';

  if (errorLower.includes('cancelled') || errorLower.includes('cancel')) {
    return 'Payment was cancelled. Say retry to try again, or keep shopping to return to browsing.';
  }

  if (errorLower.includes('invalid amount') || errorLower.includes('amount')) {
    return 'Amount error occurred. Please contact support or try again with a different payment method.';
  }

  if (errorLower.includes('network') || errorLower.includes('timeout') || errorLower.includes('connection')) {
    return 'Connection lost during payment. Don\'t worry, we\'re checking your payment status. Say retry to try again.';
  }

  if (errorLower.includes('insufficient') || errorLower.includes('declined')) {
    return 'Payment declined. Please check your payment details and try again, or use a different payment method.';
  }

  if (errorLower.includes('invalid signature') || errorLower.includes('verification failed')) {
    return 'Payment verification failed. Please contact support with your order details.';
  }

  if (errorLower.includes('expired') || errorLower.includes('session')) {
    return 'Payment session expired. Say retry to create a new payment session.';
  }

  return `Payment error: ${error}. Say retry to try again or contact support for assistance.`;
}

export function getOrderDetails(orderId, items, total) {
  if (!orderId || !items || items.length === 0) {
    return 'Order details not available.';
  }

  const itemsList = items
    .map((item, idx) => {
      const copies = item.quantity === 1 ? 'copy' : 'copies';
      return `Item ${idx + 1}: ${item.name}, ${item.quantity} ${copies}`;
    })
    .join('. ');

  return `Order number ${orderId}. Total amount: ${total} rupees. Items ordered: ${itemsList}`;
}

export function formatOrderForVoice(orderId, items, total) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemWord = itemCount === 1 ? 'item' : 'items';

  return `Your order ${orderId} for ${itemCount} ${itemWord} totaling ${total} rupees has been placed successfully.`;
}

export async function getUserOrders(userId) {
  try {
    if (!userId) {
      return {
        success: false,
        orders: [],
        error: 'User ID required',
      };
    }

    const response = await api.get(`/api/payment/user/${userId}/orders`);

    if (response.data) {
      return {
        success: true,
        orders: response.data,
        error: null,
      };
    }

    return {
      success: false,
      orders: [],
      error: 'Failed to fetch orders',
    };
  } catch (error) {
    const apiError = error.response?.data?.message || error.message || 'Network error';
    return {
      success: false,
      orders: [],
      error: apiError,
    };
  }
}

export function formatPriceForRazorpay(price) {
  return Math.round(price * 100);
}

export function formatPriceFromRazorpay(paise) {
  return Math.round(paise / 100);
}
