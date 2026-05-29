import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore.js';

/* ─── Design tokens ───────────────────────────────────────────── */
const C = {
  forge:    '#FF4D1C',
  forgeGlow:'rgba(255,77,28,0.3)',
  ink:      '#0A0A0F',
  bg:       '#131318',
  surface:  '#1f1f25',
  surfaceLow:'#1b1b20',
  onSurface:'#e4e1e9',
  onSurfaceVariant:'#e5beb4',
  gold:     '#FFB800',
  emerald:  '#00C896',
  blue:     '#4f6ef7',
  mist:     '#C8C4BE',
};

/* ─── Typewriter ──────────────────────────────────────────────── */
const TAGLINES = [
  'Your AI is only as good as your prompt.',
  'Turn rough ideas into precision-crafted prompts.',
  'Six strategies. Five providers. One platform.',
  'Stop guessing. Start forging.',
];
function useTypewriter(texts, ts = 60, ds = 30, pause = 3000) {
  const [display, setDisplay] = useState('');
  const [ti, setTi]   = useState(0);
  const [ci, setCi]   = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const cur = texts[ti];
    const id = setTimeout(() => {
      if (!del) {
        if (ci < cur.length) { setDisplay(cur.slice(0, ci + 1)); setCi(c => c + 1); }
        else setTimeout(() => setDel(true), pause);
      } else {
        if (ci > 0) { setDisplay(cur.slice(0, ci - 1)); setCi(c => c - 1); }
        else { setDel(false); setTi(i => (i + 1) % texts.length); }
      }
    }, del ? ds : ts);
    return () => clearTimeout(id);
  }, [ci, del, ti, texts, ts, ds, pause]);
  return display;
}

/* ─── Live demo streaming text ────────────────────────────────── */
// Real example of what NexPrompt's chatbot strategy produces
const FORGED_PROMPT =
`You are Aria, a senior customer success specialist for a B2B SaaS platform.

PERSONA: Warm, knowledgeable, solution-first. You speak like a trusted colleague, not a script.

CORE CAPABILITIES
→ Account & billing management
→ Technical troubleshooting (step-by-step)
→ Feature walkthroughs with real examples
→ Escalation routing with context handoff

HARD BOUNDARIES
• Never speculate on roadmap timelines
• No pricing commitments without manager approval
• Escalate legal or compliance questions immediately

RESPONSE FORMAT
• Lead with empathy, then solution
• Use numbered steps for technical fixes
• Keep replies under 150 words unless complexity demands more`;

/* ─── Strategy tab data (accurate to actual strategies) ──────── */
const STRATEGY_TABS = [
  { id: 'chatbot',  label: 'Chatbot',  icon: 'forum' },
  { id: 'coding',   label: 'Coding',   icon: 'code' },
  { id: 'writing',  label: 'Writing',  icon: 'edit_note' },
  { id: 'research', label: 'Research', icon: 'travel_explore' },
  { id: 'image',    label: 'Image',    icon: 'palette' },
  { id: 'video',    label: 'Video',    icon: 'videocam' },
];

