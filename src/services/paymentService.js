const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const paymentService = {
    // Check if Razorpay script is loaded
    isRazorpayLoaded: () => {
        return typeof window.Razorpay !== 'undefined';
    },

    // Load Razorpay script dynamically
    loadRazorpayScript: () => {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (paymentService.isRazorpayLoaded()) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
            document.body.appendChild(script);
        });
    },

    // Open Razorpay checkout
    openCheckout: async (options) => {
        try {
            // Ensure Razorpay is loaded
            await paymentService.loadRazorpayScript();

            if (!RAZORPAY_KEY_ID) {
                throw new Error('Razorpay key not configured');
            }

            return new Promise((resolve, reject) => {
                const rzp = new window.Razorpay({
                    key: RAZORPAY_KEY_ID,
                    ...options,
                    handler: (response) => {
                        resolve(response);
                    },
                    modal: {
                        ondismiss: () => {
                            reject(new Error('Payment cancelled by user'));
                        },
                        escape: false,
                        backdropclose: false
                    }
                });

                rzp.on('payment.failed', (response) => {
                    reject({
                        code: response.error.code,
                        message: response.error.description,
                        reason: response.error.reason
                    });
                });

                rzp.open();
            });
        } catch (error) {
            console.error('Razorpay checkout error:', error);
            throw error;
        }
    }
};

export default paymentService;
