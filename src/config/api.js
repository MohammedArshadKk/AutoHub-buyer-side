// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Auth endpoints
export const AUTH_ENDPOINTS = {
    googleLogin: `${API_BASE_URL}/auth/google`,
    status: `${API_BASE_URL}/auth/status`,
    me: `${API_BASE_URL}/auth/me`,
    refresh: `${API_BASE_URL}/auth/refresh`,
    logout: `${API_BASE_URL}/auth/logout`,
    logoutAll: `${API_BASE_URL}/auth/logout-all`,
};

// Fetch wrapper with credentials (for cookies)
export const fetchWithCredentials = async (url, options = {}) => {
    const response = await fetch(url, {
        ...options,
        credentials: 'include', // Include cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return { status: 'success' };
    }

    const data = await response.json();

    if (!response.ok) {
        throw {
            status: response.status,
            message: data.message || 'An error occurred',
            data,
        };
    }

    return data;
};

export default API_BASE_URL;
