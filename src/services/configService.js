import { fetchWithCredentials } from '../config/api';
// Checking standard fetch pattern in this project. Usually it's in a api.js or similar.
// I will assuming usage of standard fetch or the existing helper.
// Let's check `orderService.js` imports first to be sure.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const configService = {
    getSystemConfig: async () => {
        try {
            const data = await fetchWithCredentials(`${API_URL}/config`);
            return data.data.config;
        } catch (error) {
            console.error('Failed to fetching config:', error);
            throw error;
        }
    }
};
