import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import guestStorageService from '../services/guestStorageService';

/**
 * Cart Store
 * Manages cart state for both guest and authenticated users.
 * Cart is always stored locally for immediate access.
 * When user logs in, guest cart is merged with existing cart.
 */
const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,
            lastSynced: null,

            // ============ CART ACTIONS ============

            /**
             * Add item to cart (works for both guest and authenticated)
             */
            addItem: (product, quantity = 1) => {
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
            },

            /**
             * Remove item from cart
             */
            removeItem: (productId) => {
                set({ items: get().items.filter(item => item.id !== productId) });
            },

            /**
             * Update item quantity
             */
            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                const items = get().items.map(item =>
                    item.id === productId ? { ...item, quantity } : item
                );
                set({ items });
            },

            /**
             * Clear entire cart
             */
            clearCart: () => set({ items: [], lastSynced: null }),

            // ============ GUEST SYNC METHODS ============

            /**
             * Merge guest cart with current cart
             * Called after successful login to sync guest items
             * @param {Array} guestItems - Items from guest cart
             */
            mergeGuestCart: (guestItems) => {
                if (!guestItems || guestItems.length === 0) return;

                const currentItems = get().items;
                const mergedItems = [...currentItems];

                guestItems.forEach(guestItem => {
                    const existingIndex = mergedItems.findIndex(item => item.id === guestItem.id);
                    if (existingIndex >= 0) {
                        // Item exists, add quantities
                        mergedItems[existingIndex].quantity += guestItem.quantity;
                    } else {
                        // New item, add to cart
                        mergedItems.push({ ...guestItem, addedAt: Date.now() });
                    }
                });

                set({ items: mergedItems });
            },

            /**
             * Sync guest cart data after login
             * Retrieves guest cart from localStorage and merges with current cart
             */
            syncFromGuestStorage: () => {
                const guestCart = guestStorageService.getGuestCart();
                if (guestCart.length > 0) {
                    get().mergeGuestCart(guestCart);
                    guestStorageService.clearGuestCart();
                    console.log('Guest cart synced successfully');
                }
            },

            /**
             * Save current cart to guest storage
             * Used when user logs out to preserve cart
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
                    (total, item) => total + item.price * item.quantity,
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

            // ============ LOADING STATE ============

            setLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: 'autohub-cart',
            // Only persist items, not loading states
            partialize: (state) => ({
                items: state.items,
                lastSynced: state.lastSynced,
            }),
        }
    )
);

export default useCartStore;
