import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search,
    ShoppingCart,
    User,
    Menu,
    X,
    Sun,
    Moon,
    ChevronDown,
    LogOut
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import './Header.css';

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuthStore();
    const getTotalItems = useCartStore((state) => state.getTotalItems);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = async () => {
        await logout();
        setUserMenuOpen(false);
        navigate('/');
    };

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <Link to="/" className="header-logo">
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="logo-text">AutoPartsPro</span>
                </Link>

                {/* Search Bar - Desktop */}
                <form className="header-search" onSubmit={handleSearch}>
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by Part Number or Keyword"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </form>

                {/* Navigation - Desktop */}
                <nav className="header-nav">
                    <Link to="/products" className="nav-link">Browse Parts</Link>
                    <Link to="/sell" className="nav-link">Sell a Part</Link>
                    <Link to="/support" className="nav-link">Support</Link>
                </nav>

                {/* Actions */}
                <div className="header-actions">
                    {/* Theme Toggle */}
                    <button
                        className="action-btn theme-toggle"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Cart */}
                    <Link to="/cart" className="action-btn cart-btn">
                        <ShoppingCart size={20} />
                        {getTotalItems() > 0 && (
                            <span className="cart-count">{getTotalItems()}</span>
                        )}
                    </Link>

                    {/* User Menu */}
                    {user ? (
                        <div className="user-menu-wrapper">
                            <button
                                className="user-menu-trigger"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="" className="user-avatar" />
                                ) : (
                                    <User size={20} />
                                )}
                                <ChevronDown size={16} />
                            </button>

                            {userMenuOpen && (
                                <div className="user-dropdown">
                                    <div className="user-info">
                                        <span className="user-name">{user.displayName}</span>
                                        <span className="user-email">{user.email}</span>
                                    </div>
                                    <div className="dropdown-divider" />
                                    <Link to="/orders" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                        My Orders
                                    </Link>
                                    <Link to="/garage" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                        My Garage
                                    </Link>
                                    <div className="dropdown-divider" />
                                    <button className="dropdown-item logout" onClick={handleLogout}>
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="login-btn">
                            Log In
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <form className="mobile-search" onSubmit={handleSearch}>
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search parts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                <nav className="mobile-nav">
                    <Link to="/products" onClick={() => setMobileMenuOpen(false)}>Browse Parts</Link>
                    <Link to="/sell" onClick={() => setMobileMenuOpen(false)}>Sell a Part</Link>
                    <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                    <Link to="/garage" onClick={() => setMobileMenuOpen(false)}>My Garage</Link>
                    <Link to="/support" onClick={() => setMobileMenuOpen(false)}>Support</Link>
                </nav>

                {!user && (
                    <Link to="/login" className="mobile-login" onClick={() => setMobileMenuOpen(false)}>
                        Log In
                    </Link>
                )}
            </div>
        </header>
    );
}

export default Header;
