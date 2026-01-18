import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Filter, ShoppingBag } from 'lucide-react';
import orderService from '../services/orderService';
import OrderCard from '../components/orders/OrderCard';
import Button from '../components/common/Button';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const fetchedOrders = await orderService.getMyOrders();
            // Sort by most recent
            const sortedOrders = fetchedOrders.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setOrders(sortedOrders);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const getFilteredOrders = () => {
        let filtered = orders;

        // 1. Status Filter
        if (filter !== 'all') {
            if (filter === 'ongoing') {
                filtered = filtered.filter(order =>
                    !['delivered', 'cancelled', 'returned'].includes(order.orderStatus.toLowerCase())
                );
            } else if (filter === 'delivered') {
                filtered = filtered.filter(order =>
                    order.orderStatus.toLowerCase() === 'delivered'
                );
            } else if (filter === 'cancelled') {
                filtered = filtered.filter(order =>
                    order.orderStatus.toLowerCase() === 'cancelled'
                );
            }
        }

        // 2. Search Filter (Order ID or Product Name)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(order =>
                order.orderNumber.toLowerCase().includes(query) ||
                order.items.some(item => item.name.toLowerCase().includes(query))
            );
        }

        return filtered;
    };

    const filteredOrders = getFilteredOrders();

    if (loading) {
        return (
            <div className="orders-page loading">
                <div className="loading-spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="orders-container">
                <div className="orders-header">
                    <h1 className="page-title">My Orders</h1>

                    <div className="orders-controls">
                        <div className="search-wrapper">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by order # or item name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="orders-search"
                            />
                        </div>
                    </div>
                </div>

                <div className="orders-tabs">
                    <button
                        className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Orders
                    </button>
                    <button
                        className={`tab-btn ${filter === 'ongoing' ? 'active' : ''}`}
                        onClick={() => setFilter('ongoing')}
                    >
                        Ongoing
                    </button>
                    <button
                        className={`tab-btn ${filter === 'delivered' ? 'active' : ''}`}
                        onClick={() => setFilter('delivered')}
                    >
                        Delivered
                    </button>
                    <button
                        className={`tab-btn ${filter === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setFilter('cancelled')}
                    >
                        Cancelled
                    </button>
                </div>

                <div className="orders-content">
                    {filteredOrders.length > 0 ? (
                        <div className="orders-grid">
                            {filteredOrders.map(order => (
                                <OrderCard key={order._id} order={order} />
                            ))}
                        </div>
                    ) : (
                        <div className="orders-empty">
                            <ShoppingBag size={48} />
                            <h2>No orders found</h2>
                            <p>
                                {searchQuery
                                    ? "We couldn't find any orders matching your search."
                                    : "You haven't placed any orders yet."}
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/products')}
                            >
                                Start Shopping
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyOrdersPage;
