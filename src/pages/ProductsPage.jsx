import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    ChevronRight,
    Grid3X3,
    List,
    SlidersHorizontal,
    X,
    Check,
    ChevronDown,
    HelpCircle
} from 'lucide-react';
import VehicleSelector from '../components/features/VehicleSelector';
import ProductCard from '../components/features/ProductCard';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import './ProductsPage.css';

// Mock products data
const MOCK_PRODUCTS = [
    {
        id: '1',
        name: 'Bosch High Output Alternator - 150 Amp',
        sku: 'GL-8756-A',
        price: 145.00,
        shipping: 'free',
        condition: 'grade-a-tested',
        fitVehicle: '2018 F-150',
        shippingMethod: 'Free Shipping',
        image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop',
    },
    {
        id: '2',
        name: 'Motorcraft Generic Alternator Assembly',
        sku: 'FL3Z-10346-A',
        price: 112.50,
        shipping: 'free',
        condition: 'refurbished',
        fitVehicle: '2018 F-150',
        shippingMethod: 'Standard Ship',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    },
    {
        id: '3',
        name: 'Denso Remanufactured Alternator',
        sku: 'Z10-9870',
        price: 89.99,
        shipping: 15.00,
        condition: 'grade-b',
        fitVehicle: '2018 F-150',
        shippingMethod: '+ Shipping',
        image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&h=300&fit=crop',
    },
    {
        id: '4',
        name: 'ACDelco Gold Professional Alternator',
        sku: '335-1245',
        price: 135.00,
        shipping: 'free',
        condition: 'grade-a-tested',
        shippingMethod: 'Free Shipping',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
    },
    {
        id: '5',
        name: 'Valeo Alternator (Original Equipment)',
        sku: '439872',
        price: 195.99,
        condition: 'grade-a',
        fitVehicle: '2018 F-150',
        shippingMethod: 'Expedited',
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop',
    },
    {
        id: '6',
        name: 'BBB Industries Alternator 160A',
        sku: 'N-11234',
        price: 105.00,
        shipping: 'free',
        condition: 'refurbished',
        fitVehicle: '2018 F-150',
        shippingMethod: 'Free Shipping',
        image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop',
    },
    {
        id: '7',
        name: 'Pure Energy Alternator',
        sku: '13769A',
        price: 122.95,
        condition: 'grade-a-tested',
        fitVehicle: '2018 F-150',
        shippingMethod: 'Free Shipping',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    },
    {
        id: '8',
        name: 'Budget OEM Ford Alternator',
        sku: 'GL-8756-B',
        price: 65.00,
        condition: 'grade-c',
        fitVehicle: '2018 F-150',
        shippingMethod: 'Calc at Checkout',
        image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&h=300&fit=crop',
    },
];

const CATEGORIES = [
    { name: 'Alternators', count: 124 },
    { name: 'Starters', count: 88 },
    { name: 'Batteries & Access.', count: 42 },
    { name: 'Belts & Hoses', count: 150 },
];

const CONDITIONS = [
    { value: 'grade-a', label: 'Grade A (Like New)' },
    { value: 'grade-b', label: 'Grade B (Good)' },
    { value: 'refurbished', label: 'Refurbished' },
];

