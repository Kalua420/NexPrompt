import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Plus, LogOut, FileText, Star, Zap, Sparkles, Crown } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import PromptCard from '../../components/PromptCard.jsx';
import api from '../../utils/api.js';
import { useAuthStore } from '../../stores/authStore.js';
import { usePromptStore } from '../../stores/promptStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { useTier } from '../../hooks/useTier.js';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const planIcons = { free: null, pro: Sparkles, enterprise: Crown };

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { prompts, setPrompts, removePrompt } = usePromptStore();
  const navigate = useNavigate();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const { plan, tier, isPremium } = useTier();
  const [stats, setStats] = useState({ total: 0, favorites: 0 });

  useEffect(() => {
    api.get('/api/prompts').then(({ data }) => { setPrompts(data); setStats({ total: data.length, favorites: 0 }); }).catch(() => {});
    api.get('/api/favorites').then(({ data }) => setStats((s) => ({ ...s, favorites: data.length }))).catch(() => {});
  }, []);

  const handleDelete = async (id) => {
    await api.delete(`/api/prompts/${id}`);
    removePrompt(id);
  };

  const PlanIcon = planIcons[plan];
  const statItems = [
    { label: 'Total prompts', value: stats.total, icon: FileText, color: 'text-primary' },
    { label: 'Favorites', value: stats.favorites, icon: Star, color: 'text-yellow-400' },
    { label: 'Ready to go', value: '→', icon: Zap, color: 'text-accent' },
  ];

  return (
    <div className="min-h-screen bg-bg bg-grid">
      <Sidebar />
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} p-4 md:p-8 transition-all`}>
        <div className="flex items-center justify-between mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              {isPremium && PlanIcon && (
                <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border"
                  style={{ borderColor: tier.border, backgroundColor: tier.primary + '15', color: tier.primary }}>
                  <PlanIcon size={11} />
                  {plan === 'pro' ? 'Pro' : 'Enterprise'}
                </span>
              )}
            </div>
            <p className="text-text/50 text-sm mt-1">Welcome back, <span className="text-primary">{user?.name}</span></p>
          </motion.div>
          <div className="flex gap-3 items-center">
            <button onClick={toggleSidebar} className="text-text/30 hover:text-text md:hidden transition-colors"><Menu size={20} /></button>
            <Link to="/workspace"><Button><Plus size={16} /> New prompt</Button></Link>
            <Button variant="ghost" onClick={() => { logout(); navigate('/'); }}>
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {statItems.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} variants={item}>
                <Card className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-black/30 border border-border flex items-center justify-center ${s.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-text/50">{s.label}</p>
                    <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 className="text-lg font-medium mb-4">Recent prompts</h2>
          <div className="space-y-3">
            {prompts.slice(0, 10).map((p) => (
              <PromptCard key={p.id} prompt={p} onDelete={handleDelete} />
            ))}
            {prompts.length === 0 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-text/30 text-sm text-center py-12">
                No prompts yet.{' '}
                <Link to="/workspace" className="text-primary hover:text-accent transition-colors">Create one</Link>
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
