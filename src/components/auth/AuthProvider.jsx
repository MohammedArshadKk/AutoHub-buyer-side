import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import useCartStore, { setCartAuthChecker } from '../../store/cartStore';

/**
 * AuthProvider Component
 * Handles cart synchronization when user logs in.
 * Auth state is managed by AuthContext.
 */
function AuthProvider({ children }) {
    const { user, isAuthenticated } = useAuth();
    const { syncGuestCartToBackend, fetchCart } = useCartStore();
    const prevUserRef = useRef(null);

    // Set auth checker for cart store
    useEffect(() => {
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

        // User just logged out (had user, now null)
        if (prevUser && !user) {
            // Cart is already cleared by logout action in AuthContext
        }

        // Update ref for next comparison
        prevUserRef.current = user;
    }, [user, syncGuestCartToBackend]);

    // Fetch cart on mount if user is logged in
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart().catch((error) => {
                console.debug('Initial cart fetch handled:', error?.message);
            });
        }
    }, [isAuthenticated, fetchCart]);

    return children;
}

export default AuthProvider;
