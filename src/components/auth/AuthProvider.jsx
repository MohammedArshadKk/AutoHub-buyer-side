import { useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

/**
 * AuthProvider Component
 * Handles initial authentication check for client-side OAuth.
 * Uses persisted user from localStorage (via Zustand).
 * Wrap your app with this component to enable auth features.
 */
function AuthProvider({ children }) {
    const { user, isInitialized, setInitialized } = useAuthStore();
    const syncFromGuestStorage = useCartStore((state) => state.syncFromGuestStorage);
    const prevUserRef = useRef(null);
    const hasInitialized = useRef(false);

    // Initialize auth state on mount
    // For client-side OAuth, we rely on persisted user from localStorage
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            // Mark as initialized - user is already loaded from localStorage by Zustand persist
            setInitialized(true);
        }
    }, [setInitialized]);

    // Handle user login/logout transitions
    useEffect(() => {
        const prevUser = prevUserRef.current;

        // User just logged in (was null, now has user)
        if (!prevUser && user) {
            // Sync guest cart when user logs in
            syncFromGuestStorage();
        }

        // Update ref for next comparison
        prevUserRef.current = user;
    }, [user, syncFromGuestStorage]);

    // Show loading while initializing
    if (!isInitialized) {
        return (
            <div className="auth-provider-loading">
                <div className="auth-provider-spinner" />
            </div>
        );
    }

    return children;
}

export default AuthProvider;
