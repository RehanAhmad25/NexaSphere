# NexaSphere — Full Refactor Prompt

## Project Overview

NexaSphere is the official website for the NexaSphere student community at GL Bajaj Group of Institutions, Mathura. The frontend is React 18 + Vite. The current backend is Node.js/Express. This prompt covers a full-stack refactor with a secure admin dashboard, Java + Python backend, clean code, and skeleton UI loading states.

---

## 1. Backend Migration: Node.js → Java (Spring Boot) + Python (FastAPI)

### Architecture Split

Split the backend into two services:

**Java (Spring Boot) — Primary API Server**
- Port: `8080`
- Handles: Admin authentication, events CRUD, core team CRUD, activity events CRUD
- Stack: Spring Boot 3.x, Spring Security, Spring Data JPA, PostgreSQL (or file-based H2 for local dev)
- Build tool: Maven

**Python (FastAPI) — Form Submission Service**
- Port: `8000`
- Handles: Membership form, recruitment form, core team application form → Google Sheets + Supabase
- Stack: FastAPI, httpx, gspread or google-api-python-client

The React frontend calls Java at `/api/*` and Python at `/api/forms/*`. Both can be proxied through a single Nginx reverse proxy so the frontend only talks to one base URL.

**Important — Vercel hosting note:** The current project has a `server/vercel.json` that deployed the Node.js backend as a Vercel serverless function. Java and Python long-running servers are **not supported on Vercel**. The new backend services must be hosted on Railway, Render, or Fly.io. After deploying:
1. Delete `server/vercel.json` from the repo
2. Update the `VITE_API_BASE` environment variable in the Vercel dashboard (Settings → Environment Variables) to point to the new Java server URL, e.g. `https://nexasphere-api.up.railway.app`
3. The frontend Vercel deployment at `https://nexasphere-glbajaj.vercel.app` remains unchanged — only the API base URL changes

---

### Java Spring Boot — Detailed Spec

#### Project Structure
```
server-java/
├── src/main/java/org/nexasphere/
│   ├── NexaSphereApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   └── CorsConfig.java
│   ├── controller/
│   │   ├── AdminAuthController.java
│   │   ├── EventsController.java
│   │   ├── ActivityEventsController.java
│   │   └── CoreTeamController.java
│   ├── model/
│   │   ├── Event.java
│   │   ├── ActivityEvent.java
│   │   └── CoreTeamMember.java
│   ├── repository/
│   │   ├── EventRepository.java
│   │   ├── ActivityEventRepository.java
│   │   └── CoreTeamMemberRepository.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── EventService.java
│   │   ├── ActivityEventService.java
│   │   └── CoreTeamService.java
│   └── util/
│       └── Sanitizer.java
└── src/main/resources/
    ├── application.properties
    └── data.sql  (seed file for H2 dev mode)
```

#### Admin Authentication (`AdminAuthController.java`)
- `POST /api/admin/login`
  - Accepts: `{ "email": "nexasphere@glbajajgroup.org", "password": "Admin@123" }`
  - Credentials are stored in `application.properties` as env vars `ADMIN_EMAIL` and `ADMIN_PASSWORD`
  - On success: generate a secure random 48-char hex token, store in an in-memory `ConcurrentHashMap<String, SessionInfo>` with a TTL of 8 hours, return `{ "token": "...", "email": "..." }`
  - On failure: return HTTP 401 `{ "error": "Invalid credentials" }`
  - **Important:** the login field is `email`, not `username`. The only valid credential is `nexasphere@glbajajgroup.org` / `Admin@123`

- `POST /api/admin/logout` (Bearer token required)
  - Remove the session from the map
  - Return `{ "ok": true }`

- `GET /api/admin/me` (Bearer token required)
  - Return `{ "email": "nexasphere@glbajajgroup.org" }`

#### Session Middleware (`SecurityConfig.java`)
- All `/api/admin/**` routes (except `/api/admin/login`) require a valid Bearer token in `Authorization` header
- Check the token against the in-memory sessions map; reject with 401 if missing or expired
- No Spring Security JWT library needed — use a simple `OncePerRequestFilter`

