import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TierSync from './components/TierSync.jsx';
import { useAuthStore } from './stores/authStore.js';
import { useSubscriptionStore } from './stores/subscriptionStore.js';

const Landing = lazy(() => import('./pages/Landing/Landing.jsx'));
const Login = lazy(() => import('./pages/Auth/Login.jsx'));
const Register = lazy(() => import('./pages/Auth/Register.jsx'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard.jsx'));
const Workspace = lazy(() => import('./pages/Workspace/Workspace.jsx'));
const Templates = lazy(() => import('./pages/Templates/Templates.jsx'));
const Settings = lazy(() => import('./pages/Settings/Settings.jsx'));
const Subscription = lazy(() => import('./pages/Subscription/Subscription.jsx'));

function SubscriptionLoader() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const loadSubscription = useSubscriptionStore((s) => s.loadSubscription);

  useEffect(() => {
    if (user && accessToken) {
      loadSubscription(accessToken, import.meta.env.VITE_API_URL || 'http://localhost:5000');
    }
  }, [user, accessToken, loadSubscription]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TierSync />
      <SubscriptionLoader />
      <Suspense fallback={<div className="flex items-center justify-center h-screen bg-bg text-text">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/subscription" element={<Subscription />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
