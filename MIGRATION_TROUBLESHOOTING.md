# 🔧 Database Migrations Troubleshooting Guide

Quick reference for diagnosing and fixing migration issues in NexaSphere.

## Common Issues & Solutions

### Node.js Backend (node-pg-migrate)

#### Issue 1: `Error: connect ECONNREFUSED`
**Cause**: Database connection failed
```bash
# Solution: Ensure PostgreSQL is running and DATABASE_URL is correct
echo $DATABASE_URL
# Expected format: postgres://user:pass@localhost:5432/nexasphere

# Test connection
psql $DATABASE_URL -c "SELECT NOW();"
```

#### Issue 2: `Migration table 'pgmigrations' does not exist`
**Cause**: First migration attempt on new database
```bash
# Solution: Create the migrations table
cd server
npm run migrate:latest
```

#### Issue 3: `Migration {timestamp}_{name}.js failed`
**Cause**: Syntax error in migration file
```bash
# Solution: Check migration syntax
cat migrations/{timestamp}_{name}.js
# Verify exports.up and exports.down functions exist

# Rollback and fix
npm run migrate:rollback
# Edit the migration file
npm run migrate:latest
```

#### Issue 4: Cannot rollback - `No migrations to rollback`
```bash
# Check migration history
psql $DATABASE_URL -c "SELECT * FROM pgmigrations ORDER BY run_on DESC;"

# If stuck, manually remove from pgmigrations table (carefully!)
psql $DATABASE_URL -c "DELETE FROM pgmigrations WHERE name = '{timestamp}_{name}';"
```

---

### Java Backend (Flyway)

#### Issue 1: Application fails to start with Flyway error
**Cause**: Invalid SQL migration file or schema conflict
```bash
# Check migration files
ls -la server-java/src/main/resources/db/migration/

# Verify SQL syntax
sqlparse --format human V1__Create_Initial_Schema.sql

# Check Flyway schema version
mvn flyway:info -q
```

#### Issue 2: `Checksum validation failed`
**Cause**: Migration file was edited after being applied
```bash
# Solution: Repair schema (use cautiously!)
mvn flyway:repair -q

# Or manually reset:
mvn flyway:clean -q  # ⚠️ DELETES ALL DATA
mvn spring-boot:run  # Re-run migrations
```

#### Issue 3: Flyway not picking up migration files
**Cause**: File naming or location incorrect
```bash
# Verify location
ls -la server-java/src/main/resources/db/migration/

# Verify naming: V{version}__{description}.sql
# ✓ V1__Create_Initial_Schema.sql
# ✗ V1_Create_Initial_Schema.sql (missing __)
# ✗ create_initial_schema.sql (missing V prefix)

# Verify in pom.xml
grep -A 5 "flyway-maven-plugin" server-java/pom.xml
```

#### Issue 4: Manual database rollback needed
```bash
# Flyway doesn't support undo out-of-the-box
# Option 1: Restore from backup
# Option 2: Run compensating migration (V3__Undo_previous_changes.sql)
# Option 3: Use flyway:clean (destructive!)
mvn flyway:clean -q
```

---

### Python Backend (Alembic)

#### Issue 1: `FAILED: Can't locate revision identified by`
**Cause**: Migration history mismatch or corrupted alembic_version table
```bash
# Check current state
cd server-python
alembic current

# Check history
alembic history

# Reset to specific revision
alembic downgrade base  # Go to beginning
alembic upgrade head    # Reapply all
```

#### Issue 2: `sqlalchemy.exc.ArgumentError: Could not determine database dialect`
**Cause**: DATABASE_URL not set or invalid
```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://user:pass@localhost:5432/nexasphere"

# Test connection
python -c "from sqlalchemy import create_engine; print(create_engine('$DATABASE_URL').connect())"

# Retry migration
alembic upgrade head
```

#### Issue 3: Migration Python file has syntax errors
```bash
# Validate Python syntax
python -m py_compile alembic/versions/001_initial_schema.py

# Fix any errors and retry
alembic upgrade head
```

#### Issue 4: Circular dependency between migrations
```bash
# Check revision dependencies
alembic history --verbose

# Identify circular references in migration files
grep "down_revision" alembic/versions/*.py

# Manually fix the down_revision chain
# Each migration should point to exactly one predecessor
```

#### Issue 5: Rollback fails - `No such revision`
```bash
# Check available revisions
alembic branches

# Downgrade to valid revision
alembic downgrade 001_initial_schema

# Or downgrade step by step
alembic downgrade -1
```

---

## Multi-Service Coordination Issues

