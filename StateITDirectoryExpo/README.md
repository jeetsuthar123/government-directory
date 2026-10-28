# State IT Directory — Expo SDK 57

Public, read-only React Native directory for Android, iOS, and web. The app opens directly to the directory dashboard; there is no mobile sign-in screen, token storage, or authenticated API request. The notebook layout, navigation tabs, officer detail view, search/filter controls, retry states, and Android back navigation are retained.

## Requirements and local setup

- Node.js 22.13 or later and npm.
- Expo Go compatible with SDK 57, or an EAS/native build.
- The NestJS backend and MongoDB running for live data.

```powershell
Copy-Item .env.example .env
npm install
npm run typecheck
npx expo-doctor
npx expo start --clear
```

Configure `EXPO_PUBLIC_API_BASE_URL` in `.env` before starting Expo:

- Android emulator: `http://10.0.2.2:3000/api/v1`
- iOS simulator or local web: `http://localhost:3000/api/v1`
- Physical device: `http://YOUR_PC_LAN_IP:3000/api/v1`
- Deployed API: use its HTTPS URL ending in `/api/v1`.

After changing Expo environment variables, restart Expo with cache clearing. A phone and development PC must be on a reachable network; configure the host firewall and listen address accordingly. Native requests do not require browser CORS, while Expo web does.

## Public API contract

The app calls only anonymous GET endpoints; it does not send an `Authorization` header:

- `GET /public/directory/summary`
- `GET /public/directory/departments`
- `GET /public/directory/designations`
- `GET /public/directory/districts`
- `GET /public/directory/employees?page=1&limit=25&sortBy=name&order=asc`
- `GET /public/directory/employees/:id`

Directory search and filters are sent to the server. Supported query parameters include `search`, `location`, `departmentId`, `districtId`, `blockId`, `officeId`, `designationId`, `status=active|inactive`, `letter=A-Z`, `page`, `limit` (maximum 100), `sortBy=name|createdAt`, and `order=asc|desc`. Responses use `{ data, total, page, limit, totalPages }` for paginated officers. Department, designation, and district choices are restricted to active references represented in published records.

Public officer responses are intentionally allowlisted to name, designation, office, department, district, and active status. They do not include phone, email, full date of birth, retirement data, employee codes, database metadata, passwords, or tokens. Detail screens only display contact actions if the API later supplies approved public contact values. Birthday and retirement views remain in the notebook navigation, but these private/unsupported fields are not returned by the current public API.

## Source structure

- `App.tsx`: Expo entry point.
- `src/navigation/AppNavigator.tsx`: guest-first app state and navigation.
- `src/services/api.ts`: public API URL, request handling, and response normalization.
- `src/screens/`: dashboard, directory, details, and date/status views.
- `src/components/NotebookLayout.tsx`: notebook-style interface and tabs.
- `src/types/`: data and screen contracts.

## Validation checklist

- [ ] App opens at Dashboard with no login prompt or credentials.
- [ ] Directory and details load anonymously from a device/emulator.
- [ ] Search by officer name, designation, and office/location returns server-filtered results.
- [ ] Department, designation, district, status, and A–Z filters work together.
- [ ] “Load more” appends subsequent server pages; retry works after offline/error state.
- [ ] Department choices and officers cover multiple departments.
- [ ] No bearer header is sent and no phone/email/DOB/employee code appears unless separately approved by a future API contract.
- [ ] Notebook tabs, home/back controls, details return behavior, and Android hardware back work.
- [ ] `npm run typecheck` and `npx expo-doctor` pass.
