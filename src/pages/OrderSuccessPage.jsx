import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, CreditCard, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import orderService from '../services/orderService';
import useCartStore from '../store/cartStore'; // Import Store
import './OrderSuccessPage.css';

function OrderSuccessPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const { clearCart } = useCartStore(); // Use global store

    // Get orderId from State OR URL (priority to state to avoid fetching if possible)
    const stateOrderId = location.state?.orderId;
    const urlOrderId = searchParams.get('orderId');
    const shouldClearCart = searchParams.get('clear_cart') === 'true'; // Check flag
    const effectiveOrderId = stateOrderId || urlOrderId;

    useEffect(() => {
        // Clear cart if flagged (e.g. from backend redirect)
        if (shouldClearCart) {
            clearCart();
            // Optional: Remove param from URL to prevent re-clearing on refresh (though harmless)
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('clear_cart');
            // We don't necessarily need to replace URL immediately, but it's cleaner.
        }

        // If we have state data, use it directly (no fetch needed)
        if (location.state?.orderId) {
            setOrderDetails(location.state);
            return;
        }

        // If we have URL ID but no state, fetch the order
        if (urlOrderId) {
            fetchOrderDetails(urlOrderId);
        } else {
            // No ID at all
            navigate('/');
        }
    }, [location.state, urlOrderId, navigate]);

    const fetchOrderDetails = async (id) => {
        try {
            setLoading(true);
            const order = await orderService.getOrderById(id);

            if (!order) {
                navigate('/'); // Or show error
                return;
            }

            // Normalize data to match state structure
            setOrderDetails({
                orderId: order._id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                paymentMethod: order.paymentMethod,
                paymentId: order.razorpayPaymentId, // If available
                orderNumbers: [order.orderNumber] // Assuming single fetch for now
            });

        } catch (error) {
            console.error("Failed to load order success details:", error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="order-success-page loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!orderDetails) {
        return null; // Or generic error
    }

    const {
        orderId,
        orderNumber,
        orderNumbers,
        totalAmount,
        paymentMethod,
        paymentId
    } = orderDetails;

    const displayOrderNumber = orderNumber || (orderNumbers && orderNumbers.length > 0 ? orderNumbers[0] : null);

    return (
        <div className="order-success-page">
            <div className="container">
                <div className="success-card">
                    {/* Success Icon */}
                    <div className="success-icon-wrapper">
                        <CheckCircle size={80} className="success-icon" />
                    </div>

                    {/* Success Message */}
                    <h1 className="success-title">Order Placed Successfully!</h1>
                    <p className="success-subtitle">
                        Thank you for your order. We've received your order and will process it shortly.
                    </p>

                    {/* Order Details */}
                    <div className="order-details-card">
                        <div className="detail-row">
                            <span className="detail-label">{orderNumbers && orderNumbers.length > 1 ? 'Order Numbers:' : 'Order Number:'}</span>
                            <span className="detail-value order-number">
                                {orderNumbers && orderNumbers.length > 1
                                    ? orderNumbers.map(n => `#${n}`).join(', ')
                                    : `#${displayOrderNumber}`
                                }
                            </span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Total Amount:</span>
                            <span className="detail-value amount">₹{totalAmount?.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Payment Method:</span>
                            <span className="detail-value">
                                {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                            </span>
                        </div>

                        {paymentId && (
                            <div className="detail-row">
                                <span className="detail-label">Payment ID:</span>
                                <span className="detail-value payment-id">{paymentId}</span>
                            </div>
                        )}

                        <div className="detail-row">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value status-badge">
                                {paymentMethod === 'cod' ? 'Pending' : 'Confirmed'}
                            </span>
                        </div>
                    </div>

                    {/* Info Messages */}
                    <div className="info-messages">
                        <div className="info-box">
                            <Package size={20} />
                            <p>
                                {paymentMethod === 'cod'
                                    ? 'Your order will be confirmed once our team verifies it.'
                                    : 'Your payment has been confirmed and order is being processed.'}
                            </p>
                        </div>
                        <div className="info-box">
                            <CreditCard size={20} />
                            <p>
                                You will receive order updates via email and SMS.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={() => navigate(`/orders/${orderId}`)}
                        >
                            View Order Details
                            <ArrowRight size={18} />
                        </Button>
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => navigate('/')}
                        >
                            Continue Shopping
                        </Button>
                    </div>

                    {/* Additional Info */}
                    <p className="help-text">
                        Need help? Contact our support team or check your order status in{' '}
                        <a href="/orders" onClick={(e) => { e.preventDefault(); navigate('/orders'); }}>
                            My Orders
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default OrderSuccessPage;
