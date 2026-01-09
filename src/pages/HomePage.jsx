import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Car,
    Settings,
    Zap,
    Lightbulb,
    Thermometer,
    CircleDot,
    ShieldCheck,
    Award,
    Clock,
    ArrowRight,
    Loader2
} from 'lucide-react';
import VehicleSelector from '../components/features/VehicleSelector';
import CategoryCard from '../components/features/CategoryCard';
import ProductCard from '../components/features/ProductCard';
import useProductStore from '../store/productStore';
import './HomePage.css';

// Default categories (fallback if API fails)
const DEFAULT_CATEGORIES = [
    { icon: Car, name: 'Body Parts', slug: 'body-parts' },
    { icon: Settings, name: 'Engine', slug: 'engine' },
    { icon: Zap, name: 'Electrical', slug: 'electrical' },
    { icon: Lightbulb, name: 'Lighting', slug: 'lighting' },
    { icon: Thermometer, name: 'Cooling', slug: 'cooling' },
    { icon: CircleDot, name: 'Suspension', slug: 'suspension' },
];

// Map category slugs to icons
const CATEGORY_ICONS = {
    'body-parts': Car,
    'engine': Settings,
    'electrical': Zap,
    'lighting': Lightbulb,
    'cooling': Thermometer,
    'suspension': CircleDot,
};

function HomePage() {
    const {
        trendingProducts,
        trendingLoading,
        fetchTrendingProducts,
        categories,
        fetchCategories
    } = useProductStore();

    // Fetch trending products and categories on mount
    useEffect(() => {
        fetchTrendingProducts(4);
        fetchCategories();
    }, [fetchTrendingProducts, fetchCategories]);

    // Use API categories or fallback to defaults
    const displayCategories = categories.length > 0
        ? categories.slice(0, 6).map(cat => ({
            ...cat,
            icon: CATEGORY_ICONS[cat.slug] || Car,
        }))
        : DEFAULT_CATEGORIES;

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <img
                        src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&h=800&fit=crop"
                        alt=""
                        className="hero-bg-image"
                    />
                    <div className="hero-overlay" />
                </div>

                <div className="hero-content container">
                    <h1 className="hero-title">
                        Find the Right Part, <span>Guaranteed.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Enter your vehicle details to browse compatible, admin-inspected parts from verified sellers.
                    </p>

                    <VehicleSelector variant="hero" />
                </div>

                {/* Trust Badges */}
                <div className="hero-trust">
                    <div className="trust-badge">
                        <ShieldCheck size={20} />
                        <span>Verified Sellers</span>
                    </div>
                    <div className="trust-badge">
                        <Award size={20} />
                        <span>Admin Inspected</span>
                    </div>
                    <div className="trust-badge">
                        <Clock size={20} />
                        <span>30-Day Warranty</span>
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="categories-section container">
                <div className="section-header">
                    <h2 className="section-title">Featured Categories</h2>
                    <Link to="/products" className="section-link">
                        View All Categories
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="categories-grid">
                    {displayCategories.map((category) => (
                        <CategoryCard key={category.slug} {...category} />
                    ))}
                </div>
            </section>

            {/* Trending Parts */}
            <section className="trending-section container">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Trending Parts</h2>
                        <p className="section-subtitle">Recently listed parts compatible with popular models.</p>
                    </div>
                    <Link to="/products" className="section-link">
                        View All Parts
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {trendingLoading ? (
                    <div className="trending-loading">
                        <Loader2 size={32} className="loading-spinner" />
                        <p>Loading trending parts...</p>
                    </div>
                ) : trendingProducts.length > 0 ? (
                    <div className="products-grid">
                        {trendingProducts.map((product) => (
                            <ProductCard key={product.id || product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="trending-empty">
                        <p>No trending products available at the moment.</p>
                        <Link to="/products" className="section-link">
                            Browse All Products
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                )}
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Can't find what you're looking for?</h2>
                        <p>Our network has access to thousands of parts not yet listed. Let our team find it for you.</p>
                        <Link to="/request-part" className="cta-button">
                            Request a Part
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HomePage;
