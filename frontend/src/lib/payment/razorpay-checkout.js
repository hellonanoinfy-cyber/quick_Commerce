/**
 * Loads Razorpay Checkout when live keys are configured on the API.
 */

function loadRazorpayScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay is only available in the browser.'));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay-checkout]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay.')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script.'));
    document.body.appendChild(script);
  });
}

/**
 * @param {object} options
 * @param {string} options.keyId
 * @param {string} options.razorpayOrderId
 * @param {number} options.amount — rupees
 * @param {string} [options.name]
 * @param {string} [options.email]
 * @param {string} [options.phone]
 * @param {function} options.onSuccess — (response) => void
 * @param {function} [options.onDismiss]
 */
export async function openRazorpayCheckout({
  keyId,
  razorpayOrderId,
  amount,
  name = '',
  email = '',
  phone = '',
  onSuccess,
  onDismiss,
}) {
  if (!keyId || !razorpayOrderId) {
    throw new Error('Razorpay key and order id are required.');
  }

  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      name: 'MummaXpress',
      description: 'Order payment',
      order_id: razorpayOrderId,
      prefill: {
        name: name || undefined,
        email: email || undefined,
        contact: phone || undefined,
      },
      theme: { color: '#6A0DAD' },
      handler: response => {
        onSuccess?.(response);
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          onDismiss?.();
          reject(new Error('Payment cancelled'));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', response => {
      reject(new Error(response?.error?.description || 'Payment failed'));
    });
    rzp.open();
  });
}
