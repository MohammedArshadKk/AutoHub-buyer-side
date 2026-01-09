import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    ChevronRight,
    Grid3X3,
    List,
    SlidersHorizontal,
    X,
    Check,
    HelpCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import VehicleSelector from '../components/features/VehicleSelector';
import ProductCard from '../components/features/ProductCard';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import useProductStore from '../store/productStore';
import './ProductsPage.css';

const CONDITIONS = [
    { value: 'grade-a', label: 'Grade A (Like New)' },
    { value: 'grade-b', label: 'Grade B (Good)' },
    { value: 'refurbished', label: 'Refurbished' },
];

function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState('grid');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Get state from product store
    const {
        products,
        isLoading,
        error,
        pagination,
        filters,
        categories,
        fetchProducts,
        fetchCategories,
        setFilter,
        setFilters,
        clearFilters,
        goToPage,
        nextPage,
        prevPage,
    } = useProductStore();

    // Local filter state for controlled inputs
    const [localFilters, setLocalFilters] = useState({
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || '',
        condition: filters.condition ? filters.condition.split(',') : [],
    });

    // Sync URL params to filters on mount
    useEffect(() => {
        const category = searchParams.get('category') || '';
        const make = searchParams.get('make') || '';
        const model = searchParams.get('model') || '';
        const year = searchParams.get('year') || '';
        const search = searchParams.get('search') || '';

        // Set initial filters from URL
        const initialFilters = {};
        if (category) initialFilters.category = category;
        if (make) initialFilters.make = make;
        if (model) initialFilters.model = model;
        if (year) initialFilters.year = year;
        if (search) initialFilters.search = search;

        if (Object.keys(initialFilters).length > 0) {
            setFilters(initialFilters);
        } else {
            fetchProducts();
        }

        // Fetch categories
        fetchCategories();
    }, []); // Only run on mount

    // Handle condition toggle
    const toggleCondition = (condition) => {
        setLocalFilters(prev => {
            const newConditions = prev.condition.includes(condition)
                ? prev.condition.filter(c => c !== condition)
                : [...prev.condition, condition];
            return { ...prev, condition: newConditions };
        });
    };

    // Apply price and condition filters
    const applyFilters = () => {
        setFilters({
            minPrice: localFilters.minPrice,
            maxPrice: localFilters.maxPrice,
            condition: localFilters.condition.join(','),
        });
    };

    // Handle sort change
    const handleSortChange = (value) => {
        let sortValue = '-createdAt';
        switch (value) {
            case 'price-low':
                sortValue = 'price';
                break;
            case 'price-high':
                sortValue = '-price';
                break;
            case 'newest':
                sortValue = '-createdAt';
                break;
            default:
                sortValue = '-createdAt';
        }
        setFilter('sort', sortValue);
        fetchProducts();
    };

    // Handle category click
    const handleCategoryClick = (categorySlug) => {
        setFilter('category', categorySlug);
        fetchProducts();
    };

    // Handle clear all filters
    const handleClearFilters = () => {
        setLocalFilters({ minPrice: '', maxPrice: '', condition: [] });
        clearFilters();
    };

    // Get active filters for display
    const getActiveFilters = () => {
        const active = [];
        if (filters.make) active.push({ key: 'vehicle', label: `${filters.year || ''} ${filters.make} ${filters.model || ''}`.trim() });
        if (filters.category) active.push({ key: 'category', label: filters.category });
        if (filters.condition) active.push({ key: 'condition', label: filters.condition });
        return active;
    };

    const activeFilters = getActiveFilters();

    // Render pagination
    const renderPagination = () => {
        const { page, pages, hasNext, hasPrev } = pagination;
        const pageNumbers = [];

        // Show max 5 page numbers
        let startPage = Math.max(1, page - 2);
        let endPage = Math.min(pages, startPage + 4);
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="pagination">
                <button
                    className="pagination-btn prev"
                    disabled={!hasPrev || isLoading}
                    onClick={prevPage}
                >
                    <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                    Previous
                </button>

                <div className="pagination-pages">
                    {startPage > 1 && (
                        <>
                            <button className="page" onClick={() => goToPage(1)}>1</button>
                            {startPage > 2 && <span className="page-ellipsis">...</span>}
                        </>
                    )}
                    {pageNumbers.map(num => (
                        <button
                            key={num}
                            className={`page ${num === page ? 'active' : ''}`}
                            onClick={() => goToPage(num)}
                            disabled={isLoading}
                        >
                            {num}
                        </button>
                    ))}
                    {endPage < pages && (
                        <>
                            {endPage < pages - 1 && <span className="page-ellipsis">...</span>}
                            <button className="page" onClick={() => goToPage(pages)}>{pages}</button>
                        </>
                    )}
                </div>

                <button
                    className="pagination-btn next"
                    disabled={!hasNext || isLoading}
                    onClick={nextPage}
                >
                    Next
                    <ChevronRight size={16} />
                </button>
            </div>
        );
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
                        Filters
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
                <Button fullWidth className="update-vehicle-btn" onClick={() => fetchProducts()}>
                    Update Vehicle
                </Button>

                {/* Part Categories */}
                <div className="filter-section">
                    <h4 className="filter-title">PART CATEGORIES</h4>
                    <ul className="category-list">
                        {categories.length > 0 ? (
                            categories.map((cat) => (
                                <li key={cat.slug || cat.name}>
                                    <button
                                        className={filters.category === cat.slug ? 'active' : ''}
                                        onClick={() => handleCategoryClick(cat.slug)}
                                    >
                                        {cat.name}
                                        <span>{cat.count || 0}</span>
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="category-loading">Loading categories...</li>
                        )}
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
                                    checked={localFilters.condition.includes(condition.value)}
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
                                placeholder="Min"
                                value={localFilters.minPrice}
                                onChange={(e) => setLocalFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                            />
                        </div>
                        <span className="price-separator">–</span>
                        <div className="price-input">
                            <span>$</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={localFilters.maxPrice}
                                onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                            />
                        </div>
                    </div>
                    <Button
                        fullWidth
                        variant="outline"
                        size="sm"
                        onClick={applyFilters}
                        className="apply-filters-btn"
                    >
                        Apply Filters
                    </Button>
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
                    <Link to="/products">Products</Link>
                    {filters.category && (
                        <>
                            <ChevronRight size={14} />
                            <span>{filters.category}</span>
                        </>
                    )}
                </nav>

                {/* Header */}
                <div className="products-header">
                    <div className="products-title-section">
                        <h1>
                            {filters.category
                                ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}`
                                : 'All Products'
                            }
                            {filters.make && ` for ${filters.year || ''} ${filters.make} ${filters.model || ''}`.trim()}
                        </h1>
                        <p>
                            {isLoading
                                ? 'Loading products...'
                                : `Showing ${products.length} of ${pagination.total} products`
                            }
                        </p>
                    </div>

                    <div className="products-controls">
                        <div className="sort-control">
                            <span>Sort by:</span>
                            <Select
                                value={filters.sort === '-price' ? 'price-high' : filters.sort === 'price' ? 'price-low' : 'relevance'}
                                onChange={handleSortChange}
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
                                onClick={() => {
                                    if (filter.key === 'vehicle') {
                                        setFilters({ make: '', model: '', year: '' });
                                    } else {
                                        setFilter(filter.key, '');
                                        fetchProducts();
                                    }
                                }}
                            >
                                {filter.label}
                                <X size={14} />
                            </button>
                        ))}
                        <button className="clear-filters" onClick={handleClearFilters}>
                            Clear all filters
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="products-loading">
                        <Loader2 size={32} className="loading-spinner" />
                        <p>Loading products...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="products-error">
                        <AlertCircle size={48} />
                        <h3>Failed to load products</h3>
                        <p>{error}</p>
                        <Button onClick={() => fetchProducts()}>Try Again</Button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && products.length === 0 && (
                    <div className="products-empty">
                        <HelpCircle size={48} />
                        <h3>No products found</h3>
                        <p>Try adjusting your filters or search criteria</p>
                        <Button variant="outline" onClick={handleClearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                )}

                {/* Products Grid */}
                {!isLoading && !error && products.length > 0 && (
                    <>
                        <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                            {products.map((product) => (
                                <ProductCard key={product.id || product._id} product={product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && renderPagination()}
                    </>
                )}

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
