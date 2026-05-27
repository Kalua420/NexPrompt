import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Button from '../../components/Button.jsx';
import Tabs from '../../components/Tabs.jsx';
import Toast from '../../components/Toast.jsx';
import { useAuthStore } from '../../stores/authStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import api from '../../utils/api.js';

const tabs = ['Password', 'Theme'];

export default function Settings() {
  const navigate    = useNavigate();
  const user        = useAuthStore((s) => s.user);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const [activeTab, setActiveTab] = useState('Password');
  const [toast,     setToast]     = useState({ message: '', visible: false, type: 'info' });

  // Password tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent,     setShowCurrent]     = useState(false);
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [passwordSaving,  setPasswordSaving]  = useState(false);

  if (!user) { navigate('/login'); return null; }

  const isGoogleOnly = !user.hasPassword && !!user.googleId;

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ message: 'All password fields are required', visible: true, type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ message: 'New passwords do not match', visible: true, type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setToast({ message: 'New password must be at least 8 characters', visible: true, type: 'error' });
      return;
    }
    setPasswordSaving(true);
    try {
      await api.patch('/api/auth/profile', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToast({ message: 'Password changed successfully', visible: true, type: 'success' });
    } catch (err) {
      setToast({ message: err?.response?.data?.error || 'Failed to change password', visible: true, type: 'error' });
    }
    setPasswordSaving(false);
  };

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} p-4 md:p-8 transition-all`}>
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="overflow-x-auto">
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>

        <div className="mt-8 max-w-lg">

          {/* ── Password tab ── */}
          {activeTab === 'Password' && (
            <div className="space-y-4">
              {isGoogleOnly ? (
                /* Google-only account — no password to change */
                <div className="rounded-xl border border-border bg-black/20 p-5 space-y-2">
                  <p className="text-sm font-medium">Password not set</p>
                  <p className="text-sm text-text/50">
                    Your account uses Google sign-in. To set a password, use{' '}
                    <a href="/forgot-password" className="text-accent hover:underline">forgot password</a>{' '}
                    to receive a reset link.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-text/50">
                    Change your account password. You'll need your current password to confirm.
                  </p>

                  <div className="space-y-4">
                    {/* Current password */}
                    <div>
                      <label className="block text-xs text-text/50 uppercase tracking-wider mb-1.5">
                        Current password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrent ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full px-3 py-2 pr-10 rounded-lg bg-black/30 border border-border text-text text-sm outline-none focus:border-accent transition-colors"
                        />
                        <button type="button" onClick={() => setShowCurrent((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 hover:text-text transition-colors">
                          {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* New password */}
                    <div>
                      <label className="block text-xs text-text/50 uppercase tracking-wider mb-1.5">
                        New password
                      </label>
                      <div className="relative">
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 8 chars, upper + lower + number"
                          className="w-full px-3 py-2 pr-10 rounded-lg bg-black/30 border border-border text-text text-sm outline-none focus:border-accent transition-colors"
                        />
                        <button type="button" onClick={() => setShowNew((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 hover:text-text transition-colors">
                          {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm new password */}
                    <div>
                      <label className="block text-xs text-text/50 uppercase tracking-wider mb-1.5">
                        Confirm new password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          className={`w-full px-3 py-2 pr-10 rounded-lg bg-black/30 border text-text text-sm outline-none focus:border-accent transition-colors ${
                            confirmPassword && confirmPassword !== newPassword
                              ? 'border-red-500/50'
                              : 'border-border'
                          }`}
                        />
                        <button type="button" onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 hover:text-text transition-colors">
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {confirmPassword && confirmPassword !== newPassword && (
                        <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleSavePassword}
                    disabled={
                      passwordSaving ||
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword ||
                      newPassword !== confirmPassword
                    }
                    className="w-full"
                  >
                    {passwordSaving ? 'Changing…' : 'Change password'}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* ── Theme tab ── */}
          {activeTab === 'Theme' && (
            <div className="p-4 rounded-lg border border-border bg-black/20">
              <p className="text-sm text-text/60">Dark theme is enabled by default. Light theme coming soon.</p>
            </div>
          )}

        </div>
      </div>
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, visible: false }))} />
    </div>
  );
}
