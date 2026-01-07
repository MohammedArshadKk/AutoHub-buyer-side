import { Link } from 'react-router-dom';
import { Heart, Check } from 'lucide-react';
import { ConditionBadge } from '../common/Badge';
import Button from '../common/Button';
import useCartStore from '../../store/cartStore';
import './ProductCard.css';

function ProductCard({ product, variant = 'default' }) {
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = (e) => {
        e.preventDefault();
        addItem(product);
    };

    const isCompact = variant === 'compact';

    return (
        <Link to={`/products/${product.id}`} className={`product-card ${isCompact ? 'product-card-compact' : ''}`}>
            {/* Image Container */}
            <div className="product-image-container">
                <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                />

                {/* Condition Badge */}
                <div className="product-badge">
                    <ConditionBadge condition={product.condition} />
                </div>

                {/* Wishlist Button */}
                <button className="product-wishlist" aria-label="Add to wishlist">
                    <Heart size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="product-content">
                {/* Compatible Vehicle */}
                {product.compatibleVehicle && (
                    <span className="product-vehicle">{product.compatibleVehicle}</span>
                )}

                {/* Title */}
                <h3 className="product-title">{product.name}</h3>

                {/* SKU */}
                {product.sku && (
                    <span className="product-sku">SKU: {product.sku}</span>
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
                        <span className="product-price">${product.price.toFixed(2)}</span>
                        {product.shipping && (
                            <span className="product-shipping">
                                {product.shipping === 'free' ? 'Free Shipping' : `+$${product.shipping} Shipping`}
                            </span>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddToCart}
                        className="product-cart-btn"
                    >
                        {isCompact ? 'View Details' : 'Add to Cart'}
                    </Button>
                </div>

                {/* Seller Info */}
                <div className="product-seller">
                    <span className="seller-badge">Sold by Platform</span>
                    {product.shippingMethod && (
                        <span className="shipping-method">{product.shippingMethod}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;
