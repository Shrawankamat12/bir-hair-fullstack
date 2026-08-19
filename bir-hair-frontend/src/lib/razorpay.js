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

  /*
   * Map our store's selected payment method (from the
   * checkout page's own radio cards: card / upi / netbanking / wallet)
   * to the Razorpay Checkout "instrument" config.
   *
   * This is what makes Razorpay open showing ONLY the method
   * the customer picked on our own checkout page, instead of
   * always showing every method.
   */
  const methodInstrumentMap = {
    card: [{ method: 'card' }],
    upi: [{ method: 'upi' }],
    netbanking: [{ method: 'netbanking' }],
    wallet: [{ method: 'wallet' }],
  };

  const instruments =
    methodInstrumentMap[method] || [
      { method: 'upi' },
      { method: 'card' },
      { method: 'netbanking' },
      { method: 'wallet' },
    ];

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

      /*
       * Only show the instrument(s) matching the method
       * the customer selected on our own checkout page.
       * If no valid method is passed, fall back to showing
       * all standard methods (safety net).
       */
      config: {
        display: {
          blocks: {
            selected: {
              name: 'Pay using',
              instruments,
            },
          },

          sequence: ['block.selected'],

          preferences: {
            show_default_blocks: false,
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