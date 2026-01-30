import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Box,
    Truck,
    CheckCircle,
    Package,
    MapPin,
    FileText,
    HelpCircle,
    RotateCcw,
    Store
} from 'lucide-react';
import orderService from '../services/orderService';
import Button from '../components/common/Button';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    // Auto-sync payment status if pending
    useEffect(() => {
        if (order && order.orderStatus === 'payment_pending' && order.razorpayOrderId) {
            console.log('🔄 Order in payment_pending, auto-synchronizing...');
            handleSyncPayment(true); // Silent sync
        }
    }, [order?.orderStatus]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrderById(orderId);
            setOrder(data);
        } catch (error) {
            console.error('Failed to load order:', error);
        } finally {
            setLoading(false);
        }
    };

    const [syncLoading, setSyncLoading] = useState(false);
    const handleSyncPayment = async (silent = false) => {
        if (!order?.razorpayOrderId) return;
        try {
            if (!silent) setSyncLoading(true);
            const result = await orderService.syncPayment(order.razorpayOrderId);
            if (result.status === 'success') {
                if (!silent) alert('Payment verified successfully!');
                fetchOrderDetails();
            } else {
                if (!silent) alert(result.message || 'No successful payment found yet.');
            }
        } catch (error) {
            console.error('Sync failed:', error);
            if (!silent) alert('Failed to synchronize payment. Please try again later.');
        } finally {
            if (!silent) setSyncLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="order-detail-page loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-detail-page error">
                <h2>Order not found</h2>
                <Button onClick={() => navigate('/orders')}>Go Back</Button>
            </div>
        );
    }

    // Dynamic Timeline using statusHistory
    // Mapping internal statuses to display steps
    const timelineEvents = order.statusHistory || [];

    // Helper to find date for a specific status
    const getDateForStatus = (status) => {
        const event = timelineEvents.find(e => e.status === status);
        return event ? event.timestamp : null;
    };

    // Define standard flow steps
    const steps = [
        { id: 'pending', label: 'Order Placed', icon: Box, date: getDateForStatus('pending') || order.orderedAt },
        { id: 'processing', label: 'Processing', icon: Package, date: getDateForStatus('processing') },
        { id: 'shipped', label: 'Shipped', icon: Truck, date: getDateForStatus('shipped') },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle, date: getDateForStatus('delivered') }
    ];

    const getCurrentStepIndex = () => {
        const status = order.orderStatus.toLowerCase();
        if (status === 'delivered') return 4;
        if (status === 'out_for_delivery') return 3; // Highlight shipped step fully or maybe add a step? For now 3.5 ish but let's say 3
        if (status === 'shipped') return 3;
        if (status === 'processing') return 2;
        if (status === 'confirmed') return 2;
        return 1;
    };

    const currentStep = getCurrentStepIndex();

    return (
        <div className="order-detail-page">
            <div className="od-container">
                {/* Header / Nav */}
                <div className="od-nav">
                    <button className="back-btn" onClick={() => navigate('/orders')}>
                        <ArrowLeft size={20} />
                        Back to Orders
                    </button>
                    <div className="od-seller-info">
                        {order.sellerDetails?.businessName && (
                            <span className="seller-badge">
                                <Store size={14} />
                                Sold by {order.sellerDetails.businessName}
                            </span>
                        )}
                    </div>
                </div>

                {/* Title Section */}
                <div className="od-header">
                    <div>
                        <h1 className="od-title">Order #{order.orderNumber}</h1>
                        <p className="od-date">
                            Placed on {new Date(order.orderedAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <div className="od-actions">
                        <Button variant="outline" className="action-btn">
                            <FileText size={16} />
                            Invoice
                        </Button>
                        <Button variant="outline" className="action-btn">
                            <HelpCircle size={16} />
                            Need Help?
                        </Button>
                    </div>
                </div>

                <div className="od-content-grid">
                    {/* Left Column: Timeline & Address */}
                    <div className="od-main">
                        {/* Timeline Card */}
                        <div className="od-card">
                            <h2 className="od-section-title">Tracking Status</h2>
                            <div className="timeline-wrapper">
                                <div className="timeline-track">
                                    <div
                                        className="timeline-progress"
                                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="timeline-steps">
                                    {steps.map((step, index) => {
                                        const isActive = index < currentStep;
                                        // Specific check for Cancelled state to show red? 
                                        // For now keeping simple green progress

                                        const Icon = step.icon;

                                        return (
                                            <div key={step.id} className={`timeline-step ${isActive ? 'active' : ''}`}>
                                                <div className="step-icon">
                                                    <Icon size={18} />
                                                </div>
                                                <div className="step-info">
                                                    <span className="step-label">{step.label}</span>
                                                    {step.date && isActive && (
                                                        <span className="step-date">
                                                            {new Date(step.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Detailed Status History Log */}
                            <div className="status-history-log mt-6 pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-semibold mb-3">Activity Log</h3>
                                <div className="space-y-3">
                                    {order.statusHistory?.slice().reverse().map((event, idx) => (
                                        <div key={idx} className="flex gap-3 text-sm">
                                            <div className="text-gray-500 min-w-[120px]">
                                                {new Date(event.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div>
                                                <span className="font-medium capitalize text-gray-800">{event.status.replace(/_/g, ' ')}</span>
                                                {event.note && <span className="text-gray-500 block text-xs">"{event.note}"</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="od-card">
                            <h2 className="od-section-title">Shipping Details</h2>
                            <div className="address-display">
                                <div className="address-icon">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3>{order.shippingAddress.fullName}</h3>
                                    <p>{order.shippingAddress.addressLine1}</p>
                                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                    <p>
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                    </p>
                                    <p className="phone-line">Phone: {order.shippingAddress.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="od-sidebar">
                        <div className="od-card">
                            <h2 className="od-section-title">Order Summary</h2>
                            <p className="item-count">{order.items.length} Items</p>

                            <div className="od-items-list">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="od-item">
                                        <img
                                            src={item.images?.[0] || '/placeholder-product.png'}
                                            alt={item.name}
                                            className="od-item-img"
                                        />
                                        <div className="od-item-details">
                                            <h3>{item.name}</h3>
                                            <div className="od-item-meta">
                                                <span className="qty">Qty: {item.quantity}</span>
                                                <span className="price">₹{item.price.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="od-pricing">
                                <div className="price-row">
                                    <span>Subtotal</span>
                                    <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="price-row">
                                    <span>Shipping</span>
                                    <span>{order.shippingCharge ? `₹${order.shippingCharge}` : 'Free'}</span>
                                </div>
                                <div className="price-row total">
                                    <span>Total</span>
                                    <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {order.orderStatus === 'payment_pending' ? (
                                <div className="od-actions-footer space-y-2">
                                    <Button
                                        variant="primary"
                                        className="full-width"
                                        onClick={handleSyncPayment}
                                        disabled={syncLoading}
                                    >
                                        {syncLoading ? 'Checking...' : 'Verify Payment Status'}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="full-width"
                                        onClick={() => navigate('/payment', { state: { addressId: order.shippingAddress?._id || 'retry' } })}
                                    >
                                        Retry Payment
                                    </Button>
                                </div>
                            ) : order.orderStatus === 'payment_failed' ? (
                                <div className="od-actions-footer">
                                    <Button
                                        variant="primary"
                                        className="full-width"
                                        onClick={() => navigate('/payment', { state: { addressId: 'retry' } })}
                                    >
                                        Retry Payment
                                    </Button>
                                </div>
                            ) : order.orderStatus === 'pending' || order.orderStatus === 'confirmed' ? (
                                <div className="od-actions-footer">
                                    <Button variant="danger" className="full-width" onClick={() => {/* Cancel logic */ }}>
                                        Cancel Order
                                    </Button>
                                </div>
                            ) : (
                                <div className="od-actions-footer">
                                    <Button variant="secondary" className="full-width">
                                        <RotateCcw size={16} />
                                        Return Items
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
