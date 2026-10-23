# Government Officer Directory — React + TypeScript Admin Frontend

Responsive administration frontend for the existing module-based NestJS API. Built with React 18, TypeScript, Vite, React Router, Axios and functional components/hooks only.

## Features
- Login through `POST /auth/login`; profile validation through `GET /auth/profile`.
- Protected routes and JWT Bearer headers.
- Responsive sidebar/topbar dashboard and live summary cards.
- CRUD list/create/edit/delete workflows for departments, districts, blocks, offices, designations, employees and admin users.
- Search, pagination, active-status filtering and CSV export of the current page.
- Relationship dropdowns populated from the API; employee birth date and public visibility fields.
- Role-aware navigation and read-only UI for shared master data when signed in as a department admin.
- Loading, empty, error and confirmation states.

## Requirements
- Node.js 20 or newer recommended.
- Existing NestJS backend running at `http://localhost:3000`.
- MongoDB connected and development seed data created in the backend.

## Run on Windows PowerShell
```powershell
Copy-Item .env.example .env
npm install
npm run dev
```
Open `http://localhost:5173`.

Build:
```powershell
npm run build
```

## Environment
`.env.example`:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```
Vite reads environment variables at startup; restart the dev server after changing `.env`.

## Development login
The backend seed script creates:
- `admin@directory.local` / `Admin@12345` (super administrator)
- `education.admin@directory.local` / `Admin@12345` (department administrator)

These are development-only credentials. Change them and use a secure provisioning process outside local development.

## API assumptions and notes
- Uses existing endpoints: `/auth/login`, `/auth/profile`, `/dashboard/summary`, and `/{resource}` CRUD routes.
- Resource list API is expected to return `{ data, total, page, limit, totalPages }`.
- Dashboard summary API is expected to return counts keyed by `departments`, `districts`, `blocks`, `offices`, `designations`, and `employees`.
- The API's shared resource service validates writes; the frontend is not an authorization boundary.
- The frontend follows the currently supplied backend. It does not fabricate records or report a successful save until the API responds.
- CSV export exports the current page only.

## Verification
Run `npm run build` after installing dependencies. The build and browser/API integration must be executed in the target environment with the backend running; no successful runtime integration is claimed merely from generating this source.
