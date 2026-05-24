# 🗄️ Database Migrations Guide

## Overview

NexaSphere adopts a **versioned, coordinated database migration strategy** to ensure schema consistency, enable safe rollbacks, and maintain audit trails across all backend services.

### Why Migrations Matter
- **Schema Versioning**: Every database change is tracked and reversible
- **Multi-Service Coordination**: Prevents schema drift between Node.js, Java, and Python backends
- **Production Safety**: Deployments can be rolled back if issues arise
- **CI/CD Integration**: Automated schema validation in test environments
- **Audit Trail**: Complete history of all database changes with timestamps

---

## 🛠️ Migration Tools by Service

### Node.js Backend (`server/`)
**Tool**: [node-pg-migrate](https://github.com/salsita/node-pg-migrate)
- **Location**: `server/migrations/`
- **Config**: `server/.postgres_migrations_config.js`
- **Naming**: `{timestamp}_{description}.js`
- **Format**: JavaScript (supports async/await)

### Java Backend (`server-java/`)
**Tool**: [Flyway](https://flywaydb.org/)
- **Location**: `server-java/src/main/resources/db/migration/`
- **Config**: Embedded in `pom.xml` (Spring Boot auto-config)
- **Naming**: `V{version}__{description}.sql`
- **Format**: SQL (strictly SQL-based)

### Python Backend (`server-python/`)
**Tool**: [Alembic](https://alembic.sqlalchemy.org/)
- **Location**: `server-python/alembic/versions/`
- **Config**: `server-python/alembic.ini` and `server-python/alembic/env.py`
- **Naming**: `{revision_id}_{description}.py`
- **Format**: Python (with Alembic DSL and raw SQL support)

---

## 📋 Creating New Migrations

### Scenario 1: Adding a New Table

#### Node.js (Knex)
```bash
cd server
npm run migrate:create -- add_new_table_name
# Edit migrations/{timestamp}_add_new_table_name.js
npm run migrate:latest
```

Example migration file:
```javascript
exports.up = (pgm) => {
  pgm.createTable('my_table', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('my_table', 'name');
};

exports.down = (pgm) => {
  pgm.dropTable('my_table');
};
```

#### Java (Flyway)
Create a new SQL file: `server-java/src/main/resources/db/migration/V{N+1}__{description}.sql`

Example:
```sql
-- V3__Add_New_Table.sql
CREATE TABLE my_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_my_table_name ON my_table (name);
```

Flyway runs automatically when Spring Boot starts.

#### Python (Alembic)
```bash
cd server-python
# Generate empty migration
alembic revision -m "add new table"

# Edit alembic/versions/{revision_id}_{description}.py
# Then upgrade
alembic upgrade head
```

Example migration:
```python
def upgrade() -> None:
    op.create_table(
        'my_table',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.func.gen_random_uuid()),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_my_table_name', 'my_table', ['name'])

def downgrade() -> None:
    op.drop_index('idx_my_table_name', table_name='my_table')
    op.drop_table('my_table')
```

---

### Scenario 2: Modifying a Column

#### Node.js (Knex)
```javascript
exports.up = (pgm) => {
  pgm.alterColumn('events', 'status', {
    type: 'text',
    default: 'completed',
  });
};

exports.down = (pgm) => {
  pgm.alterColumn('events', 'status', {
    type: 'text',
    default: 'upcoming',
  });
};
```

#### Java (Flyway)
```sql
-- V4__Modify_Events_Status.sql
ALTER TABLE events
  ALTER COLUMN status SET DEFAULT 'completed';
```

#### Python (Alembic)
```python
def upgrade() -> None:
    op.alter_column('events', 'status', new_column_name='status', server_default='completed')

def downgrade() -> None:
    op.alter_column('events', 'status', new_column_name='status', server_default='upcoming')
```

---

## 🚀 Common Commands

### Node.js (node-pg-migrate)
```bash
# List pending migrations
npm run migrate

# Apply all pending migrations
npm run migrate:latest

# Rollback one migration
npm run migrate:rollback

# Reset database (dangerous!)
npm run migrate:reset

# Create new migration
npm run migrate:create -- description_of_change
```

### Java (Flyway via Spring Boot)
```bash
cd server-java

# Flyway runs automatically on startup
mvn spring-boot:run

# Validate schema
mvn flyway:validate

# Info about migrations
mvn flyway:info

# Repair schema (use carefully!)
mvn flyway:repair
```

### Python (Alembic)
```bash
cd server-python

# Create new migration
alembic revision -m "description of change"

# Apply all pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show current revision
alembic current

# Show revision history
alembic history

# Validate that pending migrations don't have syntax errors
alembic upgrade head --sql
```

---

## 🔄 Coordinated Multi-Service Deployments

### Deployment Workflow

1. **Create Migrations** (before merging PR):
   - Create migration in each affected service
   - Test locally against PostgreSQL
   - Update version numbers in documentation

2. **Code Review**:
   - Review migration logic for correctness
   - Ensure reversibility (no `DROP` without `CREATE` in `down()`)
   - Verify backward compatibility if services are updated separately

3. **Testing**:
   - Run migrations on fresh test database
   - Run app boot tests to verify schema is compatible with models
   - Integration tests pass

4. **Deployment Order** (if possible):
   - Deploy migrations first (additive changes only)
   - Deploy application code that uses new schema
   - Monitor for errors; rollback if needed

5. **Rollback** (if needed):
   - Each service can independently rollback its migration
   - Ensure coordinated rollback if services depend on each other

### Example: Adding New Column to Events Table

**Step 1**: Create migration in Node.js
```javascript
// server/migrations/{ts}_add_category_to_events.js
exports.up = (pgm) => {
  pgm.addColumn('events', {
    category: { type: 'text', default: 'general' },
  });
};
exports.down = (pgm) => {
  pgm.dropColumn('events', 'category');
};
```

**Step 2**: Create migration in Java
```sql
-- server-java/src/main/resources/db/migration/V3__Add_Category_To_Events.sql
ALTER TABLE events
  ADD COLUMN category text DEFAULT 'general';
```

**Step 3**: Create migration in Python
```python
# server-python/alembic/versions/003_add_category_to_events.py
def upgrade() -> None:
    op.add_column('events', sa.Column('category', sa.Text(), server_default='general'))

def downgrade() -> None:
    op.drop_column('events', 'category')
```

**Step 4**: Update application code in all services to use `category`

**Step 5**: Deploy migrations first, then code

---

## ✅ Migration Best Practices

### Do's ✓
- ✅ Make migrations small and focused (one change per file)
- ✅ Always write both `up()` and `down()` (rollback support)
- ✅ Use transactions for safety (auto-enabled in most tools)
- ✅ Test migrations on a fresh database
- ✅ Use descriptive naming: `add_user_phone_column`, not `schema_fix`
- ✅ Document complex migrations with comments
- ✅ Version migrations semantically: `V1_*`, `V2_*`, etc.
- ✅ Add constraints and indices for performance
- ✅ Coordinate across services before deploying

### Don'ts ✗
- ❌ Don't skip writing rollback functions
- ❌ Don't use comments in Java/Flyway migrations before column definitions
- ❌ Don't make assumptions about execution order across services
- ❌ Don't forget to update `.env.example` if new env vars are needed
- ❌ Don't deploy breaking schema changes without coordination
- ❌ Don't directly edit production databases without logging migrations
- ❌ Don't merge PRs without migrations for schema changes

---

## 🔍 Troubleshooting

### Migration Fails to Apply

**Node.js**:
```bash
# Check current state
npm run migrate -- --dryRun

# Manually inspect pgmigrations table
psql $DATABASE_URL -c "SELECT * FROM pgmigrations ORDER BY run_on DESC;"
```

**Java**:
```bash
# Check Flyway schema_version table
mvn flyway:info

# Repair broken state (use cautiously)
mvn flyway:repair
```

**Python**:
```bash
# Check Alembic history
alembic history

# View current state
alembic current

# See pending migrations as SQL
alembic upgrade head --sql
```

### Schema Mismatch Between Services

**Diagnosis**:
1. Check each service's migration history:
   - Node.js: `SELECT * FROM pgmigrations;`
   - Java: `SELECT * FROM flyway_schema_history;`
   - Python: `SELECT * FROM alembic_version;`

2. Identify which service is ahead

3. Apply pending migrations to other services

---

## 🔒 Production Safety Checklist

Before deploying migrations to production:

- [ ] Migrations tested on staging database
- [ ] Rollback procedure documented and tested
- [ ] All services' migrations coordinated
- [ ] Backup of production database taken
- [ ] Deployment window scheduled
- [ ] Monitoring alerts configured for migration errors
- [ ] Team notified of planned changes
- [ ] Runbook updated for new schema changes

---

## 📚 References

- **Node.js**: [node-pg-migrate docs](https://github.com/salsita/node-pg-migrate)
- **Java**: [Flyway docs](https://flywaydb.org/documentation)
- **Python**: [Alembic docs](https://alembic.sqlalchemy.org/)
- **PostgreSQL**: [Official docs](https://www.postgresql.org/docs/)

---

## 🤝 Contributing

When adding new migrations:

1. Follow the tool-specific syntax and conventions
2. Write descriptive migration names
3. Test locally against PostgreSQL
4. Include comments explaining complex logic
5. Update this guide if adding new patterns
6. Link to GitHub issue/PR in migration comments

---

**Last Updated**: May 2026
**Maintained by**: NexaSphere Core Team
