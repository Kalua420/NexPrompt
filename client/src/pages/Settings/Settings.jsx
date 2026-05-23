import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Tabs from '../../components/Tabs.jsx';
import Toast from '../../components/Toast.jsx';
import { useAuthStore } from '../../stores/authStore.js';
import { useUiStore } from '../../stores/uiStore.js';

const tabs = ['Profile', 'Theme'];

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const [activeTab, setActiveTab] = useState('Profile');
  const [name, setName] = useState(user?.name || '');
  const [toast, setToast] = useState({ message: '', visible: false, type: 'info' });

  const handleSave = async () => {
    setToast({ message: 'Settings saved', visible: true, type: 'success' });
  };

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} p-4 md:p-8 transition-all`}>
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="overflow-x-auto">
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>
        <div className="mt-8 max-w-lg space-y-5">
          {activeTab === 'Profile' && (
            <>
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email" value={user?.email || ''} disabled />
              <Button onClick={handleSave}>Save changes</Button>
            </>
          )}
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
