/* Database Migration Configuration for node-pg-migrate */

export default {
  // Database connection
  databaseUrl: process.env.DATABASE_URL,

  // Migration directory
  migrationsTable: 'pgmigrations',
  migrationsSchema: 'public',
  dir: 'migrations',

  // File naming pattern: v1_20260522_create_initial_schema.sql
  filenameFormat: 'utc',

  // Enable automatic transpilation for TypeScript if needed
  checkOrder: true,

  // Exit on error
  exitOnError: true,

  // Safe mode - transaction per file
  singleTransaction: false,
};