### Issue 1: Services have different schema versions
**Cause**: Uncoordinated migrations across services
```bash
# Check each service's current version
echo "Node.js:"
psql $DATABASE_URL -c "SELECT name FROM pgmigrations ORDER BY run_on DESC LIMIT 5;"

echo "Java:"
mvn flyway:info -q

echo "Python:"
cd server-python && alembic current
```

**Solution**: Coordinate migration deployment
1. Apply pending migrations to all services in sequence
2. Test inter-service API calls
3. Monitor logs for schema mismatch errors

### Issue 2: Foreign key constraint violation after migration
**Cause**: Dependent data deleted or referenced table not migrated
```bash
# Check table structure
psql $DATABASE_URL -c "\d table_name"

# Verify foreign keys exist
psql $DATABASE_URL -c "SELECT * FROM information_schema.referential_constraints;"

# Manually disable/enable FK checks if needed (carefully!)
psql $DATABASE_URL -c "ALTER TABLE table_name DISABLE TRIGGER ALL;"
# ... fix data ...
psql $DATABASE_URL -c "ALTER TABLE table_name ENABLE TRIGGER ALL;"
```

---

## Database State Recovery

### Complete Reset (Development Only!)

```bash
# Node.js
cd server
npm run migrate:reset  # Drops all tables

# Java
cd ../server-java
mvn flyway:clean -q   # Drops all tables
mvn spring-boot:run   # Re-runs migrations

# Python
cd ../server-python
alembic downgrade base  # Downgrade to before any migration
alembic upgrade head    # Re-run all migrations
```

### Backup Current Schema

```bash
# Dump current schema
pg_dump $DATABASE_URL --schema-only > schema_backup_$(date +%Y%m%d_%H%M%S).sql

# Dump data only (for debugging)
pg_dump $DATABASE_URL --data-only > data_backup_$(date +%Y%m%d_%H%M%S).sql

# Full backup
pg_dump $DATABASE_URL > full_backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## Debugging Tools

### PostgreSQL Introspection

```bash
# List all tables
psql $DATABASE_URL -c "\dt"

# Show table structure
psql $DATABASE_URL -c "\d table_name"

# List indices
psql $DATABASE_URL -c "\di"

# Show constraints
psql $DATABASE_URL -c "\d+ table_name"

# Find differences between expected and actual schema
psql $DATABASE_URL -c "
  SELECT table_name, column_name, data_type, is_nullable 
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
  ORDER BY table_name, ordinal_position;
"
```

### Migration History

```bash
# Node.js: Check pgmigrations table
psql $DATABASE_URL -c "SELECT * FROM pgmigrations ORDER BY run_on DESC;"

# Java: Check flyway_schema_history
psql $DATABASE_URL -c "SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC;"

# Python: Check alembic_version
psql $DATABASE_URL -c "SELECT version_num FROM alembic_version;"
```

---

## Prevention Tips

✅ **Always test migrations locally first**
```bash
# Use a test database
export DATABASE_URL="postgresql://localhost/nexasphere_test"
```

✅ **Run migrations on fresh database in CI**
```bash
# GitHub Actions automatically tests migrations
# Monitor: Actions > Database Migrations CI
```

✅ **Write reversible migrations**
```javascript
// Every up() needs a corresponding down()
exports.up = (pgm) => { /* add stuff */ };
exports.down = (pgm) => { /* remove stuff */ };
```

✅ **Document schema changes**
```sql
-- V3__Add_New_Column.sql
-- Purpose: Track feature X usage
-- Author: team@nexasphere.dev
-- Rollback: ALTER TABLE events DROP COLUMN feature_x_enabled;

ALTER TABLE events ADD COLUMN feature_x_enabled boolean DEFAULT false;
```

✅ **Coordinate across services**
- Check DATABASE_MIGRATIONS.md before deploying
- Run migration status before and after deployment
- Monitor application logs for schema errors

---

## Getting Help

1. **Check DATABASE_MIGRATIONS.md** for detailed tool documentation
2. **Review INSTRUCTIONS.md** for migration quick reference
3. **Run migration status checks**:
   ```bash
   ./scripts/migrate-all.sh status
   ./scripts/migrate-all.sh validate
   ```
4. **Review recent migration files** in git history
5. **Contact NexaSphere Core Team** with issue details and logs

---

## Emergency Contacts

- **Database Admin**: [Maintainer Email]
- **DevOps**: [DevOps Team]
- **On-Call**: [Rotation Schedule]

---

**Last Updated**: May 2026
**Version**: 1.0.0
