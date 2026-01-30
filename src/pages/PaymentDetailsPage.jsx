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
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(true);
    const [orderLoading, setOrderLoading] = useState(false);

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

            // Debug: Check phone format
            console.log('📞 Phone being sent:', orderData.shippingAddress.phone);
            console.log('📞 Phone length:', orderData.shippingAddress.phone?.length);
            console.log('📞 Selected address:', selectedAddress);

            if (paymentMethod === 'cod') {
                // ========== COD FLOW ==========
                const response = await orderService.createOrder({
                    ...orderData,
                    paymentMethod: 'cod'
                });

                // Clear cart
                clearCart();

                // Navigate to success page - if split, we show the first one or a general success
                const firstOrder = response.orders[0];
                navigate('/order-success', {
                    state: {
                        orderId: firstOrder._id,
                        orderNumber: firstOrder.orderNumber,
                        totalAmount: pricing.grandTotal,
                        orders: response.orders,
                        isSplitOrder: response.isSplitOrder,
                        paymentMethod: 'cod'
                    }
                });

            } else if (paymentMethod === 'online') {
                // ========== ONLINE PAYMENT FLOW ==========

                // 1. Create order in DB (before payment)
                const paymentInfo = await orderService.createOrderForPayment(orderData);

                // 2. Open Razorpay checkout modal 
                // Note: No need for separate initiatePayment as createOrderForPayment provides all details
                const paymentResponse = await paymentService.openCheckout({
                    order_id: paymentInfo.razorpayOrderId,
                    amount: paymentInfo.totalAmount,
                    currency: 'INR',
                    name: 'Auto Hub',
                    description: `Order Payment (${paymentInfo.count} orders)`,
                    image: '/logo.png',
                    prefill: {
                        name: selectedAddress.fullName,
                        contact: selectedAddress.phone,
                    },
                    notes: {
                        orderIds: paymentInfo.orderIds.join(','),
                    },
                    theme: {
                        color: '#2563eb'
                    }
                });

                // 3. Verify payment and update order
                const verifyResult = await orderService.verifyPayment(
                    null, // orderId not needed in new verify endpoint
                    paymentResponse
                );

                // 4. Clear cart
                clearCart();

                // 5. Navigate to success page
                navigate('/order-success', {
                    state: {
                        orderId: paymentInfo.orderIds[0],
                        orderNumbers: verifyResult.orderNumbers,
                        totalAmount: paymentInfo.totalAmount,
                        paymentMethod: 'online',
                        paymentId: paymentResponse.razorpay_payment_id
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
            if (err.message === 'Payment cancelled by user') {
                alert('Payment was cancelled. Your order has been saved and you can retry payment from My Orders page.');
                return;
            }

            // Handle Razorpay payment failures
            if (err.code) {
                alert(`Payment failed: ${err.message || 'Please try again'}`);
                return;
            }

            // Handle general errors
            alert(err.message || 'Failed to place order. Please try again.');
        } finally {
            setOrderLoading(false);
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
        </div>
    );
}

export default PaymentDetailsPage;
