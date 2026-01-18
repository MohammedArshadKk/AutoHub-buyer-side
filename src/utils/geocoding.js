/**
 * Geocoding Utilities
 * Functions for reverse geocoding and address parsing
 */

/**
 * Perform reverse geocoding to get address from coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Address components and formatted address
 */
export async function reverseGeocode(lat, lng) {
    if (!window.google || !window.google.maps) {
        throw new Error('Google Maps API not loaded');
    }

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    return new Promise((resolve, reject) => {
        geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const addressData = parseGeocodingResult(results[0]);
                resolve(addressData);
            } else {
                reject(new Error(`Geocoding failed: ${status}`));
            }
        });
    });
}

/**
 * Parse geocoding result into structured address components
 * @param {Object} result - Google Maps Geocoding result
 * @returns {Object} Parsed address components
 */
export function parseGeocodingResult(result) {
    const addressComponents = result.address_components;
    const parsed = {
        formattedAddress: result.formatted_address,
        streetNumber: '',
        route: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        latitude: result.geometry.location.lat(),
        longitude: result.geometry.location.lng(),
    };

    // Extract components
    addressComponents.forEach((component) => {
        const types = component.types;

        if (types.includes('street_number')) {
            parsed.streetNumber = component.long_name;
        }
        if (types.includes('route')) {
            parsed.route = component.long_name;
        }
        if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
            parsed.addressLine2 = component.long_name;
        }
        if (types.includes('locality')) {
            parsed.city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
            parsed.state = component.long_name;
        }
        if (types.includes('postal_code')) {
            parsed.zipCode = component.long_name;
        }
        if (types.includes('country')) {
            parsed.country = component.long_name;
        }
    });

    // Construct address line 1 from street number and route
    if (parsed.streetNumber && parsed.route) {
        parsed.addressLine1 = `${parsed.streetNumber} ${parsed.route}`;
    } else if (parsed.route) {
        parsed.addressLine1 = parsed.route;
    } else {
        // Fallback to neighborhood or sublocality
        const neighborhood = addressComponents.find(
            (c) =>
                c.types.includes('neighborhood') ||
                c.types.includes('sublocality_level_2') ||
                c.types.includes('sublocality_level_3')
        );
        if (neighborhood) {
            parsed.addressLine1 = neighborhood.long_name;
        }
    }

    return parsed;
}

/**
 * Get current user location using browser Geolocation API
 * @returns {Promise<Object>} Object with lat and lng
 */
export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                let message = 'Unable to get your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location permission denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out';
                        break;
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    });
}
