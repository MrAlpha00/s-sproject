# AetherVOX Production Readiness Checklist

This checklist focuses on security hardening, rate limiting, and observability audits for production-level delivery.

## 1. Rate Limiting Protection
- [ ] Authentication page protected by token-bucket rate limiter
- [ ] Translation pings rates constrained to prevent Azure overrun billing
- [ ] Analytics APIs requests limited to Owner / Admin profiles

## 2. Global Error Monitoring
- [ ] Global `ErrorBoundary` wrapper active on root component layout
- [ ] Exceptions parsed via structured code formats (`QUOTA_EXCEEDED`, `RATE_LIMITED`)
- [ ] Stack traces stripped out in production outputs to prevent leakage

## 3. Observability
- [ ] Log outputs directed to stdout as single-line JSON records
- [ ] Sentry / Azure Monitor telemetry integration active
- [ ] Container ready probes mapped to `/api/ready`