#### Events CRUD (`EventsController.java` + `EventService.java`)

**Public endpoint:**
- `GET /api/content/events` → returns all events sorted by `createdAt` descending, no auth required

**Admin endpoints (Bearer token required):**
- `GET /api/admin/events` → list all events
- `POST /api/admin/events` → create event
- `PUT /api/admin/events/{id}` → update event
- `DELETE /api/admin/events/{id}` → delete event

**Event model fields:**
```java
String id;           // slug, auto-generated from name if not provided
String name;         // max 120 chars
String shortName;    // max 60 chars
String date;         // free text, e.g. "March 14, 2025"
String description;  // max 1200 chars
String status;       // "upcoming" | "completed"
String icon;         // emoji, default "📌"
List<String> tags;   // max 12 tags, each max 40 chars
LocalDateTime createdAt;
LocalDateTime updatedAt;
```

**ID generation rule:** slug = `name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "")`. If collision on insert, append `-{timestamp}`.

**Storage:** Use JPA + PostgreSQL in production. For local dev, use H2 in-memory with a `data.sql` seed. Support both via Spring profiles (`dev`, `prod`).

#### Activity Events (`ActivityEventsController.java`)

The 8 fixed activity keys are:
`hackathon`, `codathon`, `ideathon`, `promptathon`, `workshop`, `insight-session`, `open-source-day`, `tech-debate`

**Public endpoints:**
- `GET /api/content/activity-events/{activityKey}` → list events for that activity, no auth

**Admin endpoints (Bearer token required):**
- `POST /api/admin/activity-events/{activityKey}` → create activity event
- `DELETE /api/admin/activity-events/{activityKey}/{eventId}` → delete activity event

**ActivityEvent model:**
```java
String id;          // "manual-{timestamp}"
String activityKey;
String name;        // max 120 chars
String date;        // max 80 chars
String tagline;     // max 240 chars
String description; // max 1200 chars
String status;      // "upcoming" | "completed"
LocalDateTime createdAt;
```

#### Core Team CRUD (`CoreTeamController.java`)

**Admin endpoints (Bearer token required):**
- `GET /api/admin/core-team` → list all core team members
- `POST /api/admin/core-team` → add a member
- `DELETE /api/admin/core-team/{id}` → remove a member

**CoreTeamMember model:**
```java
Long id;           // auto-increment
String name;       // max 100 chars
String role;       // e.g. "Organiser", "Core Team Member"
String year;       // e.g. "1st Year"
String branch;     // e.g. "CSE (AI & ML)"
String section;    // single letter
String email;      // validated format
String whatsapp;   // digits only, 10 chars
String linkedin;   // nullable
String instagram;  // nullable
String photoUrl;   // nullable, URL to uploaded image
LocalDateTime createdAt;
```

**Public endpoint:**
- `GET /api/content/core-team` → list all members, no auth

#### `application.properties` Template
```properties
ADMIN_EMAIL=nexasphere@glbajajgroup.org
ADMIN_PASSWORD=Admin@123
CORS_ORIGIN=http://localhost:5173,https://nexasphere-glbajaj.vercel.app
spring.datasource.url=${DB_URL:jdbc:h2:mem:nexaspheredb}
spring.datasource.driver-class-name=${DB_DRIVER:org.h2.Driver}
spring.datasource.username=${DB_USER:sa}
spring.datasource.password=${DB_PASS:}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
server.port=8080
```

---

### Python FastAPI — Detailed Spec

#### Project Structure
```
server-python/
├── main.py
├── routers/
│   └── forms.py
├── services/
│   ├── sheets.py       (Google Sheets integration)
│   └── supabase.py     (Supabase REST calls via httpx)
├── models/
│   └── forms.py        (Pydantic models)
├── requirements.txt
└── .env.example
```

#### Endpoints
- `POST /api/forms/membership`
- `POST /api/forms/recruitment`
- `POST /api/core-team/apply`

