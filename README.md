<div align="center">

# 🌌 NexaSphere

**Connecting students with opportunities across Tech and Non-Tech domains through an integrated digital ecosystem.**

[![GSSoC'26](https://img.shields.io/badge/GSSoC'26-Open%20Source-0e8a16?style=for-the-badge&logo=github)](https://gssoc.girlscript.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-nexasphere--glbajaj.vercel.app-purple?style=for-the-badge&logo=vercel)](https://nexasphere-glbajaj.vercel.app/)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)](./CONTRIBUTING.md)

</div>

---

## 🚀 Overview

**NexaSphere** is the premier community and event-management platform for the **GL Bajaj Group of Institutions**. It powers dynamic landing screens, deep event portfolios, form management, real-time activity logging, AI-powered roadmaps, and collaborative workspaces under a premium cyber-themed design system.

The platform is structured as a **monorepo** with two independent runtimes:

| Layer | Runtime | Port |
|---|---|---|
| **Frontend** | React 18 + Vite | `5175` |
| **Backend API** | Node.js + Express | `8080` (dev proxy) |

> 🎓 **GSSoC'26 participants:** Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening an issue or PR. Mentor: [@Ayushh-Sharmaa](https://github.com/Ayushh-Sharmaa)

---

## 🛠️ Tech Stack

### Frontend (`/` — root)

| Technology | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI framework |
| [Vite 5](https://vitejs.dev/) | Build tool & dev server |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [Zustand](https://zustand-demo.pmnd.rs/) | Global state management |
| [Socket.io-client](https://socket.io/) | Real-time communication |
| [Recharts](https://recharts.org/) | Data visualisation |
| [FullCalendar](https://fullcalendar.io/) | Event calendar |
| [Google Generative AI](https://ai.google.dev/) | AI features |
| [TensorFlow.js](https://www.tensorflow.org/js) | ML in the browser |
| [Sentry](https://sentry.io/) | Error monitoring |
| [Pino](https://getpino.io/) | Structured logging |

### Backend (`/server`)

| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) + [Express 4](https://expressjs.com/) | HTTP server & routing |
| [PostgreSQL](https://www.postgresql.org/) + [`pg`](https://node-postgres.com/) | Primary database |
| [node-pg-migrate](https://salsita.github.io/node-pg-migrate/) | Schema migrations |
| [Socket.io](https://socket.io/) | Real-time WebSockets |
| [Firebase Admin](https://firebase.google.com/docs/admin/setup) | Authentication |
| [SendGrid](https://sendgrid.com/) + [Nodemailer](https://nodemailer.com/) | Email delivery |
| [Winston](https://github.com/winstonjs/winston) | Server-side logging |
| [Zod](https://zod.dev/) | Schema validation |
| [Swagger / ReDoc](https://swagger.io/) | API documentation |
| [Sentry (Node)](https://sentry.io/) | Error tracking |

---

## 📁 Project Structure

```
nexasphere/                        ← monorepo root
│
├── 📂 src/                        ← React 18 application source
│   ├── App.jsx / App.tsx          ← Root router and layout shell
│   ├── main.jsx                   ← Vite entry point
│   ├── i18n.js                    ← Internationalisation config
│   │
│   ├── 📂 components/             ← Reusable UI components
│   │   ├── admin/                 ← Admin-only UI panels
│   │   ├── bookmarks/             ← Bookmark UI widgets
│   │   ├── calendar/              ← Event calendar views
│   │   ├── collab/                ← Collaborative workspace UI
│   │   ├── common/                ← Shared atomic components
│   │   ├── dashboard/             ← Dashboard widgets
│   │   ├── developer/             ← Developer profile cards
│   │   ├── events/                ← Event listings & detail views
│   │   ├── gamification/          ← Points, badges, leaderboard UI
│   │   ├── history/               ← Activity history display
│   │   ├── moderation/            ← Content moderation controls
│   │   ├── portfolio/             ← Portfolio builder components
│   │   ├── recommendation/        ← AI recommendation widgets
│   │   ├── roadmaps/              ← Interactive roadmap builder
│   │   ├── ResumeAnalyzer/        ← Resume upload & AI analysis
│   │   └── ui/                    ← Base design system primitives
│   │
│   ├── 📂 pages/                  ← Route-level page components
│   │   ├── home/                  ← Landing page
│   │   ├── events/                ← Events listing & detail
│   │   ├── dashboard/             ← User dashboard
│   │   ├── admin/                 ← Admin control panel
│   │   ├── portfolio/             ← Portfolio viewer
│   │   ├── roadmaps/              ← Roadmap explorer
│   │   ├── workspace/             ← Collaborative workspace
│   │   ├── resume/                ← Resume tools
│   │   ├── team/                  ← Core team directory
│   │   ├── collab/                ← Collaboration hub
│   │   ├── certificates/          ← Certificate viewer
│   │   ├── membership/            ← Membership management
│   │   ├── projects/              ← Project showcase
│   │   ├── recruitment/           ← Recruitment board
│   │   ├── activities/            ← Activity feed
│   │   ├── about/                 ← About page
│   │   └── contact/               ← Contact page
│   │
│   ├── 📂 context/                ← React Context providers
│   │   ├── BookmarkContext.tsx    ← Bookmark state provider
│   │   ├── RoadmapBuilderContext.tsx ← Roadmap builder state
│   │   ├── SocketContext.tsx      ← Socket.io context wrapper
│   │   └── theme/                 ← Theme (dark/light) context
│   │
│   ├── 📂 hooks/                  ← Custom React hooks
│   │   ├── useSocket.js/.ts       ← Socket.io connection hook
│   │   ├── useNotifications.js    ← Push notification hook
│   │   ├── useSearch.js           ← Global search hook
│   │   ├── useFormValidation.js   ← Form validation hook
│   │   ├── useRecommendations.js  ← AI recommendations hook
│   │   └── ...                    ← 18 hooks total
│   │
│   ├── 📂 services/               ← API client & service layer
│   │   ├── dashboardRepository.js ← Dashboard data fetching
│   │   ├── moderationService.js   ← Content moderation calls
│   │   ├── socket.ts              ← Socket client initialiser
│   │   └── recommendation/        ← AI recommendation service
│   │
│   ├── 📂 store/                  ← Zustand global stores
│   │   └── workspaceStore.ts      ← Workspace collaboration state
│   │
│   ├── 📂 lib/                    ← Core utilities & integrations
│   │   ├── logger.ts              ← Pino logger setup
│   │   ├── promptStore.js         ← AI prompt management
│   │   └── workspaceService.js    ← Workspace business logic
│   │
│   ├── 📂 utils/                  ← Pure utility functions
│   │   ├── socketClient.js        ← Socket.io singleton client
│   │   ├── seoUtils.js            ← SEO meta tag helpers
│   │   ├── errorTracking.js       ← Sentry error utilities
│   │   ├── exportRoadmap.ts       ← PDF/PNG roadmap export
│   │   ├── pushNotificationClient.js ← Push notification util
│   │   └── ...                    ← 10 utilities total
│   │
│   ├── 📂 styles/                 ← Global CSS
│   ├── 📂 assets/                 ← Static images, SVGs, fonts
│   ├── 📂 data/                   ← Static JSON data files
│   ├── 📂 locales/                ← i18n translation files
│   └── 📂 shared/                 ← next-image / next-dynamic shims
│
├── 📂 server/                     ← Node.js / Express backend
│   ├── index.js                   ← Server entry (Express app, Socket.io)
│   ├── 📂 routes/                 ← Express route definitions
│   ├── 📂 controllers/            ← Request/response handlers
│   ├── 📂 services/               ← Business logic layer
│   ├── 📂 repositories/           ← Database query layer
│   ├── 📂 models/                 ← Data model definitions
│   ├── 📂 middleware/             ← Auth, rate-limit, error handling
│   ├── 📂 migrations/             ← node-pg-migrate SQL migrations
│   ├── 📂 schemas/                ← Zod validation schemas
│   ├── 📂 sockets/                ← Socket.io event handlers
│   ├── 📂 swagger-docs/           ← OpenAPI / Swagger YAML specs
│   └── 📂 utils/                  ← Server-side helpers
│
├── 📂 app/                        ← Next.js-compatible error boundaries
│   ├── error.tsx                  ← Segment-level UI error boundary
│   ├── global-error.tsx           ← Root layout catch-all
│   ├── robots.ts                  ← robots.txt generator
│   └── sitemap.ts                 ← sitemap.xml generator
│
├── 📂 admin-dashboard/            ← Standalone admin panel (separate app)
├── 📂 public/                     ← Static assets served by Vite
├── 📂 e2e/                        ← Playwright end-to-end tests
├── 📂 tests/                      ← Additional integration tests
├── 📂 scripts/                    ← Utility scripts (data fetch, etc.)
├── 📂 server-python/              ← Python AI microservice
├── 📂 server-java/                ← Java service (experimental)
├── 📂 google-apps-script/         ← Google Workspace integrations
│
├── .env.example                   ← Frontend environment variable template
├── server/.env.example            ← Backend environment variable template
├── vite.config.js                 ← Vite build & proxy configuration
├── vercel.json                    ← Vercel deployment (frontend SPA)
├── eslint.config.js               ← ESLint flat config
├── .prettierrc                    ← Prettier formatting rules
├── playwright.config.ts           ← E2E test configuration
└── vitest.config.ts               ← Unit test configuration
```

---

## 💻 Getting Started

> 📖 **Full setup guide with troubleshooting:** [docs/SETUP.md](./docs/SETUP.md)

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | `>= 20.0.0` |
| npm | `>= 10.0.0` |
| PostgreSQL | `>= 14` |
| Git | Any recent version |

### Frontend Setup

```bash
# 1. Clone the repository
git clone https://github.com/Piyush025s07/NexaSphere-GSSOc.git
cd NexaSphere-GSSOc

# 2. Install frontend dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (see docs/SETUP.md for details)

# 4. Start the frontend dev server
npm run dev
# → Opens at http://localhost:5175
```

### Backend Setup

```bash
# In a separate terminal — navigate to the server directory
cd server

# Install backend dependencies
npm install

# Copy backend environment config
cp .env.example .env
# Fill in DATABASE_URL, Firebase credentials, SendGrid key, etc.

# Run database migrations
npm run migrate:latest

# Start the backend server
npm run dev
# → Runs at http://localhost:8080
```

### Available Scripts

#### Frontend (root)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server at port 5175 |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run Vitest unit tests |
| `npm run test:ui` | Run Vitest with browser UI |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint:fix` | Auto-fix ESLint issues |

#### Backend (`/server`)

| Script | Description |
|---|---|
| `npm run dev` | Start Express server |
| `npm run test` | Run Jest tests with coverage |
| `npm run migrate:latest` | Apply all pending migrations |
| `npm run migrate:rollback` | Roll back last migration |
| `npm run migrate:create` | Scaffold a new migration file |

---

## 🤝 Contributing

We ❤️ contributions! NexaSphere participates in **GSSoC'26**.

- Read the full [**CONTRIBUTING.md**](./CONTRIBUTING.md) before starting
- Browse [good first issues](https://github.com/Piyush025s07/NexaSphere-GSSOc/labels/good%20first%20issue)
- Comment `/assign` on an issue to request assignment
- Follow our [Code of Conduct](./CODE_OF_CONDUCT.md)

### Quick Contribution Flow

```
Fork → Branch → Code → Test → PR → Mentor Review → Admin Approval → Merge
```

See [docs/WORKFLOWS.md](./docs/WORKFLOWS.md) for the full automated pipeline.

---

## 🔐 Security

Found a vulnerability? **Please do not open a public issue.**
Report it privately — see [SECURITY.md](./SECURITY.md).

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgements

- [GL Bajaj Group of Institutions](https://www.glbajaj.org/) — the community this platform serves
- [GirlScript Foundation](https://gssoc.girlscript.tech) — for the GSSoC'26 programme
- All contributors who make NexaSphere better every day

---

<div align="center">

**Made with ❤️ for the GL Bajaj Community**

[Live App](https://nexasphere-glbajaj.vercel.app/) · [Report Bug](https://github.com/Piyush025s07/NexaSphere-GSSOc/issues/new?template=bug_report.md) · [Request Feature](https://github.com/Piyush025s07/NexaSphere-GSSOc/issues/new?template=feature_request.md)

<!-- CONTRIBUTORS_START -->
<a href="https://github.com/ionfwsrijan"><img src="https://github.com/ionfwsrijan.png" width="50px" alt="ionfwsrijan" title="ionfwsrijan" /></a>
<a href="https://github.com/anshika1179"><img src="https://github.com/anshika1179.png" width="50px" alt="anshika1179" title="anshika1179" /></a>
<a href="https://github.com/atul-upadhyay-7"><img src="https://github.com/atul-upadhyay-7.png" width="50px" alt="atul-upadhyay-7" title="atul-upadhyay-7" /></a>
<a href="https://github.com/OmanshiRaj"><img src="https://github.com/OmanshiRaj.png" width="50px" alt="OmanshiRaj" title="OmanshiRaj" /></a>
<!-- CONTRIBUTORS_END -->

</div>
