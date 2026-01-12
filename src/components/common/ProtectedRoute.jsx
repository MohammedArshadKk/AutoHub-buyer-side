import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthComponents.css';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="protected-route-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Save the attempted location for redirecting after login
        localStorage.setItem('authRedirect', location.pathname);
        return <Navigate to="/login" replace />;
    }

    return children;
}
