# Government Officer Directory

This workspace contains three applications:

- `government-directory-backend/`: NestJS + MongoDB API. Its public directory endpoints are anonymous and read-only; administrator APIs remain JWT-protected.
- `government-directory-frontend/`: React + TypeScript administrator portal. Uses authenticated administrative APIs.
- `StateITDirectoryExpo/`: Expo mobile directory. Opens directly to guest browsing and uses only the anonymous public GET endpoints.

## Run locally

Start MongoDB, then configure the backend and client separately:

1. In `government-directory-backend/`, copy `.env.example` to `.env`, set a `JWT_SECRET` with at least 32 characters and `MONGODB_URI`, then run `npm install`, `npm run build`, and `npm run start:dev`. Optionally run `npm run seed` for local demo data only; never run it against production.
2. In `StateITDirectoryExpo/`, copy `.env.example` to `.env`, set `EXPO_PUBLIC_API_BASE_URL` for the target device/emulator, then run `npm install`, `npm run typecheck`, and `npx expo start`.
3. For Android emulator, use `http://10.0.2.2:3000/api/v1`; for iOS simulator/local web, use `http://localhost:3000/api/v1`; for a physical device use the development PC's LAN IP. Use HTTPS for deployed API URLs.
4. The Expo app requires no mobile login. The admin portal still uses backend admin credentials and protected routes.

Backend Swagger is available at `http://localhost:3000/api/docs`. See [backend setup and endpoint documentation](government-directory-backend/README.md) and [Expo setup and validation](StateITDirectoryExpo/README.md).

## Publication and privacy

New employee records default to `isPublic: false`. An administrator must review and explicitly publish directory records. Public responses expose only officer name, designation, office, department, district, and active status; they exclude personal contact details, DOB, employee codes, database metadata, passwords, and tokens. Review existing `isPublic: true` records before deploying this public API. The existing authenticated CRUD routes were not made public.

## End-to-end checklist

- [ ] Anonymous directory APIs work from Swagger without a bearer token.
- [ ] Only published records appear, spanning multiple departments; response fields match the public allowlist.
- [ ] Search, department/designation/district filters, status, A–Z, location, sort, and pagination work.
- [ ] Expo opens without login; directory search, details, retry, and page loading work on device/emulator.
- [ ] Admin CRUD and dashboard/profile endpoints still reject anonymous calls.
- [ ] CORS is restricted to configured browser origins; deployed API and mobile connections use HTTPS.
- [ ] Build backend and typecheck Expo; perform an actual database/API/device integration test before release.
