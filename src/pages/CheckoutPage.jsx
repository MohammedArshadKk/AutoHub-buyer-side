import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useCartStore from '../store/cartStore';
import addressService from '../services/addressService';
import AddressCard from '../components/checkout/AddressCard';
import AddAddressModal from '../components/checkout/AddAddressModal';
import Button from '../components/common/Button';
import './CheckoutPage.css';

function CheckoutPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, getTotalPrice } = useCartStore();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch addresses on mount
    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const data = await addressService.getAddresses();
            setAddresses(data);

            // Auto-select default address or first address
            const defaultAddr = data.find(addr => addr.isDefault);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr._id);
            } else if (data.length > 0) {
                setSelectedAddressId(data[0]._id);
            }
        } catch (err) {
            console.error('Failed to fetch addresses:', err);

            // Check if it's an authentication error
            if (err.status === 401 || err.originalError?.status === 401) {
                alert('Your session has expired. Please login again.');
                navigate('/');
                return;
            }

            setError('Failed to load addresses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (formData) => {
        try {
            const newAddress = await addressService.addAddress(formData);
            setAddresses(prev => [...prev, newAddress]);

            // If it's the first address, select it
            if (addresses.length === 0) {
                setSelectedAddressId(newAddress._id);
            }
        } catch (err) {
            console.error('Failed to add address:', err);

            // Check for auth error
            if (err.status === 401 || err.originalError?.status === 401) {
                alert('Your session has expired. Please login again.');
                navigate('/');
                return;
            }

            throw err;
        }
    };

    const handleUpdateAddress = async (formData) => {
        try {
            const updatedAddress = await addressService.updateAddress(editingAddress._id, formData);
            setAddresses(prev =>
                prev.map(addr => (addr._id === updatedAddress._id ? updatedAddress : addr))
            );
        } catch (err) {
            console.error('Failed to update address:', err);

            // Check for auth error
            if (err.status === 401 || err.originalError?.status === 401) {
                alert('Your session has expired. Please login again.');
                navigate('/');
                return;
            }

            throw err;
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            await addressService.deleteAddress(addressId);
            setAddresses(prev => prev.filter(addr => addr._id !== addressId));

            // If deleted address was selected, select first remaining
            if (selectedAddressId === addressId && addresses.length > 1) {
                const remaining = addresses.filter(addr => addr._id !== addressId);
                setSelectedAddressId(remaining[0]?._id);
            }
        } catch (err) {
            // Check for auth error
            if (err.status === 401 || err.originalError?.status === 401) {
                alert('Your session has expired. Please login again.');
                navigate('/');
                return;
            }

            alert('Failed to delete address. Please try again.');
        }
    };

    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setShowAddModal(true);
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            await addressService.setDefaultAddress(addressId);
            // Update local state
            setAddresses(prev =>
                prev.map(addr => ({
                    ...addr,
                    isDefault: addr._id === addressId
                }))
            );
        } catch (err) {
            // Check for auth error
            if (err.status === 401 || err.originalError?.status === 401) {
                alert('Your session has expired. Please login again.');
                navigate('/');
                return;
            }

            alert('Failed to set default address. Please try again.');
        }
    };

    const handleProceedToPayment = () => {
        if (!selectedAddressId) {
            alert('Please select a delivery address');
            return;
        }

        // Navigate to payment with selected address
        navigate('/payment', {
            state: {
                addressId: selectedAddressId,
                address: addresses.find(addr => addr._id === selectedAddressId),
            },
        });
    };

    // Redirect if cart is empty
    if (items.length === 0) {
        return (
            <div className="checkout-page">
                <div className="checkout-container">
                    <div className="empty-cart">
                        <Package size={64} />
                        <h2>Your cart is empty</h2>
                        <p>Add items to your cart to proceed with checkout</p>
                        <Button onClick={() => navigate('/products')}>
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                {/* Header */}
                <div className="checkout-header">
                    <h1 className="checkout-title">Checkout</h1>
                    <div className="checkout-steps">
                        <div className="step active">1. Address</div>
                        <div className="step">2. Payment</div>
                        <div className="step">3. Review</div>
                    </div>
                </div>

                <div className="checkout-content">
                    {/* Address Section */}
                    <div className="checkout-main">
                        <div className="section-header">
                            <h2 className="section-title">Select Delivery Address</h2>
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={() => {
                                    setEditingAddress(null);
                                    setShowAddModal(true);
                                }}
                            >
                                <Plus size={18} />
                                Add New Address
                            </Button>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Loading addresses...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="error-container">
                                <p>{error}</p>
                                <Button onClick={fetchAddresses}>Retry</Button>
                            </div>
                        )}

                        {/* No Addresses */}
                        {!loading && !error && addresses.length === 0 && (
                            <div className="no-addresses">
                                <p>No saved addresses</p>
                                <Button
                                    onClick={() => setShowAddModal(true)}
                                >
                                    <Plus size={18} />
                                    Add Your First Address
                                </Button>
                            </div>
                        )}

                        {/* Address List */}
                        {!loading && !error && addresses.length > 0 && (
                            <div className="addresses-grid">
                                {addresses.map(address => (
                                    <AddressCard
                                        key={address._id}
                                        address={address}
                                        isSelected={selectedAddressId === address._id}
                                        onSelect={setSelectedAddressId}
                                        onEdit={handleEditAddress}
                                        onDelete={handleDeleteAddress}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="checkout-sidebar">
                        <div className="order-summary">
                            <h3 className="summary-title">Order Summary</h3>

                            <div className="summary-items">
                                {items.map(item => (
                                    <div key={item.id} className="summary-item">
                                        <img
                                            src={item.image || item.images?.[0]}
                                            alt={item.name}
                                            className="summary-item-image"
                                        />
                                        <div className="summary-item-details">
                                            <p className="summary-item-name">{item.name}</p>
                                            <p className="summary-item-qty">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="summary-item-price">
                                            ₹{((item.priceSnapshot || item.price) * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-total">
                                <div className="total-row">
                                    <span>Subtotal</span>
                                    <span>₹{getTotalPrice().toLocaleString()}</span>
                                </div>
                                <div className="total-row">
                                    <span>Shipping</span>
                                    <span className="free-badge">FREE</span>
                                </div>
                                <div className="total-row grand-total">
                                    <span>Total</span>
                                    <span>₹{getTotalPrice().toLocaleString()}</span>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                fullWidth
                                onClick={handleProceedToPayment}
                                disabled={!selectedAddressId || loading}
                            >
                                Proceed to Payment
                                <ArrowRight size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Address Modal */}
            <AddAddressModal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingAddress(null);
                }}
                onSave={editingAddress ? handleUpdateAddress : handleAddAddress}
                editingAddress={editingAddress}
            />
        </div>
    );
}

export default CheckoutPage;
