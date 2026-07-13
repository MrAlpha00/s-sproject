# AetherVOX Operations Manual

This document outlines operations telemetry monitoring, logging standards, and health endpoints checks for the AetherVOX platform.

## 1. Application Health Telemetry

AetherVOX exposes three endpoints for checking status metrics:
- **`/api/live`**: Fast liveness check returning `200 OK` instantly to indicate container is online.
- **`/api/ready`**: Verifies active connections to the Supabase database.
- **`/api/health`**: Gathers detailed memory stats and connection latency results across:
  - Database connection SELECT latency.
  - Azure Speech API connection.
  - Azure Translator API connection.

## 2. Logger Context Specifications

Logs are structured as JSON lines emitted to `stdout` in production, allowing automatic ingestion by scrapers (Sentry, OpenTelemetry, Azure Monitor):

```json
{
  "timestamp": "2026-07-14T00:00:00.000Z",
  "level": "INFO",
  "message": "Live session started successfully",
  "correlationId": "corr_abc123",
  "organizationId": "org-aether-main",
  "userId": "usr-owner-01",
  "sessionId": "sess-live-09",
  "eventId": "evt-launch-2026",
  "metadata": {}
}
```

## 3. Telemetry Troubleshooting

- **Degraded Health**: If `/api/health` returns status `degraded`, check settings inside dashboard or ping Azure regional gateways.
- **Out of Memory warning**: Keep heap memory under 512MB by monitoring memory leak logs in container outputs.
