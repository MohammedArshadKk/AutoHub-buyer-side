import { AUTH_ENDPOINTS, fetchWithCredentials } from '../config/api';

/**
 * Auth Service - Handles all authentication-related API calls
 */
const authService = {
    /**
     * Get the Google OAuth login URL
     * Redirects the user to Google for authentication
     */
    getGoogleLoginUrl: () => {
        return AUTH_ENDPOINTS.googleLogin;
    },

    /**
     * Initiate Google login by redirecting to OAuth URL
     */
    initiateGoogleLogin: () => {
        window.location.href = AUTH_ENDPOINTS.googleLogin;
    },

    /**
     * Check if user is currently authenticated
     * @returns {Promise<{isAuthenticated: boolean, user?: object}>}
     */
    checkAuthStatus: async () => {
        try {
            const response = await fetchWithCredentials(AUTH_ENDPOINTS.status);
            return response.data;
        } catch (error) {
            console.error('Auth status check failed:', error);
            return { isAuthenticated: false };
        }
    },

    /**
     * Get the current authenticated user's full profile
     * @returns {Promise<object>}
     */
    getCurrentUser: async () => {
        const response = await fetchWithCredentials(AUTH_ENDPOINTS.me);
        return response.data.user;
    },

    /**
     * Update the current user's profile
     * @param {object} userData - User data to update
     * @returns {Promise<object>}
     */
    updateProfile: async (userData) => {
        const response = await fetchWithCredentials(AUTH_ENDPOINTS.me, {
            method: 'PATCH',
            body: JSON.stringify(userData),
        });
        return response.data.user;
    },

    /**
     * Refresh the access token using the refresh token cookie
     * @returns {Promise<boolean>}
     */
    refreshToken: async () => {
        try {
            await fetchWithCredentials(AUTH_ENDPOINTS.refresh, {
                method: 'POST',
            });
            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    },

    /**
     * Logout from current device
     * @returns {Promise<boolean>}
     */
    logout: async () => {
        try {
            await fetchWithCredentials(AUTH_ENDPOINTS.logout, {
                method: 'POST',
            });
            return true;
        } catch (error) {
            console.error('Logout failed:', error);
            return false;
        }
    },

    /**
     * Logout from all devices
     * @returns {Promise<boolean>}
     */
    logoutAll: async () => {
        try {
            await fetchWithCredentials(AUTH_ENDPOINTS.logoutAll, {
                method: 'POST',
            });
            return true;
        } catch (error) {
            console.error('Logout all failed:', error);
            return false;
        }
    },
};

export default authService;