const STRATEGIES = {
  chatbot: {
    title: 'Persona-Driven Chatbot System Prompts',
    desc: 'Transforms your rough bot idea into a production-ready system prompt — covering identity, tone, capabilities, hard boundaries, conversation flow, and edge-case handling. Paste the output directly into any AI platform.',
    features: ['10-dimension persona architecture', 'Hard boundary & escalation rules', 'Multi-turn conversation flow design'],
  },
  coding: {
    title: 'Production-Grade Coding Prompts',
    desc: 'Structures your request into a complete engineering brief: objective, tech stack, functional requirements, I/O contract, error handling, performance constraints, and test coverage — specific enough that a developer can implement without a single follow-up.',
    features: ['Full I/O contract with typed examples', 'Edge cases & error handling spec', 'Architecture patterns & anti-patterns'],
  },
  writing: {
    title: 'Tone & Voice Calibration',
    desc: 'Turns a vague writing idea into a rich, immediately actionable brief — covering format, voice, target audience, core thesis, must-include elements, style guidance, opening hook, and closing impact.',
    features: ['Audience-specific voice calibration', 'Must-include & must-avoid elements', 'Opening hook & closing impact direction'],
  },
  research: {
    title: 'Structured Research & Analysis Prompts',
    desc: 'Converts a broad topic into a scoped research directive with a sharp research question, sub-questions, analytical framework, source requirements, output structure, and depth standards — so two researchers produce comparable, structured outputs.',
    features: ['Scoped research question + sub-questions', 'Analytical framework selection', 'Source requirements & confidence standards'],
  },
  image: {
    title: 'Precision Image Generation Prompts',
    desc: 'Translates abstract visual ideas into a single, highly detailed prompt covering subject, setting, art style, composition, lighting, colour palette, mood, texture, and quality tags — optimised for Midjourney v6, DALL-E 3, Stable Diffusion XL, and Flux.',
    features: ['Platform-specific optimisation (MJ, DALL-E, SD)', 'Lighting, palette & mood specification', 'Composition & framing control'],
  },
  video: {
    title: 'Video Production Briefs',
    desc: 'Builds a complete video production prompt — concept, format, platform, visual style, audience, timed structure, script outline, B-roll, audio direction, and CTA — specific enough for a producer or scriptwriter to execute without additional briefing.',
    features: ['Timed section breakdown with hook', 'Platform-specific format guidance', 'B-roll, audio & CTA specification'],
  },
};

/* ─── 4-step process ──────────────────────────────────────────── */
const STEPS = [
  { n: '01', title: 'Describe your idea',   body: 'Write what you want in plain language — no prompting expertise needed. A sentence is enough to start.', icon: 'edit',           color: C.forge,   mt: 0  },
  { n: '02', title: 'Pick a strategy',      body: 'Choose from six domain-tuned strategies: Chatbot, Coding, Writing, Research, Image, or Video.', icon: 'strategy',       color: C.emerald, mt: 32 },
  { n: '03', title: 'Choose your provider', body: 'Select Groq, SambaNova, Anthropic, Gemini, or OpenCode. We tune the output syntax for each model.', icon: 'neurology',      color: C.blue,    mt: 48 },
  { n: '04', title: 'Stream the result',    body: 'Watch your optimised prompt appear token by token. Cancel, refine with AI clarifying questions, and repeat.', icon: 'stream', color: C.forge,   mt: 64 },
];

/* ─── Providers (accurate to constants.js + tiers.js) ────────── */
const PROVIDERS = [
  { name: 'Groq',      model: 'LLaMA 3.3 70B',       tag: 'Fastest',    color: C.emerald, cost: '1 credit' },
  { name: 'SambaNova', model: 'DeepSeek-V3.1',        tag: 'Powerful',   color: C.blue,    cost: '2 credits' },
  { name: 'Anthropic', model: 'Claude 3.5 Sonnet',    tag: 'Nuanced',    color: '#A855F7', cost: '3 credits' },
  { name: 'Gemini',    model: 'Gemini 2.0 Flash',     tag: 'Versatile',  color: C.gold,    cost: '2 credits' },
  { name: 'OpenCode',  model: 'DeepSeek V4',          tag: 'Code-first', color: C.forge,   cost: '1 credit'  },
];

/* ─── Credit packs (accurate to tiers.js) ────────────────────── */
const PACKS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹19',
    credits: 20,
    bonus: 0,
    perCredit: '₹0.95',
    features: ['20 prompt generations', 'All 5 AI providers', 'All 6 domain strategies', '24+ templates'],
    missing: [],
    cta: 'Get Started',
    to: '/register',
    hot: false,
    checkColor: C.blue,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '₹79',
    credits: 100,
    bonus: 10,
    perCredit: '₹0.79',
    features: ['100 + 10 bonus credits', 'All 5 AI providers', 'All 6 domain strategies', 'AI clarifying questions', 'Prompt history & favorites'],
    missing: [],
    cta: 'Best Value',
    to: '/register',
    hot: true,
    checkColor: C.forge,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹149',
    credits: 250,
    bonus: 50,
    perCredit: '₹0.60',
    features: ['250 + 50 bonus credits', 'All 5 AI providers', 'All 6 domain strategies', 'Real-time streaming', 'Export & fork prompts'],
    missing: [],
    cta: 'Go Premium',
    to: '/register',
    hot: false,
    checkColor: C.emerald,
  },
];

