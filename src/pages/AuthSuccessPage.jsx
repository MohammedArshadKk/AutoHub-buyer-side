import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import guestStorageService from '../services/guestStorageService';
import './AuthSuccessPage.css';

function AuthSuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { checkAuth, executePendingAction } = useAuthStore();
    const syncFromGuestStorage = useCartStore((state) => state.syncFromGuestStorage);
    const [status, setStatus] = useState('loading'); // loading, success, syncing, error
    const [message, setMessage] = useState('Completing sign in...');

    useEffect(() => {
        const handleAuthCallback = async () => {
            // Check for error in URL params
            const error = searchParams.get('error');
            if (error) {
                setStatus('error');
                setMessage(getErrorMessage(error));
                setTimeout(() => navigate('/login?error=' + error), 2000);
                return;
            }

            try {
                // Verify authentication with server
                const isAuthenticated = await checkAuth();

                if (isAuthenticated) {
                    // Check if there's guest data to sync
                    const guestData = guestStorageService.getGuestDataSummary();

                    if (guestData.hasData) {
                        setStatus('syncing');
                        setMessage(`Syncing your ${guestData.cartCount} cart item${guestData.cartCount !== 1 ? 's' : ''}...`);

                        // Sync guest cart to authenticated cart
                        syncFromGuestStorage();

                        // Small delay to show sync message
                        await new Promise(resolve => setTimeout(resolve, 800));
                    }

                    setStatus('success');
                    setMessage('Sign in successful! Redirecting...');

                    // Execute any pending action (like adding to cart)
                    executePendingAction();

                    // Redirect to home or previous page
                    setTimeout(() => {
                        const redirectTo = localStorage.getItem('authRedirect') || '/';
                        localStorage.removeItem('authRedirect');
                        navigate(redirectTo);
                    }, 1000);
                } else {
                    setStatus('error');
                    setMessage('Authentication failed. Please try again.');
                    setTimeout(() => navigate('/login'), 2000);
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                setStatus('error');
                setMessage('Something went wrong. Please try again.');
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        handleAuthCallback();
    }, [checkAuth, executePendingAction, navigate, searchParams, syncFromGuestStorage]);

    const getErrorMessage = (error) => {
        switch (error) {
            case 'auth_failed':
                return 'Authentication failed. Please try again.';
            case 'no_email':
                return 'Email access is required to sign in.';
            case 'server_error':
                return 'Server error. Please try again later.';
            default:
                return 'An error occurred. Please try again.';
        }
    };

    return (
        <div className="auth-success-page">
            <div className="auth-success-card">
                {status === 'loading' && (
                    <div className="auth-spinner" />
                )}
                {status === 'syncing' && (
                    <>
                        <div className="auth-sync-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12a9 9 0 11-9-9" />
                                <path d="M21 3v9h-9" />
                            </svg>
                        </div>
                    </>
                )}
                {status === 'success' && (
                    <div className="auth-success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                            <path d="M22 4L12 14.01l-3-3" />
                        </svg>
                    </div>
                )}
                {status === 'error' && (
                    <div className="auth-error-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M15 9l-6 6M9 9l6 6" />
                        </svg>
                    </div>
                )}
                <p className={`auth-message ${status}`}>{message}</p>
            </div>
        </div>
    );
}

export default AuthSuccessPage;
