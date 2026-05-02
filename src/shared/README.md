# 🧩 src/shared/

Shared components used across multiple pages.

---

## Components

| File | Purpose |
|---|---|
| `Navbar.jsx` | Top navigation bar — desktop + mobile, active tab highlight |
| `Footer.jsx` | Site footer with links, logo, and social icons |
| `Icons.jsx` | SVG icon components (`IconArrowLeft`, `IconArrowRight`, `IconBolt`, `IconShieldCheck`, `IconSpark`, `IconUsers`) |
| `ParticleBackground.jsx` | Animated particle canvas rendered behind all content |
| `CinematicOpening.jsx` | Full-screen intro animation played once on first load |

---

## Navbar

- `TABS` in `App.jsx` controls which tabs appear: `['Home','Activities','Events','About','Team','Contact']`
- Active tab is highlighted and synced with scroll position on the home page
- On mobile, collapses to a hamburger menu

## Icons

Import named exports:

```js
import { IconArrowRight, IconBolt, IconShieldCheck } from '../../shared/Icons';
```

Use as self-closing JSX with an optional `style` prop:

```jsx
<IconArrowRight style={{ width: 16, height: 16 }} />
```

## ParticleBackground

Accepts `theme` prop (`'dark'` | `'light'`) to switch particle colours.  
Only renders after `CinematicOpening` completes (`cinDone === true` in `App.jsx`).
