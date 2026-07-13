# AetherVOX Security Manual

This document details security controls, network headers, and role access boundaries enforced across AetherVOX.

## 1. Network Security Headers

Next.js response headers enforce high-level protections:
- **Content-Security-Policy (CSP)**: `default-src 'self'` restricts scripts, fonts, and connections to verified domains (e.g. self, supabase, azure-speech-region).
- **Strict-Transport-Security (HSTS)**: `max-age=31536000` enforces HTTPS.
- **X-Frame-Options**: `DENY` protects against clickjacking attempts.
- **X-Content-Type-Options**: `nosniff` prevents MIME-type sniffing exploits.

## 2. Token & Secrets Sanitization

- **Azure Key Management**: Cognitive keys are loaded securely server-side or requested dynamically via transient regional authorization tokens.
- **Leakage Prevention**: Zero repository commits contain production API keys.

## 3. Database RLS Policies

Multi-tenancy isolation policies verify that the active user's `organization_id` matches the targeted rows' `organization_id` before returning rows:
```sql
CREATE POLICY "Tenant isolation" ON table
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
```
