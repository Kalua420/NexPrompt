import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import GoogleAuthButton from '../../components/GoogleAuthButton.jsx';
import api from '../../utils/api.js';
import { getApiError } from '../../utils/errors.js';
import AuthLayout from './AuthLayout.jsx';

function IconInput({ icon, type = 'text', value, onChange, placeholder, required, autoComplete, id, minLength }) {
  const [show, setShow] = useState(false);
  const isPw = type === 'password';
  const inputType = isPw ? (show ? 'text' : 'password') : type;
  return (
    <div className="auth-input-wrap">
      <span className="msym auth-input-icon">{icon}</span>
      <input
        id={id}
        className={`auth-input${isPw ? ' auth-input-pw' : ''}`}
        type={inputType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
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

export default function Register() {
  const [name,          setName]          = useState('');
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) { setError('You must accept the Terms and Conditions to register'); return; }
    setError(''); setLoading(true);
    try {
      await api.post('/api/auth/register', { name, email, password });
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      const data = err?.response?.data;
      if (data?.requiresVerification) { navigate('/verify-email', { state: { email } }); return; }
      setError(getApiError(err, 'Registration failed'));
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout heading="Create Account" subheading="Begin your journey into optimized intelligence.">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <AnimatePresence>{error && <ErrorMessage message={error} />}</AnimatePresence>

        {/* Full Name */}
        <div className="auth-field">
          <label className="auth-field-label" htmlFor="reg-name">Full Name</label>
          <IconInput icon="person" id="reg-name" value={name} onChange={e => setName(e.target.value)}
            placeholder="Enter your full name" required autoComplete="name" />
        </div>

        {/* Email */}
        <div className="auth-field">
          <label className="auth-field-label" htmlFor="reg-email">Email Address</label>
          <IconInput icon="alternate_email" id="reg-email" type="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required autoComplete="email" />
        </div>

        {/* Password */}
        <div className="auth-field">
          <label className="auth-field-label" htmlFor="reg-pw">Password</label>
          <IconInput icon="lock" id="reg-pw" type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} autoComplete="new-password" />
        </div>

        {/* Terms */}
        <div className="auth-check-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 8, background: 'rgba(10,10,15,0.4)', border: '1px solid rgba(92,64,57,0.2)' }}>
          <input type="checkbox" id="terms" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)}
            style={{ marginTop: 2, width: 16, height: 16, accentColor: '#FF4D1C', cursor: 'pointer', flexShrink: 0 }} />
          <label htmlFor="terms" style={{ fontSize: 12, color: 'rgba(228,225,233,0.55)', lineHeight: 1.6, cursor: 'pointer' }}>
            I agree to the{' '}
            <Link to="/legal/terms" target="_blank" className="auth-link">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/legal/privacy" target="_blank" className="auth-link">Privacy Policy</Link>.
          </label>
        </div>

        {/* CTA */}
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading
            ? <><span className="msym" style={{ fontSize: 18, animation: 'auth-spin 0.8s linear infinite' }}>progress_activity</span> Creating account…</>
            : <><span>Get started free</span><span className="msym" style={{ fontSize: 18 }}>bolt</span></>
          }
        </button>
        <style>{`@keyframes auth-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

        {/* Sign in link */}
        <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(228,225,233,0.5)', margin: 0 }}>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in instead</Link>
        </p>

        {/* Divider */}
        <div className="auth-divider">or continue with</div>

        {/* Social buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <GoogleAuthButton onError={(msg) => setError(msg)} />
        </div>
      </form>
    </AuthLayout>
  );
}
