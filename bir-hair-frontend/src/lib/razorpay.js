let scriptPromise = null;

function loadRazorpayScript() {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';

    script.onload = () => resolve(true);
    script.onerror = () =>
      reject(new Error('Could not load Razorpay checkout'));

    document.body.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Opens Razorpay Checkout.
 *
 * Resolves with:
 * {
 *   razorpayPaymentId,
 *   razorpayOrderId,
 *   razorpaySignature
 * }
 */
export async function openRazorpayCheckout({
  keyId,
  amount,
  currency,
  razorpayOrderId,
  name,
  email,
  contact,
  orderNumber,
  method,
}) {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,

      amount,

      currency,

      order_id: razorpayOrderId,

      name: 'B.I.R Hair India Factory',

      description: `Order ${orderNumber}`,

      prefill: {
        name: name || '',
        email: email || '',
        contact: contact || '',
      },

      theme: {
        color: '#C9A227',
      },

      /*
       * Razorpay Checkout payment-method configuration.
       *
       * This tells Checkout which major payment categories
       * should be available.
       */
      config: {
        display: {
          blocks: {
            preferred: {
              name: 'Pay using',
              instruments: [
                {
                  method: 'upi',
                },
                {
                  method: 'card',
                },
                {
                  method: 'netbanking',
                },
                {
                  method: 'wallet',
                },
              ],
            },
          },

          sequence: ['block.preferred'],

          preferences: {
            show_default_blocks: true,
          },
        },
      },

      handler: (response) => {
        resolve({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        });
      },

      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled'));
        },
      },
    };

    /*
     * If user selected a payment category on our checkout page,
     * try to open that category first.
     *
     * Razorpay still controls which methods are actually available.
     */
    if (
      method === 'upi' ||
      method === 'card' ||
      method === 'netbanking' ||
      method === 'wallet'
    ) {
      options.config.display.preferences = {
        show_default_blocks: true,
      };
    }

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', (response) => {
      const description =
        response?.error?.description || 'Payment failed';

      reject(new Error(description));
    });

    rzp.open();
  });
}