import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import api from '../../utils/api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="w-full max-w-sm bg-black/20 backdrop-blur-xl border border-border rounded-xl p-8 space-y-5">
        <h1 className="text-2xl font-bold text-center text-primary">Reset password</h1>
        {sent ? (
          <p className="text-sm text-text/60 text-center">Check your email for reset instructions.</p>
        ) : (
          <>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <Button type="submit" className="w-full">Send reset link</Button>
          </>
        )}
        <p className="text-sm text-center text-text/50"><Link to="/login" className="text-primary hover:text-accent">Back to sign in</Link></p>
      </motion.form>
    </div>
  );
}
