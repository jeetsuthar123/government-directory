# Government Directory Backend

NestJS REST API backed by MongoDB. It exposes two separate API surfaces: public, anonymous, read-only directory endpoints, and the existing JWT-protected administrator endpoints. Public access does not weaken the existing CRUD authorization guards.

## Local setup

Requirements: Node.js 20+ (Expo app separately requires 22.13+), npm, and MongoDB 6+ locally or a development MongoDB connection string.

```powershell
Copy-Item .env.example .env
```

Edit `.env` before startup. Set a random `JWT_SECRET` of at least 32 characters; the API deliberately refuses to start without it. Set `MONGODB_URI`, `PORT` if needed, and `CORS_ORIGINS` to a comma-separated list of trusted browser origins. Do not copy real secrets into source control.

```powershell
npm install
npm run build
npm run seed
npm run start:dev
```

Swagger UI: `http://localhost:3000/api/docs`. Seed is for local development only and refuses to run when `NODE_ENV=production`; it creates demo administrator credentials. Never run the seed script against a production database. To run locally without demo records, omit `npm run seed` and provision admin accounts through a controlled process.

## API routes

All paths use `/api/v1`.

### Anonymous public directory (GET only)

- `GET /public/directory/summary`
- `GET /public/directory/departments`
- `GET /public/directory/designations`
- `GET /public/directory/districts`
- `GET /public/directory/employees`
- `GET /public/directory/employees/:id`

Officer listing accepts `page` (1-based), `limit` (1–100), `search`, `location`, `departmentId`, `districtId`, `blockId`, `officeId`, `designationId`, `status=active|inactive`, `letter=A-Z`, `sortBy=name|createdAt`, and `order=asc|desc`. Results are filtered and paginated by MongoDB; the envelope is `{ data, total, page, limit, totalPages }`. Text search covers officer name, designation, office and district; location can be constrained separately. Reference lists only include active values represented by published officer records, across all departments.

Only records explicitly marked `isPublic: true` appear. This is opt-in for new employee records (the schema default is false). The public response is an explicit allowlist: officer ID/name, designation name, office name, department name, district name, and active status. It deliberately omits phone, personal email, full date of birth, retirement data, employee codes, database metadata, passwords, and tokens. Review disclosure rules before extending this projection. Existing records with `isPublic: true` remain eligible; records without the flag are not public. Administrators must review and explicitly publish approved records.

### Authenticated administrator API

- `POST /auth/login` is the only unauthenticated admin/auth route.
- `GET /auth/profile`, `/dashboard/summary`, all resource GET routes, and all create/update/delete routes require a JWT bearer token.
- Existing resources: `/departments`, `/districts`, `/blocks`, `/offices`, `/designations`, `/employees`, `/admin-users`.

The public controller is a separate GET-only module and does not call the general CRUD service. Do not remove guards from the admin resource controllers to enable mobile access.

## Swagger verification

Open `/api/docs`, expand the **Public directory** tag, and call the public GET operations without clicking Authorize or supplying a token. Try employee listing with search and filter parameters, then follow the returned `id` to the detail endpoint. For protected operations, try a resource GET or POST without a bearer token and verify that the API rejects it (normally HTTP 401). The public endpoints return no write operations.

## Environment and deployment

- `MONGODB_URI`: production MongoDB URI, stored only in the deployment platform's secret manager.
- `JWT_SECRET`: randomly generated secret with at least 32 characters; rotate through a planned token invalidation process.
- `JWT_EXPIRES_IN`: token duration (default `1d`).
- `PORT`: platform-provided port or `3000`.
- `CORS_ORIGINS`: exact trusted browser origins, comma-separated; do not use `*`. Native Expo requests do not rely on CORS, but Expo web/admin browser origins must be listed.
- Set `NODE_ENV=production`, deploy behind HTTPS, use network-restricted MongoDB access, backups, logs/monitoring, rate limiting, and controlled administrator provisioning. Never use development seed credentials in production.

A typical deployment builds with `npm ci` and `npm run build`, then starts with `npm start`; provide the environment variables through the host's secret/configuration settings, not a checked-in `.env`. Configure the Expo app's `EXPO_PUBLIC_API_BASE_URL` to the deployed HTTPS API ending in `/api/v1` and rebuild/restart the client. Do not expose MongoDB directly to the mobile application.

## Data model

Employees reference offices and designations. Department and district information is resolved through the employee's office. The public API queries existing MongoDB collections and uses the existing models; no data migration is required for the new routes, though older records lacking `isPublic: true` will remain private until reviewed and explicitly published.

## End-to-end testing checklist

- [ ] Anonymous request to each public GET route succeeds without an `Authorization` header.
- [ ] Anonymous `GET /public/directory/employees/:id` succeeds only for an explicitly published officer; unpublished/missing IDs return not found.
- [ ] Public list and detail responses contain no `mobile`, `email`, `dateOfBirth`, `employeeCode`, `passwordHash`, token, or unrelated Mongo fields.
- [ ] Published officers from multiple departments are returned; each department/designation/district reference list only represents public officers.
- [ ] Search matches officer name, designation, office, and district; location and relationship filters narrow results in combination.
- [ ] Page/limit metadata, stable name sorting, letter, status, and maximum page size behave as documented.
- [ ] `GET /employees`, `GET /departments`, dashboard summary, profile, and create/update/delete remain rejected without JWT.
- [ ] Valid super-admin and department-admin tokens retain the existing write scope and cannot write through public endpoints (no public write route exists).
- [ ] CORS permits configured frontend origins and does not send credential cookies or wildcard origins.
- [ ] Production startup fails if `JWT_SECRET` is absent/too short; local `.env` is not included in source or release archives.
- [ ] Backend `npm run build` and Expo `npm run typecheck` pass; verify actual device/emulator networking.
