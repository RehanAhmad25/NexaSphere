# NexaSphere — GL Bajaj Group of Institutions, Mathura

> The official website & community platform for NexaSphere — connecting GL Bajaj students with opportunities across Tech and Non-Tech domains.

**🌐 Live Site:** https://nexasphere-glbajaj.netlify.app  
**📧 Email:** nexasphere@glbajajgroup.org  
**💼 LinkedIn:** https://www.linkedin.com/showcase/glbajaj-nexasphere/  
**💬 WhatsApp Community:** https://chat.whatsapp.com/Jjc5cuUKENu0RC1vWSEs20

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | Vanilla CSS (globals · animations · components · **motion**) |
| Hosting | Netlify (auto-deploy on push to `main`) |
| Form backend | Google Apps Script → Google Sheets |
| Fonts | Orbitron · Rajdhani · Space Mono · Inter (Google Fonts) |

---

## 📁 Project Structure

```
NexaSphere-1/
├── google-apps-script/         # Apps Script files (NOT auto-deployed)
│   └── Code.gs                 # Membership form handler → Google Sheets
├── public/                     # Static assets served as-is
├── src/
│   ├── App.jsx                 # Root component — routing & page switching + motion hooks
│   ├── assets/
│   │   └── images/
│   │       ├── logos/          # nexasphere-logo.png, glbajaj-logo.png
│   │       └── team/           # Circular profile photos (300×300px)
│   ├── data/                   # All site content (edit here — no component changes needed)
│   │   ├── teamData.js         # Core team members
│   │   ├── activitiesData.js   # Activity card grid data
│   │   ├── eventsData.js       # Home page + Events page timeline
│   │   └── activities/         # Per-activity detail pages
│   │       ├── index.js        # Activity registry
│   │       ├── insightSession.js
│   │       ├── workshop.js
│   │       ├── hackathon.js
│   │       └── ...
│   ├── pages/
│   │   ├── home/               # HeroSection
│   │   ├── activities/         # ActivitiesPage + ActivityDetailPage
│   │   ├── events/             # EventsPage + EventDetailPage
│   │   ├── about/              # AboutPage
│   │   ├── team/               # TeamPage + TeamSection
│   │   ├── contact/            # ContactPage
│   │   ├── recruitment/        # RecruitmentPage  (Core Team Application — 7-step form)
│   │   └── membership/         # MembershipPage   (Join as Member — 2-section form)
│   ├── shared/                 # Navbar, Footer, Icons, ParticleBackground, MotionLayer, etc.
│   └── styles/
│       ├── globals.css         # CSS variables, body reset, layout utilities
│       ├── animations.css      # @keyframes + scroll-reveal classes (v8)
│       ├── components.css      # Every component's styles
│       └── motion.css          # ✨ NEW: Advanced motion layer (v2) — see below
├── index.html
├── vite.config.js
├── netlify.toml
└── package.json
```

---

## 🚀 Development

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # Production build → dist/
npm run preview    # Preview the production build locally
```

---

## 🌍 Deployment

Push to `main` → Netlify auto-builds and deploys via `netlify.toml`.

```toml
# netlify.toml
[build]
  command   = "npm run build"
  publish   = "dist"
```

---

## ✨ Animation Architecture & Interaction System

NexaSphere uses a **layered motion hierarchy** across three CSS files and a shared React utility module. All effects are **non-destructive** — existing animations are preserved and only extended.

### Motion Files

| File | Purpose |
|---|---|
| `src/styles/animations.css` | Core keyframes + `.pop-in/.pop-word/.pop-left` scroll-reveal system |
| `src/styles/components.css` | Per-component hover, shimmer, and transition styles |
| `src/styles/motion.css` | ✨ Advanced motion layer — ambient orbs, parallax, nav micro-fx, button pulses |
| `src/shared/MotionLayer.jsx` | React hooks wiring all scroll/mouse effects into the app |

### Animation Hierarchy

```
Level 1 — Loader / Cinematic Opening
  CinematicOpening.jsx → shard-shatter, letter-typewriter, crack SVG, flash burst
  Wipe component       → page wipe + shimmer sweep + logo splash + page flash glow

Level 2 — Ambient / Background
  AmbientOrbs          → 5 fixed blurred gradient orbs drifting behind content
  ParticleBackground   → canvas-based constellation particle system
  Hero hero-bg-parallax→ scroll-driven scale+translateY on hero background

Level 3 — Entrance Reveals (scroll-triggered)
  .pop-in/.pop-word/.pop-left/.pop-right/.pop-scale/.pop-flip/.pop-num
    → IntersectionObserver adds .fired → triggers keyframe animation
  .ns-reveal / .ns-reveal-left / .ns-reveal-right / .ns-reveal-scale
    → IntersectionObserver adds .ns-visible → CSS transition fade/slide

Level 4 — Per-Section Micro-interactions
  Activity cards  → mag-card 3D tilt + card-accent-line + shimmer sweep + icon spin
  Team cards      → mag-card 3D tilt + photo ring spin (conic-gradient) + glow
  Timeline cards  → translateY lift + border glow + dot color pulse
  About values    → chip hover lift + box-shadow
  Buttons         → ctaBreath pulse / joinBreath pulse / outlinePulse glow
                    + press-down :active scale + ripple on click

Level 5 — Navigation
  Navbar         → navSlideIn on mount + lift on tab hover + underline glow
  Tab switching  → wipeDown/wipeUp wipe + shimmer overlay + page flash + splash logo
  Scroll bar     → #scroll-progress width driven by useScrollProgress hook

