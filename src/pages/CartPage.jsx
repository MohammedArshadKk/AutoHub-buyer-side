import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    Trash2,
    Minus,
    Plus,
    ChevronRight,
    ArrowLeft,
    Lock,
    Truck,
    Shield,
    Tag
} from 'lucide-react';
import Button from '../components/common/Button';
import useCartStore from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import './CartPage.css';

function CartPage() {
    const navigate = useNavigate();
    const {
        items,
        updateQuantity,
        removeItem,
        clearCart,
        getTotalItems,
        getTotalPrice,
        fetchCart,
        isLoading,
        openLoginModal,
    } = useCartStore();
    const { user } = useAuth();

    // Fetch cart from backend for authenticated users on mount
    useEffect(() => {
        if (user) {
            // Pass true to force fetch since we know we have a user
            // This avoids race condition where authChecker in store isn't set yet
            fetchCart(true);
        }
    }, [user, fetchCart]);

    const totalItems = getTotalItems();
    const subtotal = getTotalPrice();
    const shipping = subtotal > 100 ? 0 : 15;
    const tax = subtotal * 0.08; // 8% tax estimate
    const total = subtotal + shipping + tax;

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeItem(itemId);
        } else {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleCheckout = () => {
        if (!user) {
            // Show login modal if not authenticated
            openLoginModal(() => {
                // After login, proceed to checkout
                navigate('/checkout');
            });
        } else {
            // Navigate to checkout/address selection
            navigate('/checkout');
        }
    };

    // Empty cart state
    if (items.length === 0) {
        return (
            <div className="cart-page">
                <div className="cart-empty">
                    <div className="empty-icon">
                        <ShoppingCart size={64} />
                    </div>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any parts yet. Browse our catalog to find what you need.</p>
                    <Button size="lg" onClick={() => navigate('/products')}>
                        Browse Products
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-container container">
                {/* Header */}
                <div className="cart-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        Continue Shopping
                    </button>
                    <h1>Shopping Cart</h1>
                    <span className="cart-count">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                </div>

                <div className="cart-content">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {items.map((item) => {
                            const itemId = item.id || item._id;
                            // Use priceSnapshot from backend, fallback to price for guest cart
                            const itemPrice = item.priceSnapshot || item.price || 0;
                            // Get image: backend returns images array, guest cart has image field
                            const itemImage = item.images?.[0] || item.image || 'https://via.placeholder.com/120x90';

                            return (
                                <div key={itemId} className="cart-item">
                                    <Link to={`/product/${itemId}`} className="item-image">
                                        <img
                                            src={itemImage}
                                            alt={item.name}
                                        />
                                    </Link>

                                    <div className="item-details">
                                        <Link to={`/product/${itemId}`} className="item-name">
                                            {item.name}
                                        </Link>
                                        {(item.sku || item.partNumber) && (
                                            <span className="item-sku">
                                                {item.partNumber ? `Part #: ${item.partNumber}` : `SKU: ${item.sku}`}
                                            </span>
                                        )}
                                        {item.compatibleVehicle && (
                                            <span className="item-vehicle">{item.compatibleVehicle}</span>
                                        )}
                                        {item.compatibleVehicles && item.compatibleVehicles.length > 0 && (
                                            <span className="item-vehicle">
                                                Fits: {item.compatibleVehicles[0].year} {item.compatibleVehicles[0].make} {item.compatibleVehicles[0].model}
                                            </span>
                                        )}
                                        <div className="item-shipping">
                                            <Truck size={14} />
                                            {item.shipping === 'free' || item.shipping === 0
                                                ? 'Free Shipping'
                                                : item.shipping
                                                    ? `+₹${item.shipping} shipping`
                                                    : 'Shipping calculated at checkout'
                                            }
                                        </div>
                                    </div>

                                    <div className="item-quantity">
                                        <button
                                            onClick={() => handleQuantityChange(itemId, item.quantity - 1)}
                                            aria-label="Decrease quantity"
                                            disabled={isLoading}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(itemId, item.quantity + 1)}
                                            aria-label="Increase quantity"
                                            disabled={isLoading}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <div className="item-price">
                                        <span className="price-value">
                                            ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                                        </span>
                                        {item.quantity > 1 && (
                                            <span className="price-each">
                                                ₹{itemPrice.toLocaleString('en-IN')} each
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        className="item-remove"
                                        onClick={() => removeItem(itemId)}
                                        aria-label="Remove item"
                                        disabled={isLoading}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            );
                        })}

                        {/* Clear Cart */}
                        <div className="cart-actions">
                            <button
                                className="clear-cart-btn"
                                onClick={clearCart}
                                disabled={isLoading}
                            >
                                <Trash2 size={16} />
                                Clear Cart
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="cart-summary">
                        <h2>Order Summary</h2>

                        {/* Promo Code */}
                        <div className="promo-section">
                            <div className="promo-input">
                                <Tag size={18} />
                                <input type="text" placeholder="Promo code" />
                                <button>Apply</button>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="summary-lines">
                            <div className="summary-line">
                                <span>Subtotal ({totalItems} items)</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="summary-line">
                                <span>Shipping</span>
                                <span className={shipping === 0 ? 'free' : ''}>
                                    {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                                </span>
                            </div>
                            <div className="summary-line">
                                <span>Estimated Tax</span>
                                <span>₹{tax.toLocaleString('en-IN')}</span>
                            </div>
                            {subtotal < 100 && (
                                <div className="free-shipping-hint">
                                    Add ₹{(100 - subtotal).toLocaleString('en-IN')} more for FREE shipping!
                                </div>
                            )}
                            <div className="summary-line total">
                                <span>Total</span>
                                <span>₹{total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <Button size="lg" fullWidth onClick={handleCheckout}>
                            <Lock size={18} />
                            {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                        </Button>

                        {!user && (
                            <p className="guest-notice">
                                <Link to="/login">Sign in</Link> to save your cart and track orders
                            </p>
                        )}

                        {/* Trust Badges */}
                        <div className="summary-trust">
                            <div className="trust-item">
                                <Lock size={16} />
                                <span>Secure Checkout</span>
                            </div>
                            <div className="trust-item">
                                <Shield size={16} />
                                <span>30-Day Warranty</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;
