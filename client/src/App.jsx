import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from './stores/authStore.js';

const Landing = lazy(() => import('./pages/Landing/Landing.jsx'));
const Login = lazy(() => import('./pages/Auth/Login.jsx'));
const Register = lazy(() => import('./pages/Auth/Register.jsx'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword.jsx'));
const VerifyEmail = lazy(() => import('./pages/Auth/VerifyEmail.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard.jsx'));
const Workspace = lazy(() => import('./pages/Workspace/Workspace.jsx'));
const Templates = lazy(() => import('./pages/Templates/Templates.jsx'));
const Favorites = lazy(() => import('./pages/Favorites/Favorites.jsx'));
const Settings = lazy(() => import('./pages/Settings/Settings.jsx'));
const Profile = lazy(() => import('./pages/Profile/Profile.jsx'));
const Credits = lazy(() => import('./pages/Credits/Credits.jsx'));
const Subscription = lazy(() => import('./pages/Subscription/Subscription.jsx'));
const Terms = lazy(() => import('./pages/Legal/Terms.jsx'));
const Privacy = lazy(() => import('./pages/Legal/Privacy.jsx'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/Admin/Login.jsx'));
const Admin = lazy(() => import('./pages/Admin/Admin.jsx'));

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Blocks access to admin routes for unauthenticated users or non-admins.
 */
function ProtectedAdminRoute({ children }) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<div className="flex items-center justify-center h-screen bg-bg text-text">Loading...</div>}>
        <Routes>
          {/* User routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/legal/terms" element={<Terms />} />
          <Route path="/legal/privacy" element={<Privacy />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <Admin />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default function App() {
  if (googleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        <AppRoutes />
      </GoogleOAuthProvider>
    );
  }
  return <AppRoutes />;
}
