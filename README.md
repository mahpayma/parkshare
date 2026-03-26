# Parkshare Smart Access MVP

This repository now contains an MVP backend foundation for a Smart Access SaaS platform:

- Node.js + Express API
- MySQL schema
- Twilio IVR webhook flow
- JWT authentication and role-based admin endpoints
- Access logging across app, QR, PIN, and phone channels

## Quick start

```bash
cd backend
npm install
cp .env.example .env
# update env values
npm run dev
```

See `docs/mvp-implementation-plan.md` for deployment and roadmap guidance.
