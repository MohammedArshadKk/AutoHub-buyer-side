import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import useCartStore from '../store/cartStore';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setLoading(true);
            console.log('🔍 Checking auth status...');
            const response = await authService.checkAuthStatus();
            console.log('✅ Auth response:', response);

            const { isAuthenticated, user: userData } = response;

            if (isAuthenticated && userData) {
                console.log('👤 User authenticated:', userData);
                setUser({
                    id: userData.id,
                    name: userData.name,
                    email: userData.email,
                    avatar: userData.avatar,
                    role: userData.role,
                });
            } else {
                console.log('❌ User not authenticated');
                setUser(null);
            }
        } catch (err) {
            console.error('❌ Auth check failed:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = () => {
        // Redirect to Google OAuth via backend
        authService.loginWithGoogle();
    };

    const logout = async () => {
        console.log('🔐 [LOGOUT] Called');
        console.trace('🔐 [LOGOUT] Stack trace:'); // Shows who triggered logout

        try {
            setLoading(true);
            console.log('🔐 [LOGOUT] Calling backend logout service...');
            await authService.logout();
            console.log('🔐 [LOGOUT] Backend logout successful');

            // Clear cart state
            useCartStore.getState().logout();

            setUser(null);
            console.log('🔐 [LOGOUT] User state cleared');

            navigate('/');
            console.log('🔐 [LOGOUT] Redirecting to home');
        } catch (err) {
            console.error('🔐 [LOGOUT] Error:', err);
            setError(err.message || 'Logout failed');
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (updates) => {
        try {
            const updatedUser = await authService.updateProfile(updates);
            setUser({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                role: updatedUser.role,
            });
            return updatedUser;
        } catch (err) {
            setError(err.message || 'Update failed');
            throw err;
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        updateUser,
        checkAuth,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
