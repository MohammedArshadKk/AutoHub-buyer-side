/**
 * Google Maps API Loader Utility
 * Dynamically loads the Google Maps JavaScript API
 */

let isLoading = false;
let isLoaded = false;
let loadPromise = null;

/**
 * Load Google Maps JavaScript API
 * @returns {Promise<void>} Resolves when Google Maps is ready
 */
export function loadGoogleMaps() {
    // Return existing promise if already loading
    if (isLoading) {
        return loadPromise;
    }

    // Return resolved promise if already loaded
    if (isLoaded) {
        return Promise.resolve();
    }

    // Check if API key is configured
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        return Promise.reject(
            new Error(
                'Google Maps API key not found. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file'
            )
        );
    }

    // Start loading
    isLoading = true;

    loadPromise = new Promise((resolve, reject) => {
        try {
            // Check if already loaded by another script
            if (window.google && window.google.maps) {
                isLoaded = true;
                isLoading = false;
                resolve();
                return;
            }

            // Create script element
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
            script.async = true;
            script.defer = true;

            // Handle successful load
            script.onload = () => {
                isLoaded = true;
                isLoading = false;
                resolve();
            };

            // Handle loading errors
            script.onerror = () => {
                isLoading = false;
                reject(
                    new Error(
                        'Failed to load Google Maps API. Please check your API key and internet connection.'
                    )
                );
            };

            // Append to document
            document.head.appendChild(script);
        } catch (error) {
            isLoading = false;
            reject(error);
        }
    });

    return loadPromise;
}

/**
 * Check if Google Maps is loaded
 * @returns {boolean}
 */
export function isGoogleMapsLoaded() {
    return isLoaded && window.google && window.google.maps;
}
