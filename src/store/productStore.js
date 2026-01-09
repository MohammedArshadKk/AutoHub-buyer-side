import { create } from 'zustand';
import productService from '../services/productService';

/**
 * Product Store
 * Manages products state with loading, error handling, filters, and pagination
 */
const useProductStore = create((set, get) => ({
    // Product list state
    products: [],
    isLoading: false,
    error: null,

    // Pagination state
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false,
    },

    // Filter state
    filters: {
        category: '',
        condition: '',
        minPrice: '',
        maxPrice: '',
        make: '',
        model: '',
        year: '',
        search: '',
        brand: '',
        inStock: false,
        sort: '-createdAt',
    },

    // Categories
    categories: [],
    categoriesLoading: false,

    // Vehicle data
    vehicleMakes: [],
    vehicleModels: [],
    vehicleYears: [],

    // Single product
    currentProduct: null,
    currentProductLoading: false,
    currentProductError: null,

    // Trending products
    trendingProducts: [],
    trendingLoading: false,

    // ============ ACTIONS ============

    /**
     * Fetch products with current filters and pagination
     */
    fetchProducts: async (params = {}) => {
        const { filters, pagination } = get();

        set({ isLoading: true, error: null });

        try {
            const queryParams = {
                page: params.page || pagination.page,
                limit: params.limit || pagination.limit,
                ...filters,
                ...params,
            };

            // Remove empty values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
                    delete queryParams[key];
                }
            });

            const result = await productService.getProducts(queryParams);

            set({
                products: result.products,
                pagination: result.pagination,
                isLoading: false,
                error: null,
            });

            return result;
        } catch (error) {
            console.error('Failed to fetch products:', error);
            set({
                products: [],
                isLoading: false,
                error: error.message || 'Failed to load products',
            });
            throw error;
        }
    },

    /**
     * Update filters and refetch products
     */
    setFilters: async (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
            pagination: { ...state.pagination, page: 1 }, // Reset to page 1 when filters change
        }));

        await get().fetchProducts({ page: 1 });
    },

    /**
     * Set a single filter value
     */
    setFilter: (key, value) => {
        set((state) => ({
            filters: { ...state.filters, [key]: value },
        }));
    },

    /**
     * Clear all filters
     */
    clearFilters: async () => {
        set({
            filters: {
                category: '',
                condition: '',
                minPrice: '',
                maxPrice: '',
                make: '',
                model: '',
                year: '',
                search: '',
                brand: '',
                inStock: false,
                sort: '-createdAt',
            },
            pagination: { page: 1, limit: 20, total: 0, pages: 0, hasNext: false, hasPrev: false },
        });

        await get().fetchProducts({ page: 1 });
    },

    /**
     * Go to specific page
     */
    goToPage: async (page) => {
        set((state) => ({
            pagination: { ...state.pagination, page },
        }));

        await get().fetchProducts({ page });
    },

    /**
     * Go to next page
     */
    nextPage: async () => {
        const { pagination } = get();
        if (pagination.hasNext) {
            await get().goToPage(pagination.page + 1);
        }
    },

    /**
     * Go to previous page
     */
    prevPage: async () => {
        const { pagination } = get();
        if (pagination.hasPrev) {
            await get().goToPage(pagination.page - 1);
        }
    },

    /**
     * Fetch single product by ID
     */
    fetchProductById: async (id) => {
        set({ currentProductLoading: true, currentProductError: null });

        try {
            const product = await productService.getProductById(id);
            set({
                currentProduct: product,
                currentProductLoading: false,
                currentProductError: null,
            });
            return product;
        } catch (error) {
            console.error('Failed to fetch product:', error);
            set({
                currentProduct: null,
                currentProductLoading: false,
                currentProductError: error.message || 'Failed to load product',
            });
            throw error;
        }
    },

    /**
     * Fetch trending products
     */
    fetchTrendingProducts: async (limit = 4) => {
        set({ trendingLoading: true });

        try {
            const products = await productService.getTrendingProducts(limit);
            set({
                trendingProducts: products,
                trendingLoading: false,
            });
            return products;
        } catch (error) {
            console.error('Failed to fetch trending products:', error);
            set({ trendingLoading: false });
            // Don't throw - trending is non-critical
            return [];
        }
    },

    /**
     * Fetch categories
     */
    fetchCategories: async () => {
        set({ categoriesLoading: true });

        try {
            const categories = await productService.getCategories();
            set({
                categories,
                categoriesLoading: false,
            });
            return categories;
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            set({ categoriesLoading: false });
            return [];
        }
    },

    /**
     * Fetch vehicle makes
     */
    fetchVehicleMakes: async () => {
        try {
            const makes = await productService.getVehicleMakes();
            set({ vehicleMakes: makes });
            return makes;
        } catch (error) {
            console.error('Failed to fetch vehicle makes:', error);
            return [];
        }
    },

    /**
     * Fetch vehicle models for a make
     */
    fetchVehicleModels: async (make) => {
        try {
            const models = await productService.getVehicleModels(make);
            set({ vehicleModels: models });
            return models;
        } catch (error) {
            console.error('Failed to fetch vehicle models:', error);
            return [];
        }
    },

    /**
     * Fetch vehicle years for make and model
     */
    fetchVehicleYears: async (make, model) => {
        try {
            const years = await productService.getVehicleYears(make, model);
            set({ vehicleYears: years });
            return years;
        } catch (error) {
            console.error('Failed to fetch vehicle years:', error);
            return [];
        }
    },

    /**
     * Clear current product
     */
    clearCurrentProduct: () => {
        set({
            currentProduct: null,
            currentProductLoading: false,
            currentProductError: null,
        });
    },

    /**
     * Reset entire store
     */
    reset: () => {
        set({
            products: [],
            isLoading: false,
            error: null,
            pagination: { page: 1, limit: 20, total: 0, pages: 0, hasNext: false, hasPrev: false },
            filters: {
                category: '',
                condition: '',
                minPrice: '',
                maxPrice: '',
                make: '',
                model: '',
                year: '',
                search: '',
                brand: '',
                inStock: false,
                sort: '-createdAt',
            },
            currentProduct: null,
            trendingProducts: [],
        });
    },
}));

export default useProductStore;
