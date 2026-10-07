# Nyvra deployment readiness notes

## Authentication
Nyvra uses Clerk for authentication. The browser receives only the Clerk publishable key. The FastAPI service verifies Clerk session tokens and uses the verified Clerk user ID as the ownership key for journal and habit data.

Required frontend variable:
- `REACT_APP_CLERK_PUBLISHABLE_KEY`

Required backend variables:
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_KEY`
- `CLERK_AUTHORIZED_PARTIES`

## Database ownership migration
Run `backend/migrations/001_add_user_ownership.sql` before enabling the authenticated API against an existing database.

The migration intentionally does not guess ownership for legacy rows. Existing rows without a `user_id` are not exposed by the authenticated API. Before production, review whether the database contains any legacy data and either intentionally migrate it to the correct Clerk user or remove it.

Once no legacy rows remain, enforce `NOT NULL` on both `user_id` columns as documented in the migration.

## Frontend
Set:
- `REACT_APP_API_URL=https://<your-api-domain>`
- `REACT_APP_CLERK_PUBLISHABLE_KEY=<your Clerk publishable key>`

The frontend no longer stores journal entries in localStorage. The authenticated database is the source of truth for journal history.

## Backend
Set:
- `DATABASE_URL=<Neon connection string>`
- `CORS_ORIGINS=https://<your-frontend-domain>`
- `CLERK_SECRET_KEY=<server-only Clerk secret>`
- `CLERK_JWT_KEY=<server-only Clerk public verification key>`
- `CLERK_AUTHORIZED_PARTIES=https://<your-frontend-domain>`

Never commit `.env` files or any server-side Clerk secret.
