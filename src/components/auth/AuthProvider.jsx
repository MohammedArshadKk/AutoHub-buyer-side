import { useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';

/**
 * AuthProvider Component
 * Handles initial authentication check and token refresh
 * Wrap your app with this component to enable auth features
 */
function AuthProvider({ children }) {
    const { checkAuth, refreshToken, isInitialized, user } = useAuthStore();
    const refreshIntervalRef = useRef(null);

    // Check auth status on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Set up token refresh interval (every 10 minutes)
    useEffect(() => {
        if (user && !refreshIntervalRef.current) {
            // Refresh token every 10 minutes (before 15 min expiry)
            refreshIntervalRef.current = setInterval(() => {
                refreshToken();
            }, 10 * 60 * 1000);
        }

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }
        };
    }, [user, refreshToken]);

    // Show nothing while checking initial auth status
    // You could show a loading spinner here if preferred
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
