import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, MapPin, CreditCard } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import './OrderCard.css';

const OrderCard = ({ order }) => {
    const navigate = useNavigate();

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Calculate total items
    const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="order-card" onClick={() => navigate(`/orders/${order._id}`)}>
            <div className="order-card-header">
                <div className="order-info">
                    <span className="order-number">Order #{order.orderNumber}</span>
                    <span className="order-date">
                        <Calendar size={14} />
                        {formatDate(order.createdAt)}
                    </span>
                </div>
                <OrderStatusBadge status={order.orderStatus} />
            </div>

            <div className="order-card-content">
                <div className="product-thumbnails">
                    {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="thumbnail-wrapper">
                            <img
                                src={item.images?.[0] || '/placeholder-product.png'}
                                alt={item.name}
                                className="product-thumbnail"
                            />
                            <span className="thumbnail-qty">x{item.quantity}</span>
                        </div>
                    ))}
                    {order.items.length > 3 && (
                        <div className="more-items">
                            +{order.items.length - 3}
                        </div>
                    )}
                </div>

                <div className="order-products-summary">
                    <h3>{order.items[0]?.name}</h3>
                    {order.items.length > 1 && (
                        <p className="secondary-text">
                            + {order.items.length - 1} more item{order.items.length > 2 ? 's' : ''}
                        </p>
                    )}
                </div>

                <div className="order-price">
                    <span className="label">Total Amount</span>
                    <span className="amount">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
            </div>

            <div className="order-card-footer">
                <div className="footer-info">
                    {order.paymentMethod === 'cod' ? (
                        <span className="payment-badge cod">Cash on Delivery</span>
                    ) : (
                        <span className="payment-badge online">Paid Online</span>
                    )}
                </div>
                <button className="view-details-btn">
                    View Details
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default OrderCard;
