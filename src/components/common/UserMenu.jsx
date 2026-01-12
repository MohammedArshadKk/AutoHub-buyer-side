import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthComponents.css';

export default function UserMenu() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    if (!user) return null;

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    const handleLogout = async () => {
        setIsOpen(false);
        await logout();
    };

    return (
        <div className="user-menu-container">
            <button
                className="user-menu-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User menu"
            >
                <img src={user.avatar} alt={user.name} className="user-avatar" />
                <span className="user-name">{user.name}</span>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`chevron ${isOpen ? 'open' : ''}`}
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="user-menu-backdrop" onClick={() => setIsOpen(false)} />
                    <div className="user-menu-dropdown">
                        <div className="user-menu-header">
                            <div className="user-menu-info">
                                <p className="user-menu-name">{user.name}</p>
                                <p className="user-menu-email">{user.email}</p>
                            </div>
                        </div>
                        <div className="user-menu-divider" />
                        <button onClick={() => handleNavigate('/profile')} className="user-menu-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>My Profile</span>
                        </button>
                        <button onClick={() => handleNavigate('/cart')} className="user-menu-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                            </svg>
                            <span>My Cart</span>
                        </button>
                        <button onClick={() => handleNavigate('/orders')} className="user-menu-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                            </svg>
                            <span>My Orders</span>
                        </button>
                        <div className="user-menu-divider" />
                        <button onClick={handleLogout} className="user-menu-item logout">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                <path d="M16 17l5-5-5-5M21 12H9" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
