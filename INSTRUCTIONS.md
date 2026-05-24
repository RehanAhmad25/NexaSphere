# 📘 NexaSphere Project Instructions & Documentation

Welcome to the official **NexaSphere** architectural documentation. This guide provides a comprehensive breakdown of the project's structure, the purpose of each component, and the operational principles governing the ecosystem.

---

## 🏗️ Core Architecture Overview

NexaSphere is built using a **Modular Micro-Architecture** to ensure scalability, maintainability, and clear separation of concerns:

-   **Main Frontend**: React-based SPA for the public-facing community platform.
-   **Admin Dashboard**: Dedicated management portal for content and core team administration.
-   **Java Backend**: Primary REST API handling persistence, business logic, and security.
-   **Python Backend**: Specialized microservice for AI chat and form handling.

---

## 📂 Root Directory Configurations

| File / Folder | 🛠️ Working Principle |
| :--- | :--- |
| `src/` | **Primary UI**: Contains the main React application for the community website. |
| `admin-dashboard/` | **Management UI**: Standalone Vite/React project for administrative tasks. |
| `server-java/` | **Persistence Layer**: Spring Boot application managing the PostgreSQL database and security. |
| `server-python/` | **AI & Forms**: FastAPI service utilizing Gemini AI and Google Sheets/Supabase integrations. |
| `vite.config.js` | **Bundler Config**: Orchestrates the development server, proxy rules, and PWA configurations. |
| `package.json` | **Dependency Manifest**: Defines scripts and libraries for the root frontend environment. |
| `.env.example` | **Environment Blueprint**: Provides a template for the required API base URLs and keys. |
| `vercel.json` | **Deployment Config**: Defines routing and build settings for Vercel hosting. |

---

## 🌐 Frontend Application (`src/`)

| Path | 🚀 Purpose |
| :--- | :--- |
| `App.jsx` | **Central Router**: Manages global routing, theme providers, and layout structure. |
| `pages/` | **Route Views**: Individual components for Home, Events, Team, etc. |
| `components/` | **Atom UI**: Reusable components like Navbars, Footers, and UI Cards. |
| `shared/` | **Cross-cutting**: Utilities, shared hooks, and global context providers. |
| `data/config.js` | **Static Truth**: Centralized configuration for API endpoints and theme keys. |
| `styles/` | **Visual Design**: Vanilla CSS system with variables for consistent branding. |

---

## 🔑 Admin Dashboard (`admin-dashboard/`)

| Path | 🔧 Purpose |
| :--- | :--- |
| `src/services/api.js` | **Data Fetching**: Handles all administrative API calls with integrated offline/mock fallback. |
| `src/pages/` | **Admin Views**: CRUD interfaces for Events, Team Members, and Activities. |
| `src/hooks/` | **State Management**: Custom hooks for authentication and data synchronization. |
| `src/services/auth.js` | **Security**: Manages JWT storage and administrative session lifecycle. |

---

## ☕ Java Backend (`server-java/`)

| Path | ⚙️ Purpose |
| :--- | :--- |
| `controller/` | **REST Controllers**: Defines API endpoints for content and administration. |
| `service/` | **Logic Layer**: Implements business rules and sanitization before persistence. |
| `model/` | **JPA Entities**: Maps Java objects to PostgreSQL database tables. |
| `repository/` | **Data Access**: Spring Data JPA interfaces for database operations. |
| `config/SecurityConfig.java` | **Guard**: Implements CORS policies and JWT authentication filters. |
| `application.properties` | **System Config**: Orchestrates DB connections and environment-specific settings. |

---

## 🐍 Python Backend (`server-python/`)

| Path | 🤖 Purpose |
| :--- | :--- |
| `main.py` | **App Entry**: Initializes FastAPI, CORS, and the Gemini AI model. |
| `routers/` | **API Routing**: Handles incoming form submissions and AI chat requests. |
| `services/` | **Integration Layer**: Logic for communicating with Google Sheets and Supabase. |
| `Procfile` | **Deployment**: Instructions for Railway to run the Uvicorn production server. |

---

## 🔄 Operational Principles

1.  **Stateless API**: All backend services communicate via JSON and rely on JWT for authenticated requests.
2.  **Environment Driven**: No secrets are hardcoded; use `.env` files for both development and production.
3.  **Cross-Origin Ready**: CORS is strictly managed in both backends to permit only authorized frontend domains.
4.  **Component Driven**: Frontends follow an atomic design pattern to minimize code duplication.

---

## 🗄️ Database Schema Management

NexaSphere uses a **versioned, coordinated database migration strategy** to ensure schema consistency across all backend services.

### Migration Tools

Each backend service uses a dedicated migration tool:

| Service | Tool | Location | Command |
| :--- | :--- | :--- | :--- |
| **Node.js** (`server/`) | [node-pg-migrate](https://github.com/salsita/node-pg-migrate) | `server/migrations/` | `npm run migrate:latest` |
| **Java** (`server-java/`) | [Flyway](https://flywaydb.org/) | `server-java/src/main/resources/db/migration/` | Auto-runs on boot |
| **Python** (`server-python/`) | [Alembic](https://alembic.sqlalchemy.org/) | `server-python/alembic/versions/` | `alembic upgrade head` |

### Quick Start

**Node.js**: Create and apply migrations
```bash
cd server
npm install  # Installs node-pg-migrate
npm run migrate:create -- description_of_change  # Create new migration
npm run migrate:latest  # Apply all pending migrations
npm run migrate:rollback  # Rollback one migration
```

**Java**: Migrations auto-apply on startup
```bash
cd server-java
mvn spring-boot:run  # Flyway runs automatically
```

**Python**: Create and apply migrations
```bash
cd server-python
pip install -r requirements.txt  # Installs Alembic
alembic revision -m "description of change"  # Create new migration
alembic upgrade head  # Apply all pending migrations
```

### Key Rules

✅ **Always write reversible migrations** (both `up` and `down`)
✅ **Coordinate migrations across services** before deploying
✅ **Test migrations on a fresh database** before production
✅ **Use descriptive names**: `add_category_to_events`, not `schema_fix`
✅ **Keep migrations small and focused** (one change per file)

❌ **Never modify production databases directly**
❌ **Never skip rollback functions** (down migration)
❌ **Never assume execution order** across different services

### Complete Migration Guide

For detailed examples, troubleshooting, and best practices, see **[DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md)** — this document covers:
- Creating new migrations per service
- Coordinated multi-service deployments
- Common commands and troubleshooting
- Production safety checklist

---

### 🛡️ Developed by NexaSphere Core Team
*Last Updated: May 2026*
