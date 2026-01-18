import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, CreditCard, Truck } from 'lucide-react';
import useCartStore from '../store/cartStore';
import addressService from '../services/addressService';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import Button from '../components/common/Button';
import './PaymentDetailsPage.css';

function PaymentDetailsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { items, getTotalPrice, clearCart } = useCartStore();

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('online');
    const [loading, setLoading] = useState(true);
    const [orderLoading, setOrderLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [paymentError, setPaymentError] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);

    // Get addressId from navigation state
    const addressId = location.state?.addressId;

    useEffect(() => {
        // Redirect if no address selected or cart is empty
        if (!addressId || items.length === 0) {
            navigate('/checkout');
            return;
        }
        fetchAddress();
    }, [addressId, items, navigate]);

    const fetchAddress = async () => {
        try {
            setLoading(true);
            const addresses = await addressService.getAddresses();
            const address = addresses.find(addr => addr._id === addressId);

            if (!address) {
                alert('Address not found');
                navigate('/checkout');
                return;
            }

            setSelectedAddress(address);
        } catch (err) {
            console.error('Failed to fetch address:', err);

            // Check for auth error
            if (err.status === 401 || err.originalError?.status === 401) {
                alert('Your session has expired. Please login again.');
                navigate('/');
                return;
            }

            alert('Failed to load address. Please try again.');
            navigate('/checkout');
        } finally {
            setLoading(false);
        }
    };

    // Calculate pricing
    const calculatePricing = () => {
        const subtotal = getTotalPrice();
        const shippingCharge = subtotal >= 1000 ? 0 : 50;
        const handlingCharge = 20;
        const tax = 0; // Can add GST calculation if needed
        const grandTotal = subtotal + shippingCharge + handlingCharge + tax;

        return {
            subtotal,
            shippingCharge,
            handlingCharge,
            tax,
            grandTotal
        };
    };

    const pricing = calculatePricing();

    const handlePlaceOrder = async () => {
        setOrderLoading(true);

        try {
            // Prepare order data
            const orderData = {
                items: items.map(item => ({
                    _id: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    images: item.images
                })),
                shippingAddress: {
                    fullName: selectedAddress.fullName,
                    phone: selectedAddress.phone,
                    addressLine1: selectedAddress.addressLine1,
                    addressLine2: selectedAddress.addressLine2 || '',
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    zipCode: selectedAddress.zipCode,
                    country: selectedAddress.country
                },
                pricing: {
                    subtotal: pricing.subtotal,
                    shippingCharge: pricing.shippingCharge,
                    handlingCharge: pricing.handlingCharge,
                    tax: pricing.tax,
                    totalAmount: pricing.grandTotal
                }
            };

            if (paymentMethod === 'cod') {
                setLoadingStep('Creating your order...');
                // ========== COD FLOW ==========
                const order = await orderService.createOrder({
                    ...orderData,
                    paymentMethod: 'cod'
                });

                // Clear cart
                clearCart();

                // Navigate to success page
                navigate('/order-success', {
                    state: {
                        orderId: order._id,
                        orderNumber: order.orderNumber,
                        totalAmount: order.totalAmount,
                        paymentMethod: 'cod'
                    }
                });

            } else if (paymentMethod === 'online') {
                // ========== ONLINE PAYMENT FLOW ==========

                // 1. Create order in DB (before payment)
                setLoadingStep('Creating order...');
                const order = await orderService.createOrderForPayment(orderData);

                // 2. Initiate Razorpay payment
                setLoadingStep('Preparing payment gateway...');
                const paymentData = await orderService.initiatePayment(order._id);

                // 3. Open Razorpay checkout modal
                setLoadingStep('Opening payment...');
                setOrderLoading(false); // Hide loading overlay for Razorpay modal

                const paymentResponse = await paymentService.openCheckout({
                    order_id: paymentData.razorpayOrderId,
                    amount: paymentData.amount,
                    currency: paymentData.currency,
                    name: 'Auto Hub',
                    description: `Order ${order.orderNumber}`,
                    image: '/logo.png', // Your logo
                    prefill: {
                        name: selectedAddress.fullName,
                        contact: selectedAddress.phone,
                        email: '' // Add if you collect email
                    },
                    notes: {
                        orderId: order._id,
                        orderNumber: order.orderNumber
                    },
                    theme: {
                        color: '#2563eb'
                    }
                });

                // 4. Verify payment and update order
                setOrderLoading(true); // Show loading again
                setLoadingStep('Verifying payment...');
                const updatedOrder = await orderService.verifyPayment(
                    order._id,
                    paymentResponse
                );

                // 5. Clear cart
                clearCart();

                // 6. Navigate to success page
                navigate('/order-success', {
                    state: {
                        orderId: updatedOrder._id,
                        orderNumber: updatedOrder.orderNumber,
                        totalAmount: order.totalAmount,
                        paymentMethod: 'online',
                        paymentId: updatedOrder.razorpayPaymentId
                    }
                });
            }

        } catch (err) {
            console.error('Order placement failed:', err);

            // Handle authentication errors
            if (err.status === 401 || err.originalError?.status === 401) {
                alert('Your session has expired. Please login again.');
                navigate('/');
                return;
            }

            // Handle payment cancellation
            if (err.message === 'Payment cancelled by user' || err.message === 'Payment cancelled') {
                alert('Payment was cancelled. Your order has been saved. You can retry payment from My Orders page.');
                return;
            }

            // Handle Razorpay payment failures with detailed error
            if (err.code || err.error || (err.message && err.message.includes('Payment'))) {
                setPaymentError({
                    code: err.code || err.error?.code || 'PAYMENT_FAILED',
                    message: err.message || err.description || err.error?.description || 'Payment could not be completed',
                    reason: err.reason || err.error?.reason || 'Unknown',
                    method: paymentMethod,
                    amount: pricing.grandTotal,
                    timestamp: new Date().toISOString(),
                    details: err
                });
                setShowErrorModal(true);
                return;
            }

            // Handle general errors
            alert(err.message || 'Failed to place order. Please try again.');
        } finally {
            setOrderLoading(false);
            setLoadingStep('');
        }
    };

    if (loading) {
        return (
            <div className="payment-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading payment details...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <div className="container">
                {/* Header */}
                <div className="payment-header">
                    <button className="back-button" onClick={() => navigate('/checkout')}>
                        <ArrowLeft size={20} />
                        Back to Checkout
                    </button>
                    <h1 className="payment-title">Payment Details</h1>
                </div>

                <div className="payment-content">
                    {/* Main Content */}
                    <div className="payment-main">
                        {/* Shipping Address */}
                        <div className="section-card">
                            <div className="section-header">
                                <MapPin size={20} />
                                <h2>Shipping Address</h2>
                            </div>
                            <div className="address-display">
                                <div className="address-info">
                                    <p className="address-name">{selectedAddress.fullName}</p>
                                    <p className="address-phone" data-label="Phone:">{selectedAddress.phone}</p>
                                    <p className="address-line" data-label="Address:">{selectedAddress.addressLine1}</p>
                                    {selectedAddress.addressLine2 && (
                                        <p className="address-line" data-label="">{selectedAddress.addressLine2}</p>
                                    )}
                                    <p className="address-line" data-label="Location:">
                                        {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zipCode}
                                    </p>
                                    <p className="address-line" data-label="Country:">{selectedAddress.country}</p>
                                </div>
                                <button
                                    className="change-address-btn"
                                    onClick={() => navigate('/checkout')}
                                >
                                    Change Address
                                </button>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="section-card">
                            <div className="section-header">
                                <CreditCard size={20} />
                                <h2>Payment Method</h2>
                            </div>
                            <div className="payment-methods">
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className="payment-option-content">
                                        <Truck size={20} />
                                        <div>
                                            <strong>Cash on Delivery</strong>
                                            <p>Pay when you receive the order</p>
                                        </div>
                                    </div>
                                </label>
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="online"
                                        checked={paymentMethod === 'online'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className="payment-option-content">
                                        <CreditCard size={20} />
                                        <div>
                                            <strong>Online Payment</strong>
                                            <p>UPI, Cards, Net Banking</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="section-card">
                            <div className="section-header">
                                <Package size={20} />
                                <h2>Order Items ({items.length})</h2>
                            </div>
                            <div className="order-items">
                                {items.map((item) => (
                                    <div key={item._id} className="order-item">
                                        <img
                                            src={item.images?.[0] || '/placeholder-product.png'}
                                            alt={item.name}
                                            className="item-image"
                                        />
                                        <div className="item-details">
                                            <h3 className="item-name">{item.name}</h3>
                                            <p className="item-quantity">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="item-pricing">
                                            <p className="item-price">₹{item.price.toLocaleString('en-IN')}</p>
                                            <p className="item-total">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Price Breakdown */}
                    <div className="payment-sidebar">
                        <div className="price-card">
                            <h2 className="price-card-title">Price Details</h2>

                            <div className="price-breakdown">
                                <div className="price-row">
                                    <span>Subtotal ({items.length} items)</span>
                                    <span>₹{pricing.subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="price-row">
                                    <span>Shipping Charges</span>
                                    {pricing.shippingCharge === 0 ? (
                                        <span className="free-badge">FREE</span>
                                    ) : (
                                        <span>₹{pricing.shippingCharge}</span>
                                    )}
                                </div>
                                <div className="price-row">
                                    <span>Handling Charges</span>
                                    <span>₹{pricing.handlingCharge}</span>
                                </div>
                                {pricing.tax > 0 && (
                                    <div className="price-row">
                                        <span>Tax</span>
                                        <span>₹{pricing.tax}</span>
                                    </div>
                                )}
                            </div>

                            <div className="price-total">
                                <strong>Total Amount</strong>
                                <strong>₹{pricing.grandTotal.toLocaleString('en-IN')}</strong>
                            </div>

                            {pricing.subtotal >= 1000 && (
                                <p className="savings-message">
                                    You saved ₹50 on shipping!
                                </p>
                            )}

                            <Button
                                variant="primary"
                                fullWidth
                                onClick={handlePlaceOrder}
                                disabled={orderLoading}
                            >
                                {orderLoading ? 'Placing Order...' : 'Place Order'}
                            </Button>

                            <p className="terms-text">
                                By placing your order, you agree to our terms and conditions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Loading Overlay */}
            {orderLoading && (
                <div className="loading-overlay">
                    <div className="loading-content">
                        <div className="loading-spinner-large"></div>
                        <p className="loading-text">{loadingStep || 'Processing...'}</p>
                        <p className="loading-subtext">Please do not close this window</p>
                    </div>
                </div>
            )}

            {/* Payment Error Modal */}
            {showErrorModal && paymentError && (
                <div className="payment-error-modal-overlay" onClick={() => setShowErrorModal(false)}>
                    <div className="payment-error-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header error">
                            <h2>❌ Payment Failed</h2>
                        </div>

                        <div className="modal-body">
                            <div className="error-summary">
                                <h3>{paymentError.message}</h3>
                                <p className="error-reason">Reason: {paymentError.reason}</p>
                            </div>

                            <div className="error-details">
                                <h4>Transaction Details:</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Error Code:</span>
                                        <span className="detail-value">{paymentError.code}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Payment Method:</span>
                                        <span className="detail-value">{paymentError.method === 'online' ? 'Online Payment' : 'Cash on Delivery'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Amount:</span>
                                        <span className="detail-value">₹{paymentError.amount?.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Timestamp:</span>
                                        <span className="detail-value">{new Date(paymentError.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="error-help">
                                <p><strong>What happened?</strong></p>
                                <p>Your payment could not be processed. Don't worry, your order has been saved and no money has been deducted.</p>

                                <p className="mt-3"><strong>What you can do:</strong></p>
                                <ul>
                                    <li>Try a different payment method</li>
                                    <li>Check your card/account balance</li>
                                    <li>Contact your bank if the issue persists</li>
                                    <li>Retry payment from My Orders page</li>
                                </ul>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowErrorModal(false);
                                    setPaymentError(null);
                                }}
                            >
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setShowErrorModal(false);
                                    setPaymentError(null);
                                    // User can try placing order again
                                }}
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentDetailsPage;
