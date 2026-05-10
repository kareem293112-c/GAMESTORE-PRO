import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SearchProvider } from './context/SearchContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { CartSidebar } from './components/ui/CartSidebar';
import { ActivityFeed } from './components/layout/ActivityFeed';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CheckoutPage } from './pages/CheckoutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { DeliveryPage } from './pages/DeliveryPage';
import { DistanceSalesPage } from './pages/DistanceSalesPage';
import { SecurityPage } from './pages/SecurityPage';
import { TermsPage } from './pages/TermsPage';
import { SupportPage } from './pages/SupportPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProductDetailPage } from './pages/ProductDetailPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, profile, loading, isAdmin, isProductManager, isOrderManager } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) {
    if (adminOnly) return <Navigate to="/" />;
    return <Navigate to="/login" />;
  }
  if (adminOnly && !isAdmin && !isProductManager && !isOrderManager) return <Navigate to="/" />;

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (user) return <Navigate to="/" />;
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { direction } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200" dir={direction}>
      <ScrollToTop />
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/distance-sales" element={<DistanceSalesPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/usage" element={<TermsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <ActivityFeed />
      <Footer />
      <Toaster position="bottom-left" />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <Router>
              <AppContent />
            </Router>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
