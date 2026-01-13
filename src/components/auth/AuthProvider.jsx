import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import useCartStore, { setCartAuthChecker } from '../../store/cartStore';

/**
 * AuthProvider Component
 * Handles cart synchronization when user logs in.
 * Auth state is managed by AuthContext.
 */
function AuthProvider({ children }) {
    const { user, isAuthenticated, loading } = useAuth();
    const { syncGuestCartToBackend } = useCartStore();
    const prevUserRef = useRef(null);

    // Set auth checker for cart store
    useEffect(() => {
        // Direct integration with store
        setCartAuthChecker(() => isAuthenticated);
    }, [isAuthenticated]);

    // Handle user login/logout transitions
    useEffect(() => {
        const prevUser = prevUserRef.current;

        // User just logged in (was null, now has user)
        if (!prevUser && user) {
            // Sync guest cart to backend when user logs in
            syncGuestCartToBackend().catch((error) => {
                console.debug('Cart sync handled:', error?.message);
            });
        }

        // Update ref for next comparison
        prevUserRef.current = user;
    }, [user, syncGuestCartToBackend]);

    // Show loading screen while checking auth
    if (loading) {
        return (
            <div className="auth-loading-screen">
                <div className="loading-spinner"></div>
                <p>Initializing...</p>
            </div>
        );
    }

    return children;
}

export default AuthProvider;
