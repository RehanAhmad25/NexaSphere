# 🌌 NexaSphere

### Connecting students with opportunities across Tech and Non-Tech domains through an integrated digital ecosystem.

---

## 🚀 Overview

**NexaSphere** is the premier community and event-management platform for the GL Bajaj Group of Institutions. Built on a modern, high-performance web architecture, NexaSphere powers dynamic landing screens, deep event portfolios, form management, and real-time activity logging under a premium, cyber-themed design system.

---

## 🛠️ Tech Stack

NexaSphere is engineered with industry-standard, scalable full-stack technologies:

*   **Frontend Framework**: [Next.js](https://nextjs.org/) (App Router architecture)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) for robust typing and reliability
*   **Styling & Motion**: [Tailwind CSS](https://tailwindcss.com/) for micro-utility styling, paired with advanced custom motions
*   **Database & ORM**: PostgreSQL with Prisma ORM for structured and efficient data modeling
*   **Caching & KV Storage**: Upstash Redis for high-speed rate limiting and state storage
*   **Authentication**: NextAuth.js for secure administrator and member logins

---

## 📁 Project Structure

Below is a breakdown of the core directories in the NexaSphere platform:

```
nexasphere/
│
├── 📂 app/                  # Next.js App Router (Layouts, pages, global error boundaries)
│   ├── error.tsx            # Segment-level UI error boundary
│   └── global-error.tsx     # Absolute catch-all root layout error screen
│
├── 📂 src/
│   ├── 📂 components/       # Reusable UI elements (Themes, forms, developer cards)
│   ├── 📂 lib/              # Database connections, core services, and state utilities
│   ├── 📂 pages/            # Page templates and segment views
│   ├── 📂 shared/           # Cross-cutting assets, icons, and next-compat wrappers
│   └── 📂 styles/           # Global typography, color sheets, and animations
│
├── 📂 public/               # Static assets, vector icons, and manifest configs
│
├── .env.example             # Template for local environment variables
├── next.config.js           # Next.js framework configuration (w/ Bundle Analyzer)
└── vite.config.js           # Production build orchestrations and resolve alias mapping
```

---

## 💻 Getting Started

Follow these instructions to set up your local development environment.

### Prerequisites

*   **Node.js**: `v20` or higher
*   **npm**: `v10` or higher

### Installation & Run

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Ayushh-Sharmaa/NexaSphere.git
    cd NexaSphere
    ```

2.  **Install Project Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Copy the sample environment template to create your local configurations:
    ```bash
    cp .env.example .env.local
    ```
    Open `.env.local` and fill in your local Postgres database details, Upstash Redis tokens, and application URLs.

4.  **Launch Local Development Server**:
    ```bash
    npm run dev
    ```
    The application will launch locally at `http://localhost:3000` (or the configured `port` in your dev pipeline).

---

## 🤝 Contributing Guidelines

We welcome contributions to the NexaSphere platform! To ensure consistent code quality and seamless integrations, the project enforces automated workflows.

### Local Guardrails

This project utilizes **Husky** and **lint-staged** to run pre-commit validations automatically whenever you make a commit:
*   Pre-commit hooks will execute `npx lint-staged` to run **Prettier** formatting checks (`prettier --write`) and **ESLint** code analysis (`eslint --fix`) on your modified files.

### Continuous Integration (CI)

Every Pull Request targeting the `main` branch triggers our GitHub Actions CI workflow to verify:
1.  **Code Formatting**: `npm run format:check`
2.  **Static Analysis (Linting)**: `npm run lint`
3.  **Static Type-checking**: `npm run typecheck`
4.  **Production Compilation**: `npm run build`

Please ensure your code is cleanly formatted and passes all local linting rules before pushing.
