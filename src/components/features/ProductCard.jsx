import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Check, ShoppingCart } from 'lucide-react';
import { ConditionBadge } from '../common/Badge';
import Button from '../common/Button';
import useCartStore from '../../store/cartStore';
import { useAuth } from '../../context/AuthContext';
import useRequireAuth from '../../hooks/useRequireAuth';
import './ProductCard.css';

function ProductCard({ product, variant = 'default' }) {
    const addItem = useCartStore((state) => state.addItem);
    const isInCart = useCartStore((state) => state.isInCart);
    const { user } = useAuth();
    const requireAuth = useRequireAuth();
    const [showAddedMessage, setShowAddedMessage] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Get product ID (handle both id and _id from MongoDB)
    const productId = product.id || product._id;

    // Get thumbnail - use first image from images array, or fallback to image field
    const thumbnail = product.images?.[0] || product.image || 'https://via.placeholder.com/400x300?text=No+Image';

    // Get compatible vehicle string
    const getCompatibleVehicleText = () => {
        if (product.compatibleVehicle) return product.compatibleVehicle;
        if (product.compatibleVehicles?.length > 0) {
            const v = product.compatibleVehicles[0];
            return `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim();
        }
        return null;
    };

    // Format price (handle INR and USD)
    const formatPrice = (price) => {
        if (product.currency === 'INR') {
            return `₹${price?.toLocaleString('en-IN')}`;
        }
        return `$${price?.toFixed(2)}`;
    };

    // Check if product is in stock
    const inStock = product.stock === undefined || product.stock > 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!inStock) return;

        // Require authentication to add to cart
        requireAuth(() => {
            addItem({
                ...product,
                id: productId,
                image: thumbnail, // Normalize to single image for cart
            });

            // Show feedback
            setShowAddedMessage(true);
            setTimeout(() => setShowAddedMessage(false), 2000);
        });
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Wishlist requires authentication
        requireAuth(() => {
            setIsWishlisted(!isWishlisted);
            // TODO: Add to wishlist API functionality
            console.log('Wishlist toggled:', productId);
        });
    };

    const isCompact = variant === 'compact';
    const productInCart = isInCart(productId);
    const compatibleVehicle = getCompatibleVehicleText();
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;

    return (
        <Link to={`/product/${productId}`} className={`product-card ${isCompact ? 'product-card-compact' : ''}`}>
            {/* Image Container */}
            <div className="product-image-container">
                <img
                    src={thumbnail}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                />

                {/* Condition Badge */}
                <div className="product-badge">
                    <ConditionBadge condition={product.condition} />
                </div>

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="product-discount-badge">
                        -{discountPercent}%
                    </div>
                )}

                {/* Out of Stock Overlay */}
                {!inStock && (
                    <div className="product-out-of-stock">
                        Out of Stock
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    className={`product-wishlist ${isWishlisted ? 'active' : ''}`}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    onClick={handleWishlist}
                >
                    <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>

                {/* Added to cart feedback */}
                {showAddedMessage && (
                    <div className="product-added-toast">
                        <Check size={14} />
                        <span>Added to cart</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="product-content">
                {/* Brand */}
                {product.brand && (
                    <span className="product-brand">{product.brand}</span>
                )}

                {/* Compatible Vehicle */}
                {compatibleVehicle && (
                    <span className="product-vehicle">{compatibleVehicle}</span>
                )}

                {/* Title */}
                <h3 className="product-title">{product.name}</h3>

                {/* Part Number / SKU */}
                {(product.partNumber || product.sku) && (
                    <span className="product-sku">
                        {product.partNumber ? `Part #: ${product.partNumber}` : `SKU: ${product.sku}`}
                    </span>
                )}

                {/* Fit Info */}
                {product.fitVehicle && (
                    <div className="product-fit">
                        <Check size={14} />
                        <span>Fits your {product.fitVehicle}</span>
                    </div>
                )}

                {/* Price & Action */}
                <div className="product-footer">
                    <div className="product-pricing">
                        <span className="product-price-label">Price</span>
                        <div className="product-price-row">
                            <span className="product-price">{formatPrice(product.price)}</span>
                            {hasDiscount && (
                                <span className="product-original-price">
                                    {formatPrice(product.originalPrice)}
                                </span>
                            )}
                        </div>
                        {product.shipping !== undefined && (
                            <span className="product-shipping">
                                {product.shipping === 'free' || product.shipping === 0
                                    ? 'Free Shipping'
                                    : `+${formatPrice(product.shipping)} Shipping`
                                }
                            </span>
                        )}
                    </div>

                    <Button
                        variant={productInCart ? 'primary' : 'outline'}
                        size="sm"
                        onClick={handleAddToCart}
                        className="product-cart-btn"
                        disabled={!inStock}
                    >
                        {isCompact ? (
                            'View Details'
                        ) : productInCart ? (
                            <>
                                <ShoppingCart size={14} />
                                In Cart
                            </>
                        ) : !inStock ? (
                            'Out of Stock'
                        ) : (
                            'Add to Cart'
                        )}
                    </Button>
                </div>

                {/* Seller Info */}
                <div className="product-seller">
                    <span className="seller-badge">
                        {product.seller?.name || 'Sold by Platform'}
                    </span>
                    {product.shippingMethod && (
                        <span className="shipping-method">{product.shippingMethod}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;
