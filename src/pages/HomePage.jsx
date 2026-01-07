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
    ArrowRight
} from 'lucide-react';
import VehicleSelector from '../components/features/VehicleSelector';
import CategoryCard from '../components/features/CategoryCard';
import ProductCard from '../components/features/ProductCard';
import './HomePage.css';

// Mock trending products data
const TRENDING_PRODUCTS = [
    {
        id: '1',
        name: 'Front Bumper Assembly - Midnight Black',
        sku: 'TY-BMP-0821',
        price: 350.00,
        shipping: 45.00,
        condition: 'used-good',
        compatibleVehicle: 'Toyota Camry 2018-2022',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    },
    {
        id: '2',
        name: 'LED Headlight Assembly (Right Side)',
        sku: 'BMW-HDL-9393',
        price: 850.00,
        shipping: 'free',
        condition: 'refurbished',
        compatibleVehicle: 'BMW 3 Series (F30)',
        image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&h=300&fit=crop',
    },
    {
        id: '3',
        name: 'High Output Alternator 220A',
        sku: 'FRD-ALT-4420',
        price: 120.00,
        shipping: 20.00,
        condition: 'used-fair',
        compatibleVehicle: 'Ford F-150 2018-2023',
        image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop',
    },
    {
        id: '4',
        name: 'Side Mirror Assembly (Left, Heated)',
        sku: 'HND-MIR-1234',
        price: 85.00,
        shipping: 'free',
        condition: 'used-excellent',
        compatibleVehicle: 'Honda Civic 2016-2021',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
    },
];

const CATEGORIES = [
    { icon: Car, name: 'Body Parts', slug: 'body-parts' },
    { icon: Settings, name: 'Engine', slug: 'engine' },
    { icon: Zap, name: 'Electrical', slug: 'electrical' },
    { icon: Lightbulb, name: 'Lighting', slug: 'lighting' },
    { icon: Thermometer, name: 'Cooling', slug: 'cooling' },
    { icon: CircleDot, name: 'Suspension', slug: 'suspension' },
];

function HomePage() {
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
                    <Link to="/categories" className="section-link">
                        View All Categories
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="categories-grid">
                    {CATEGORIES.map((category) => (
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

                <div className="products-grid">
                    {TRENDING_PRODUCTS.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
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
