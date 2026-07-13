# AetherVOX Deployment Checklist

Follow this checklist prior to launching the Next.js App Router workspace to production hosting.

## 1. Environment Configurations
- [ ] Set `NODE_ENV=production`
- [ ] Configure `NEXT_PUBLIC_SUPABASE_URL` pointing to live Supabase project
- [ ] Configure `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Configure Azure Speech regional keys (`AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`)
- [ ] Configure Azure Translator regional keys (`AZURE_TRANSLATOR_KEY`, `AZURE_TRANSLATOR_REGION`)

## 2. Database Migrations
- [ ] Execute all migration scripts (`0001_initial_schema.sql` to `0014_activity_logs.sql`) on target PostgreSQL instance
- [ ] Verify that all Row Level Security (RLS) policies are active and verified for the tenant tables

## 3. Optimizations & Compilation
- [ ] Execute `npm run build` locally to guarantee zero type compilation or lint warnings
- [ ] Ensure that PWA asset manifests are accessible from `/manifest.json`
- [ ] Verify health status outputs via `/api/health`
