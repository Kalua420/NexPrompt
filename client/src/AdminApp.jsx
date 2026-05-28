import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore.js';

const AdminLogin = lazy(() => import('./pages/Admin/Login.jsx'));
const Admin = lazy(() => import('./pages/Admin/Admin.jsx'));

function ProtectedAdminRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <div className="flex items-center justify-center h-screen bg-bg text-text/50">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    const userAppUrl = import.meta.env.VITE_USER_APP_URL || 'https://nexprompt.site';
    window.location.replace(`${userAppUrl}/dashboard`);
    return null;
  }

  return children;
}

export default function AdminApp() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<div className="flex items-center justify-center h-screen bg-bg text-text">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<ProtectedAdminRoute><Admin section="overview" /></ProtectedAdminRoute>} />
          <Route path="/users" element={<ProtectedAdminRoute><Admin section="users" /></ProtectedAdminRoute>} />
          <Route path="/templates" element={<ProtectedAdminRoute><Admin section="templates" /></ProtectedAdminRoute>} />
          <Route path="/plans" element={<ProtectedAdminRoute><Admin section="plans" /></ProtectedAdminRoute>} />
          <Route path="/services" element={<ProtectedAdminRoute><Admin section="services" /></ProtectedAdminRoute>} />
          <Route path="/apikeys" element={<ProtectedAdminRoute><Admin section="apikeys" /></ProtectedAdminRoute>} />
          <Route path="/usage" element={<ProtectedAdminRoute><Admin section="usage" /></ProtectedAdminRoute>} />
          <Route path="/profile" element={<ProtectedAdminRoute><Admin section="profile" /></ProtectedAdminRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
