let scriptPromise = null;

function loadRazorpayScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Could not load Razorpay checkout'));
    document.body.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Opens Razorpay Checkout. Resolves with { razorpayPaymentId, razorpayOrderId, razorpaySignature }
 * on success, rejects on dismiss/failure.
 */
export async function openRazorpayCheckout({ keyId, amount, currency, razorpayOrderId, name, email, contact, orderNumber }) {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: keyId,
      amount,
      currency,
      order_id: razorpayOrderId,
      name: 'B.I.R Hair India Factory',
      description: `Order ${orderNumber}`,
      prefill: { name, email, contact },
      theme: { color: '#C9A227' },
      handler: (response) => {
        resolve({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    });
    rzp.on('payment.failed', (response) => reject(new Error(response.error?.description || 'Payment failed')));
    rzp.open();
  });
}
