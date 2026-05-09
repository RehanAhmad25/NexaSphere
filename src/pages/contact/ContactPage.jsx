import { useEffect, useRef, useState } from 'react';
import { MapPin, Mail, CheckCircle, ClipboardList, Linkedin, MessageSquare, Phone } from 'lucide-react';
import glbajajLogo from '../../assets/images/logos/glbajaj-logo.png';
import './ContactPage.css';

const EMAIL = 'nexasphere@glbajajgroup.org';
const LINKEDIN = 'https://www.linkedin.com/showcase/glbajaj-nexasphere/';
const WHATSAPP = 'https://chat.whatsapp.com/Jjc5cuUKENu0RC1vWSEs20';
const MAP_EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3548.165842841444!2d77.5935043!3d27.2133092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39736ce498c19951%3A0x63359d9c7cf8d1d8!2sGL%20Bajaj%20Group%20of%20Institutions!5e0!3m2!1sen!2sin!4v1709462841284!5m2!1sen!2sin";

const BURST_PARTICLES = 8;
const BURST_DURATION = 600;
const COPIED_TIMEOUT = 2200;

function useBurst(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const burst = e => {
      for (let i = 0; i < BURST_PARTICLES; i++) {
        const p = document.createElement('span');
        const angle = (i / BURST_PARTICLES) * Math.PI * 2;
        const dist = 40 + Math.random() * 30;
        p.style.cssText = `
          position:absolute;
          left:${e.clientX - el.getBoundingClientRect().left}px;
          top:${e.clientY - el.getBoundingClientRect().top}px;
          width:5px; height:5px; border-radius:50%;
          background:var(--c1);
          pointer-events:none; z-index:10;
          animation:contactBurst .55s ease forwards;
          --tx:${Math.cos(angle) * dist}px;
          --ty:${Math.sin(angle) * dist}px;
        `;
        el.appendChild(p);
        setTimeout(() => p.remove(), BURST_DURATION);
      }
    };
    el.addEventListener('click', burst);
    return () => el.removeEventListener('click', burst);
  }, []);
}

function ContactCard({ icon, label, value, href, delay = 0, color }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  useBurst(ref);

  return (
    <a
      ref={ref}
      href={href}
      target={href.startsWith('mailto') ? '_self' : '_blank'}
      rel="noopener noreferrer"
      className="contact-card pop-flip shimmer"
      style={{ animationDelay: `${delay}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="contact-card-glow-overlay"
        style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 60%)`,
          opacity: hovered ? 1 : 0, transition: 'opacity .3s',
          pointerEvents: 'none',
        }}
      />
      <div className="corner-tl" />
      <div className="corner-br" />

      <div
        className="contact-card-icon-wrap"
        style={{
          background: `${color}15`, border: `2px solid ${color}40`,
          boxShadow: hovered ? `0 0 24px ${color}40` : 'none',
        }}
      >
        {icon}
      </div>

      <div className="contact-card-label" style={{ color: color }}>{label}</div>
      <div className="contact-card-value">{value}</div>

      <div
        className="contact-card-cta"
        style={{ color: color, opacity: hovered ? 1 : 0.55 }}
      >
        {href.startsWith('mailto') ? 'Send Email →' : href.includes('linkedin') ? 'Open LinkedIn →' : 'Join Chat →'}
      </div>
    </a>
  );
}

