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
    Store,
    AlertTriangle,
    XCircle
} from 'lucide-react';
import orderService from '../services/orderService';
import { configService } from '../services/configService';
import Button from '../components/common/Button';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [systemConfig, setSystemConfig] = useState(null);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
        fetchSystemConfig();
    }, [orderId]);

    const fetchSystemConfig = async () => {
        try {
            const config = await configService.getSystemConfig();
            setSystemConfig(config);
        } catch (error) {
            console.error('Failed to fetch system config:', error);
        }
    };

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

    const handleCancelOrder = async () => {
        if (!cancellationReason) {
            alert('Please select a reason for cancellation');
            return;
        }

        try {
            setCancelLoading(true);
            await orderService.cancelOrder(orderId, cancellationReason);
            setIsCancelModalOpen(false);
            fetchOrderDetails(); // Refresh to show cancelled status
            alert('Order cancelled successfully.');
        } catch (error) {
            console.error('Cancellation failed:', error);
            alert(error.message || 'Failed to cancel order');
        } finally {
            setCancelLoading(false);
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            setDownloadLoading(true);
            await orderService.downloadInvoice(orderId);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download invoice');
        } finally {
            setDownloadLoading(false);
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

    // Timeline Configuration
    const timelineEvents = order.statusHistory || [];
    const getDateForStatus = (status) => {
        const event = timelineEvents.find(e => e.status === status);
        return event ? event.timestamp : null;
    };

    const steps = [
        { id: 'pending', label: 'Order Placed', icon: Box, date: getDateForStatus('pending') || order.orderedAt },
        { id: 'processing', label: 'Processing', icon: Package, date: getDateForStatus('processing') },
        { id: 'shipped', label: 'Shipped', icon: Truck, date: getDateForStatus('shipped') },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle, date: getDateForStatus('delivered') }
    ];

    const getCurrentStepIndex = () => {
        const status = order.orderStatus.toLowerCase();
        if (status === 'delivered') return 4;
        if (status === 'out_for_delivery') return 3;
        if (status === 'shipped') return 3;
        if (status === 'processing') return 2;
        if (status === 'confirmed') return 2;
        return 1;
    };

    const currentStep = getCurrentStepIndex();
    const isCancelled = order.orderStatus === 'cancelled';
    const canCancel = ['pending', 'confirmed', 'processing', 'payment_pending'].includes(order.orderStatus);

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
                    {/* Actions moved to sidebar for better stacking/alignment */}
                </div>

                <div className="od-content-grid">
                    {/* Left Column: Timeline & Address */}
                    <div className="od-main">
                        {/* Status Card */}
                        <div className="od-card">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="od-section-title mb-0">Order Status</h2>
                                {isCancelled && (
                                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-bold flex items-center gap-2">
                                        <XCircle size={16} /> Cancelled
                                    </span>
                                )}
                            </div>

                            {!isCancelled ? (
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
                            ) : (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-800">
                                    <p className="font-medium">This order was cancelled on {new Date(order.cancelledAt).toLocaleDateString()}.</p>
                                    <p className="text-sm mt-1">Reason: {order.cancellationReason}</p>
                                </div>
                            )}

                            {/* Activity Log */}
                            <div className="status-history-log mt-8 pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-semibold mb-3 text-gray-500 uppercase tracking-wide">Activity Log</h3>
                                <div className="space-y-4">
                                    {order.statusHistory?.slice().reverse().map((event, idx) => (
                                        <div key={idx} className="flex gap-4 text-sm">
                                            <div className="text-gray-400 font-mono text-xs min-w-[120px] pt-1">
                                                {new Date(event.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div>
                                                <span className={`font-medium capitalize ${event.status === 'cancelled' ? 'text-red-600' : 'text-gray-800'}`}>
                                                    {event.status.replace(/_/g, ' ')}
                                                </span>
                                                {event.note && <p className="text-gray-500 text-xs mt-0.5">"{event.note}"</p>}
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
                        {/* Help & Support Card - Moved from Header */}
                        <div className="od-card">
                            <h2 className="od-section-title">Help & Support</h2>
                            <div className="flex flex-col gap-3">
                                <Button
                                    variant="outline"
                                    className="full-width justify-start"
                                    onClick={handleDownloadInvoice}
                                    disabled={downloadLoading}
                                >
                                    <FileText size={18} />
                                    {downloadLoading ? 'Downloading...' : 'Download Invoice'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="full-width justify-start"
                                    onClick={() => setIsHelpModalOpen(true)}
                                >
                                    <HelpCircle size={18} />
                                    Need Help?
                                </Button>
                            </div>
                        </div>

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
                                {order.handlingCharge > 0 && (
                                    <div className="price-row">
                                        <span>Handling Fee</span>
                                        <span>₹{order.handlingCharge.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="price-row">
                                    <span>Shipping</span>
                                    <span>{order.shippingCharge ? `₹${order.shippingCharge}` : 'Free'}</span>
                                </div>
                                <div className="price-row total">
                                    <span>Total</span>
                                    <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="od-actions-footer space-y-3">
                                {order.orderStatus === 'payment_pending' ? (
                                    <>
                                        <Button
                                            variant="primary"
                                            className="full-width"
                                            onClick={handleSyncPayment}
                                            disabled={syncLoading}
                                        >
                                            {syncLoading ? 'Checking...' : 'Verify Payment Status'}
                                        </Button>
                                    </>
                                ) : order.orderStatus === 'payment_failed' ? (
                                    <Button
                                        variant="primary"
                                        className="full-width"
                                        onClick={() => navigate('/payment', {
                                            state: {
                                                addressId: 'retry',
                                                existingOrderId: order._id,
                                                existingRazorpayOrderId: order.razorpayOrderId,
                                                existingOrderNumber: order.orderNumber,
                                                retryItems: order.items,
                                                retryAddress: order.shippingAddress,
                                                retryPricing: {
                                                    subtotal: order.subtotal || order.totalAmount,
                                                    shippingCharge: order.shippingCharge || 0,
                                                    handlingCharge: 0,
                                                    tax: 0,
                                                    grandTotal: order.totalAmount
                                                }
                                            }
                                        })}
                                    >
                                        Retry Payment
                                    </Button>
                                ) : canCancel ? (
                                    <Button
                                        variant="secondary"
                                        className="full-width text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                        onClick={() => setIsCancelModalOpen(true)}
                                    >
                                        Cancel Order
                                    </Button>
                                ) : !isCancelled && (
                                    <Button variant="secondary" className="full-width">
                                        <RotateCcw size={16} />
                                        Return Items
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Help Modal */}
            {isHelpModalOpen && (
                <div className="cancel-modal-overlay" onClick={() => setIsHelpModalOpen(false)}>
                    <div className="cancel-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <HelpCircle size={24} />
                                </div>
                                <h2 className="mb-0">How can we help?</h2>
                            </div>
                            <p>Our support team is available to assist you with your order.</p>
                        </div>

                        <div className="space-y-4 my-6">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Store size={20} className="text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Sold by</p>
                                    <p className="font-semibold text-gray-800">{order.sellerDetails?.businessName || 'Auto Hub Seller'}</p>
                                </div>
                            </div>

                            <a
                                href={`mailto:${systemConfig?.supportEmail || 'support@autohub.com'}`}
                                className="p-4 bg-white hover:bg-gray-50 transition-colors rounded-xl border border-gray-100 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <HelpCircle size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Email Support</p>
                                        <p className="font-semibold text-gray-800">{systemConfig?.supportEmail || 'support@autohub.com'}</p>
                                    </div>
                                </div>
                                <ArrowLeft size={18} className="rotate-180 text-gray-300 group-hover:text-blue-500 transition-colors" />
                            </a>

                            {systemConfig?.supportPhone && (
                                <div className="p-4 bg-white rounded-xl border border-gray-100 flex items-center gap-4">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                        <HelpCircle size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Call Support</p>
                                        <p className="font-semibold text-gray-800">{systemConfig.supportPhone}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <Button variant="primary" className="full-width" onClick={() => setIsHelpModalOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {isCancelModalOpen && (
                <div className="cancel-modal-overlay" onClick={() => setIsCancelModalOpen(false)}>
                    <div className="cancel-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Cancel Order</h2>
                            <p>Please select a reason for cancellation</p>
                        </div>

                        <div className="reason-options">
                            {['Ordered by mistake', 'Found cheaper price', 'Shipping time is too long', 'Changed my mind', 'Other'].map(reason => (
                                <label
                                    key={reason}
                                    className={`reason-option ${cancellationReason === reason ? 'selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="cancelReason"
                                        value={reason}
                                        checked={cancellationReason === reason}
                                        onChange={(e) => setCancellationReason(e.target.value)}
                                    />
                                    {reason}
                                </label>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <Button variant="secondary" onClick={() => setIsCancelModalOpen(false)}>
                                Keep Order
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleCancelOrder}
                                disabled={cancelLoading}
                            >
                                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetailPage;
