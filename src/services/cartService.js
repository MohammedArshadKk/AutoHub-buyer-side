import { CART_ENDPOINTS, fetchWithCredentials } from '../config/api';

/**
 * Cart Service - Handles all cart-related API calls for authenticated users
 * 
 * All endpoints require buyer authentication via accessToken cookie.
 * Backend automatically handles:
 * - Stock validation
 * - Price snapshots
 * - Filtering deleted/inactive products
 */
const cartService = {
    /**
     * Get cart from backend
     * Automatically filters out deleted or inactive products
     * @returns {Promise<Object>} Cart with items, subtotal, totalItems
     */
    getCart: async () => {
        try {
            const response = await fetchWithCredentials(CART_ENDPOINTS.base);
            return response.data.cart;
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            throw {
                message: error.message || 'Failed to load cart. Please try again.',
                status: error.status,
                originalError: error,
            };
        }
    },

    /**
     * Add item to cart or increment quantity if already exists
     * @param {string} productId - Product ID to add
     * @param {number} quantity - Quantity to add (must be >= 1)
     * @returns {Promise<Object>} Updated cart
     */
    addItem: async (productId, quantity = 1) => {
        try {
            const response = await fetchWithCredentials(CART_ENDPOINTS.base, {
                method: 'POST',
                body: JSON.stringify({ productId, quantity }),
            });
            return response.data.cart;
        } catch (error) {
            console.error('Failed to add item to cart:', error);

            // Provide user-friendly error messages
            let message = 'Failed to add item to cart.';

            if (error.status === 400) {
                // Stock or validation errors
                message = error.message || error.data?.message || 'Product is not available or out of stock.';
            } else if (error.status === 404) {
                message = 'Product not found.';
            } else if (error.status === 401) {
                message = 'Please login to add items to cart.';
            }

            throw {
                message,
                status: error.status,
                originalError: error,
            };
        }
    },

    /**
     * Update item quantity in cart
     * Set quantity to 0 to remove the item
     * @param {string} productId - Product ID to update
     * @param {number} quantity - New quantity (>= 0)
     * @returns {Promise<Object>} Updated cart
     */
    updateQuantity: async (productId, quantity) => {
        try {
            const response = await fetchWithCredentials(CART_ENDPOINTS.item(productId), {
                method: 'PUT',
                body: JSON.stringify({ quantity }),
            });
            return response.data.cart;
        } catch (error) {
            console.error('Failed to update cart item:', error);

            let message = 'Failed to update quantity.';

            if (error.status === 400) {
                message = error.message || error.data?.message || 'Invalid quantity or insufficient stock.';
            } else if (error.status === 404) {
                message = 'Product not found in cart.';
            }

            throw {
                message,
                status: error.status,
                originalError: error,
            };
        }
    },

    /**
     * Remove item from cart
     * @param {string} productId - Product ID to remove
     * @returns {Promise<Object>} Updated cart
     */
    removeItem: async (productId) => {
        try {
            const response = await fetchWithCredentials(CART_ENDPOINTS.item(productId), {
                method: 'DELETE',
            });
            return response.data.cart;
        } catch (error) {
            console.error('Failed to remove cart item:', error);
            throw {
                message: error.message || 'Failed to remove item from cart.',
                status: error.status,
                originalError: error,
            };
        }
    },

    /**
     * Clear entire cart
     * @returns {Promise<Object>} Empty cart
     */
    clearCart: async () => {
        try {
            const response = await fetchWithCredentials(CART_ENDPOINTS.base, {
                method: 'DELETE',
            });
            return response.data.cart;
        } catch (error) {
            console.error('Failed to clear cart:', error);
            throw {
                message: error.message || 'Failed to clear cart.',
                status: error.status,
                originalError: error,
            };
        }
    },

    /**
     * Sync guest cart items to backend
     * Adds all guest items to backend cart (merges quantities if exists)
     * @param {Array} guestItems - Array of guest cart items
     * @returns {Promise<Object>} Merged cart from backend
     */
    syncGuestCart: async (guestItems) => {
        if (!guestItems || guestItems.length === 0) {
            // No items to sync, just fetch current cart
            return await cartService.getCart();
        }

        try {
            // Add each guest item to backend cart
            // Backend handles merging if item already exists
            for (const item of guestItems) {
                try {
                    await cartService.addItem(item.id || item._id, item.quantity);
                } catch (itemError) {
                    // Log but continue - some items might fail (out of stock, deleted, etc.)
                    console.warn(`Failed to sync item ${item.id}:`, itemError.message);
                }
            }

            // Fetch final merged cart
            return await cartService.getCart();
        } catch (error) {
            console.error('Failed to sync guest cart:', error);
            throw {
                message: 'Failed to sync your cart. Please try again.',
                status: error.status,
                originalError: error,
            };
        }
    },
};

export default cartService;