All three accept the same Pydantic model:
```python
class FormSubmission(BaseModel):
    fullName: str = Field(..., max_length=140)
    collegeEmail: EmailStr
    whatsapp: str = Field(..., pattern=r"^[\d\s\+\-\(\)]{8,20}$")
    # additional optional fields as free dict
    extra: dict = {}
```

Validation:
- `fullName` required, non-empty
- `collegeEmail` must pass `EmailStr` validation
- `whatsapp` must match phone pattern

On valid submission:
1. Try to write to Google Sheets (via `gspread` service account)
2. Try to write to Supabase `form_submissions` table (via `httpx`)
3. If both fail → return 500
4. If at least one succeeds → return `{ "ok": true }`

Tab mapping (same as old Node.js server):
```python
TAB_MAP = {
    "membership":   "MembershipResponses",
    "recruitment":  "RecruitmentResponses",
    "core_team":    "CoreTeamResponses",
}
```

#### `requirements.txt`
```
fastapi>=0.110.0
uvicorn[standard]>=0.29.0
pydantic[email]>=2.6.0
gspread>=6.0.0
google-auth>=2.29.0
httpx>=0.27.0
python-dotenv>=1.0.1
```

#### CORS
Allow the same origins as the Java server. Configure via `fastapi.middleware.cors.CORSMiddleware`.

---

## 2. Frontend Changes (React 18 + Vite — no framework change)

### 2a. Admin Dashboard Login (`src/pages/admin/AdminPage.jsx`)

**Replace the current username/password login with email/password login:**
- Input 1: `email` (type=`email`, placeholder `Admin Email`)
- Input 2: `password` (type=`password`, placeholder `Password`)
- On submit: `POST /api/admin/login` with `{ email, password }`
- The only valid credential is `nexasphere@glbajajgroup.org` / `Admin@123` — enforced server-side

**Dashboard tabs (after login):**

The dashboard must have 3 tabs rendered as a tab bar at the top:
1. **Events** — manage global events shown on the `/events` page
2. **Activity Events** — manage events under each of the 8 activities
3. **Core Team** — manage team members shown on the `/team` page

**Tab 1 — Events Manager:**
- Form fields: Event Name*, Short Name, Date*, Description*, Status (dropdown: Upcoming / Completed), Icon (emoji picker or text), Tags (comma-separated)
- Submit creates a new event via `POST /api/admin/events`
- Event list below the form with Edit and Delete buttons per row
- Edit pre-fills the form; on update calls `PUT /api/admin/events/{id}`
- Delete calls `DELETE /api/admin/events/{id}` with a `confirm()` dialog

**Tab 2 — Activity Events Manager:**
- Dropdown to select which activity: Hackathon, Codathon, Ideathon, Promptathon, Workshop, Insight Session, Open Source Day, Tech Debate
- On activity select, fetch `GET /api/content/activity-events/{activityKey}` and show existing events
- Form fields: Event Name*, Date*, Tagline, Description*, Status (dropdown)
- Submit: `POST /api/admin/activity-events/{activityKey}`
- Each listed event has a Delete button: `DELETE /api/admin/activity-events/{activityKey}/{eventId}`
- **No separate core team member auth required here** — the admin token is sufficient

**Tab 3 — Core Team Manager:**
- List all members from `GET /api/admin/core-team`
- Add form fields: Name*, Role*, Year*, Branch*, Section, Email*, WhatsApp*, LinkedIn (optional), Instagram (optional), Photo URL (optional)
- Submit: `POST /api/admin/core-team`
- Each member card has a Delete button: `DELETE /api/admin/core-team/{id}`

**Shared dashboard UI rules:**
- Sticky tab bar at top (below navbar) with active tab highlighted
- All forms: label above each input, clear error messages, disabled state while submitting
- Success messages auto-dismiss after 4 seconds
- Logout button in top-right corner of dashboard

---

### 2b. Remove All Hardcoded Dummy/Placeholder Event Data

**Remove from these files entirely — delete the mock data, keep only the structure/config:**

