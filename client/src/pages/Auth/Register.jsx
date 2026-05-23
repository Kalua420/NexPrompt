import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import { useAuthStore } from '../../stores/authStore.js';
import api from '../../utils/api.js';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', { name, email, password });
      login(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg bg-grid flex items-center justify-center px-6">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-black/20 backdrop-blur-xl border border-border rounded-xl p-8 space-y-5 shadow-2xl"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            <span className="text-gradient">Create account</span>
          </h1>
          <p className="text-sm text-text/50 mt-1">Start crafting perfect prompts</p>
        </div>
        {error && (
          <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-center">
            {error}
          </motion.p>
        )}
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="At least 6 characters"
          suffix={
            <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-text/30 hover:text-text transition-colors" tabIndex={-1}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        <Button type="submit" className="w-full" loading={loading}>
          <UserPlus size={16} />
          Get started
        </Button>
        <p className="text-sm text-center text-text/50">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-accent transition-colors">Sign in</Link>
        </p>
      </motion.form>
    </div>
  );
}
