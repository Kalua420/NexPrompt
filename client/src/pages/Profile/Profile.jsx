import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Check, Mail, Calendar, Shield } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Toast from '../../components/Toast.jsx';
import { useAuthStore } from '../../stores/authStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import api from '../../utils/api.js';

/* ── Resize + center-crop an image to a square data URL ── */
function resizeImage(file, size = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const navigate   = useNavigate();
  const user       = useAuthStore((s) => s.user);
  const setUser    = useAuthStore((s) => s.setUser);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  const [name,          setName]          = useState(user?.name || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarData,    setAvatarData]    = useState(undefined); // undefined = no change, null = remove
  const [saving,        setSaving]        = useState(false);
  const [toast,         setToast]         = useState({ message: '', visible: false, type: 'info' });
  const fileInputRef = useRef(null);

  if (!user) { navigate('/login'); return null; }

  const initials   = (user.name || user.email || '?').charAt(0).toUpperCase();
  const profileDirty = name.trim() !== (user.name || '') || avatarData !== undefined;
  const isGoogleUser = !!user.googleId;
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  /* ── Avatar ── */
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file', visible: true, type: 'error' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Image must be under 5 MB', visible: true, type: 'error' });
      return;
    }
    try {
      const dataUrl = await resizeImage(file, 256);
      setAvatarPreview(dataUrl);
      setAvatarData(dataUrl);
    } catch {
      setToast({ message: 'Failed to process image', visible: true, type: 'error' });
    }
    e.target.value = '';
  }, []);

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarData(null);
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (!name.trim()) {
      setToast({ message: 'Name cannot be empty', visible: true, type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const payload = { name: name.trim() };
      if (avatarData !== undefined) payload.avatar = avatarData;
      const { data } = await api.patch('/api/auth/profile', payload);
      setUser(data.user);
      setAvatarData(undefined);
      setToast({ message: 'Profile updated', visible: true, type: 'success' });
    } catch (err) {
      setToast({ message: err?.response?.data?.error || 'Failed to save profile', visible: true, type: 'error' });
    }
    setSaving(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className={`ml-0 ${sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-64'} h-screen overflow-y-auto p-4 md:p-8 transition-all`}>

        <h1 className="text-2xl font-bold mb-8">Profile</h1>

        <div className="max-w-xl space-y-8">

          {/* ── Avatar card ── */}
          <div className="rounded-xl border border-border bg-black/20 p-6">
            <h2 className="text-sm font-semibold text-text/60 uppercase tracking-wider mb-5">Photo</h2>
            <div className="flex items-center gap-6">
              {/* Avatar circle */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-accent/10 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-accent">{initials}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  title="Upload photo"
                >
                  <Camera size={22} className="text-white" />
                </button>
                {avatarPreview && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-bg flex items-center justify-center hover:bg-red-400 transition-colors"
                    title="Remove photo"
                  >
                    <X size={10} className="text-white" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-text/40">JPG, PNG or GIF · max 5 MB · cropped to square</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 hover:text-accent transition-all text-text/60"
                  >
                    Upload photo
                  </button>
                  {avatarPreview && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-red-500/50 hover:text-red-400 transition-all text-text/60"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          {/* ── Info card ── */}
          <div className="rounded-xl border border-border bg-black/20 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-text/60 uppercase tracking-wider">Account info</h2>

            <Input
              label="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />

            <div className="flex flex-col gap-1.5">
              <Input label="Email" value={user.email || ''} disabled />
              <p className="text-xs text-text/40">Email address cannot be changed</p>
            </div>

            <Button onClick={handleSave} disabled={!profileDirty || saving} className="w-full">
              {saving ? 'Saving…' : <><Check size={14} /> Save changes</>}
            </Button>
          </div>

          {/* ── Account details card ── */}
          <div className="rounded-xl border border-border bg-black/20 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-text/60 uppercase tracking-wider">Account details</h2>

            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center gap-3 text-sm">
                <Mail size={15} className="text-text/30 shrink-0" />
                <span className="text-text/60">Email</span>
                <span className="ml-auto text-text/80 font-medium">{user.email}</span>
              </div>

              {/* Sign-in method */}
              <div className="flex items-center gap-3 text-sm">
                <svg width="15" height="15" viewBox="0 0 24 24" className="shrink-0 opacity-30">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-text/60">Sign-in</span>
                <span className="ml-auto text-text/80 font-medium">
                  {isGoogleUser ? 'Google' : 'Email & password'}
                </span>
              </div>

              {/* Role */}
              {user.role === 'admin' && (
                <div className="flex items-center gap-3 text-sm">
                  <Shield size={15} className="text-text/30 shrink-0" />
                  <span className="text-text/60">Role</span>
                  <span className="ml-auto text-accent font-medium capitalize">{user.role}</span>
                </div>
              )}

              {/* Joined */}
              {joinedDate && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={15} className="text-text/30 shrink-0" />
                  <span className="text-text/60">Joined</span>
                  <span className="ml-auto text-text/80 font-medium">{joinedDate}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      <Toast {...toast} onClose={() => setToast((t) => ({ ...t, visible: false }))} />
    </div>
  );
}