function MapSection() {
  const [loaded, setLoaded] = useState(false);
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShow(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="pop-in map-section">
      <div className="map-header">
        <span className="map-find-us"><MapPin size={14} style={{display:'inline', verticalAlign:'-2px'}} /> FIND US</span>
        <h3 className="map-title">GL Bajaj Group of Institutions</h3>
        <p style={{ color: 'var(--t2)', fontSize: '0.9rem' }}>
          Mathura – Delhi Highway (NH-2), Near Crossing Republic, Mathura, UP 281406
        </p>
      </div>

      <div className="map-container">
        <div className="corner-tl" style={{ width: 20, height: 20 }} />
        <div className="corner-br" style={{ width: 20, height: 20 }} />

        {!loaded && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 12, zIndex: 2, background: 'var(--card)',
          }}>
            <div style={{ animation: 'float 2s ease-in-out infinite' }}><MapPin size={32} color="var(--c1)" /></div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '.6rem', color: 'var(--t3)', letterSpacing: '.2em' }}>LOADING MAP...</div>
            <div style={{ width: 120, height: 2, borderRadius: 2, background: 'var(--bdr)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '60%', background: 'linear-gradient(90deg,var(--c1),var(--c2))', animation: 'shimmerBar 1.2s ease-in-out infinite' }} />
            </div>
          </div>
        )}

        {show && (
          <iframe
            src={MAP_EMBED}
            width="100%"
            height="100%"
            style={{ border: 0, display: 'block', filter: 'saturate(.9) contrast(1.05)', opacity: loaded ? 1 : 0, transition: 'opacity .5s ease' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="GL Bajaj Group of Institutions, Mathura"
            onLoad={() => setLoaded(true)}
          />
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <a
          href="https://maps.google.com/?q=GL+Bajaj+Group+of+Institutions+Mathura"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <MapPin size={16} /> Open in Google Maps
        </a>
      </div>
    </div>
  );
}

function MessageCTA() {
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_TIMEOUT);
    });
  };

  const subject = encodeURIComponent(`Hi NexaSphere${name ? ` — ${name}` : ''}`);
  const body = encodeURIComponent(`Hello NexaSphere Team,\n\n[Your message here]\n\nBest,\n${name || 'Your Name'}`);

  return (
    <div className="pop-scale message-cta-box">
      <div className="corner-tl" />
      <div className="corner-br" />

      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Mail size={36} color="var(--c1)" /></div>
        <h3 className="map-title" style={{ fontSize: 'clamp(1rem,2.5vw,1.3rem)' }}>Drop Us a Message</h3>
        <p style={{ color: 'var(--t2)', fontSize: '.88rem', lineHeight: 1.6 }}>
          For collaborations, queries, or just to say hi —<br />we respond to every message.
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="name-input"
        />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a
          href={`mailto:${EMAIL}?subject=${subject}&body=${body}`}
          className="btn btn-primary btn-ripple"
          style={{ flex: 1, minWidth: 0, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Mail size={16} /> Open Email App
        </a>
        <button
          className="btn btn-outline btn-ripple"
          onClick={handleCopy}
          style={{ flex: 1, minWidth: 0, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {copied ? <><CheckCircle size={16} /> Copied!</> : <><ClipboardList size={16} /> Copy Email</>}
        </button>
      </div>

      <p style={{ textAlign: 'center', marginTop: 14, fontFamily: 'Space Mono,monospace', fontSize: '.6rem', color: 'var(--t3)', letterSpacing: '.15em' }}>
        {EMAIL}
      </p>
    </div>
  );
}

export default function ContactPage({ onBack }) {
  return (
    <div className="pg-contact" id="pg-contact">
      <div className="contact-hero">
        <div className="contact-hero-bg" />
        {onBack && (
          <button
            onClick={onBack}
            className="btn btn-outline btn-sm"
            style={{ position: 'absolute', top: 24, left: 24 }}
          >
            ← Back
          </button>
        )}
        <span className="cin-section-label pop-in">Get In Touch</span>
        <h1 className="section-title pop-word" style={{ marginBottom: 16 }}>Contact Us</h1>
        <p className="pop-in" style={{ color: 'var(--t2)', fontSize: 'clamp(.9rem,2vw,1.08rem)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7, animationDelay: '.12s' }}>
          We&apos;re a student-run community — always happy to connect, collaborate, and answer questions.
        </p>
        <div className="contact-divider" style={{ marginTop: 40, maxWidth: 600 }} />
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="contact-cards-grid cin-container">
          <ContactCard icon={<Mail size={24} />} label="Email" delay={0} value={EMAIL} href={`mailto:${EMAIL}`} color="var(--c1)" />
          <ContactCard icon={<Linkedin size={24} />} label="LinkedIn" delay={0.08} value="NexaSphere · GL Bajaj" href={LINKEDIN} color="var(--c2)" />
          <ContactCard icon={<MessageSquare size={24} />} label="WhatsApp Community" delay={0.16} value="Join our active community group" href={WHATSAPP} color="var(--c5)" />
        </div>

        <MapSection />

        <div className="contact-divider" style={{ maxWidth: 400, margin: '0 auto 64px' }} />

        <MessageCTA />

        <div className="pop-in footer-info-box">
          <div className="corner-tl" />
          <div className="corner-br" />
          <img
            src={glbajajLogo}
            alt="GL Bajaj"
            style={{ height: 38, margin: '0 auto 12px', background: 'rgba(255,255,255,.88)', padding: '3px 8px', borderRadius: 6 }}
          />
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '.72rem', color: 'var(--c1)', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            GL Bajaj Group of Institutions
          </div>
          <p style={{ color: 'var(--t2)', fontSize: '.83rem', lineHeight: 1.65 }}>
            Mathura – Delhi Highway (NH-2),<br />
            Near Crossing Republic, Mathura,<br />
            Uttar Pradesh — 281406
          </p>
          <a
            href="tel:+915652400400"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 10, color: 'var(--c1)', fontSize: '.85rem', fontWeight: 600 }}
          >
            <Phone size={14} /> +91-565-2400400
          </a>
        </div>
      </div>
    </div>
  );
}
