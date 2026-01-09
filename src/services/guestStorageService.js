/**
 * Guest Storage Service
 * Manages guest user data in localStorage for cart, wishlist, and other actions
 * that can be synced when the user logs in.
 */

const STORAGE_KEYS = {
    GUEST_CART: 'autohub-guest-cart',
    GUEST_WISHLIST: 'autohub-guest-wishlist',
    PENDING_ACTIONS: 'autohub-pending-actions',
};

/**
 * Safely parse JSON from localStorage
 */
const safeJsonParse = (value, fallback = null) => {
    try {
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.error('Failed to parse localStorage value:', error);
        return fallback;
    }
};

const guestStorageService = {
    // ============ CART METHODS ============

    /**
     * Get guest cart items from localStorage
     * @returns {Array} Array of cart items
     */
    getGuestCart: () => {
        const data = localStorage.getItem(STORAGE_KEYS.GUEST_CART);
        return safeJsonParse(data, []);
    },

    /**
     * Save cart items to localStorage for guest user
     * @param {Array} items - Cart items to save
     */
    saveGuestCart: (items) => {
        try {
            localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(items));
        } catch (error) {
            console.error('Failed to save guest cart:', error);
        }
    },

    /**
     * Clear guest cart from localStorage
     */
    clearGuestCart: () => {
        localStorage.removeItem(STORAGE_KEYS.GUEST_CART);
    },

    /**
     * Check if guest has items in cart
     * @returns {boolean}
     */
    hasGuestCart: () => {
        const cart = guestStorageService.getGuestCart();
        return cart.length > 0;
    },

    /**
     * Get guest cart item count
     * @returns {number}
     */
    getGuestCartCount: () => {
        const cart = guestStorageService.getGuestCart();
        return cart.reduce((total, item) => total + (item.quantity || 1), 0);
    },

    // ============ WISHLIST METHODS ============

    /**
     * Get guest wishlist from localStorage
     * @returns {Array} Array of wishlist items
     */
    getGuestWishlist: () => {
        const data = localStorage.getItem(STORAGE_KEYS.GUEST_WISHLIST);
        return safeJsonParse(data, []);
    },

    /**
     * Save wishlist to localStorage for guest user
     * @param {Array} items - Wishlist items to save
     */
    saveGuestWishlist: (items) => {
        try {
            localStorage.setItem(STORAGE_KEYS.GUEST_WISHLIST, JSON.stringify(items));
        } catch (error) {
            console.error('Failed to save guest wishlist:', error);
        }
    },

    /**
     * Add item to guest wishlist
     * @param {Object} product - Product to add
     */
    addToGuestWishlist: (product) => {
        const wishlist = guestStorageService.getGuestWishlist();
        if (!wishlist.find(item => item.id === product.id)) {
            wishlist.push(product);
            guestStorageService.saveGuestWishlist(wishlist);
        }
    },

    /**
     * Remove item from guest wishlist
     * @param {string} productId - Product ID to remove
     */
    removeFromGuestWishlist: (productId) => {
        const wishlist = guestStorageService.getGuestWishlist();
        const filtered = wishlist.filter(item => item.id !== productId);
        guestStorageService.saveGuestWishlist(filtered);
    },

    /**
     * Clear guest wishlist from localStorage
     */
    clearGuestWishlist: () => {
        localStorage.removeItem(STORAGE_KEYS.GUEST_WISHLIST);
    },

    /**
     * Check if item is in guest wishlist
     * @param {string} productId - Product ID to check
     * @returns {boolean}
     */
    isInGuestWishlist: (productId) => {
        const wishlist = guestStorageService.getGuestWishlist();
        return wishlist.some(item => item.id === productId);
    },

    // ============ PENDING ACTIONS ============

    /**
     * Store a pending action to be executed after login
     * @param {Object} action - Action object with type and payload
     */
    addPendingAction: (action) => {
        const actions = guestStorageService.getPendingActions();
        actions.push({ ...action, timestamp: Date.now() });
        try {
            localStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(actions));
        } catch (error) {
            console.error('Failed to save pending action:', error);
        }
    },

    /**
     * Get all pending actions
     * @returns {Array} Array of pending actions
     */
    getPendingActions: () => {
        const data = localStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS);
        return safeJsonParse(data, []);
    },

    /**
     * Clear all pending actions
     */
    clearPendingActions: () => {
        localStorage.removeItem(STORAGE_KEYS.PENDING_ACTIONS);
    },

    // ============ UTILITY METHODS ============

    /**
     * Clear all guest data from localStorage
     * Called after successful sync to authenticated account
     */
    clearAllGuestData: () => {
        guestStorageService.clearGuestCart();
        guestStorageService.clearGuestWishlist();
        guestStorageService.clearPendingActions();
    },

    /**
     * Get summary of guest data for sync
     * @returns {Object} Summary of guest cart, wishlist, and pending actions
     */
    getGuestDataSummary: () => {
        return {
            cart: guestStorageService.getGuestCart(),
            cartCount: guestStorageService.getGuestCartCount(),
            wishlist: guestStorageService.getGuestWishlist(),
            pendingActions: guestStorageService.getPendingActions(),
            hasData: guestStorageService.hasGuestCart() ||
                guestStorageService.getGuestWishlist().length > 0 ||
                guestStorageService.getPendingActions().length > 0,
        };
    },
};

export default guestStorageService;