function ProductsPage() {
    const [searchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState('grid');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedConditions, setSelectedConditions] = useState(['grade-a']);
    const [priceRange, setPriceRange] = useState({ min: 50, max: 500 });
    const [sortBy, setSortBy] = useState('relevance');
    const [activeFilters, setActiveFilters] = useState([
        { key: 'vehicle', label: '2018 Ford F-150' },
        { key: 'condition', label: 'Grade A' },
    ]);

    const category = searchParams.get('category') || 'alternators';
    const year = searchParams.get('year') || '2018';
    const make = searchParams.get('make') || 'Ford';
    const model = searchParams.get('model') || 'F-150';

    const toggleCondition = (condition) => {
        setSelectedConditions(prev =>
            prev.includes(condition)
                ? prev.filter(c => c !== condition)
                : [...prev, condition]
        );
    };

    const removeFilter = (key) => {
        setActiveFilters(prev => prev.filter(f => f.key !== key));
    };

    const clearAllFilters = () => {
        setActiveFilters([]);
        setSelectedConditions([]);
        setPriceRange({ min: 0, max: 1000 });
    };

    return (
        <div className="products-page">
            {/* Mobile Filter Toggle */}
            <button
                className="filter-toggle-mobile"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                <SlidersHorizontal size={18} />
                Filters
            </button>

            {/* Sidebar */}
            <aside className={`products-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>
                        <SlidersHorizontal size={18} />
                        Vehicle Selector
                    </h3>
                    <button
                        className="sidebar-close"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Vehicle Selector */}
                <VehicleSelector />
                <Button fullWidth className="update-vehicle-btn">
                    Update Vehicle
                </Button>

                {/* Part Categories */}
                <div className="filter-section">
                    <h4 className="filter-title">PART CATEGORIES</h4>
                    <ul className="category-list">
                        {CATEGORIES.map((cat) => (
                            <li key={cat.name}>
                                <button className={cat.name.toLowerCase() === category ? 'active' : ''}>
                                    {cat.name}
                                    <span>{cat.count}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Condition */}
                <div className="filter-section">
                    <h4 className="filter-title">CONDITION</h4>
                    <div className="condition-list">
                        {CONDITIONS.map((condition) => (
                            <label key={condition.value} className="condition-item">
                                <input
                                    type="checkbox"
                                    checked={selectedConditions.includes(condition.value)}
                                    onChange={() => toggleCondition(condition.value)}
                                />
                                <span className="checkbox-custom">
                                    <Check size={12} />
                                </span>
                                {condition.label}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div className="filter-section">
                    <h4 className="filter-title">PRICE RANGE</h4>
                    <div className="price-inputs">
                        <div className="price-input">
                            <span>$</span>
                            <input
                                type="number"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                            />
                        </div>
                        <span className="price-separator">–</span>
                        <div className="price-input">
                            <span>$</span>
                            <input
                                type="number"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                            />
                        </div>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                        className="price-slider"
                    />
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="products-main">
                {/* Breadcrumbs */}
                <nav className="breadcrumbs">
                    <Link to="/">Home</Link>
                    <ChevronRight size={14} />
                    <Link to={`/products?make=${make}`}>{make}</Link>
                    <ChevronRight size={14} />
                    <Link to={`/products?make=${make}&model=${model}`}>{model}</Link>
                    <ChevronRight size={14} />
                    <span>Alternators</span>
                </nav>

                {/* Header */}
                <div className="products-header">
                    <div className="products-title-section">
                        <h1>Alternators for {year} {make} {model}</h1>
                        <p>Showing {MOCK_PRODUCTS.length} verified parts compatible with your vehicle</p>
                    </div>

                    <div className="products-controls">
                        <div className="sort-control">
                            <span>Sort by:</span>
                            <Select
                                value={sortBy}
                                onChange={setSortBy}
                                options={[
                                    { value: 'relevance', label: 'Relevance' },
                                    { value: 'price-low', label: 'Price: Low to High' },
                                    { value: 'price-high', label: 'Price: High to Low' },
                                    { value: 'newest', label: 'Newest First' },
                                ]}
                                size="sm"
                            />
                        </div>

                        <div className="view-toggle">
                            <button
                                className={viewMode === 'grid' ? 'active' : ''}
                                onClick={() => setViewMode('grid')}
                                aria-label="Grid view"
                            >
                                <Grid3X3 size={18} />
                            </button>
                            <button
                                className={viewMode === 'list' ? 'active' : ''}
                                onClick={() => setViewMode('list')}
                                aria-label="List view"
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Active Filters */}
                {activeFilters.length > 0 && (
                    <div className="active-filters">
                        {activeFilters.map((filter) => (
                            <button
                                key={filter.key}
                                className="filter-tag"
                                onClick={() => removeFilter(filter.key)}
                            >
                                {filter.label}
                                <X size={14} />
                            </button>
                        ))}
                        <button className="clear-filters" onClick={clearAllFilters}>
                            Clear all filters
                        </button>
                    </div>
                )}

                {/* Products Grid */}
                <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                    {MOCK_PRODUCTS.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <button className="pagination-btn prev" disabled>
                        <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                        Previous
                    </button>

                    <div className="pagination-pages">
                        <button className="page active">1</button>
                        <button className="page">2</button>
                        <button className="page">3</button>
                        <span className="page-ellipsis">...</span>
                        <button className="page">12</button>
                    </div>

                    <button className="pagination-btn next">
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Can't Find CTA */}
                <div className="cant-find-section">
                    <div className="cant-find-icon">
                        <HelpCircle size={28} />
                    </div>
                    <h3>Can't find what you're looking for?</h3>
                    <p>Our network has access to thousands of parts not yet listed. Let our team find it for you.</p>
                    <Button variant="outline">Request a Part</Button>
                </div>
            </main>
        </div>
    );
}

export default ProductsPage;
