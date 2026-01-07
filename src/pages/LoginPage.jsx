import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import useAuthStore from '../store/authStore';
import './LoginPage.css';

function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, isLoading, setLoading, login } = useAuthStore();
    const [error, setError] = useState(null);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    // Check for error in URL params (from OAuth callback)
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            setError(getErrorMessage(errorParam));
        }
    }, [searchParams]);

    const getErrorMessage = (errorType) => {
        switch (errorType) {
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

    const handleGoogleSuccess = async (tokenResponse) => {
        try {
            setLoading(true);
            // Fetch user info from Google using access token
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const userInfo = await userInfoResponse.json();

            // Set user in store (using login function)
            login({
                id: userInfo.sub,
                displayName: userInfo.name,
                email: userInfo.email,
                photoURL: userInfo.picture,
                accessToken: tokenResponse.access_token,
            });

            navigate('/');
        } catch (err) {
            console.error('Google login error:', err);
            setError('Failed to get user info. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google sign-in was cancelled or failed. Please try again.');
        setLoading(false);
    };

    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: handleGoogleError,
    });

    return (
        <div className="login-page">
            {/* Background Pattern */}
            <div className="login-bg">
                <div className="login-bg-pattern" />
            </div>

            {/* Login Card */}
            <div className="login-card">
                {/* Logo */}
                <div className="login-logo">
                    <div className="login-logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h1 className="login-brand">AutoPartsPro</h1>
                </div>

                {/* Welcome Text */}
                <div className="login-welcome">
                    <h2>Welcome back</h2>
                    <p>Sign in to access your account, track orders, and find the perfect parts for your vehicle.</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="login-error">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4M12 16h.01" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Google Sign In Button */}
                <button
                    className="google-btn"
                    onClick={() => googleLogin()}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="google-spinner" />
                    ) : (
                        <>
                            <svg className="google-icon" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span>Continue with Google</span>
                        </>
                    )}
                </button>

                {/* Terms */}
                <p className="login-terms">
                    By signing in, you agree to our{' '}
                    <a href="/terms">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy">Privacy Policy</a>
                </p>

                {/* Trust Badges */}
                <div className="login-trust">
                    <div className="trust-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M9 12l2 2 4-4" />
                        </svg>
                        <span>Secure Login</span>
                    </div>
                    <div className="trust-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                        <span>24/7 Support</span>
                    </div>
                    <div className="trust-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                            <path d="M22 4L12 14.01l-3-3" />
                        </svg>
                        <span>Verified Sellers</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
