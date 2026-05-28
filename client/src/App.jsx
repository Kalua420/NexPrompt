import React, { Suspense, lazy, useEffect } from 'react';
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

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Automatically redirects admin users to the admin subdomain.
 * This prevents admin users from accidentally accessing the user app.
 */
function AdminRedirect() {
  const user = useAuthStore((s) => s.user);
  
  useEffect(() => {
    if (user?.role === 'admin') {
      const adminUrl = import.meta.env.VITE_ADMIN_URL || 'https://admin.nexprompt.site';
      console.log('Admin user detected, redirecting to admin app:', adminUrl);
      window.location.replace(adminUrl);
    }
  }, [user]);
  
  return null;
}

function AppRoutes() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AdminRedirect />
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
