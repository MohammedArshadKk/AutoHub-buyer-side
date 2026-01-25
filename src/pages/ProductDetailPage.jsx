import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    ChevronLeft,
    Heart,
    ShoppingCart,
    Check,
    Truck,
    Shield,
    RefreshCw,
    Star,
    Loader2,
    AlertCircle,
    Minus,
    Plus,
    Share2,
    Package,
    Info,
    Eye,
    ShoppingBag
} from 'lucide-react';
import Button from '../components/common/Button';
import { ConditionBadge } from '../components/common/Badge';
import useProductStore from '../store/productStore';
import useCartStore from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import useRequireAuth from '../hooks/useRequireAuth';
import './ProductDetailPage.css';

function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const requireAuth = useRequireAuth();

    const {
        currentProduct: product,
        currentProductLoading: isLoading,
        currentProductError: error,
        fetchProductById,
        clearCurrentProduct,
    } = useProductStore();

    const addItem = useCartStore((state) => state.addItem);
    const isInCart = useCartStore((state) => state.isInCart);
    const getItemQuantity = useCartStore((state) => state.getItemQuantity);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const { user } = useAuth();

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showAddedMessage, setShowAddedMessage] = useState(false);

    // Fetch product on mount
    useEffect(() => {
        if (id) {
            fetchProductById(id);
        }
        return () => clearCurrentProduct();
    }, [id, fetchProductById, clearCurrentProduct]);

    // Get product ID
    const productId = product?.id || product?._id;

    // Check if product is in cart
    const productInCart = productId ? isInCart(productId) : false;
    const cartQuantity = productId ? getItemQuantity(productId) : 0;

    // Get images array
    const images = product?.images?.length > 0
        ? product.images
        : product?.image
            ? [product.image]
            : ['https://via.placeholder.com/600x400?text=No+Image'];

    // Get compatible vehicles text
    const getCompatibleVehiclesText = () => {
        if (product?.compatibleVehicles?.length > 0) {
            return product.compatibleVehicles.map(v =>
                `${v.year || ''} ${v.make || ''} ${v.model || ''} ${v.variant || ''}`.trim()
            );
        }
        if (product?.compatibleVehicle) {
            return [product.compatibleVehicle];
        }
        return [];
    };

    // Format price in INR
    const formatPrice = (price) => {
        return `₹${price?.toLocaleString('en-IN')}`;
    };

    // Check stock
    const inStock = product?.stock === undefined || product?.stock > 0;
    const hasDiscount = product?.originalPrice && product?.originalPrice > product?.price;
    const discountPercent = hasDiscount
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;

    const handleAddToCart = () => {
        if (product && inStock) {
            requireAuth(() => {
                addItem({
                    ...product,
                    id: productId,
                    image: images[0],
                }, quantity);
                setShowAddedMessage(true);
                setTimeout(() => setShowAddedMessage(false), 3000);
            });
        }
    };

    const handleUpdateCartQuantity = (newQty) => {
        if (productId && newQty >= 0) {
            updateQuantity(productId, newQty);
        }
    };

    const handleBuyNow = () => {
        if (product && inStock) {
            requireAuth(() => {
                // Add to cart if not already in cart or update quantity
                if (!productInCart) {
                    addItem({
                        ...product,
                        id: productId,
                        image: images[0],
                    }, quantity);
                }
                // Navigate to cart page
                navigate('/cart');
            });
        }
    };

    const handleWishlist = () => {
        requireAuth(() => {
            setIsWishlisted(!isWishlisted);
        });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product?.name,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="product-detail-page">
                <div className="product-detail-loading">
                    <Loader2 size={48} className="loading-spinner" />
                    <p>Loading product details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="product-detail-page">
                <div className="product-detail-error">
                    <AlertCircle size={48} />
                    <h2>Failed to load product</h2>
                    <p>{error}</p>
                    <div className="error-actions">
                        <Button onClick={() => fetchProductById(id)}>Try Again</Button>
                        <Button variant="outline" onClick={() => navigate('/products')}>
                            Back to Products
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // No product found
    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="product-detail-error">
                    <AlertCircle size={48} />
                    <h2>Product not found</h2>
                    <p>The product you're looking for doesn't exist or has been removed.</p>
                    <Button onClick={() => navigate('/products')}>Browse Products</Button>
                </div>
            </div>
        );
    }

    const compatibleVehicles = getCompatibleVehiclesText();

    return (
        <div className="product-detail-page">
            {/* Breadcrumbs */}
            <nav className="breadcrumbs container">
                <Link to="/">Home</Link>
                <ChevronRight size={14} />
                <Link to="/products">Products</Link>
                {product.category && (
                    <>
                        <ChevronRight size={14} />
                        <Link to={`/products?category=${product.category}`}>{product.category}</Link>
                    </>
                )}
                <ChevronRight size={14} />
                <span>{product.name}</span>
            </nav>

            <div className="product-detail-container container">
                {/* Image Gallery */}
                <div className="product-gallery">
                    <div className="gallery-main">
                        <img
                            src={images[selectedImage]}
                            alt={product.name}
                            className="gallery-main-image"
                        />
                        {images.length > 1 && (
                            <>
                                <button
                                    className="gallery-nav prev"
                                    onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    className="gallery-nav next"
                                    onClick={() => setSelectedImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}
                        <div className="gallery-badge">
                            <ConditionBadge condition={product.condition} />
                        </div>
                        {hasDiscount && (
                            <div className="gallery-discount">
                                -{discountPercent}% OFF
                            </div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="gallery-thumbnails">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img src={img} alt={`${product.name} ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Product Stats (Views/Sales) - Mobile Only */}
                    <div className="product-stats mobile-only">
                        <div className="stat-item">
                            <Eye size={16} />
                            <span>{product.views || 0} views</span>
                        </div>
                        <div className="stat-item">
                            <ShoppingBag size={16} />
                            <span>{product.soldCount || 0} sold</span>
                        </div>
                    </div>
                </div>

                {/* Product Info */}
                <div className="product-info">
                    {/* Header */}
                    <div className="product-header">
                        {product.brand && (
                            <span className="product-brand">{product.brand}</span>
                        )}
                        <h1 className="product-title">{product.name}</h1>

                        <div className="product-meta">
                            {(product.partNumber || product.sku) && (
                                <span className="product-sku">
                                    {product.partNumber ? `Part #: ${product.partNumber}` : `SKU: ${product.sku}`}
                                </span>
                            )}
                            <div className="product-stats desktop-only">
                                <span className="stat-separator">•</span>
                                <div className="stat-item">
                                    <Eye size={14} />
                                    <span>{product.views || 0} views</span>
                                </div>
                                <span className="stat-separator">•</span>
                                <div className="stat-item">
                                    <ShoppingBag size={14} />
                                    <span>{product.soldCount || 0} sold</span>
                                </div>
                            </div>
                        </div>

                        {product.tags && product.tags.length > 0 && (
                            <div className="product-tags">
                                {product.tags.map((tag, index) => (
                                    <span key={index} className="tag-badge">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className={`stock-status ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                        <Package size={16} />
                        {inStock
                            ? product.stock
                                ? `In Stock (${product.stock} available)`
                                : 'In Stock'
                            : 'Out of Stock'
                        }
                    </div>

                    {/* Price */}
                    <div className="product-price-section">
                        <div className="price-main">
                            <span className="price-value">{formatPrice(product.price)}</span>
                            {hasDiscount && (
                                <>
                                    <span className="price-original">{formatPrice(product.originalPrice)}</span>
                                    <span className="price-discount">Save {discountPercent}%</span>
                                </>
                            )}
                        </div>
                        <div className="price-shipping">
                            {product.shipping === 'free' || product.shipping === 0 ? (
                                <span className="shipping-free">
                                    <Truck size={16} />
                                    Free Shipping
                                </span>
                            ) : product.shipping ? (
                                <span className="shipping-cost">
                                    <Truck size={16} />
                                    +{formatPrice(product.shipping)} Shipping
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {/* Quantity & Add to Cart */}
                    <div className="product-actions">
                        {!productInCart ? (
                            <>
                                <div className="product-actions-main">
                                    <div className="quantity-selector">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span>{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => q + 1)}
                                            disabled={product.stock && quantity >= product.stock}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="product-actions-buttons">
                                        <Button
                                            size="lg"
                                            className="add-to-cart-btn"
                                            onClick={handleAddToCart}
                                            disabled={!inStock}
                                        >
                                            <ShoppingCart size={18} />
                                            {inStock ? 'Add to Cart' : 'Out of Stock'}
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="buy-now-btn"
                                            onClick={handleBuyNow}
                                            disabled={!inStock}
                                        >
                                            {inStock ? 'Buy Now' : 'Out of Stock'}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="product-actions-main">
                                    <div className="quantity-selector in-cart">
                                        <button
                                            onClick={() => handleUpdateCartQuantity(cartQuantity - 1)}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span>{cartQuantity}</span>
                                        <button onClick={() => handleUpdateCartQuantity(cartQuantity + 1)}>
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <Button
                                        size="lg"
                                        variant="primary"
                                        className="add-to-cart-btn in-cart"
                                        onClick={() => navigate('/cart')}
                                    >
                                        <Check size={18} />
                                        View Cart ({cartQuantity})
                                    </Button>
                                </div>
                            </>
                        )}
                        <div className="product-actions-secondary">
                            <button
                                className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                                onClick={handleWishlist}
                            >
                                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                            </button>
                            <button className="share-btn" onClick={handleShare}>
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Added Message */}
                    {showAddedMessage && (
                        <div className="added-message">
                            <Check size={16} />
                            Added to cart!
                        </div>
                    )}

                    {/* Guest hint */}
                    {!user && (
                        <p className="guest-hint">
                            <Link to="/login">Sign in</Link> to save your cart and track orders
                        </p>
                    )}

                    {/* Trust Badges */}
                    <div className="product-trust">
                        <div className="trust-item">
                            <Shield size={18} />
                            <span>{product.warranty || '30-Day Warranty'}</span>
                        </div>
                        <div className="trust-item">
                            <RefreshCw size={18} />
                            <span>Easy Returns</span>
                        </div>
                        <div className="trust-item">
                            <Truck size={18} />
                            <span>Fast Shipping</span>
                        </div>
                    </div>

                    {/* Features */}
                    {product.features && product.features.length > 0 && (
                        <div className="product-features">
                            <h3>Features</h3>
                            <ul>
                                {product.features.map((feature, index) => (
                                    <li key={index}>
                                        <Check size={16} className="feature-icon" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Description */}
                    {product.description && (
                        <div className="product-description">
                            <h3>Description</h3>
                            <p>{product.description}</p>
                        </div>
                    )}

                    {/* Remarks / Additional Notes */}
                    {product.remarks && (
                        <div className="product-remarks">
                            <div className="remarks-header">
                                <Info size={18} />
                                <h3>Additional Notes</h3>
                            </div>
                            <div className="remarks-content">
                                <p>{product.remarks}</p>
                            </div>
                        </div>
                    )}

                    {/* Specifications */}
                    {product.specifications && Object.keys(product.specifications).length > 0 && (
                        <div className="product-specifications">
                            <h3>Specifications</h3>
                            <table>
                                <tbody>
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <tr key={key}>
                                            <td>{key}</td>
                                            <td>{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Weight & Dimensions */}
                    {(product.weight || product.dimensions) && (
                        <div className="product-dimensions">
                            <h3>Shipping Info</h3>
                            <div className="dimensions-grid">
                                {product.weight && (
                                    <div className="dimension-item">
                                        <span className="label">Weight</span>
                                        <span className="value">{product.weight.value} {product.weight.unit}</span>
                                    </div>
                                )}
                                {product.dimensions && (
                                    <div className="dimension-item">
                                        <span className="label">Dimensions</span>
                                        <span className="value">
                                            {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Compatible Vehicles */}
                    {compatibleVehicles.length > 0 && (
                        <div className="compatible-vehicles">
                            <h4>Compatible Vehicles</h4>
                            <ul>
                                {compatibleVehicles.slice(0, 3).map((v, i) => (
                                    <li key={i}>
                                        <Check size={14} />
                                        {v}
                                    </li>
                                ))}
                                {compatibleVehicles.length > 3 && (
                                    <li className="more">
                                        +{compatibleVehicles.length - 3} more vehicles
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductDetailPage;
