import { createOrder, verifyPayment, handlePaymentError, formatOrderForVoice } from '../services/paymentService';
import commandParser from '../dialogue/CommandParser';

export const createCheckoutFlow = (cartContext, userId, userEmail, onPaymentSuccess, onCancel) => {
  return async (userInput, flowState) => {
    const { step, orderId, paymentId, signature, deliveryAddress, retryCount = 0 } = flowState;

    const cartSummary = cartContext.getCartSummary();
    const { items, total, itemCount } = cartSummary;

    switch (step) {
      case 'init': {
        if (itemCount === 0) {
          return {
            response: 'Your cart is empty. Say browse books to add items.',
            completed: true,
            requiresInput: false,
          };
        }

        if (!userId) {
          return {
            response: 'Please log in to complete checkout. Say log in to continue.',
            completed: true,
            requiresInput: false,
          };
        }

        const itemWord = itemCount === 1 ? 'item' : 'items';
        const itemsList = items
          .map((item, idx) => {
            const copies = item.quantity === 1 ? 'copy' : 'copies';
            return `Item ${idx + 1}: ${item.name}, ${item.quantity} ${copies} at ${item.price} rupees each`;
          })
          .join('. ');

        return {
          response: `Let me confirm your order. You have ${itemCount} ${itemWord}. ${itemsList}. Subtotal: ${total} rupees. Is this correct? Say yes to continue or no to modify.`,
          flowState: { ...flowState, step: 'review-order' },
          requiresInput: true,
        };
      }

      case 'review-order': {
        const confirmation = commandParser.parseConfirmation(userInput);

        if (confirmation.confirmed === false) {
          if (onCancel) {
            onCancel();
          }
          return {
            response: 'Returning to cart. Say view cart to make changes.',
            completed: true,
            requiresInput: false,
            action: 'back-to-cart',
          };
        }

        if (confirmation.confirmed === true) {
          return {
            response: `Your final total is ${total} rupees. This amount will be charged to your account. Say confirm to proceed with payment, or cancel to go back.`,
            flowState: { ...flowState, step: 'confirm-total' },
            requiresInput: true,
          };
        }

        return {
          response: 'Please say yes to confirm order, or no to modify.',
          flowState,
          requiresInput: true,
        };
      }

      case 'confirm-total': {
        if (/\b(cancel|go back|stop)\b/i.test(userInput)) {
          if (onCancel) {
            onCancel();
          }
          return {
            response: 'Payment cancelled. Your cart is saved. Say view cart or continue shopping.',
            completed: true,
            requiresInput: false,
            action: 'back-to-cart',
          };
        }

        if (/\b(confirm|proceed|yes|continue)\b/i.test(userInput)) {
          return {
            response: 'Collecting delivery address. Please tell me your complete delivery address.',
            flowState: { ...flowState, step: 'collect-address' },
            requiresInput: true,
          };
        }

        return {
          response: 'Please say confirm to proceed with payment, or cancel to go back.',
          flowState,
          requiresInput: true,
        };
      }

      case 'collect-address': {
        const address = userInput.trim();

        if (!address || address.length < 10) {
          return {
            response: 'Please provide a complete delivery address with at least 10 characters.',
            flowState,
            requiresInput: true,
          };
        }

        return {
          response: `I heard: ${address}. Say correct to confirm, or repeat to say it again.`,
          flowState: { ...flowState, step: 'confirm-address', tempAddress: address },
          requiresInput: true,
        };
      }

      case 'confirm-address': {
        const confirmation = commandParser.parseConfirmation(userInput);

        if (confirmation.confirmed === false) {
          return {
            response: 'Please tell me your delivery address again.',
            flowState: { ...flowState, step: 'collect-address' },
            requiresInput: true,
          };
        }

        if (confirmation.confirmed === true) {
          return {
            response: 'Processing payment. One moment please.',
            flowState: {
              ...flowState,
              step: 'create-order',
              deliveryAddress: flowState.tempAddress,
            },
            requiresInput: false,
          };
        }

        return {
          response: 'Please say correct to confirm, or repeat to say it again.',
          flowState,
          requiresInput: true,
        };
      }

      case 'create-order': {
        try {
          const orderResult = await createOrder(total, userId);

          if (!orderResult.success) {
            const errorMessage = handlePaymentError(orderResult.error);
            return {
              response: `Failed to create order. ${errorMessage}`,
              flowState: { ...flowState, step: 'error', error: orderResult.error },
              requiresInput: true,
            };
          }

          return {
            response: 'Order created. Opening payment window. A payment window has opened on your screen. Complete the payment using card, U P I, or net banking as shown. Say done when payment is complete, or cancel to stop.',
            flowState: {
              ...flowState,
              step: 'await-payment',
              orderId: orderResult.orderId,
              orderAmount: orderResult.amount,
            },
            requiresInput: true,
            action: 'open-razorpay',
            razorpayData: {
              orderId: orderResult.orderId,
              amount: orderResult.amount,
              currency: orderResult.currency,
              userEmail: userEmail || 'customer@example.com',
            },
          };
        } catch (error) {
          const errorMessage = handlePaymentError(error.message);
          return {
            response: `Error creating order. ${errorMessage}`,
            flowState: { ...flowState, step: 'error', error: error.message },
            requiresInput: true,
          };
        }
      }

      case 'await-payment': {
        if (/\b(cancel|stop|quit)\b/i.test(userInput)) {
          if (onCancel) {
            onCancel();
          }
          return {
            response: 'Payment cancelled. Your cart is still saved. Say try again to retry payment, or keep shopping to continue browsing.',
            completed: true,
            requiresInput: false,
            action: 'payment-cancelled',
          };
        }

        if (/\b(done|completed|finished|paid)\b/i.test(userInput)) {
          return {
            response: 'Verifying payment. Please wait.',
            flowState: { ...flowState, step: 'verify-payment' },
            requiresInput: false,
          };
        }

        return {
          response: 'Say done when payment is complete, or cancel to stop.',
          flowState,
          requiresInput: true,
        };
      }

      case 'verify-payment': {
        if (!paymentId || !signature) {
          return {
            response: 'Payment details missing. This usually means payment was not completed. Say retry to try again, or contact support if amount was deducted.',
            flowState: { ...flowState, step: 'error', error: 'Missing payment details' },
            requiresInput: true,
          };
        }

        try {
          const bookNames = items.map(item => item.name).join(', ');
          const transactionDetails = `Amount Paid: ${total} rupees`;

          const verifyResult = await verifyPayment(
            orderId,
            paymentId,
            signature,
            userId,
            bookNames,
            transactionDetails,
            deliveryAddress
          );

          if (!verifyResult.success) {
            const errorMessage = handlePaymentError(verifyResult.error);
            return {
              response: `Payment verification failed. ${errorMessage}`,
              flowState: { ...flowState, step: 'error', error: verifyResult.error },
              requiresInput: true,
            };
          }

          cartContext.clearCart();

          const orderMessage = formatOrderForVoice(orderId, items, total);

          if (onPaymentSuccess) {
            onPaymentSuccess({
              orderId,
              items,
              total,
              deliveryAddress,
            });
          }

          return {
            response: `Payment successful! ${orderMessage} Items will be delivered to your address. Confirmation email sent. Say browse books to continue shopping, or view orders to see your order history.`,
            completed: true,
            requiresInput: false,
            action: 'payment-success',
            orderData: {
              orderId,
              items,
              total,
              deliveryAddress,
            },
          };
        } catch (error) {
          const errorMessage = handlePaymentError(error.message);
          return {
            response: `Error verifying payment. ${errorMessage}`,
            flowState: { ...flowState, step: 'error', error: error.message },
            requiresInput: true,
          };
        }
      }

      case 'error': {
        if (/\b(retry|try again)\b/i.test(userInput)) {
          if (retryCount >= 3) {
            return {
              response: 'Maximum retry attempts reached. Please contact support or try again later. Your cart is saved.',
              completed: true,
              requiresInput: false,
            };
          }

          return {
            response: 'Retrying payment. One moment.',
            flowState: {
              ...flowState,
              step: 'create-order',
              retryCount: retryCount + 1,
              error: null,
            },
            requiresInput: false,
          };
        }

        if (/\b(keep shopping|continue shopping|browse)\b/i.test(userInput)) {
          if (onCancel) {
            onCancel();
          }
          return {
            response: 'Returning to browse. Your cart is saved.',
            completed: true,
            requiresInput: false,
            action: 'back-to-browse',
          };
        }

        return {
          response: 'Say retry to try payment again, keep shopping to continue browsing, or contact support for help.',
          flowState,
          requiresInput: true,
        };
      }

      default:
        return {
          response: 'Something went wrong with checkout. Say view cart to start over, or contact support for assistance.',
          completed: true,
          requiresInput: false,
        };
    }
  };
};
