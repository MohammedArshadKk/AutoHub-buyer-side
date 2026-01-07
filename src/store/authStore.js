import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,
            isInitialized: false,
            error: null,
            showLoginModal: false,
            pendingAction: null, // Callback to execute after login

            // Actions
            login: (userData) => set({
                user: userData,
                isLoading: false,
                error: null
            }),

            logout: async () => {
                try {
                    await authService.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                }
                set({
                    user: null,
                    isLoading: false,
                    error: null
                });
            },

            logoutAll: async () => {
                try {
                    await authService.logoutAll();
                } catch (error) {
                    console.error('Logout all error:', error);
                }
                set({
                    user: null,
                    isLoading: false,
                    error: null
                });
            },

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (error) => set({ error, isLoading: false }),

            setInitialized: (initialized) => set({ isInitialized: initialized }),

            // Check auth status from server
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

            // Fetch full user profile
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

            // Refresh token
            refreshToken: async () => {
                return await authService.refreshToken();
            },

            // Login modal controls
            openLoginModal: (pendingAction = null) => set({
                showLoginModal: true,
                pendingAction
            }),

            closeLoginModal: () => set({
                showLoginModal: false,
                pendingAction: null
            }),

            // Execute pending action after successful login
            executePendingAction: () => {
                const { pendingAction } = get();
                if (pendingAction && typeof pendingAction === 'function') {
                    pendingAction();
                }
                set({ pendingAction: null, showLoginModal: false });
            },

            // Getters
            isAuthenticated: () => get().user !== null,
        }),
        {
            name: 'autohub-auth',
            partialize: (state) => ({ user: state.user }),
        }
    )
);

export default useAuthStore;
