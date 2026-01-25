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
    RotateCcw
} from 'lucide-react';
import orderService from '../services/orderService';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
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

    // Timeline Steps Logic
    const steps = [
        { id: 'placed', label: 'Order Placed', icon: Box, date: order.orderedAt },
        { id: 'processing', label: 'Processing', icon: Package, date: order.createdAt }, // Fallback to createdAt
        { id: 'shipped', label: 'Shipped', icon: Truck, date: order.shippedAt },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle, date: order.deliveredAt }
    ];

    const getCurrentStepIndex = () => {
        const status = order.orderStatus.toLowerCase();
        if (status === 'delivered') return 4;
        if (status === 'shipped') return 3;
        if (status === 'processing' || status === 'confirmed') return 2;
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
                </div>

                {/* Title Section */}
                <div className="od-header">
                    <div>
                        <h1 className="od-title">Order #{order.orderNumber}</h1>
                        <p className="od-date">
                            Placed on {new Date(order.orderedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
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
                                        const isCompleted = index < currentStep - 1;
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

                            {/* Detailed Activity Mockup (Static for now, can be dynamic later) */}
                            {currentStep < 4 && order.orderStatus !== 'cancelled' && (
                                <div className="delivery-estimate">
                                    <div className="estimate-icon">
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <strong>On the way</strong>
                                        <p>Your package is being processed and will be shipped soon.</p>
                                    </div>
                                </div>
                            )}
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

                            <div className="od-actions-footer">
                                <Button variant="secondary" className="full-width">
                                    <RotateCcw size={16} />
                                    Return Items
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
