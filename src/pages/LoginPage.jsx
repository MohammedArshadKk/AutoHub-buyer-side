import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginButton from '../components/common/LoginButton';
import useCartStore from '../store/cartStore';
import './LoginPage.css';

function LoginPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const getTotalItems = useCartStore((state) => state.getTotalItems);

    const cartItemCount = getTotalItems();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    return (
        <div className="login-page">
            {/* Background Pattern */}
            <div className="login-bg">
                <div className="login-bg-pattern" />
            </div>

            {/* Login Card */}
            <div className="login-card">
                {/* Logo */}
                <div className="login-logo">
                    <div className="login-logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h1 className="login-brand">AutoPartsPro</h1>
                </div>

                {/* Welcome Text */}
                <div className="login-welcome">
                    <h2>Welcome back</h2>
                    <p>Sign in to access your account, track orders, and find the perfect parts for your vehicle.</p>
                </div>

                {/* Cart Items Notice */}
                {cartItemCount > 0 && (
                    <div className="login-cart-notice">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        <span>You have {cartItemCount} item{cartItemCount > 1 ? 's' : ''} in your cart. Sign in to save them!</span>
                    </div>
                )}

                {/* Google Sign In Button */}
                <LoginButton />

                {/* Continue as Guest */}
                <button
                    className="guest-btn"
                    onClick={() => navigate('/')}
                >
                    Continue as guest
                </button>

                {/* Terms */}
                <p className="login-terms">
                    By signing in, you agree to our{' '}
                    <a href="/terms">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy">Privacy Policy</a>
                </p>

                {/* Trust Badges */}
                <div className="login-trust">
                    <div className="trust-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                        <span>Secure Login</span>
                    </div>
                    <div className="trust-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                        <span>24/7 Support</span>
                    </div>
                    <div className="trust-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                            <path d="M22 4L12 14.01l-3-3" />
                        </svg>
                        <span>Verified Sellers</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
