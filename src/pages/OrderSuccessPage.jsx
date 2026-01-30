import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, CreditCard, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import './OrderSuccessPage.css';

function OrderSuccessPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        orderId,
        orderNumber,
        orderNumbers, // For split orders
        totalAmount,
        paymentMethod,
        paymentId
    } = location.state || {};

    const displayOrderNumber = orderNumber || (orderNumbers && orderNumbers.length > 0 ? orderNumbers[0] : null);

    useEffect(() => {
        // Redirect if no order data
        if (!orderId || !displayOrderNumber) {
            navigate('/');
        }
    }, [orderId, displayOrderNumber, navigate]);

    if (!orderId || !displayOrderNumber) {
        return null;
    }

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
