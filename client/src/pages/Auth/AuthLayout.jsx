import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ─── Shared CSS injected once ────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0&display=swap');

  .msym {
    font-family: 'Material Symbols Outlined';
    font-weight: normal; font-style: normal; font-size: 24px;
    line-height: 1; letter-spacing: normal; text-transform: none;
    display: inline-block; white-space: nowrap; word-wrap: normal;
    direction: ltr; -webkit-font-smoothing: antialiased;
  }

  /* Root layout */
  .auth-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #0A0A0F;
    font-family: Inter, system-ui, sans-serif;
    color: #e4e1e9;
  }
  @media (min-width: 1024px) {
    .auth-root { flex-direction: row; }
  }

  /* Left cinematic panel */
  .auth-left {
    display: none;
    position: relative;
    overflow: hidden;
    background: #0A0A0F;
  }
  @media (min-width: 1024px) {
    .auth-left {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 50%;
      min-height: 100vh;
      padding: 40px 48px;
    }
  }

  /* Right form panel */
  .auth-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: clamp(80px, 8vw, 120px) clamp(24px, 6vw, 80px) clamp(40px, 5vw, 64px);
    background: #131318;
    overflow-y: auto;
  }

  /* Mobile-only logo */
  .auth-mobile-logo { display: block; }
  @media (min-width: 1024px) { .auth-mobile-logo { display: none; } }

  /* ── Input group with leading icon ── */
  .auth-field { display: flex; flex-direction: column; gap: 6px; }
  .auth-field-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.05em;
    text-transform: uppercase; color: rgba(228,225,233,0.5);
  }
  .auth-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .auth-input-icon {
    position: absolute;
    left: 12px;
    color: rgba(228,225,233,0.4);
    pointer-events: none;
    transition: color .2s;
    font-size: 18px !important;
    line-height: 1;
  }
  .auth-input-wrap:focus-within .auth-input-icon { color: #FF4D1C; }
  .auth-input {
    width: 100%;
    padding: 13px 14px 13px 40px;
    border-radius: 8px;
    background: rgba(10,10,15,0.5);
    border: 1px solid rgba(92,64,57,0.35);
    color: #e4e1e9;
    font-size: 14px;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    font-family: inherit;
    box-sizing: border-box;
  }
  .auth-input::placeholder { color: rgba(228,225,233,0.25); }
  .auth-input:focus {
    border-color: rgba(255,77,28,0.5);
    box-shadow: 0 0 0 1px rgba(255,77,28,0.25);
  }
  /* password input needs room for the eye toggle on the right */
  .auth-input-pw { padding-right: 44px; }

  /* CTA button */
  .auth-btn {
    width: 100%;
    padding: 14px;
    border-radius: 8px;
    background: #FF562A;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: filter .2s, transform .1s;
    box-shadow: 0 0 40px 10px rgba(255,77,28,0.15), 0 4px 20px rgba(255,77,28,0.25);
    font-family: inherit;
  }
  .auth-btn:hover:not(:disabled) { filter: brightness(1.1); }
  .auth-btn:active:not(:disabled) { transform: scale(0.97); }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Ghost button */
  .auth-btn-ghost {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    background: rgba(31,31,37,0.8);
    color: rgba(228,225,233,0.7);
    font-size: 14px;
    font-weight: 500;
    border: 1px solid rgba(92,64,57,0.2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background .2s, border-color .2s;
    font-family: inherit;
  }
  .auth-btn-ghost:hover { background: rgba(42,41,47,0.9); border-color: rgba(92,64,57,0.4); }

  /* Social button */
  .auth-social-btn {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    background: #1f1f25;
    border: 1px solid rgba(92,64,57,0.15);
    color: #e4e1e9;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background .2s;
    font-family: inherit;
  }
  .auth-social-btn:hover { background: #2a292f; }

  /* Divider */
  .auth-divider {
    display: flex; align-items: center; gap: 12px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.05em;
    text-transform: uppercase; color: rgba(228,225,233,0.25);
  }
  .auth-divider::before, .auth-divider::after {
    content: ''; flex: 1; height: 1px;
    background: rgba(92,64,57,0.2);
  }

  /* Link */
  .auth-link { color: #FF4D1C; text-decoration: none; font-weight: 600; transition: opacity .15s; }
  .auth-link:hover { opacity: .75; text-decoration: underline; text-decoration-color: rgba(255,77,28,0.5); text-underline-offset: 3px; }

  /* Error */
  .auth-error {
    font-size: 13px; color: #f87171;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 8px; padding: 10px 14px;
    margin: 0;
  }

  /* Checkbox row */
  .auth-check-row {
    display: flex; align-items: flex-start; gap: 10;
    padding: 12px 14px; border-radius: 8px;
    background: rgba(10,10,15,0.4);
    border: 1px solid rgba(92,64,57,0.2);
  }
`;

/* ─── Avatar stack (social proof) ────────────────────────────── */
const AVATAR_URLS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCqGOXEi36Nq9HEKwBoetJZS0c2VDnMw8YpLmabVsrL5k48jwM5h_b0T8y4L-NwROzeQyj51jqU3chkJBHrnb4Uaezd59aBlSZDmHyRhq0CEVSfgqsT3GUlkeIm2KZWOyxrozoRR2kVuEBZYKCZqmObq11-w0Q7a38bxwn8uNeRKlAV2Fvho8acRyMrvoPE36HZ6id4HnrxO3BwXW6EmFTj3_EfnDInuG7YrFCV-gTPVvHSwxi7HImjmzj28CSMFIuHEvixgCXpWDY',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA3jHatpTDasAwQNGLhyUFEFbnUYp5XFRbMqz1Xu8elLF2YsujHTVjUdH4SgsG6XJTWGhyJRmgfRlOKgcbg10x3eGO9tB83w09uXzI_DN682beJWsapJMbwGaF9Q8dsxa2F7AMcdp-XPZ1eVK4CQq9ySZ0iNaNm3rvPUD0zuKnEta18PtntDa3zzcJkvbIua4hWeWpiMHEvZWoBOBNNd6Y67XDf5KOPnikxQS9G_XzG4iT89CTHWx_oBIwyrDticAQHwZxX98thE8U',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC9r39rxQOHwSnBVe-TWAiNYQChTT5YQtxt190VsxohFUhRw3Y71e8ORuAXDjqhvAX4AWIqepRhAhYfJCg_kmnJ83x3s1tfyzUlzulY0t1U0a_616KUM7M24ZS-tUiFiXLdPR5fMWas7DPAl1v41xYqYzt0LVtrjCvTxHGPWWm3XhyWW4neh_GDYm5wY3swr-iO80WqYL6gvozga_oeK_HT9ZTJg0hIGNgmSdn8l1xI_DeazhxsMnflpTtUGI2q9sp5ZgwfvUJF3HQ',
];

export default function AuthLayout({ children, heading, subheading }) {
  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div className="auth-root">

        {/* ══ LEFT: Cinematic panel ══ */}
        <div className="auth-left">
          {/* Full-bleed background image */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtF9TDdEt8HgoJnUudJ-2JsZ0447_ViP87Vue2oLj48oAjlNTMynPaFsHv5yZmAm_IteyZGLIDrtavWxzk9izKWCw1HY4n46iccC6cst9yuh1A4xHVffvbXAgbIwZSHgkvs_4kvd_gNdJ_eDz1IsizgpxBU5F8zLz3s2gn4QxNpvseO5lMDzlsvKemdUze9bZun51IklxxIRD9YaQdBiGYIvLLDGsq6JmcE9aM0tZsjVNxx56ThmwS_LGlVBoQZ1OVvNAYHGEyJ9c"
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, mixBlendMode: 'screen' }}
            />
            {/* Dark overlay so text is readable */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.5) 60%, rgba(10,10,15,0.85) 100%)' }} />
          </div>

          {/* Ambient glows */}
          <div style={{ position: 'absolute', top: '25%', right: -80, width: 256, height: 256, background: 'rgba(255,77,28,0.1)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '25%', left: -80, width: 384, height: 384, background: 'rgba(255,180,162,0.05)', borderRadius: '50%', filter: 'blur(150px)', pointerEvents: 'none' }} />

          {/* Top: logo */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#e4e1e9', letterSpacing: '-0.01em' }}>
                NexPrompt
              </span>
            </Link>
          </div>

          {/* Middle: hero headline */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(52px, 6vw, 80px)',
              fontWeight: 800, lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: '0 0 24px',
              color: '#e4e1e9',
            }}>
              Forge Your<br />
              <span style={{ color: '#FF4D1C' }}>Future</span>
            </h1>
            <p style={{
              fontSize: 18, fontWeight: 600, lineHeight: 1.5,
              color: 'rgba(228,225,233,0.75)', margin: 0, maxWidth: 380,
            }}>
              The elite workspace for prompt engineers. Precise tools, cinematic performance.
            </p>
          </div>

          {/* Bottom: social proof */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Avatar stack */}
            <div style={{ display: 'flex' }}>
              {AVATAR_URLS.map((src, i) => (
                <div key={i} style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: '2px solid #0A0A0F',
                  overflow: 'hidden', marginLeft: i === 0 ? 0 : -12,
                  background: '#2a292f',
                }}>
                  <img src={src} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'rgba(228,225,233,0.5)',
            }}>
              Joined by 2k+ Elite Engineers
            </span>
          </div>
        </div>

        {/* ══ RIGHT: Form panel ══ */}
        <div className="auth-right">
          {/* Mobile logo */}
          <div className="auth-mobile-logo" style={{ alignSelf: 'flex-start', marginBottom: 32 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: '#e4e1e9' }}>NexPrompt</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ width: '100%', maxWidth: 384 }}
          >
            {/* Heading block */}
            {(heading || subheading) && (
              <div style={{ marginBottom: 28 }}>
                {heading && (
                  <h2 style={{
                    fontFamily: 'Syne, sans-serif',
                    fontSize: 'clamp(24px, 3vw, 32px)',
                    fontWeight: 800, letterSpacing: '-0.02em',
                    color: '#e4e1e9', margin: '0 0 8px',
                  }}>{heading}</h2>
                )}
                {subheading && (
                  <p style={{ fontSize: 14, color: 'rgba(228,225,233,0.5)', margin: 0, lineHeight: 1.6 }}>
                    {subheading}
                  </p>
                )}
              </div>
            )}

            {/* Form content — no card wrapper, matches reference */}
            {children}
          </motion.div>
        </div>

      </div>
    </>
  );
}
