import useAuthStore from '../store/authStore';

/**
 * Custom hook that provides a function to wrap protected actions
 * Shows login modal if user is not authenticated
 * 
 * @returns {function} requireAuth - Function that wraps callbacks requiring authentication
 * 
 * @example
 * const requireAuth = useRequireAuth();
 * 
 * const handleAddToCart = () => {
 *   requireAuth(() => {
 *     // This only runs if user is authenticated
 *     addToCart(product);
 *   });
 * };
 */
function useRequireAuth() {
    const { user, openLoginModal } = useAuthStore();

    /**
     * Wraps a callback function with authentication check
     * If user is authenticated, executes the callback immediately
     * If not, opens the login modal and stores the callback as pending action
     * 
     * @param {function} callback - The action to perform if authenticated
     * @param {object} options - Additional options
     * @param {boolean} options.immediate - If true, don't store as pending action
     */
    const requireAuth = (callback, options = {}) => {
        if (user) {
            // User is authenticated, execute callback immediately
            if (typeof callback === 'function') {
                callback();
            }
        } else {
            // User not authenticated, show login modal
            if (options.immediate) {
                openLoginModal(null);
            } else {
                openLoginModal(callback);
            }
        }
    };

    return requireAuth;
}

export default useRequireAuth;
