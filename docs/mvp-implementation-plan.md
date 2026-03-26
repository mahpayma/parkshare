# Smart Access SaaS — MVP Implementation Plan

## 1) What this repository now includes

- Express backend scaffold with JWT authentication.
- MySQL schema for properties, users, doors, permissions, guest codes, and access logs.
- Core routes for:
  - app/QR unlock flow,
  - guest PIN unlock flow,
  - Twilio voice IVR unlock flow,
  - admin door listing, guest code creation, and access log viewing.

## 2) Backend API surface (MVP)

- `POST /api/auth/login`
- `POST /api/access/unlock`
- `POST /api/access/guest/unlock`
- `POST /api/twilio/voice`
- `POST /api/twilio/voice/select-door`
- `GET /api/admin/doors`
- `POST /api/admin/guest-codes`
- `GET /api/admin/access-logs`

## 3) React Native app guidance

### Resident app

1. Login screen (email/password).
2. Door list screen (fetch allowed doors).
3. QR scanner screen:
   - QR payload should contain a `doorId`.
   - call `POST /api/access/unlock` with method `qr`.
4. Manual unlock button:
   - call `POST /api/access/unlock` with method `app`.
5. Guest code creator:
   - admin/resident with permission can create expiring guest code.

### Admin app/portal

1. Manage doors and user permissions.
2. Generate guest codes and expiry windows.
3. Access log table with filters (date, door, status, channel).
4. Export logs CSV (next increment).

## 4) Twilio IVR notes

- Configure Voice webhook to `/api/twilio/voice`.
- Current mapping in code is static (`1 -> door 1`, `2 -> door 2`) and should be moved to DB-driven menu per property.
- Caller validation is phone-number based from `users.phone_number`.

## 5) cPanel deployment notes

1. Provision MySQL database and run `backend/db/schema.sql`.
2. Set Node.js app root to `backend`.
3. Add environment variables from `backend/.env.example`.
4. Start command: `npm start`.
5. Set reverse proxy/URL rewrite so Twilio can reach webhook endpoints over HTTPS.

## 6) Security checklist for production

- Enforce TLS everywhere.
- Use strong `JWT_SECRET` and rotate periodically.
- Move relay calls to private network and restrict egress.
- Add Twilio request signature validation middleware.
- Add per-user and per-phone anti-abuse thresholds.
- Use hashed PIN/guest code values instead of plaintext.

## 7) Sprint-by-sprint build alignment

### Sprint 1
- Done scaffold: auth, app unlock, phone flow, logs.

### Sprint 2
- Add hashed guest PINs, max-use limits, and resident-generated guest links.

### Sprint 3
- Full admin CRUD for properties, doors, and permissions.

### Sprint 4
- Accessibility improvements: multilingual voice prompts, DTMF retries, screen reader-first app UI.

### Sprint 5
- Pilot instrumentation dashboard and onboarding flows.
