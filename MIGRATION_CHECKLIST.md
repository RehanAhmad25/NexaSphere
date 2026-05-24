# ✅ Migration Deployment Checklist

Use this checklist before deploying any database schema changes to production.

## Pre-Migration Development Checklist

- [ ] **Branch created** from `main` with descriptive name
  - Example: `feature/add-user-profiles` or `bugfix/fix-events-schema`

- [ ] **Migrations created** in all affected services
  - [ ] Node.js migration in `server/migrations/`
  - [ ] Java migration in `server-java/src/main/resources/db/migration/`
  - [ ] Python migration in `server-python/alembic/versions/`

- [ ] **Migration files are valid**
  - [ ] Each migration has both `up()` and `down()` (or `upgrade()` and `downgrade()`)
  - [ ] Descriptive names: `add_email_to_users`, not `schema_fix`
  - [ ] Comments explain the purpose
  - [ ] SQL syntax verified

- [ ] **Backward compatibility checked**
  - [ ] Changes work with current application code
  - [ ] Or: Code changes are coordinated and will deploy together
  - [ ] No breaking API changes

- [ ] **Local testing completed**
  - [ ] Migrations run successfully on local PostgreSQL
  - [ ] Application boots without schema errors
  - [ ] Existing data still works
  - [ ] Rollback works: `npm run migrate:rollback`, `alembic downgrade -1`, etc.

- [ ] **Data migration included** (if needed)
  - [ ] Seed data migration created if adding reference data
  - [ ] Data transformation migration created if modifying existing data
  - [ ] Rollback removes inserted data

## PR Review Checklist

Reviewers should verify:

- [ ] **Migrations are reversible**
  - [ ] `down()` function removes all changes from `up()`
  - [ ] No `DROP TABLE` without creating table in `down()`

- [ ] **Files follow naming conventions**
  - [ ] Node.js: `{timestamp}_{description}.js`
  - [ ] Java: `V{version}__{description}.sql`
  - [ ] Python: `{revision_id}_{description}.py`

- [ ] **No direct schema changes** in application code
  - [ ] ORM models reference migrations, not the reverse
  - [ ] No hardcoded DDL in application logic

- [ ] **Documentation updated**
  - [ ] DATABASE_MIGRATIONS.md updated if new patterns introduced
  - [ ] INSTRUCTIONS.md has latest migration commands
  - [ ] Inline comments explain complex migrations

- [ ] **CI/CD passes**
  - [ ] GitHub Actions: Database Migrations CI workflow passes
  - [ ] All three services (Node, Java, Python) validate successfully

## Pre-Deployment Staging Checklist

Before deploying to staging/production:

- [ ] **Backup taken**
  - [ ] Full database backup exists
  - [ ] Schema backup exists (`pg_dump --schema-only`)
  - [ ] Backup verified and tested

- [ ] **Migration status known**
  - [ ] Run: `./scripts/migrate-all.sh status`
  - [ ] All services show expected state
  - [ ] No pending migrations from previous deployments

- [ ] **Deployment order planned**
  - [ ] Migrations will apply first, code deploys second
  - [ ] Or: Single atomic deployment if services tightly coupled
  - [ ] Rollback plan documented

- [ ] **Monitoring ready**
  - [ ] Application logs reviewed
  - [ ] Error monitoring configured (Sentry, etc.)
  - [ ] Database metrics monitored
  - [ ] Team on standby

- [ ] **Communication sent**
  - [ ] Stakeholders notified of maintenance window
  - [ ] Runbook shared with on-call team
  - [ ] Rollback procedures documented

## Deployment Checklist

During deployment:

- [ ] **Pre-deployment test**
  - [ ] Test migrations on staging database
  - [ ] Verify application boots
  - [ ] Run smoke tests
  - [ ] Check inter-service communication

- [ ] **Execute deployment** in this order:
  1. [ ] Apply migrations
  2. [ ] Deploy application code
  3. [ ] Run post-deployment tests
  4. [ ] Monitor logs