- `src/data/activities/hackathon.js` → delete the `upcomingEvents` array entry for "Hackathon 1.0 — Coming Soon" and the empty `conductedEvents` comments. Keep only the activity metadata (id, icon, title, tagline, color, gradient, description). The actual events will come from the API.
- `src/data/activities/codathon.js` — same treatment
- `src/data/activities/ideathon.js` — same treatment
- `src/data/activities/promptathon.js` — same treatment
- `src/data/activities/workshop.js` — same treatment
- `src/data/activities/openSourceDay.js` — same treatment
- `src/data/activities/techDebate.js` — same treatment
- `src/data/activities/insightSession.js` — **keep the real KSS #153 event data** as it is a real completed event, but move it to be seeded into the database on first startup (see Java seed data below)
- `src/data/eventsData.js` — remove the mock event entries except any that are real/confirmed. The frontend should always fetch from `/api/content/events` and only fall back to an empty array `[]` if the API is unavailable, not to fake data.

---

### 2c. Data Fetching in Activity Detail Page

`src/pages/activities/ActivityDetailPage.jsx` currently reads from the static JS files. Change it to:

1. Read the static activity metadata (title, icon, color, gradient, description, tagline) from the local JS files — these never change
2. Fetch `conductedEvents` and `upcomingEvents` dynamically from `GET /api/content/activity-events/{activityKey}` on mount
3. Merge the two sources: static metadata + dynamic events

The `activityKey` mapping (activity title → API key):
```js
const ACTIVITY_KEY_MAP = {
  'Hackathon':       'hackathon',
  'Codathon':        'codathon',
  'Ideathon':        'ideathon',
  'Promptathon':     'promptathon',
  'Workshop':        'workshop',
  'Insight Session': 'insight-session',
  'Open Source Day': 'open-source-day',
  'Tech Debate':     'tech-debate',
};
```

---

### 2d. Skeleton UI — Loading States

Add skeleton loaders for every section that fetches data. Use a reusable `<Skeleton>` component:

**`src/shared/Skeleton.jsx`**
```jsx
export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style = {} }) {
  return (
    <div
      style={{
        width, height, borderRadius,
        background: 'linear-gradient(90deg, var(--card) 25%, var(--card2) 50%, var(--card) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.4s infinite',
        ...style,
      }}
    />
  );
}
```

Add the keyframe to `src/styles/animations.css`:
```css
@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Apply skeletons in these locations:**

1. **Events page** (`src/pages/events/EventsPage.jsx`): while fetching events, show 4 skeleton timeline cards (rectangle 100% wide × 100px high, borderRadius 14px, stacked with 12px gap)

2. **Activity detail page** (`src/pages/activities/ActivityDetailPage.jsx`): while fetching activity events, show 2 skeleton event cards (80px high each)

3. **Team page** (`src/pages/team/TeamPage.jsx`): while fetching core team members, show 8 skeleton member cards in a grid (match the grid layout, 200px × 260px each)

4. **Admin dashboard** (`src/pages/admin/AdminPage.jsx`): while loading the events/team list after login, show 3 skeleton rows in the list area

---

## 3. Database Seed Data

When the Java server starts for the first time (H2 dev or fresh PostgreSQL), seed these records:

**`data.sql` — Events table:**
```sql
INSERT INTO events (id, name, short_name, date_text, description, status, icon, tags, created_at, updated_at)
VALUES (
  'kss-153',
  'KSS #153 — Knowledge Sharing Session',
  'KSS #153',
  'March 14, 2025',
  'NexaSphere''s inaugural Knowledge Sharing Session focused on the impact of AI on everyday life, industry, and careers.',
  'completed',
  '🧠',
  ARRAY['AI', 'Learning', 'Community'],
  NOW(), NOW()
);
```

**`data.sql` — Activity Events table (insight-session KSS #153):**
```sql
INSERT INTO activity_events (id, activity_key, name, date_text, tagline, description, status, created_at)
VALUES (
  'kss-153',
  'insight-session',
  'KSS #153 — Impact of AI',
  'March 2025',
  'They came. They listened. They left thinking differently.',
  'Knowledge Sharing Session #153 on the topic "Impact of AI" — NexaSphere''s first major community event at GL Bajaj Group of Institutions, Mathura.',
  'completed',
  NOW()
);
```

---

## 4. Code Quality & Cleanup Rules

Apply to ALL files in the project:

1. **Remove all comments** — delete every `//` comment and `/* */` block including JSDoc. Code should be self-explanatory through naming.
2. **No unused imports** — remove every import that is not referenced in the file.
3. **No dead code** — remove commented-out code blocks, unused variables, unused state, and unreachable branches.
4. **No `console.log` statements** — remove all debug logging from frontend files.
5. **Consistent naming** — use camelCase for JS variables/functions, PascalCase for React components, kebab-case for CSS class names.
6. **No inline styles where a CSS class already exists** — migrate repetitive inline styles to `src/styles/components.css`.
7. **Short functions** — any function over 40 lines should be split into smaller helpers.
8. **Java-specific:** no `System.out.println`, use `@Slf4j` logger. All controller methods must have `@Valid` on request bodies. Use `ResponseEntity<>` return types.
9. **Python-specific:** use Pydantic v2 models everywhere, no raw `dict` returns from endpoints, use `HTTPException` for all error responses.

