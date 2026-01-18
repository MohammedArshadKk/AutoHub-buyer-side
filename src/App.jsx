import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AuthProviderLogic from './components/auth/AuthProvider';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoginModal from './components/common/LoginModal';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AuthSuccessPage from './pages/AuthSuccessPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentDetailsPage from './pages/PaymentDetailsPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import './index.css';

/**
 * Auto Hub Buyer Side Application
 * 
 * Authentication Flow:
 * - Uses backend cookie-based Google OAuth
 * - Guest users can browse and add to cart
 * - Cart syncs to account on login
 */
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AuthProviderLogic>
            <div className="app">
              <Routes>
                {/* Auth pages without header/footer */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/auth/success" element={<AuthSuccessPage />} />

                {/* Main layout with header/footer */}
                <Route
                  path="*"
                  element={
                    <>
                      <Header />
                      <main className="main-content">
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/products" element={<ProductsPage />} />
                          <Route path="/products/:category" element={<ProductsPage />} />
                          <Route path="/product/:id" element={<ProductDetailPage />} />
                          {/* Cart is accessible to guests, authentication required only at checkout */}
                          <Route path="/cart" element={<CartPage />} />
                          {/* Checkout - protected route */}
                          <Route
                            path="/checkout"
                            element={
                              <ProtectedRoute>
                                <CheckoutPage />
                              </ProtectedRoute>
                            }
                          />
                          {/* Payment - protected route */}
                          <Route
                            path="/payment"
                            element={
                              <ProtectedRoute>
                                <PaymentDetailsPage />
                              </ProtectedRoute>
                            }
                          />
                          {/* Order Success - protected route */}
                          <Route
                            path="/order-success"
                            element={
                              <ProtectedRoute>
                                <OrderSuccessPage />
                              </ProtectedRoute>
                            }
                          />
                        </Routes>
                      </main>
                      <Footer />
                    </>
                  }
                />
              </Routes>
              {/* Global Login Modal */}
              <LoginModal />
            </div>
          </AuthProviderLogic>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