- [ ] **Validate success**
  - [ ] Run: `./scripts/migrate-all.sh status`
  - [ ] Compare with pre-deployment state
  - [ ] All services at same schema version
  - [ ] No errors in logs

- [ ] **Test functionality**
  - [ ] Public website loads
  - [ ] Admin dashboard works
  - [ ] API endpoints respond
  - [ ] Database queries complete

## Post-Deployment Checklist

After deployment completes:

- [ ] **Monitor for errors** (30 minutes)
  - [ ] Check application logs for schema errors
  - [ ] Monitor error tracking (Sentry)
  - [ ] Review database query performance
  - [ ] Check for timeout issues

- [ ] **Database health check**
  ```bash
  psql $DATABASE_URL -c "
    SELECT table_name, row_count 
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  "
  ```

- [ ] **Document in runbook**
  - [ ] Migration timestamp
  - [ ] What changed
  - [ ] Who deployed
  - [ ] Any issues encountered
  - [ ] Rollback actions taken (if applicable)

- [ ] **Cleanup old migrations** (if applicable)
  - [ ] Remove `.sql` dump files
  - [ ] Archive older baseline migrations
  - [ ] Update documentation

- [ ] **Notify stakeholders**
  - [ ] Deployment completed successfully
  - [ ] No issues observed
  - [ ] System returned to normal

## Rollback Checklist

If deployment fails or issues arise:

- [ ] **Stop current operations**
  - [ ] Take note of error messages
  - [ ] Capture logs
  - [ ] Take screenshot of error state

- [ ] **Identify issue** (use MIGRATION_TROUBLESHOOTING.md)
  - [ ] Is it a syntax error?
  - [ ] Is it a data mismatch?
  - [ ] Is it an application code issue?

- [ ] **Decide rollback strategy**
  - [ ] Rollback migrations only
  - [ ] Rollback code and migrations
  - [ ] Restore from backup

- [ ] **Execute rollback**
  ```bash
  # Node.js
  npm run migrate:rollback

  # Java
  mvn flyway:undo  # Manual undo via compensating migration

  # Python
  alembic downgrade -1
  ```

- [ ] **Verify rollback**
  - [ ] Run: `./scripts/migrate-all.sh status`
  - [ ] Confirm schema matches pre-deployment
  - [ ] Redeploy previous working code

- [ ] **Post-mortem**
  - [ ] Document what went wrong
  - [ ] Update runbooks
  - [ ] Train team on prevention
  - [ ] Schedule follow-up

## Emergency Procedures

### Database is locked / won't respond

1. Check active queries:
   ```sql
   SELECT pid, usename, query FROM pg_stat_activity WHERE state != 'idle';
   ```

2. Terminate blocking queries:
   ```sql
   SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE query LIKE '%migration%';
   ```

3. Restart application and retry

### Migrations applied but app won't boot

1. Check application logs for schema errors
2. Verify migration actually completed: `./scripts/migrate-all.sh status`
3. Check that all services have matching schema versions
4. Rollback if mismatch detected

### Data loss detected

1. **STOP DEPLOYMENT IMMEDIATELY**
2. Restore from backup
3. Document what happened
4. Fix migration and retry

---

## Quick Reference Commands

```bash
# Check migration status
./scripts/migrate-all.sh status

# Validate all migrations
./scripts/migrate-all.sh validate

# Apply migrations to specific service
./scripts/migrate-all.sh up --node
./scripts/migrate-all.sh up --java
./scripts/migrate-all.sh up --python

# Rollback last migration
./scripts/migrate-all.sh down --python

# View full help
./scripts/migrate-all.sh help
```

---

## Related Documentation

- [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md) — Complete migration guide
- [MIGRATION_TROUBLESHOOTING.md](MIGRATION_TROUBLESHOOTING.md) — Troubleshooting guide
- [INSTRUCTIONS.md](INSTRUCTIONS.md) — Quick reference in main docs

---

**Last Updated**: May 2026
**For Questions**: See DATABASE_MIGRATIONS.md or contact NexaSphere Core Team
