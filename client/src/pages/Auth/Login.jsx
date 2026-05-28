import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, MailCheck } from 'lucide-react';
import Button from '../../components/Button.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import GoogleAuthButton from '../../components/GoogleAuthButton.jsx';
import { useAuthStore } from '../../stores/authStore.js';
import api from '../../utils/api.js';
import { getApiError } from '../../utils/errors.js';
import AuthLayout from './AuthLayout.jsx';

function IconInput({ icon, type = 'text', value, onChange, placeholder, required, autoComplete, id }) {
  const [show, setShow] = useState(false);
  const isPw = type === 'password';
  return (
    <div className="auth-input-wrap">
      <span className="msym auth-input-icon">{icon}</span>
      <input
        id={id}
        className={`auth-input${isPw ? ' auth-input-pw' : ''}`}
        type={isPw ? (show ? 'text' : 'password') : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
      />
      {isPw && (
        <button type="button" onClick={() => setShow(s => !s)}
          style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(228,225,233,0.35)', padding: 0, display: 'flex', alignItems: 'center' }}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const login    = useAuthStore((s) => s.login);
  const user     = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // Already logged in — send to the right place
  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') {
      // Redirect admin users to the admin subdomain
      const adminUrl = import.meta.env.VITE_ADMIN_URL || 'https://admin.nexprompt.site';
      window.location.replace(`${adminUrl}/dashboard`);
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setUnverifiedEmail(''); setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      if (data.user.role === 'admin') {
        login(data.user, data.accessToken, data.refreshToken);
        // Redirect admin users to the admin subdomain
        const adminUrl = import.meta.env.VITE_ADMIN_URL || 'https://admin.nexprompt.site';
        window.location.replace(`${adminUrl}/dashboard`);
        return;
      }
      login(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      const data = err?.response?.data;
      if (data?.requiresVerification) setUnverifiedEmail(data.email || email);
      else setError(getApiError(err, 'Login failed'));
    } finally { setLoading(false); }
  };

  /* ── Unverified state ── */
  if (unverifiedEmail) {
    return (
      <AuthLayout heading="Verify your email" subheading="Your account hasn't been activated yet.">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(79,110,247,0.12)', border: '1px solid rgba(79,110,247,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MailCheck size={26} style={{ color: '#4f6ef7' }} />
          </div>
          <p style={{ fontSize: 14, color: 'rgba(228,225,233,0.55)', lineHeight: 1.65, margin: 0 }}>
            Check your inbox for the verification link sent to{' '}
            <strong style={{ color: '#e4e1e9' }}>{unverifiedEmail}</strong>.
          </p>
          <button className="auth-btn" onClick={() => navigate('/verify-email')}>
            Go to verification page
          </button>
          <button onClick={() => setUnverifiedEmail('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(228,225,233,0.35)', transition: 'color .15s' }}
            onMouseEnter={e => e.target.style.color = '#e4e1e9'}
            onMouseLeave={e => e.target.style.color = 'rgba(228,225,233,0.35)'}>
            ← Back to login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout heading="Welcome back" subheading="Sign in to your NexPrompt account.">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <AnimatePresence>{error && <ErrorMessage message={error} />}</AnimatePresence>

        {/* Email */}
        <div className="auth-field">
          <label className="auth-field-label" htmlFor="login-email">Email Address</label>
          <IconInput icon="alternate_email" id="login-email" type="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required autoComplete="email" />
        </div>

        {/* Password */}
        <div className="auth-field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="auth-field-label" htmlFor="login-pw">Password</label>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: 12, fontWeight: 500 }}>Forgot password?</Link>
          </div>
          <IconInput icon="lock" id="login-pw" type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required autoComplete="current-password" />
        </div>

        {/* CTA */}
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading
            ? <><span className="msym" style={{ fontSize: 18, animation: 'auth-spin 0.8s linear infinite' }}>progress_activity</span> Signing in…</>
            : <><span>Sign in</span><span className="msym" style={{ fontSize: 18 }}>login</span></>
          }
        </button>
        <style>{`@keyframes auth-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

        {/* Register link */}
        <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(228,225,233,0.5)', margin: 0 }}>
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one free</Link>
        </p>

        {/* Divider */}
        <div className="auth-divider">or continue with</div>

        {/* Social */}
        <div style={{ display: 'flex', gap: 12 }}>
          <GoogleAuthButton onError={(msg) => setError(msg)} />
        </div>
      </form>
    </AuthLayout>
  );
}
