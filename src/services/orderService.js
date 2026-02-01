import { fetchWithCredentials } from '../config/api';

const API_URL = import.meta.env.VITE_API_URL;

const orderService = {
    // Create COD order (direct)
    createOrder: async (orderData) => {
        try {
            const data = await fetchWithCredentials(`${API_URL}/orders`, {
                method: 'POST',
                body: JSON.stringify(orderData),
            });
            // Returns { orders, isSplitOrder }
            return data.data;
        } catch (error) {
            console.error('Order creation failed:', error);
            throw error;
        }
    },

    // Create order for online payment (before payment)
    createOrderForPayment: async (orderData) => {
        try {
            const data = await fetchWithCredentials(`${API_URL}/orders/create-for-payment`, {
                method: 'POST',
                body: JSON.stringify(orderData),
            });
            // Returns { razorpayOrderId, totalAmount, orderIds, count ... }
            return data.data;
        } catch (error) {
            console.error('Order creation for payment failed:', error);
            throw error;
        }
    },

    // Initiate payment for order
    initiatePayment: async (orderId) => {
        try {
            const data = await fetchWithCredentials(`${API_URL}/orders/${orderId}/payment/initiate`, {
                method: 'POST',
            });
            return data.data;
        } catch (error) {
            console.error('Payment initiation failed:', error);
            throw error;
        }
    },

    // Verify payment and update order
    verifyPayment: async (orderId, paymentResponse) => {
        try {
            const data = await fetchWithCredentials(`${API_URL}/orders/payment/verify`, {
                method: 'POST',
                body: JSON.stringify({
                    razorpayOrderId: paymentResponse.razorpay_order_id,
                    razorpayPaymentId: paymentResponse.razorpay_payment_id,
                    razorpaySignature: paymentResponse.razorpay_signature,
                }),
            });
            // Returns { ordersCount, orderNumbers }
            return data.data;
        } catch (error) {
            console.error('Payment verification failed:', error);
            throw error;
        }
    },

    // Get my orders
    getMyOrders: async () => {
        try {
            const data = await fetchWithCredentials(`${API_URL}/orders/my-orders`);
            return data.data.orders;
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            throw error;
        }
    },

    // Get order by ID
    getOrderById: async (orderId) => {
        try {
            const data = await fetchWithCredentials(`${API_URL}/orders/${orderId}`);
            return data.data.order;
        } catch (error) {
            console.error('Failed to fetch order:', error);
            throw error;
        }
    },

    // Cancel order
    // Cancel order
    cancelOrder: async (orderId, reason) => {
        try {
            const data = await fetchWithCredentials(`${API_URL}/orders/${orderId}/cancel`, {
                method: 'POST',
                body: JSON.stringify({ reason }),
            });
            return data.data.order;
        } catch (error) {
            console.error('Failed to cancel order:', error);
            throw error;
        }
    },

    // Synchronize payment status with backend (manual retry)
    syncPayment: async (razorpayOrderId) => {
        try {
            const data = await fetchWithCredentials(`${API_URL}/orders/payment/sync`, {
                method: 'POST',
                body: JSON.stringify({ razorpayOrderId }),
            });
            return data.data;
        } catch (error) {
            console.error('Payment synchronization failed:', error);
            throw error;
        }
    },

    // Download Invoice
    downloadInvoice: async (orderId) => {
        try {
            // Use credentials: 'include' to send HTTP-only cookies
            const response = await fetch(`${API_URL}/orders/${orderId}/invoice`, {
                headers: {
                    // 'Authorization': ... // Not needed, using cookies
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                // Try to parse JSON error if possible
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.message || 'Failed to download invoice');
                } catch (e) {
                    throw new Error(errorText || 'Failed to download invoice');
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return true;
        } catch (error) {
            console.error('Invoice download failed:', error);
            throw error;
        }
    },
};

export default orderService;
