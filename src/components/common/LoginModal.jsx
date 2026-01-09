import { useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import './LoginModal.css';

function LoginModal() {
    const { showLoginModal, closeLoginModal, login, setLoading, executePendingAction } = useAuthStore();
    const syncFromGuestStorage = useCartStore((state) => state.syncFromGuestStorage);
    const getTotalItems = useCartStore((state) => state.getTotalItems);
    const location = useLocation();

    const cartItemCount = getTotalItems();

    const handleGoogleSuccess = async (tokenResponse) => {
        try {
            setLoading(true);
            // Fetch user info from Google using access token
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const userInfo = await userInfoResponse.json();

            // Set user in store
            login({
                id: userInfo.sub,
                displayName: userInfo.name,
                email: userInfo.email,
                photoURL: userInfo.picture,
                accessToken: tokenResponse.access_token,
            });

            // Sync guest cart to user's cart
            syncFromGuestStorage();

            // Execute any pending action
            executePendingAction();

            closeLoginModal();
        } catch (err) {
            console.error('Google login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        console.error('Google sign-in was cancelled or failed');
    };

    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: handleGoogleError,
    });

    if (!showLoginModal) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeLoginModal();
        }
    };

    return (
        <div className="login-modal-overlay" onClick={handleBackdropClick}>
            <div className="login-modal">
                <button className="login-modal-close" onClick={closeLoginModal}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                <div className="login-modal-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M12 8v4M12 16h.01" />
                    </svg>
                </div>

                <h2 className="login-modal-title">Sign in Required</h2>
                <p className="login-modal-text">
                    {cartItemCount > 0
                        ? `Sign in to save your ${cartItemCount} cart item${cartItemCount > 1 ? 's' : ''} and complete your purchase.`
                        : 'Please sign in to continue with this action. Your cart and preferences will be saved to your account.'
                    }
                </p>

                {/* Cart items indicator */}
                {cartItemCount > 0 && (
                    <div className="login-modal-cart-info">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        <span>{cartItemCount} item{cartItemCount > 1 ? 's' : ''} in cart</span>
                    </div>
                )}

                <button className="login-modal-google-btn" onClick={() => googleLogin()}>
                    <svg className="google-icon" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    <span>Continue with Google</span>
                </button>

                <button className="login-modal-cancel" onClick={closeLoginModal}>
                    Continue browsing
                </button>
            </div>
        </div>
    );
}

export default LoginModal;