---

## 5. Updated `README.md`

Replace the entire existing README with the following structure (fill in actual content):

```markdown
# NexaSphere — GL Bajaj Group of Institutions, Mathura

Official website and community platform for NexaSphere.

**Live:** https://nexasphere-glbajaj.vercel.app
**Email:** nexasphere@glbajajgroup.org

## Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Frontend      | React 18 + Vite 5                 |
| Primary API   | Java 17 + Spring Boot 3           |
| Forms Service | Python 3.11 + FastAPI             |
| Database      | PostgreSQL (prod) / H2 (dev)      |
| Hosting       | Vercel (frontend), Railway/Render (backend) |
| Fonts         | Orbitron · Rajdhani · Space Mono  |

## Project Structure

[describe the folder layout — frontend, server-java, server-python]

## Local Development

### Prerequisites
- Node.js 20+
- Java 17+
- Python 3.11+
- PostgreSQL (optional — H2 used by default in dev)

### Frontend
[npm install + npm run dev instructions]

### Java API Server
[mvn spring-boot:run instructions, env vars needed]

### Python Forms Server
[pip install + uvicorn main:app instructions, env vars needed]

## Environment Variables

### Java (application.properties / .env)
| Variable         | Description                    | Default                          |
|------------------|--------------------------------|----------------------------------|
| ADMIN_EMAIL      | Admin dashboard login email    | nexasphere@glbajajgroup.org      |
| ADMIN_PASSWORD   | Admin dashboard login password | Admin@123                        |
| DB_URL           | JDBC connection string         | jdbc:h2:mem:nexaspheredb         |
| CORS_ORIGIN      | Allowed frontend origins       | http://localhost:5173            |

### Python (.env)
| Variable                      | Description                  |
|-------------------------------|------------------------------|
| GOOGLE_SERVICE_ACCOUNT_EMAIL  | GCP service account email    |
| GOOGLE_PRIVATE_KEY            | GCP private key (escaped \n) |
| GOOGLE_SHEET_ID               | Target spreadsheet ID        |
| SUPABASE_URL                  | Supabase project URL         |
| SUPABASE_SERVICE_ROLE_KEY     | Supabase service role key    |

## Admin Dashboard

Access at `/admin`. Login with the org email and password.
Manage events, activity events per category, and core team members — all without touching code.

## Deployment

[brief notes on deploying frontend to Vercel, Java to Railway/Render, Python to Railway/Render]

## Contributing

Internal project — GL Bajaj NexaSphere core team only.
```

---

## 6. Summary of What NOT to Change

- Visual design, animations, CSS variables, color scheme — keep exactly as-is
- Navbar, Footer, ParticleBackground, CinematicOpening, StormOverlay — keep exactly as-is
- The KSS #153 event detail page content (topics, speakers, acknowledgements, stats) — keep in the frontend static data for the detail view since it is rich structured data; the API only needs to return the event summary card data
- All existing page routes — keep the same URL structure
- Team member profile photos — keep the existing image imports and file structure
- Membership, recruitment, and core team application forms on the frontend — only the backend service changes from Node.js to Python FastAPI