/* ─── Ember particles ─────────────────────────────────────────── */
function Embers({ count = 50 }) {
  const items = useRef(
    Array.from({ length: count }, (_, i) => ({
      size:    1 + Math.random() * 3,
      left:    `${Math.random() * 100}%`,
      top:     `${Math.random() * 100}%`,
      opacity: Math.random() * 0.5,
      dur:     5 + Math.random() * 10,
      delay:   Math.random() * 4,
      color:   i % 3 === 0 ? C.forge : i % 3 === 1 ? C.gold : '#fff',
    }))
  ).current;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.4 }}>
      {items.map((p, i) => (
        <motion.div key={i}
          style={{
            position: 'absolute', width: p.size, height: p.size,
            borderRadius: '50%', background: p.color,
            left: p.left, top: p.top,
            boxShadow: `0 0 ${p.size * 2}px ${C.forge}`,
          }}
          animate={{ y: [0, -200, -400], opacity: [0, p.opacity, 0], rotate: [0, 360, 720] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

/* ─── Live Demo Widget ────────────────────────────────────────── */
function LiveDemo() {
  const [text, setText] = useState('');
  const timerRef = useRef(null);

  const startStream = useCallback(() => {
    setText('');
    let i = 0;
    timerRef.current = setInterval(() => {
      if (i < FORGED_PROMPT.length) {
        setText(FORGED_PROMPT.slice(0, ++i));
      } else {
        clearInterval(timerRef.current);
        setTimeout(startStream, 5000);
      }
    }, 18);
  }, []);

  useEffect(() => { startStream(); return () => clearInterval(timerRef.current); }, [startStream]);

  return (
    <div style={{
      background: 'rgba(19,19,24,0.7)', backdropFilter: 'blur(12px)',
      border: `1px solid rgba(255,77,28,0.1)`, borderRadius: 20, overflow: 'hidden',
      boxShadow: `0 0 40px -10px ${C.forgeGlow}`,
    }}>
      {/* Window chrome */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['rgba(255,94,87,0.5)', 'rgba(255,189,46,0.5)', 'rgba(40,200,64,0.5)'].map((bg, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: bg }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>terminal</span>
          NEXPROMPT · CHATBOT STRATEGY
        </div>
      </div>

      <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Input */}
        <div style={{ background: 'rgba(10,10,15,0.5)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 8 }}>
            Raw Idea
          </div>
          <p style={{ fontSize: 13, color: C.mist, fontFamily: 'monospace', lineHeight: 1.6, margin: 0 }}>
            Build a customer support chatbot for my SaaS product.
          </p>
        </div>

        {/* Processing */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '4px 0' }}>
          <motion.span className="material-symbols-outlined" style={{ fontSize: 18, color: C.forge }}
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
            cyclone
          </motion.span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.forge }}>
            Applying Chatbot Strategy...
          </span>
        </div>

        {/* Output */}
        <div style={{ background: 'rgba(255,77,28,0.05)', padding: 16, borderRadius: 12, border: `1px solid rgba(255,77,28,0.2)`, position: 'relative', minHeight: 160 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.forge, marginBottom: 8 }}>
            Forged System Prompt
          </div>
          <p style={{ fontSize: 12, color: C.onSurface, fontFamily: 'monospace', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>
            {text}
            <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.7 }}
              style={{ display: 'inline-block', width: 7, height: 13, background: C.forge, marginLeft: 2, verticalAlign: 'text-bottom' }} />
          </p>
          <div style={{ position: 'absolute', bottom: 10, right: 12, display: 'flex', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'rgba(255,77,28,0.4)', cursor: 'pointer' }}>content_copy</span>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'rgba(255,77,28,0.4)', cursor: 'pointer' }}>history</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ──────────────────────────────────────────── */
export default function Landing() {
  const tagline         = useTypewriter(TAGLINES);
  const [activeStrategy, setActiveStrategy] = useState('chatbot');
  const { scrollY }     = useScroll();
  const headerBg        = useTransform(scrollY, [0, 80], ['rgba(19,19,24,0)', 'rgba(19,19,24,0.95)']);

  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s._hydrated);
  const scrollTo = id => { setMobileOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  const strategy = STRATEGIES[activeStrategy];
  const adminUrl = import.meta.env.VITE_ADMIN_URL || 'https://admin.nexprompt.site';

  return (
    <div style={{ background: C.bg, color: C.onSurface, minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        * { box-sizing: border-box; }
        .material-symbols-outlined { font-family:'Material Symbols Outlined'; font-weight:normal; font-style:normal; font-size:24px; line-height:1; letter-spacing:normal; text-transform:none; display:inline-block; white-space:nowrap; word-wrap:normal; direction:ltr; -webkit-font-smoothing:antialiased; }
        .syne { font-family:'Syne',sans-serif; }
        ::selection { background:${C.forge}; color:#fff; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${C.forge}55; border-radius:4px; }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-cta-desktop { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
          .stats-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .stats-grid > div { border-left: none !important; border-right: none !important; padding: 12px 0 !important; }
          .strategy-tabs-wrap { flex-wrap: nowrap !important; overflow-x: auto !important; justify-content: flex-start !important; scrollbar-width: none; -ms-overflow-style: none; }
          .strategy-tabs-wrap::-webkit-scrollbar { display: none; }
          .pricing-card-hot { transform: scale(1) !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .hero-section { padding-top: 96px !important; }
          .footer-links { flex-direction: column !important; gap: 16px !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-toggle { display: none !important; }
          .mobile-menu { display: none !important; }
        }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .animate-float { animation:float 6s ease-in-out infinite; }
        @keyframes ping { 0%{transform:scale(1);opacity:.75} 75%,100%{transform:scale(2);opacity:0} }
        .animate-ping { animation:ping 1.5s cubic-bezier(0,0,.2,1) infinite; }
        .nav-link { background:none; border:none; color:rgba(228,225,233,0.6); font-weight:400; font-size:14px; cursor:pointer; font-family:Inter,sans-serif; padding:4px 12px; border-radius:4px; transition:all .15s; }
        .nav-link:hover { color:${C.forge}; background:rgba(255,255,255,0.05); }
        .glass { background:rgba(19,19,24,0.7); backdrop-filter:blur(12px); border:1px solid rgba(255,77,28,0.1); }
        .forge-glow { box-shadow:0 0 40px -10px ${C.forgeGlow}; }
      `}</style>

      <Embers count={50} />

      {/* ── Nav ── */}
      <motion.nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        background: headerBg, backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        boxShadow: `0 0 20px rgba(255,77,28,0.1)`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px clamp(16px,4vw,48px)', maxWidth: 1280, margin: '0 auto' }}>
          <span className="syne" style={{ fontSize: 22, fontWeight: 800, color: C.forge, letterSpacing: '-0.02em', cursor: 'pointer' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            NexPrompt
          </span>

          {/* Desktop nav links */}
          <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="nav-link" style={{ color: C.forge, fontWeight: 700 }} onClick={() => scrollTo('process')}>Process</button>
            <button className="nav-link" onClick={() => scrollTo('pricing')}>Pricing</button>
            <button className="nav-link" onClick={() => scrollTo('strategies')}>Showcase</button>
          </div>
          <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {hydrated && user ? (
              user.role === 'admin' ? (
                <a href={`${adminUrl}/dashboard`} className="nav-link" style={{ textDecoration: 'none' }}>Admin Panel</a>
              ) : (
                <Link to="/dashboard" className="nav-link" style={{ textDecoration: 'none' }}>Dashboard</Link>
              )
            ) : (
              <Link to="/login" className="nav-link" style={{ textDecoration: 'none' }}>Sign In</Link>
            )}
            {hydrated && user ? (
              user.role === 'admin' ? (
                <a href={`${adminUrl}/dashboard`} style={{
                  background: C.forge, color: '#fff', padding: '8px 24px', borderRadius: 9999,
                  fontWeight: 700, fontSize: 14, textDecoration: 'none',
                  boxShadow: `0 4px 16px rgba(255,77,28,0.2)`, transition: 'filter .2s',
                }}
                  onMouseEnter={e => e.target.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.target.style.filter = 'brightness(1)'}>
                  Admin Panel
                </a>
              ) : (
                <Link to="/workspace" style={{
                  background: C.forge, color: '#fff', padding: '8px 24px', borderRadius: 9999,
                  fontWeight: 700, fontSize: 14, textDecoration: 'none',
                  boxShadow: `0 4px 16px rgba(255,77,28,0.2)`, transition: 'filter .2s',
                }}
                  onMouseEnter={e => e.target.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.target.style.filter = 'brightness(1)'}>
                  Workspace
                </Link>
              )
            ) : (
              <Link to="/register" style={{
                background: C.forge, color: '#fff', padding: '8px 24px', borderRadius: 9999,
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                boxShadow: `0 4px 16px rgba(255,77,28,0.2)`, transition: 'filter .2s',
              }}
                onMouseEnter={e => e.target.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.target.style.filter = 'brightness(1)'}>
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="nav-mobile-toggle" onClick={() => setMobileOpen(o => !o)}
            style={{
              background: 'none', border: 'none', color: C.onSurface, cursor: 'pointer',
              padding: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
            }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{
              display: 'flex', flexDirection: 'column', gap: 4,
              padding: '8px clamp(16px,4vw,48px) 16px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
            <button className="nav-link" style={{ color: C.forge, fontWeight: 700, textAlign: 'left', padding: '12px 8px', fontSize: 15 }} onClick={() => scrollTo('process')}>Process</button>
            <button className="nav-link" style={{ textAlign: 'left', padding: '12px 8px', fontSize: 15 }} onClick={() => scrollTo('pricing')}>Pricing</button>
            <button className="nav-link" style={{ textAlign: 'left', padding: '12px 8px', fontSize: 15 }} onClick={() => scrollTo('strategies')}>Showcase</button>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '4px 0' }} />
            {hydrated && user ? (
              user.role === 'admin' ? (
                <a href={`${adminUrl}/dashboard`} className="nav-link" style={{ textDecoration: 'none', textAlign: 'left', padding: '12px 8px', fontSize: 15 }}>Admin Panel</a>
              ) : (
                <Link to="/dashboard" className="nav-link" style={{ textDecoration: 'none', textAlign: 'left', padding: '12px 8px', fontSize: 15 }}>Dashboard</Link>
              )
            ) : (
              <Link to="/login" className="nav-link" style={{ textDecoration: 'none', textAlign: 'left', padding: '12px 8px', fontSize: 15 }}>Sign In</Link>
            )}
            {hydrated && user ? (
              user.role === 'admin' ? (
                <a href={`${adminUrl}/dashboard`} style={{
                  display: 'block', textAlign: 'center',
                  background: C.forge, color: '#fff', padding: '14px 24px', borderRadius: 9999,
                  fontWeight: 700, fontSize: 14, textDecoration: 'none', marginTop: 4,
                }}>
                  Admin Panel
                </a>
              ) : (
                <Link to="/workspace" style={{
                  display: 'block', textAlign: 'center',
                  background: C.forge, color: '#fff', padding: '14px 24px', borderRadius: 9999,
                  fontWeight: 700, fontSize: 14, textDecoration: 'none', marginTop: 4,
                }}>
                  Workspace
                </Link>
              )
            ) : (
              <Link to="/register" style={{
                display: 'block', textAlign: 'center',
                background: C.forge, color: '#fff', padding: '14px 24px', borderRadius: 9999,
                fontWeight: 700, fontSize: 14, textDecoration: 'none', marginTop: 4,
              }}>
                Get Started
              </Link>
            )}
          </motion.div>
        )}
      </motion.nav>

      {/* ── Hero ── */}
      <section className="hero-section" style={{ position: 'relative', padding: '128px clamp(16px,4vw,48px) 80px', maxWidth: 1280, margin: '0 auto', zIndex: 10 }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 64, alignItems: 'center' }}>

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '4px 12px', borderRadius: 9999,
                border: `1px solid rgba(255,77,28,0.3)`, background: 'rgba(255,77,28,0.05)',
                color: C.forge, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
                  <span className="animate-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.forge, opacity: 0.75 }} />
                  <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: C.forge, display: 'inline-block' }} />
                </span>
                Groq · SambaNova · Claude · Gemini · OpenCode
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
              className="syne"
              style={{ fontSize: 'clamp(44px,8vw,80px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
              Forge perfect<br />prompts with{' '}
              <span style={{ color: C.forge }}>AI</span>
            </motion.h1>

            {/* Typewriter */}
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              style={{ fontSize: 18, color: C.onSurfaceVariant, maxWidth: 520, lineHeight: 1.6, margin: 0, minHeight: 28 }}>
              <span style={{ color: C.onSurface, fontWeight: 700 }}>{tagline}</span>
              <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.7 }}
                style={{ display: 'inline-block', width: 2, height: 18, background: C.forge, marginLeft: 3, verticalAlign: 'middle' }} />
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 16, paddingTop: 16 }}>
              {hydrated && user ? (
                <Link to="/workspace" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: C.forge, color: '#fff', padding: '16px 32px', borderRadius: 12,
                  fontWeight: 700, fontSize: 15, textDecoration: 'none',
                  boxShadow: `0 0 40px -10px ${C.forgeGlow}`, transition: 'filter .2s',
                }}
                  onMouseEnter={e => e.target.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.target.style.filter = 'brightness(1)'}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>bolt</span>
                  Go to Workspace
                </Link>
              ) : (
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: C.forge, color: '#fff', padding: '16px 32px', borderRadius: 12,
                  fontWeight: 700, fontSize: 15, textDecoration: 'none',
                  boxShadow: `0 0 40px -10px ${C.forgeGlow}`, transition: 'filter .2s',
                }}
                  onMouseEnter={e => e.target.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.target.style.filter = 'brightness(1)'}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>bolt</span>
                  Start Forging Free
                </Link>
              )}
              <button onClick={() => scrollTo('strategies')} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(19,19,24,0.7)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: C.onSurface, padding: '16px 32px', borderRadius: 12,
                fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background .2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(19,19,24,0.7)'}>
                View Showcase
              </button>
            </motion.div>
          </div>

          {/* Right: Live Demo */}
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
            className="animate-float" style={{ position: 'relative' }}>
            <LiveDemo />
            <div style={{ position: 'absolute', zIndex: -1, bottom: -40, right: -40, width: 256, height: 256, background: 'rgba(255,77,28,0.2)', filter: 'blur(100px)', borderRadius: '50%' }} />
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: '80px clamp(16px,4vw,48px)', background: 'rgba(14,14,19,0.5)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="stats-grid" style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 48, textAlign: 'center' }}>
          {[
            { value: '24+',  label: 'Expert Templates' },
            { value: '6',    label: 'Domain Strategies', border: true },
            { value: '5',    label: 'AI Providers' },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: s.border ? '1px solid rgba(255,255,255,0.05)' : 'none', borderRight: s.border ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div className="syne" style={{ fontSize: 'clamp(36px,5vw,44px)', fontWeight: 800, color: C.forge }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(228,225,233,0.5)' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Strategy Tabs ── */}
      <section id="strategies" style={{ padding: '80px clamp(16px,4vw,48px)', maxWidth: 1280, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="syne" style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, marginBottom: 16 }}>
            Master Every <span style={{ color: C.forge }}>Domain</span>
          </h2>
          <p style={{ color: 'rgba(228,225,233,0.5)', maxWidth: 560, margin: '0 auto', fontSize: 16, lineHeight: 1.65 }}>
            Six battle-tested strategies — each purpose-built for its domain. Pick one and NexPrompt applies the right framework automatically.
          </p>
        </motion.div>

        {/* Tab bar */}
        <div className="strategy-tabs-wrap" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 40, padding: 4, background: 'rgba(10,10,15,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, maxWidth: 860, margin: '0 auto 40px' }}>
          {STRATEGY_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveStrategy(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 20px', borderRadius: 12, cursor: 'pointer', fontSize: 14, transition: 'all .2s',
                background: activeStrategy === tab.id ? 'rgba(255,77,28,0.1)' : 'transparent',
                color:      activeStrategy === tab.id ? C.forge : 'rgba(228,225,233,0.5)',
                border:     activeStrategy === tab.id ? `1px solid rgba(255,77,28,0.2)` : '1px solid transparent',
                fontWeight: activeStrategy === tab.id ? 700 : 400,
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Strategy content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeStrategy}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}
            className="glass forge-glow"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 48, alignItems: 'center', borderRadius: 24, padding: 'clamp(24px,4vw,48px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h3 className="syne" style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{strategy.title}</h3>
              <p style={{ color: 'rgba(228,225,233,0.5)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{strategy.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {strategy.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: C.onSurface }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: C.forge }}>check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE6yhH2vs2OfklEZ77_dSVqoucM0l4dUnGoqqEmius7lQhtCs_lPy6xx8VBwgyG3C-d8E7XpksoEADzPz5AVao8PwPXDl6Be_vSHN7AJETqsE5IJAJIdopuxcktydLy81eDQlTQy_FBUnbqhcviG47A6I7AjpHtd-A8H4Api86b0G7i4GdnrQ5TvfQtOrpIS5_ywQUUKEnhe9OSb9g5QT0PgECVAwUq1hScMoSeRTQ5X6dwj_fxgnScMhdxOkU02iKzZdg_JjxngA"
                alt="AI Visualization"
                style={{ width: '100%', height: 400, objectFit: 'cover', display: 'block', transition: 'transform .7s' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(10,10,15,1) 0%,transparent 50%)' }} />
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── 4-Step Process ── */}
      <section id="process" style={{ padding: '96px clamp(16px,4vw,48px)', maxWidth: 1280, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 64 }}>
          <h2 className="syne" style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, marginBottom: 8 }}>
            The Forging <span style={{ color: C.forge }}>Ritual</span>
          </h2>
          <p style={{ color: 'rgba(228,225,233,0.5)', fontSize: 16 }}>From rough idea to precision prompt in four steps — under 10 seconds.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24 }}>
          {STEPS.map((step, i) => (
            <motion.div key={step.n}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              className="glass"
              style={{
                borderRadius: 16, padding: 32,
                borderTop:    (i === 0 || i === 3) ? `2px solid rgba(255,77,28,0.4)` : undefined,
                borderBottom: i === 3 ? `2px solid rgba(255,77,28,0.4)` : undefined,
                marginTop: step.mt,
              }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, marginBottom: 24, background: `${step.color}18`, border: `1px solid ${step.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: step.color }}>{step.icon}</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: step.color, marginBottom: 8 }}>Step {step.n}</div>
              <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: C.onSurface }}>{step.title}</h4>
              <p style={{ fontSize: 14, color: 'rgba(228,225,233,0.5)', lineHeight: 1.65, margin: 0 }}>{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Providers ── */}
      <section style={{ padding: '80px clamp(16px,4vw,48px)', background: 'rgba(14,14,19,0.5)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="syne" style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, marginBottom: 16 }}>
              Five <span style={{ color: C.forge }}>AI Providers</span>
            </h2>
            <p style={{ color: 'rgba(228,225,233,0.5)', maxWidth: 520, margin: '0 auto', fontSize: 16, lineHeight: 1.65 }}>
              Every provider is available to every user. Switch mid-session. We tune the prompt syntax for each model automatically.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
            {PROVIDERS.map((p, i) => (
              <motion.div key={p.name}
                initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass"
                style={{ borderRadius: 16, padding: '28px 20px', textAlign: 'center', transition: 'all .25s' }}
                whileHover={{ y: -6, borderColor: `${p.color}44` }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, margin: '0 auto 16px', background: `${p.color}18`, border: `1px solid ${p.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: p.color }}>memory</span>
                </div>
                <h3 className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
                <p style={{ fontSize: 11, color: 'rgba(228,225,233,0.35)', marginBottom: 8 }}>{p.model}</p>
                <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 99, background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}33`, marginBottom: 8 }}>{p.tag}</span>
                <p style={{ fontSize: 11, color: 'rgba(228,225,233,0.4)', margin: 0 }}>{p.cost} / generation</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '96px clamp(16px,4vw,48px)', background: 'rgba(27,27,32,0.3)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 className="syne" style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, marginBottom: 16 }}>
              Choose Your <span style={{ color: C.forge }}>Intensity</span>
            </h2>
            <p style={{ color: 'rgba(228,225,233,0.5)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              Pay only for what you use. No subscriptions, no monthly lock-in. Buy credits, forge prompts.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 32, alignItems: 'start' }}>
            {PACKS.map((pack, i) => (
              <motion.div key={pack.id}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={pack.hot ? 'pricing-card-hot' : ''}
                style={{
                  background: pack.hot ? 'rgba(255,77,28,0.02)' : 'rgba(19,19,24,0.7)',
                  backdropFilter: 'blur(12px)',
                  border: pack.hot ? `1px solid rgba(255,77,28,0.5)` : '1px solid rgba(255,77,28,0.1)',
                  borderRadius: 24, padding: 40,
                  display: 'flex', flexDirection: 'column',
                  position: 'relative',
                  transform: pack.hot ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: pack.hot ? `0 0 40px -10px ${C.forgeGlow}` : 'none',
                  zIndex: pack.hot ? 10 : 1,
                  outline: pack.hot ? `1px solid rgba(255,77,28,0.2)` : 'none',
                }}>
                {pack.hot && (
                  <div style={{
                    position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                    background: C.forge, color: '#fff', padding: '4px 16px', borderRadius: 9999,
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>MOST POPULAR</div>
                )}

                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: pack.hot ? C.forge : 'rgba(228,225,233,0.5)', marginBottom: 16 }}>{pack.name}</div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span className="syne" style={{ fontSize: 40, fontWeight: 700 }}>{pack.price}</span>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(228,225,233,0.4)', marginBottom: 32 }}>
                  {pack.credits}{pack.bonus > 0 ? ` + ${pack.bonus} bonus` : ''} credits · {pack.perCredit}/credit
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
                  {pack.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: C.onSurface }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: pack.checkColor }}>check</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link to={pack.to} style={{
                  display: 'block', textAlign: 'center', padding: '16px 0', borderRadius: 12,
                  background: pack.hot ? C.forge : 'transparent',
                  border: pack.hot ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none',
                  boxShadow: pack.hot ? `0 4px 24px rgba(255,77,28,0.2)` : 'none',
                  transition: 'filter .2s, background .2s',
                }}
                  onMouseEnter={e => { if (pack.hot) e.target.style.filter = 'brightness(1.1)'; else e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (pack.hot) e.target.style.filter = 'brightness(1)'; else e.target.style.background = 'transparent'; }}>
                  {pack.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Enterprise note */}
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginTop: 48 }}>
            <p style={{ color: 'rgba(228,225,233,0.4)', fontSize: 14 }}>
              Need more?{' '}
              <Link to="/register" style={{ color: C.forge, textDecoration: 'none', fontWeight: 600 }}>
                Enterprise Pack — 600 + 150 bonus credits for ₹299
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '40px clamp(16px,4vw,48px)', background: C.bg, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 32 }}>
          <div>
            <span className="syne" style={{ fontSize: 18, fontWeight: 800, color: C.onSurface }}>NexPrompt</span>
            <p style={{ fontSize: 10, color: 'rgba(228,225,233,0.4)', marginTop: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              © 2024 NexPrompt. All rights reserved.
            </p>
          </div>

          <div className="footer-links" style={{ display: 'flex', gap: 32 }}>
            {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Docs', '#'], ['API', '#']].map(([label, to]) => (
              <Link key={label} to={to} style={{ color: 'rgba(228,225,233,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color .15s' }}
                onMouseEnter={e => e.target.style.color = C.forge}
                onMouseLeave={e => e.target.style.color = 'rgba(228,225,233,0.5)'}>
                {label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            {['alternate_email', 'language'].map(icon => (
              <div key={icon} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = C.forge; e.currentTarget.style.borderColor = C.forge; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: C.onSurface }}>{icon}</span>
              </div>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
