import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MailCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.js';
import api from '../../utils/api.js';
import AuthLayout from './AuthLayout.jsx';

/* ─── Status icon ─────────────────────────────────────────────── */
function StatusIcon({ status }) {
  const configs = {
    verifying: { Icon: Loader2,      color: '#4f6ef7', bg: 'rgba(79,110,247,0.1)',  border: 'rgba(79,110,247,0.25)',  spin: true  },
    success:   { Icon: CheckCircle2, color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',   spin: false },
    error:     { Icon: XCircle,      color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   spin: false },
    pending:   { Icon: MailCheck,    color: '#FF4D1C', bg: 'rgba(255,77,28,0.1)',   border: 'rgba(255,77,28,0.25)',   spin: false },
  };
  const c = configs[status];
  if (!c) return null;
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ width: 56, height: 56, borderRadius: 14, background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <c.Icon size={26} style={{ color: c.color, animation: c.spin ? 'spin 1s linear infinite' : 'none' }} />
    </motion.div>
  );
}

/* ─── Resend form ─────────────────────────────────────────────── */
function ResendForm({ prefillEmail = '' }) {
  const [email,   setEmail]   = useState(prefillEmail);
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/resend-verification', { email });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to resend. Try again.');
    } finally { setLoading(false); }
  };

  if (sent) {
    return (
      <p style={{ fontSize: 13, color: '#4ade80', textAlign: 'center', margin: 0 }}>
        ✓ Verification email sent — check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
      <p style={{ fontSize: 12, color: 'rgba(228,225,233,0.35)', textAlign: 'center', margin: 0 }}>
        Didn't receive it? Resend below.
      </p>
      <div className="auth-input-wrap">
        <span className="msym auth-input-icon">alternate_email</span>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="auth-input"
        />
      </div>
      {error && <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{error}</p>}
      <button type="submit" className="auth-btn-ghost" disabled={loading}>
        {loading
          ? <><span className="msym" style={{ fontSize: 18, animation: 'auth-spin 0.8s linear infinite' }}>progress_activity</span> Sending…</>
          : <><span className="msym" style={{ fontSize: 18 }}>forward_to_inbox</span> Resend verification email</>
        }
      </button>
    </form>
  );
}

/* ─── Main component ──────────────────────────────────────────── */
export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const { state }      = useLocation();
  const token          = searchParams.get('token');
  const navigate       = useNavigate();
  const login          = useAuthStore((s) => s.login);

  const [status,   setStatus]   = useState(token ? 'verifying' : 'pending');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) return;
    api.post('/api/auth/verify-email', { token })
      .then(({ data }) => {
        login(data.user, data.accessToken, data.refreshToken);
        setStatus('success');
        setTimeout(() => navigate('/dashboard', { state: { welcome: true, credits: data.credits || 0 } }), 2000);
      })
      .catch((err) => {
        setErrorMsg(err?.response?.data?.error || 'Verification failed. The link may have expired.');
        setStatus('error');
      });
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const HEADINGS = {
    verifying: { heading: 'Verifying your email…', sub: 'Just a moment.' },
    success:   { heading: 'Email verified!',        sub: 'Redirecting you to your dashboard…' },
    error:     { heading: 'Verification failed',    sub: errorMsg || 'The link may have expired.' },
    pending:   { heading: 'Check your inbox',       sub: 'Click the link we sent you to activate your account.' },
  };

  const h = HEADINGS[status] || HEADINGS.pending;

  return (
    <AuthLayout heading={h.heading} subheading={h.sub}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes auth-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>

      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}
        >
          <StatusIcon status={status} />

          {/* Verifying */}
          {status === 'verifying' && (
            <p style={{ fontSize: 14, color: 'rgba(228,225,233,0.45)', margin: 0 }}>
              Confirming your email address…
            </p>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <p style={{ fontSize: 14, color: 'rgba(228,225,233,0.5)', margin: 0 }}>
                Your account is active. Taking you to your dashboard now.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(228,225,233,0.3)' }}>
                <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4D1C' }} />
                Redirecting…
              </div>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <div style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', fontSize: 13, color: 'rgba(228,225,233,0.5)', textAlign: 'left', lineHeight: 1.65 }}>
                {errorMsg}
              </div>
              <ResendForm prefillEmail={state?.email} />
              <p style={{ fontSize: 13, color: 'rgba(228,225,233,0.35)', margin: 0 }}>
                Already verified?{' '}
                <Link to="/login" className="auth-link">Sign in</Link>
              </p>
            </>
          )}

          {/* Pending */}
          {status === 'pending' && (
            <>
              <p style={{ fontSize: 14, color: 'rgba(228,225,233,0.5)', margin: 0, lineHeight: 1.65 }}>
                We sent a verification link to{' '}
                {state?.email
                  ? <strong style={{ color: '#e4e1e9' }}>{state.email}</strong>
                  : 'your email address'
                }.
                {' '}Click it to activate your account.
              </p>
              <div style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'rgba(10,10,15,0.4)', border: '1px solid rgba(92,64,57,0.2)', fontSize: 12, color: 'rgba(228,225,233,0.4)', textAlign: 'left', lineHeight: 1.7 }}>
                <p style={{ margin: 0 }}>• Check your spam / junk folder if you don't see it</p>
                <p style={{ margin: '4px 0 0' }}>• The link expires in 24 hours</p>
              </div>
              <ResendForm prefillEmail={state?.email} />
              <p style={{ fontSize: 13, color: 'rgba(228,225,233,0.35)', margin: 0 }}>
                Already verified?{' '}
                <Link to="/login" className="auth-link">Sign in</Link>
              </p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
}
