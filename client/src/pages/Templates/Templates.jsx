import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Input from '../../components/Input.jsx';
import TemplateCard from '../../components/TemplateCard.jsx';
import Tabs from '../../components/Tabs.jsx';
import api from '../../utils/api.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useTemplateStore } from '../../stores/templateStore.js';
import { useUiStore } from '../../stores/uiStore.js';

const categories = ['All', 'chatbot', 'coding', 'writing', 'research', 'image'];
const planFilters = ['All Plans', 'Free', 'Pro', 'Enterprise'];

export default function Templates() {
  const { templates, setTemplates, filter, setFilter } = useTemplateStore();
  const [category, setCategory] = useState('All');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const [hydrated, setHydrated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const params = {};
    if (category !== 'All') params.category = category;
    if (filter) params.search = filter;
    if (planFilter !== 'All Plans') params.plan = planFilter.toLowerCase();

    api.get('/api/templates', { params }).then(({ data }) => setTemplates(data)).catch(() => {});
  }, [hydrated, category, filter, planFilter]);

  const handleUse = (template) => {
    if (!template.canUse) {
      navigate('/subscription');
      return;
    }
    navigate('/workspace', { state: { template } });
  };

  return (
    <div className="min-h-screen bg-bg bg-grid">
      <Sidebar />
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} p-4 md:p-8 transition-all`}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-2">Template Marketplace</h1>
          <p className="text-text/50 text-sm mb-6">Browse community templates to jumpstart your prompts.</p>
        </motion.div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search templates..."
              suffix={<Search size={16} className="text-text/30" />}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <Tabs tabs={planFilters} active={planFilter} onChange={setPlanFilter} />
          </div>
        </div>
        <div className="mb-6">
          <Tabs tabs={categories} active={category} onChange={setCategory} />
        </div>
        <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t) => (
            <motion.div key={t.id} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
              <TemplateCard template={t} onUse={handleUse} />
            </motion.div>
          ))}
          {templates.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-text/30 text-center py-16">
              No templates found.
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