Level 6 — Cursor System
  Custom cursor  → anti-gravity orb (with float bob) + trail dot + ambient glow halo
                   magnetic hover expand + click shrink
```

### Key Hooks (src/shared/MotionLayer.jsx)

| Hook | Effect |
|---|---|
| `useScrollProgress()` | Drives `#scroll-progress` bar width via `window.scrollY` |
| `useNsReveal(deps)` | IntersectionObserver for `.ns-reveal*` elements → adds `.ns-visible` |
| `useHeroParallax()` | rAF loop: moves `.hero-bg-parallax` at 0.28× scroll speed |
| `useNavScrollTint()` | Dynamic `backdropFilter` intensity on navbar on scroll |
| `useGlobalMouseParallax()` | Moves `[data-parallax]` elements based on mouse position |
| `useMagneticCards()` | 3D `perspective + rotateX/Y` tilt on `.mag-card` elements |

### CSS Classes Reference

| Class | Applied To | Effect |
|---|---|---|
| `.ns-reveal` | Section wrappers | Fade + translateY up on scroll into view |
| `.ns-reveal-left` | Text columns | Slide from left on scroll |
| `.ns-reveal-right` | Media columns | Slide from right on scroll |
| `.ns-reveal-scale` | CTA boxes | Scale from 0.88 on scroll |
| `.ns-visible` | Added by JS | Triggers the transition |
| `.mag-card` | Activity + Team cards | 3D tilt from MotionLayer mouse hook |
| `.ambient-orb` | Fixed bg divs | Drifting colored blur orbs |
| `.section-divider` | Between sections | Animated gradient sweep stripe |
| `.wipe-shimmer` | During nav wipe | Bright shimmer over page transition |
| `.page-flash` | On nav arrive | Radial glow burst on page entry |
| `.hero-bg-parallax` | Hero bg div | Scroll-driven transform |
| `[data-parallax="N"]` | SVG rings, etc. | Mouse-driven movement at depth N |
| `.scroll-indicator-line` | Hero scroll dot | Bounce animation |

### Timing Consistency

All animations use one of these easing functions for consistency:
- **`cubic-bezier(.22,1,.36,1)`** — smooth spring (entrances, reveals)
- **`cubic-bezier(.34,1.56,.64,1)`** — bouncy spring (interactive elements, modals)
- **`cubic-bezier(.77,0,.18,1)`** — cinematic snap (page wipes)
- **`ease-in-out`** — ambient loops (orbs, pulses, parallax)

### Performance Optimizations

- `will-change: transform` on animated cards and orbs
- `passive: true` on all scroll/mouse event listeners
- rAF loops for smooth 60fps effects (cursor, parallax, progress bar)
- `@media (prefers-reduced-motion: reduce)` disables all ambient animations
- `@media (max-width: 768px)` hides ambient orbs and disables parallax

---

## 📝 Forms & Google Sheets Integration

NexaSphere uses **Google Apps Script Web Apps** for form submissions. Data stays in Google Sheets — no backend server required.

### Form 1 — Core Team Recruitment (7-step)

| Item | Detail |
|---|---|
| File | `src/pages/recruitment/RecruitmentPage.jsx` |
| Constant | `APPS_SCRIPT_URL` (line ~883) |
| Script project | Separate Apps Script project (Core Team sheet) |
| Sheet tab | `Responses` |
| Deployed URL | *(stored in the constant above)* |

### Form 2 — Join as Member (2-section)

| Item | Detail |
|---|---|
| File | `src/pages/membership/MembershipPage.jsx` |
| Constant | `MEMBERSHIP_SCRIPT_URL` (line ~33) |
| Script project | **"NexaSphere Membership"** Apps Script project |
| Sheet tab | `Membership` (auto-created on first submission) |
| Deployment ID | `AKfycbyRQOW3Xjv13vXvft8ezD9sJdvjV3kf-VHm1l_mImHRDUAEqsilK0wb5QBD5GOkixwe` |
| Deployed URL | `https://script.google.com/macros/s/AKfycbyRQOW3Xjv13vXvft8ez.../exec` |
| Script file | `google-apps-script/Code.gs` |

> Both forms use `mode: 'no-cors'` + `Content-Type: text/plain` to bypass CORS on Google's servers. The Apps Script parses the plain-text body as JSON.

---

## ✏️ Common Content Changes

| Task | File to edit |
|---|---|
| Add / update team member | `src/data/teamData.js` |
| Add activity event | `src/data/activities/<name>.js` |
| Add KSS / Insight Session | `src/data/activities/insightSession.js` |
| Update home page stats | `src/pages/home/HeroSection.jsx` → `StatsBar` |
| Update contact details | `src/pages/contact/ContactPage.jsx` → constants at top |
| Add team member photo | `src/assets/images/team/<name>.png` (300×300px, transparent) |
| Change site colors | `src/styles/globals.css` → `:root {}` |
| Add a new scroll-reveal | Add `ns-reveal` class to any wrapper element |
| Change animation timing | Edit easing in `src/styles/motion.css` |

---

## 🔗 Key Links

| Resource | URL |
|---|---|
| Core Team Application | In-built form (opens from "Apply" / "Core Team" buttons) |
| Join as Member | In-built form (opens from "Join as Member" hero button) |
| Code of Conduct | https://tinyurl.com/NexaSphere-COD |
| Community Rules | https://tinyurl.com/NexaSphere-Rules |
| LinkedIn Page | https://www.linkedin.com/showcase/glbajaj-nexasphere/ |
| WhatsApp Community | https://chat.whatsapp.com/Jjc5cuUKENu0RC1vWSEs20 |

---

*NexaSphere — GL Bajaj Group of Institutions · Built with React + Vite*
