import { ADDRESS_ENDPOINTS, fetchWithCredentials } from '../config/api';

/**
 * Address Service - Handles all address-related API calls
 * 
 * All endpoints require authentication via accessToken cookie.
 */
const addressService = {
    /**
     * Get all addresses for the authenticated user
     * @returns {Promise<Array>} List of addresses
     */
    getAddresses: async () => {
        try {
            const response = await fetchWithCredentials(ADDRESS_ENDPOINTS.list);
            return response.data.addresses || [];
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
            throw {
                message: error.message || 'Failed to load addresses.',
                status: error.status,
                originalError: error,
            };
        }
    },

    /**
     * Add a new address
     * @param {Object} addressData - Address details
     * @returns {Promise<Object>} Created address
     */
    addAddress: async (addressData) => {
        try {
            const response = await fetchWithCredentials(ADDRESS_ENDPOINTS.list, {
                method: 'POST',
                body: JSON.stringify(addressData),
            });
            return response.data.address;
        } catch (error) {
            console.error('Failed to add address:', error);

            let message = 'Failed to add address.';
            if (error.status === 400) {
                message = error.message || 'Invalid address data.';
            } else if (error.status === 401) {
                message = 'Please login to add addresses.';
            }

            throw {
                message,
                status: error.status,
                originalError: error,
            };
        }
    },

    /**
     * Update an existing address
     * @param {string} addressId - Address ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated address
     */
    updateAddress: async (addressId, updates) => {
        try {
            const response = await fetchWithCredentials(ADDRESS_ENDPOINTS.detail(addressId), {
                method: 'PUT',
                body: JSON.stringify(updates),
            });
            return response.data.address;
        } catch (error) {
            console.error('Failed to update address:', error);

            let message = 'Failed to update address.';
            if (error.status === 404) {
                message = 'Address not found.';
            } else if (error.status === 400) {
                message = error.message || 'Invalid address data.';
            }

            throw {
                message,
                status: error.status,
                originalError: error,
            };
        }
    },

    /**
     * Delete an address
     * @param {string} addressId - Address ID to delete
     * @returns {Promise<void>}
     */
    deleteAddress: async (addressId) => {
        try {
            await fetchWithCredentials(ADDRESS_ENDPOINTS.detail(addressId), {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Failed to delete address:', error);
            throw {
                message: error.message || 'Failed to delete address.',
                status: error.status,
                originalError: error,
            };
        }
    },

    /**
     * Set an address as default
     * @param {string} addressId - Address ID to set as default
     * @returns {Promise<Object>} Updated address
     */
    setDefaultAddress: async (addressId) => {
        try {
            const response = await fetchWithCredentials(ADDRESS_ENDPOINTS.setDefault(addressId), {
                method: 'PATCH',
            });
            return response.data.address;
        } catch (error) {
            console.error('Failed to set default address:', error);
            throw {
                message: error.message || 'Failed to set default address.',
                status: error.status,
                originalError: error,
            };
        }
    },
};

export default addressService;
