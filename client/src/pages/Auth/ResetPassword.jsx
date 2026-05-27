import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import { useToast } from '../../hooks/useToast.jsx';
import api from '../../utils/api.js';
import AuthLayout from './AuthLayout.jsx';

/* ─── Password field with show/hide toggle ────────────────────── */
function PwInput({ id, label, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-field">
      <label className="auth-field-label" htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        <span className="msym auth-input-icon">lock</span>
        <input
          id={id}
          className="auth-input auth-input-pw"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          autoComplete={autoComplete}
        />
        <button type="button" onClick={() => setShow(s => !s)}
          style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(228,225,233,0.35)', padding: 0, display: 'flex', alignItems: 'center' }}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

/* ─── Password requirement row ────────────────────────────────── */
function Req({ met, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: met ? '#4ade80' : 'rgba(228,225,233,0.3)', transition: 'color .2s' }}>
      <span style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
        background: met ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${met ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.08)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .2s',
      }}>
        {met && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </span>
      {text}
    </div>
  );
}

/* ─── Strength bar ────────────────────────────────────────────── */
const STRENGTH = [
  { label: 'Weak',   color: '#ef4444' },
  { label: 'Fair',   color: '#f59e0b' },
  { label: 'Good',   color: '#3b82f6' },
  { label: 'Strong', color: '#22c55e' },
];

export default function ResetPassword() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const { showToast }   = useToast();
  const token           = searchParams.get('token');

  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState(false);

  const strength = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)          s++;
    if (password.length >= 12)         s++;
    if (/[a-z]/.test(password))        s++;
    if (/[A-Z]/.test(password))        s++;
    if (/\d/.test(password))           s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    return Math.min(4, Math.ceil(s / 1.5));
  }, [password]);

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token)                                              return setError('Invalid or missing reset token.');
    if (password.length < 8)                                return setError('Password must be at least 8 characters.');
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))  return setError('Password must contain uppercase, lowercase, and a number.');
    if (password !== confirmPassword)                        return setError('Passwords do not match.');

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { token, password });
      setSuccess(true);
      showToast('Password reset successful!', 'success');
      setTimeout(() => navigate('/login'), 2200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Invalid token ── */
  if (!token) {
    return (
      <AuthLayout heading="Invalid reset link" subheading="This link is missing a token.">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={26} style={{ color: '#ef4444' }} />
          </div>
          <p style={{ fontSize: 14, color: 'rgba(228,225,233,0.5)', margin: 0, lineHeight: 1.65 }}>
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button className="auth-btn" onClick={() => navigate('/forgot-password')}>
            <span>Request new reset link</span>
            <span className="msym" style={{ fontSize: 18 }}>send</span>
          </button>
        </div>
      </AuthLayout>
    );
  }

  /* ── Success ── */
  if (success) {
    return (
      <AuthLayout heading="Password updated" subheading="You can now sign in with your new password.">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={26} style={{ color: '#22c55e' }} />
          </motion.div>
          <p style={{ fontSize: 14, color: 'rgba(228,225,233,0.5)', margin: 0 }}>Redirecting you to sign in…</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(228,225,233,0.3)' }}>
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1 }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4D1C' }} />
            Redirecting…
          </div>
        </div>
      </AuthLayout>
    );
  }

  /* ── Main form ── */
  return (
    <AuthLayout heading="Set new password" subheading="Create a strong password for your account.">
      <style>{`@keyframes auth-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <AnimatePresence>{error && <ErrorMessage message={error} />}</AnimatePresence>

        {/* New password + strength */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PwInput id="rp-pw" label="New password" value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter new password" autoComplete="new-password" />

          {password && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Strength bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'rgba(228,225,233,0.4)' }}>Strength</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: STRENGTH[strength - 1]?.color || 'rgba(228,225,233,0.3)' }}>
                  {STRENGTH[strength - 1]?.label || ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4].map(l => (
                  <div key={l} style={{
                    flex: 1, height: 3, borderRadius: 99,
                    background: l <= strength ? (STRENGTH[strength - 1]?.color || '#ccc') : 'rgba(255,255,255,0.07)',
                    transition: 'background .3s',
                  }} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Requirements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
            <Req met={password.length >= 8}   text="At least 8 characters" />
            <Req met={/[A-Z]/.test(password)} text="One uppercase letter" />
            <Req met={/[a-z]/.test(password)} text="One lowercase letter" />
            <Req met={/\d/.test(password)}    text="One number" />
          </div>
        </div>

        {/* Confirm password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <PwInput id="rp-confirm" label="Confirm password" value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password" autoComplete="new-password" />
          {confirmPassword && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ fontSize: 12, margin: 0, color: passwordsMatch ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: 6 }}>
              {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
            </motion.p>
          )}
        </div>

        <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: 4 }}>
          {loading
            ? <><span className="msym" style={{ fontSize: 18, animation: 'auth-spin 0.8s linear infinite' }}>progress_activity</span> Resetting…</>
            : <><span className="msym" style={{ fontSize: 18 }}>lock_reset</span><span>Reset password</span></>
          }
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(228,225,233,0.35)', margin: 0 }}>
          <Link to="/login" className="auth-link" style={{ fontWeight: 500 }}>← Back to sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
