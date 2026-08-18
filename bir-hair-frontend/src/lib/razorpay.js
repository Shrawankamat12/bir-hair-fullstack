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
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Could not load Razorpay checkout'));
    };

    document.body.appendChild(script);
  });

  return scriptPromise;
}

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

  if (!window.Razorpay) {
    throw new Error('Razorpay Checkout could not be loaded');
  }

  if (!keyId) {
    throw new Error('Razorpay Key ID is missing');
  }

  if (!razorpayOrderId) {
    throw new Error('Razorpay Order ID is missing');
  }

  return new Promise((resolve, reject) => {
    let completed = false;

    const options = {
      key: keyId,

      amount: Number(amount),

      currency: currency || 'INR',

      order_id: razorpayOrderId,

      name: 'B.I.R Hair India Factory',

      description: `Order ${orderNumber || ''}`,

      prefill: {
        name: name || '',
        email: email || '',
        contact: contact || '',
      },

      notes: {
        order_number: orderNumber || '',
      },

      theme: {
        color: '#C9A227',
      },

      // Razorpay will show the available payment methods
      // according to your Razorpay account configuration.
      config: {
        display: {
          blocks: {
            banks: {
              name: 'Recommended Payment Methods',
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

          sequence: [
            'block.banks',
            'upi',
            'card',
            'netbanking',
            'wallet',
          ],

          preferences: {
            show_default_blocks: true,
          },
        },
      },

      handler: function (response) {
        completed = true;

        resolve({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        });
      },

      modal: {
        ondismiss: function () {
          if (!completed) {
            reject(new Error('Payment cancelled'));
          }
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        reject(
          new Error(
            response?.error?.description ||
              response?.error?.reason ||
              'Payment failed'
          )
        );
      });

      rzp.open();
    } catch (error) {
      reject(
        new Error(error?.message || 'Unable to open Razorpay Checkout')
      );
    }
  });
}