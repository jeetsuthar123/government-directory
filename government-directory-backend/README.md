# Government Directory Backend (schema-aligned)

This NestJS backend implements the collections and relationships in the supplied architecture diagram.

## Data model
- `departments`: name, code, shortName, description, isActive, timestamps
- `districts`: name, code, state, isActive, timestamps
- `blocks`: districtId reference, name, code, isActive, timestamps
- `offices`: departmentId, districtId, optional blockId, name, code, address, phone, email, latitude, longitude, isActive, timestamps
- `designations`: name, code, level, isActive, timestamps
- `employees`: officeId, designationId, name, employeeCode, mobile, email, dateOfBirth, isPublic, isActive, timestamps
- `adminUsers`: email, passwordHash, role, departmentIds, isActive

Mongoose schemas provide ObjectId references, validation, timestamps and indexes. The Employee schema intentionally does not duplicate department/district/block fields: those are derived through Employee -> Office.

## Run locally (PowerShell)
```powershell
Copy-Item .env.example .env
npm install
npm run seed
npm run start:dev
```
Swagger: http://localhost:3000/api/docs

Use MongoDB locally or set `MONGODB_URI` to a development Atlas URI in `.env`.
Do not seed production databases. Seed credentials:
- `admin@directory.local` / `Admin@12345`
- `education.admin@directory.local` / `Admin@12345`

## API
Prefix: `/api/v1`
- `POST /auth/login`, `GET /auth/profile`
- CRUD resources: `/departments`, `/districts`, `/blocks`, `/offices`, `/designations`, `/employees`, `/admin-users`
- `GET /dashboard/summary`
All routes other than login require a JWT Bearer token.

List endpoints accept `page`, `limit`, `search`, `sortBy`, `order` and relation filters such as `departmentId`, `districtId`, `blockId`, `officeId`, `designationId`, `isActive`, and `isPublic`. Employee filters for department, district, and block are resolved through the employee's office relationship. Office and employee list responses populate the related labels used by the admin UI.

## Architecture rules
- A department has many offices.
- A district has many blocks.
- An office belongs to one department and one district, and may optionally belong to one block.
- An office has many employees.
- Each employee belongs to one office and one designation.
- Department administrators are scoped to their assigned department for office and employee data.
- Referenced records cannot be deleted; deactivate them instead.

## Security/production caveat
This is a development starter, not a production certification. Before production deployment, add dedicated resource DTOs and automated unit/e2e tests, audit logging, rate limiting, a robust policy for access to shared district/block/designation records, and review environment secrets and administrator provisioning. The frontend should not be treated as an authorization boundary.


## Type definitions and request validation
- `src/schemas/*.schema.ts`: one Mongoose schema per collection, including field types, required fields, limits, defaults, references and indexes.
- `src/dto/*.dto.ts`: request DTOs using `class-validator` decorators for each resource.
- `src/dto/resource.dto.ts`: selects the DTO for each CRUD resource and validates POST/PATCH bodies, rejects unknown properties, and returns structured validation errors.
- `src/schemas.ts`: schema registry used by the CRUD service.


## NestJS module structure
Each resource has its own feature module and controller:
- `departments/`, `districts/`, `blocks/`, `offices/`, `designations/`, `employees/`, `admin-users/`
- `auth/` contains login DTO, service, controller and module.
- `dashboard/` contains its own controller and module.
- `common/` contains the shared CRUD service, JWT guard and validation helper.
- `schemas/` contains one Mongoose schema file per collection.
- Each resource folder has a `dto/` folder for class-validator request DTOs.


## Verification notes (2026-10-23)
Feature modules register their dedicated controllers for CRUD routes. Run `npm install`, `npm run build`, `npm run seed`, and `npm run start:dev` locally to verify against your MongoDB instance. Full runtime/API integration was not verified in this generation environment.
