import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Zap, Circle, Star, CreditCard, Settings, Sparkles, Crown, UserCircle, X, ChevronLeft, Menu } from 'lucide-react';
import { useUiStore } from '../stores/uiStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { useTier } from '../hooks/useTier.js';
import CreditDisplay from './CreditDisplay';

const links = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/workspace',    label: 'Workspace',    icon: Zap },
  { to: '/templates',    label: 'Templates',    icon: Circle },
  { to: '/favorites',    label: 'Favorites',    icon: Star },
  { to: '/subscription', label: 'Subscription', icon: CreditCard },
  { to: '/profile',      label: 'Profile',      icon: UserCircle },
  { to: '/settings',     label: 'Settings',     icon: Settings },
];

export default function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const toggleCollapse = useUiStore((s) => s.toggleCollapse);
  const { plan, isPaid, tier } = useTier();

  const swipeRef = useRef(null);

  const planIcons = { free: null, pro: Sparkles, team: Crown };
  const PlanIcon = planIcons[plan];

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const collapsed = sidebarCollapsed && !isMobile;

  const navClass = ({ isActive }) =>
    `flex items-center ${collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-2.5'} rounded-lg text-sm transition-all duration-200 group ${
      isActive ? 'bg-primary/15 text-primary' : 'text-text/50 hover:text-text hover:bg-white/[0.04]'
    }`;

  const renderDesktopContent = () => (
    <>
      {/* Header */}
      <div className={`flex items-center ${collapsed ? 'justify-center mb-6' : 'justify-between mb-4 px-3'}`}>
        {collapsed ? (
          <span className="text-lg font-bold text-gradient">N</span>
        ) : (
          <span className="text-xl font-bold flex items-center gap-2">
            <span className="text-gradient">NexPrompt</span>
            {isPaid && PlanIcon && <PlanIcon size={14} className="text-accent" />}
          </span>
        )}
      </div>

      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
        <div className={`flex flex-col ${collapsed ? 'items-center' : ''} gap-1`}>
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <NavLink key={l.to} to={l.to} className={navClass}>
                {({ isActive }) => (
                  <>
                    <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Icon size={collapsed ? 20 : 18} className={isActive ? 'text-primary' : 'group-hover:text-text transition-colors'} />
                    </motion.span>
                    {!collapsed && l.label}
                    {isActive && !collapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: tier.primary }} />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
          {!collapsed && <CreditDisplay />}
        </div>
      </div>

      {/* Plan info + collapse toggle (always visible) */}
      <div className={`pt-4 border-t border-border ${collapsed ? 'px-1' : 'px-3'}`}>
        <div className={`flex ${collapsed ? 'flex-col items-center gap-1' : 'items-center gap-2'} text-xs text-text-muted mb-3`}>
          {PlanIcon && <PlanIcon size={12} className="text-accent" />}
          <span className={collapsed ? 'capitalize text-[10px]' : 'capitalize'}>{plan}</span>
          {!collapsed && <span className="text-text-muted/50">Plan</span>}
        </div>
        <button onClick={toggleCollapse}
          className={`flex items-center justify-center rounded-lg text-text/50 hover:text-text hover:bg-white/[0.04] transition-all group w-full ${collapsed ? 'py-3' : 'gap-2 px-3 py-2.5'}`}
          aria-label={collapsed ? 'Expand' : 'Collapse'}>
          <ChevronLeft size={18} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </>
  );

  const renderMobileContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-3">
        <span className="text-xl font-bold flex items-center gap-2">
          <span className="text-gradient">NexPrompt</span>
          {isPaid && PlanIcon && <PlanIcon size={14} className="text-accent" />}
        </span>
        <button onClick={toggleSidebar} className="text-text/50 hover:text-text transition-colors p-1" aria-label="Close sidebar">
          <X size={18} />
        </button>
      </div>

      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
        <div className="flex flex-col gap-1">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                    isActive ? 'bg-primary/15 text-primary' : 'text-text/50 hover:text-text hover:bg-white/[0.04]'
                  }`
                }>
                {({ isActive }) => (
                  <>
                    <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Icon size={18} className={isActive ? 'text-primary' : 'group-hover:text-text transition-colors'} />
                    </motion.span>
                    {l.label}
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: tier.primary }} />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
          <CreditDisplay />
        </div>
      </div>

      {/* Plan info (always visible) */}
      <div className="pt-4 border-t border-border px-3">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {PlanIcon && <PlanIcon size={12} className="text-accent" />}
          <span className="capitalize">{plan}</span>
          <span className="text-text-muted/50">Plan</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Floating hamburger — top-left, always visible when sidebar isn't fully expanded */}
      {(isMobile ? !sidebarOpen : collapsed) && (
        <button
          onClick={isMobile ? toggleSidebar : toggleCollapse}
          className="fixed top-3 left-3 z-30 p-2 rounded-lg text-text/80 bg-black/50 backdrop-blur-sm border border-border/50 hover:text-text hover:bg-black/60 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Edge swipe handle — mobile only */}
      {!sidebarOpen && (
        <div className="fixed left-0 top-0 bottom-0 w-6 z-20 md:hidden"
          onPointerDown={(e) => { swipeRef.current = e.clientX; }}
          onPointerUp={(e) => {
            const dx = e.clientX - (swipeRef.current || 0);
            if (dx > 40) toggleSidebar();
            swipeRef.current = null;
          }}
          style={{ touchAction: 'none', cursor: 'ew-resize' }}
        />
      )}

      {/* Desktop sidebar — always visible, collapsed or expanded, never scrolls with page */}
      <aside className={`fixed left-0 top-0 h-screen bg-black/40 backdrop-blur-xl border-r border-border z-30 p-3 flex flex-col transition-all duration-200 ${isMobile ? 'hidden' : collapsed ? 'w-[68px]' : 'w-64'} md:flex`}>
        {renderDesktopContent()}
      </aside>

      {/* Mobile overlay sidebar — always full-width, never scrolls with page */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div key="sidebar-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
              onClick={toggleSidebar} />
            <motion.aside key="sidebar-panel"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.8 }}
              drag="x" dragConstraints={{ left: -300, right: 0 }} dragElastic={{ left: 0.3, right: 0 }}
              onDragEnd={(_, { offset, velocity }) => {
                if (offset.x < -80 || velocity.x < -500) toggleSidebar();
              }}
              className="fixed left-0 top-0 h-screen w-64 max-w-[85vw] bg-black/40 backdrop-blur-xl border-r border-border z-40 p-5 flex flex-col">
              {renderMobileContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
