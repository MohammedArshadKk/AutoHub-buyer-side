import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';
import useCartStore from './cartStore';

/**
 * Auth Store
 * Manages authentication state with cookie-based tokens.
 * Handles guest data sync on login.
 */
const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,
            isInitialized: false,
            error: null,
            showLoginModal: false,
            pendingAction: null, // Callback to execute after login

            // ============ AUTH ACTIONS ============

            /**
             * Set user data on login
             */
            login: (userData) => set({
                user: userData,
                isLoading: false,
                error: null
            }),

            /**
             * Logout from current device
             * Optionally preserves cart for guest access
             */
            logout: async (preserveCart = false) => {
                try {
                    // Save cart to guest storage before logout if requested
                    if (preserveCart) {
                        useCartStore.getState().saveToGuestStorage();
                    }

                    await authService.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                }

                // Clear cart on logout
                if (!preserveCart) {
                    useCartStore.getState().clearCart();
                }

                set({
                    user: null,
                    isLoading: false,
                    error: null
                });
            },

            /**
             * Logout from all devices
             */
            logoutAll: async () => {
                try {
                    await authService.logoutAll();
                } catch (error) {
                    console.error('Logout all error:', error);
                }

                // Clear cart on logout
                useCartStore.getState().clearCart();

                set({
                    user: null,
                    isLoading: false,
                    error: null
                });
            },

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (error) => set({ error, isLoading: false }),

            setInitialized: (initialized) => set({ isInitialized: initialized }),

            // ============ AUTH CHECK ============

            /**
             * Check auth status from server using cookies
             * Also syncs guest cart if user is authenticated
             */
            checkAuth: async () => {
                try {
                    set({ isLoading: true });
                    const { isAuthenticated, user } = await authService.checkAuthStatus();

                    if (isAuthenticated && user) {
                        set({
                            user: {
                                id: user.id,
                                displayName: user.name,
                                email: user.email,
                                photoURL: user.avatar,
                                role: user.role,
                            },
                            isLoading: false,
                            isInitialized: true,
                            error: null
                        });

                        // Sync guest cart after successful auth
                        useCartStore.getState().syncFromGuestStorage();

                        return true;
                    } else {
                        set({
                            user: null,
                            isLoading: false,
                            isInitialized: true,
                            error: null
                        });
                        return false;
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    set({
                        user: null,
                        isLoading: false,
                        isInitialized: true,
                        error: error.message
                    });
                    return false;
                }
            },

            // ============ USER PROFILE ============

            /**
             * Fetch full user profile from server
             */
            fetchUserProfile: async () => {
                try {
                    const user = await authService.getCurrentUser();
                    set({
                        user: {
                            id: user.id,
                            displayName: user.name,
                            email: user.email,
                            photoURL: user.avatar,
                            role: user.role,
                            phone: user.phone,
                            addresses: user.addresses,
                            isEmailVerified: user.isEmailVerified,
                        },
                        error: null
                    });
                    return true;
                } catch (error) {
                    console.error('Fetch profile failed:', error);
                    return false;
                }
            },

            /**
             * Refresh access token
             */
            refreshToken: async () => {
                return await authService.refreshToken();
            },

            // ============ LOGIN MODAL ============

            /**
             * Open login modal with optional pending action
             * @param {Function} pendingAction - Callback to execute after login
             */
            openLoginModal: (pendingAction = null) => set({
                showLoginModal: true,
                pendingAction
            }),

            /**
             * Close login modal
             */
            closeLoginModal: () => set({
                showLoginModal: false,
                pendingAction: null
            }),

            /**
             * Execute pending action after successful login
             * Also syncs guest cart
             */
            executePendingAction: () => {
                const { pendingAction } = get();

                // Sync guest cart first
                useCartStore.getState().syncFromGuestStorage();

                // Execute pending action if exists
                if (pendingAction && typeof pendingAction === 'function') {
                    pendingAction();
                }

                set({ pendingAction: null, showLoginModal: false });
            },

            // ============ GETTERS ============

            /**
             * Check if user is authenticated
             */
            isAuthenticated: () => get().user !== null,
        }),
        {
            name: 'autohub-auth',
            // Only persist user data, not UI states
            partialize: (state) => ({ user: state.user }),
        }
    )
);

export default useAuthStore;
