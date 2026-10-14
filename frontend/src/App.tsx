import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { ForecastDetail } from './pages/ForecastDetail';
import { Advisories } from './pages/Advisories';
import { AdvisoryDetail } from './pages/AdvisoryDetail';
import { Assistant } from './pages/Assistant';
import { Notifications } from './pages/Notifications';
import { CropProfile } from './pages/CropProfile';
import { FeedbackPage } from './pages/FeedbackPage';
import { Settings } from './pages/Settings';
import { Methodology } from './pages/Methodology';
import { AdminDashboard } from './pages/AdminDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing */}
              <Route path="/" element={<Landing />} />

              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Onboarding */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              {/* Main Application Routes (Protected, wrapped in MainLayout) */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/forecast" element={<ForecastDetail />} />
                <Route path="/advisories" element={<Advisories />} />
                <Route path="/advisories/:id" element={<AdvisoryDetail />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/crops" element={<CropProfile />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/methodology" element={<Methodology />} />
              </Route>

              {/* Admin Routes (Protected, Admin only) */}
              <Route
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
