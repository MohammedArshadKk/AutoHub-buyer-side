import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,
            error: null,

            // Actions
            login: (userData) => set({
                user: userData,
                isLoading: false,
                error: null
            }),

            logout: () => set({
                user: null,
                isLoading: false,
                error: null
            }),

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (error) => set({ error, isLoading: false }),

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
