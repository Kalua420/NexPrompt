import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import AuthLayout from './AuthLayout.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import api from '../../utils/api.js';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  /* ── Sent state ── */
  if (sent) {
    return (
      <AuthLayout heading="Check your inbox" subheading={`We sent a reset link to ${email}.`}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={26} style={{ color: '#00C896' }} />
          </div>
          <p style={{ fontSize: 14, color: 'rgba(228,225,233,0.55)', lineHeight: 1.65, margin: 0 }}>
            If an account exists for <strong style={{ color: '#e4e1e9' }}>{email}</strong>, you'll receive a reset link shortly.
          </p>
          <div style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'rgba(10,10,15,0.4)', border: '1px solid rgba(92,64,57,0.2)', fontSize: 12, color: 'rgba(228,225,233,0.4)', textAlign: 'left', lineHeight: 1.7 }}>
            <p style={{ margin: 0 }}>• The link expires in 1 hour</p>
            <p style={{ margin: '4px 0 0' }}>• Check your spam / junk folder</p>
          </div>
          <Link to="/login" className="auth-link" style={{ fontSize: 14 }}>← Back to sign in</Link>
        </div>
      </AuthLayout>
    );
  }

  /* ── Form ── */
  return (
    <AuthLayout heading="Reset password" subheading="Enter your email and we'll send you a reset link.">
      <style>{`@keyframes auth-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <AnimatePresence>{error && <ErrorMessage message={error} />}</AnimatePresence>

        <div className="auth-field">
          <label className="auth-field-label" htmlFor="fp-email">Email Address</label>
          <div className="auth-input-wrap">
            <span className="msym auth-input-icon">alternate_email</span>
            <input id="fp-email" className="auth-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="name@example.com"
              required autoComplete="email" />
          </div>
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading
            ? <><span className="msym" style={{ fontSize: 18, animation: 'auth-spin 0.8s linear infinite' }}>progress_activity</span> Sending…</>
            : <><span>Send reset link</span><span className="msym" style={{ fontSize: 18 }}>send</span></>
          }
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(228,225,233,0.4)', margin: 0 }}>
          <Link to="/login" className="auth-link">← Back to sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
