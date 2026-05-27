import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import api from '../utils/api.js';
import { getApiError } from '../utils/errors.js';

/**
 * Google sign-in / sign-up button.
 *
 * Uses the implicit flow (@react-oauth/google) to get an id_token (credential),
 * then exchanges it with our backend POST /api/auth/google.
 *
 * Props:
 *   onError(msg) — called with a string error message on failure
 */
export default function GoogleAuthButton({ onError }) {
  const [loading, setLoading] = useState(false);
  const login    = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      // tokenResponse.access_token is the OAuth2 access token from the implicit flow.
      // We send it to the server which uses it to fetch the user profile.
      const { data } = await api.post('/api/auth/google', { credential: tokenResponse.access_token });
      login(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      onError?.(getApiError(err, 'Google sign-in failed'));
    } finally {
      setLoading(false);
    }
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => onError?.('Google sign-in was cancelled or failed'),
    scope: 'openid email profile',
  });

  return (
    <>
      <style>{`@keyframes auth-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <button
        type="button"
        className="auth-social-btn"
        style={{ flex: 1 }}
        disabled={loading}
        onClick={() => triggerGoogleLogin()}
      >
        {loading ? (
          <span className="msym" style={{ fontSize: 18, animation: 'auth-spin 0.8s linear infinite' }}>
            progress_activity
          </span>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {loading ? 'Signing in…' : 'Google'}
      </button>
    </>
  );
}
