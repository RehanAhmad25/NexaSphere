# Database Migrations

NexaSphere uses a multi-stack architecture with three independent database migration systems — one per server implementation. All migration suites target a **PostgreSQL** database.

---

## Migration Systems Overview

| Stack | Tool | Directory | Config |
|-------|------|-----------|--------|
| Node.js | [node-postgres-migrate](https://github.com/brianbrunner/yowl) / `db-migrate` | `server/migrations/` | `server/.postgres_migrations_config.json` |
| Java (Spring Boot) | [Flyway](https://flywaydb.org/) | `server-java/src/main/resources/db/migration/` | `server-java/pom.xml` |
| Python (FastAPI) | [Alembic](https://alembic.sqlalchemy.org/) | `server-python/alembic/versions/` | `server-python/alembic.ini` |

---

## Node.js Migrations (`server/`)

Migration files live in `server/migrations/` and are managed via `npm run migrate:latest` / `npm run migrate:rollback`.

### Files

| File | Description |
|------|-------------|
| `1705945200000_create-initial-schema.js` | Creates the initial database schema — users, events, activities, and core team tables. |
| `1705945201000_seed-recommendation-data.js` | Seeds initial recommendation/sample data for development and testing. |
| `1705945202000_canonicalize-portfolio-usernames.js` | Normalises existing portfolio usernames to a canonical lowercase format. |

### Running Migrations

```bash
# Apply all pending migrations
npm --prefix server run migrate:latest

# Roll back the most recent migration
npm --prefix server run migrate:rollback

# Check current migration version
npm --prefix server run migrate -- --version
```

### Environment Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgres://user:pass@localhost:5432/nexasphere` | Full PostgreSQL connection string |

---

## Java Migrations (`server-java/`)

Migration files follow the Flyway naming convention (`V{version}__{description}.sql`) and live in `server-java/src/main/resources/db/migration/`. Flyway runs automatically on Spring Boot startup.

### Files

| File | Description |
|------|-------------|
| `V1__Create_Initial_Schema.sql` | Creates the initial database schema for the Spring Boot application. |
| `V2__Seed_Recommendation_Data.sql` | Populates seed data used for the recommendation engine. |
| `V3__Extend_Event_Metadata.sql` | Adds additional metadata columns to the events table (location, capacity, gradient colors). |

### Running Migrations

Flyway migrations execute automatically when the Spring Boot application starts. To validate without starting the app:

```bash
cd server-java
mvn clean validate
```

### Configuration

Flyway is declared as a Maven dependency in `pom.xml`. The datasource is configured via environment variables or `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/nexasphere
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.flyway.enabled=true
```

---

## Python Migrations (`server-python/`)

Migration files are managed by Alembic and live in `server-python/alembic/versions/`. Alembic is configured via `server-python/alembic.ini`.

### Files

| File | Description |
|------|-------------|
| `001_initial_schema.py` | Creates the initial schema for the Python/FastAPI server. |
| `002_seed_recommendation_data.py` | Seeds initial data for recommendations and activities. |

### Running Migrations

```bash
cd server-python

# Apply all pending migrations
alembic upgrade head

# Roll back one migration
alembic downgrade -1

# Show current revision
alembic current

# Generate SQL for pending migrations (dry-run)
alembic upgrade head --sql
```

### Environment Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/nexasphere` | Full PostgreSQL connection string |

---

## CI Validation

The **Database Migrations CI** workflow (`.github/workflows/db-migrations-ci.yml`) runs automatically on `push` to `main` or on pull requests that modify migration files. It performs the following jobs:

| Job | Description |
|-----|-------------|
| `Validate Node.js Migrations` | Spins up a PostgreSQL service, installs dependencies, runs migrations, and tests rollback. |
| `Validate Java Migrations` | Validates Flyway SQL files and checks the Maven build. |
| `Validate Python Migrations` | Validates Alembic migration Python files and tests the DB connection. |
| `Check Migration Documentation` | Verifies this file (`DATABASE_MIGRATIONS.md`) exists and all migration directories are present. |
| `Migration Validation Summary` | Aggregates all job results and fails the workflow if any job failed. |

---

## Best Practices

1. **Never edit an existing migration file** after it has been merged to `main`. Create a new migration instead.
2. **Name migrations descriptively** — use timestamps (Node.js), version numbers with double underscores (Flyway), or sequential numbers (Alembic).
3. **Always write a rollback** for Node.js migrations (`exports.down`).
4. **Test locally** before opening a PR — run your migration against a fresh DB to catch issues early.
5. **Update this document** when adding new migration files so the CI documentation check passes.
