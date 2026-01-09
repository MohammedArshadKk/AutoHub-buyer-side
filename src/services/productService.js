import { PRODUCT_ENDPOINTS, VEHICLE_ENDPOINTS, fetchWithCredentials } from '../config/api';

/**
 * Product Service - Handles all product-related API calls
 */
const productService = {
    /**
     * Get products list with filters and pagination
     * @param {Object} params - Query parameters
     * @returns {Promise<{products: Array, pagination: Object}>}
     */
    getProducts: async (params = {}) => {
        const queryParams = new URLSearchParams();

        // Add all provided params to query string
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const queryString = queryParams.toString();
        const url = queryString
            ? `${PRODUCT_ENDPOINTS.list}?${queryString}`
            : PRODUCT_ENDPOINTS.list;

        const response = await fetchWithCredentials(url);
        return {
            products: response.data?.products || [],
            pagination: response.pagination || {
                page: 1,
                limit: 20,
                total: 0,
                pages: 0,
                hasNext: false,
                hasPrev: false,
            },
            results: response.results || 0,
        };
    },

    /**
     * Get single product by ID
     * @param {string} id - Product ID
     * @returns {Promise<Object>}
     */
    getProductById: async (id) => {
        const response = await fetchWithCredentials(PRODUCT_ENDPOINTS.detail(id));
        return response.data?.product || null;
    },

    /**
     * Get trending products
     * @param {number} limit - Number of products to return
     * @returns {Promise<Array>}
     */
    getTrendingProducts: async (limit = 4) => {
        const response = await fetchWithCredentials(
            `${PRODUCT_ENDPOINTS.trending}?limit=${limit}`
        );
        return response.data?.products || [];
    },

    /**
     * Get all categories
     * @returns {Promise<Array>}
     */
    getCategories: async () => {
        const response = await fetchWithCredentials(PRODUCT_ENDPOINTS.categories);
        return response.data?.categories || [];
    },

    /**
     * Get vehicle makes
     * @returns {Promise<Array>}
     */
    getVehicleMakes: async () => {
        const response = await fetchWithCredentials(VEHICLE_ENDPOINTS.makes);
        return response.data?.makes || [];
    },

    /**
     * Get vehicle models for a make
     * @param {string} make - Vehicle make
     * @returns {Promise<Array>}
     */
    getVehicleModels: async (make) => {
        const response = await fetchWithCredentials(
            `${VEHICLE_ENDPOINTS.models}?make=${encodeURIComponent(make)}`
        );
        return response.data?.models || [];
    },

    /**
     * Get vehicle years for a make and model
     * @param {string} make - Vehicle make
     * @param {string} model - Vehicle model
     * @returns {Promise<Array>}
     */
    getVehicleYears: async (make, model) => {
        const response = await fetchWithCredentials(
            `${VEHICLE_ENDPOINTS.years}?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`
        );
        return response.data?.years || [];
    },
};

export default productService;
