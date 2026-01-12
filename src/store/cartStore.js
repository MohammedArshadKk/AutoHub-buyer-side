import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import guestStorageService from '../services/guestStorageService';
import cartService from '../services/cartService';

// Auth checker will be set by AuthProvider - allows cart to check auth without direct dependency
let authChecker = null;
export const setCartAuthChecker = (checker) => {
    authChecker = checker;
};

/**
 * Cart Store - Hybrid Implementation
 * 
 * - Guest users: Cart stored in localStorage
 * - Authenticated users: Cart synced with backend API
 * - Auto-sync: Guest cart merged to backend on login
 * 
 * The store automatically detects user authentication status and routes
 * operations to either local storage or backend API accordingly.
 */
const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,
            error: null,
            lastSynced: null,
            // Login modal state (moved from authStore)
            showLoginModal: false,
            pendingAction: null,

            // ============ HELPER: Check if user is authenticated ============

            _isAuthenticated: () => {
                // Use external auth checker if available
                return authChecker ? authChecker() : false;
            },

            // ============ CART ACTIONS (Hybrid: Local or Backend) ============

            /**
             * Add item to cart
             * - Authenticated: POST to backend
             * - Guest: Update localStorage
             * @param {Object} product - Product object
             * @param {number} quantity - Quantity to add
             */
            addItem: async (product, quantity = 1) => {
                const isAuth = get()._isAuthenticated();

                if (!isAuth) {
                    // Guest mode: Local storage
                    const items = get().items;
                    const existingIndex = items.findIndex(item => item.id === product.id);

                    let newItems;
                    if (existingIndex >= 0) {
                        newItems = [...items];
                        newItems[existingIndex].quantity += quantity;
                    } else {
                        newItems = [...items, { ...product, quantity, addedAt: Date.now() }];
                    }

                    set({ items: newItems });
                    return;
                }

                // Authenticated mode: Backend API
                set({ isLoading: true, error: null });

                try {
                    const productId = product.id || product._id;
                    const cart = await cartService.addItem(productId, quantity);

                    // Transform backend cart to local format
                    const items = cart.items.map(item => ({
                        ...item.product,
                        id: item.product._id,
                        image: item.product.images?.[0] || item.product.image, // Backward compatibility
                        quantity: item.quantity,
                        priceSnapshot: item.priceSnapshot,
                        addedAt: item.addedAt,
                    }));

                    set({
                        items,
                        isLoading: false,
                        lastSynced: Date.now(),
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error.message
                    });
                    // Optionally show toast notification here
                    console.error('Add to cart failed:', error.message);
                    throw error;
                }
            },

            /**
             * Remove item from cart
             * @param {string} productId - Product ID to remove
             */
            removeItem: async (productId) => {
                const isAuth = get()._isAuthenticated();

                if (!isAuth) {
                    // Guest mode
                    set({ items: get().items.filter(item => item.id !== productId) });
                    return;
                }

                // Authenticated mode
                set({ isLoading: true, error: null });

                try {
                    const cart = await cartService.removeItem(productId);

                    const items = cart.items.map(item => ({
                        ...item.product,
                        id: item.product._id,
                        image: item.product.images?.[0] || item.product.image,
                        quantity: item.quantity,
                        priceSnapshot: item.priceSnapshot,
                        addedAt: item.addedAt,
                    }));

                    set({
                        items,
                        isLoading: false,
                        lastSynced: Date.now(),
                    });
                } catch (error) {
                    set({ isLoading: false, error: error.message });
                    console.error('Remove from cart failed:', error.message);
                    throw error;
                }
            },

            /**
             * Update item quantity
             * @param {string} productId - Product ID
             * @param {number} quantity - New quantity (0 to remove)
             */
            updateQuantity: async (productId, quantity) => {
                if (quantity <= 0) {
                    return get().removeItem(productId);
                }

                const isAuth = get()._isAuthenticated();

                if (!isAuth) {
                    // Guest mode
                    const items = get().items.map(item =>
                        item.id === productId ? { ...item, quantity } : item
                    );
                    set({ items });
                    return;
                }

                // Authenticated mode
                set({ isLoading: true, error: null });

                try {
                    const cart = await cartService.updateQuantity(productId, quantity);

                    const items = cart.items.map(item => ({
                        ...item.product,
                        id: item.product._id,
                        image: item.product.images?.[0] || item.product.image,
                        quantity: item.quantity,
                        priceSnapshot: item.priceSnapshot,
                        addedAt: item.addedAt,
                    }));

                    set({
                        items,
                        isLoading: false,
                        lastSynced: Date.now(),
                    });
                } catch (error) {
                    set({ isLoading: false, error: error.message });
                    console.error('Update quantity failed:', error.message);
                    throw error;
                }
            },

            /**
             * Clear entire cart
             */
            clearCart: async () => {
                const isAuth = get()._isAuthenticated();

                if (!isAuth) {
                    // Guest mode
                    set({ items: [], lastSynced: null });
                    return;
                }

                // Authenticated mode
                set({ isLoading: true, error: null });

                try {
                    await cartService.clearCart();
                    set({
                        items: [],
                        isLoading: false,
                        lastSynced: Date.now(),
                    });
                } catch (error) {
                    set({ isLoading: false, error: error.message });
                    console.error('Clear cart failed:', error.message);
                    throw error;
                }
            },

            // ============ BACKEND SYNC (Authenticated Only) ============

            /**
             * Fetch cart from backend
             * Only for authenticated users
             */
            fetchCart: async () => {
                const isAuth = get()._isAuthenticated();

                if (!isAuth) {
                    console.warn('Cannot fetch cart: User not authenticated');
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    const cart = await cartService.getCart();

                    const items = cart.items.map(item => ({
                        ...item.product,
                        id: item.product._id,
                        image: item.product.images?.[0] || item.product.image,
                        quantity: item.quantity,
                        priceSnapshot: item.priceSnapshot,
                        addedAt: item.addedAt,
                    }));

                    set({
                        items,
                        isLoading: false,
                        lastSynced: Date.now(),
                    });
                } catch (error) {
                    // Special handling for 401 - user session expired or invalid
                    if (error.status === 401) {
                        console.warn('Cart fetch failed: User not authenticated or session expired');
                        // Clear error state silently - this is expected when not logged in
                        set({ isLoading: false, error: null, items: [] });
                        return;
                    }

                    // For other errors, log and set error state
                    set({ isLoading: false, error: error.message });
                    console.error('Fetch cart failed:', error.message);
                }
            },

            /**
             * Sync guest cart to backend after login
             * Merges local guest items with backend cart
             */
            syncGuestCartToBackend: async () => {
                const isAuth = get()._isAuthenticated();

                if (!isAuth) {
                    console.warn('Cannot sync: User not authenticated');
                    return;
                }

                const guestItems = get().items;

                if (guestItems.length === 0) {
                    // No guest items, just fetch backend cart
                    await get().fetchCart();
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    console.log(`Syncing ${guestItems.length} guest items to backend...`);

                    // Sync guest cart to backend
                    const cart = await cartService.syncGuestCart(guestItems);

                    // Update local cart with merged backend cart
                    const items = cart.items.map(item => ({
                        ...item.product,
                        id: item.product._id,
                        image: item.product.images?.[0] || item.product.image,
                        quantity: item.quantity,
                        priceSnapshot: item.priceSnapshot,
                        addedAt: item.addedAt,
                    }));

                    set({
                        items,
                        isLoading: false,
                        lastSynced: Date.now(),
                    });

                    // Clear guest storage
                    guestStorageService.clearGuestCart();

                    console.log('Guest cart synced successfully');
                } catch (error) {
                    // Handle 401 errors - session expired or invalid
                    if (error.status === 401) {
                        console.warn('Cart sync failed: User not authenticated or session expired');
                        set({ isLoading: false, error: null });
                        return;
                    }

                    set({ isLoading: false, error: error.message });
                    console.error('Sync failed:', error.message);
                    // Keep local items as fallback
                }
            },

            // ============ GUEST SYNC METHODS (Legacy - kept for compatibility) ============

            /**
             * Merge guest cart with current cart
             * @deprecated Use syncGuestCartToBackend instead
             */
            mergeGuestCart: (guestItems) => {
                if (!guestItems || guestItems.length === 0) return;

                const currentItems = get().items;
                const mergedItems = [...currentItems];

                guestItems.forEach(guestItem => {
                    const existingIndex = mergedItems.findIndex(item => item.id === guestItem.id);
                    if (existingIndex >= 0) {
                        mergedItems[existingIndex].quantity += guestItem.quantity;
                    } else {
                        mergedItems.push({ ...guestItem, addedAt: Date.now() });
                    }
                });

                set({ items: mergedItems });
            },

            /**
             * Save current cart to guest storage (on logout)
             */
            saveToGuestStorage: () => {
                const items = get().items;
                if (items.length > 0) {
                    guestStorageService.saveGuestCart(items);
                }
            },

            // ============ COMPUTED VALUES ============

            /**
             * Get total number of items in cart
             */
            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            /**
             * Get total price of all items
             */
            getTotalPrice: () => {
                return get().items.reduce(
                    (total, item) => {
                        // Use priceSnapshot if available (from backend), otherwise use price
                        const price = item.priceSnapshot || item.price;
                        return total + price * item.quantity;
                    },
                    0
                );
            },

            /**
             * Check if a product is in cart
             */
            isInCart: (productId) => {
                return get().items.some(item => item.id === productId);
            },

            /**
             * Get quantity of a specific item
             */
            getItemQuantity: (productId) => {
                const item = get().items.find(item => item.id === productId);
                return item ? item.quantity : 0;
            },

            // ============ LOGIN MODAL (for cart actions requiring auth) ============

            /**
             * Open login modal with optional pending action
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
             * Get pending action
             */
            getPendingAction: () => get().pendingAction,

            /**
             * Execute pending action and close modal
             */
            executePendingAction: () => {
                const { pendingAction } = get();
                if (pendingAction && typeof pendingAction === 'function') {
                    pendingAction();
                }
                set({ pendingAction: null, showLoginModal: false });
            },

            // ============ LOADING STATE ============

            setLoading: (isLoading) => set({ isLoading }),

            clearError: () => set({ error: null }),
        }),
        {
            name: 'autohub-cart',
            // Only persist items and lastSynced, not loading/error/modal states
            partialize: (state) => ({
                items: state.items,
                lastSynced: state.lastSynced,
            }),
        }
    )
);

export default useCartStore;
