# AetherVOX Backup & Recovery Manual

This manual details pg_dump schedules, configuration export tasks, and recovery guidelines.

## 1. Database pg_dump Schedule
- Automated backups run daily at 02:00 UTC using `pg_dump` targeting the Supabase postgres instance.
- Retention is configured for 30 daily snapshots stored in encrypted AWS S3 buckets.

## 2. Configuration & Profiles Backup
Operators can export their configuration states using `BackupService`:
- Voice Profiles configuration mapping metadata is serialized into JSON payloads.
- Audio setup presets are included in the export.

## 3. Disaster Recovery Steps
In case of database connection failures or data corruption:
1. Initialize a clean postgres container.
2. Restore database structure using target migrations:
   ```bash
   psql -h host -U user -d db -f supabase/migrations/0001_initial_schema.sql
   ```
3. Load the latest backup snapshot.
4. Verify application readiness via `/api/health`.
