import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore.js';

const AdminLogin = lazy(() => import('./pages/Admin/Login.jsx'));
const Admin = lazy(() => import('./pages/Admin/Admin.jsx'));

/**
 * Blocks access to admin routes for unauthenticated users or non-admins.
 * - No session → redirect to /login
 * - Logged in but not admin → redirect to main user app
 * - Admin → render children
 */
function ProtectedAdminRoute({ children }) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    // Kick non-admin users back to the main app immediately, no flash
    window.location.replace(
      import.meta.env.VITE_USER_APP_URL || 'https://nexprompt.site/dashboard'
    );
    return null;
  }

  return children;
}

export default function AdminApp() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<div className="flex items-center justify-center h-screen bg-bg text-text">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedAdminRoute>
                <Admin />
              </ProtectedAdminRoute>
            }
          />
          {/* Catch-all: redirect unknown paths to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
