<!-- .github/copilot-instructions.md for cost-construction-system-duo- -->
# Quick instructions for AI coding agents

These notes are targeted and concrete so an AI can be productive immediately in this Next.js (App Router) codebase.

- Big picture
  - Next.js App Router app/ directory. Server-first API routes live under `app/api/**/route.js`.
  - MongoDB + Mongoose for persistence; connection helper is `lib/db.js` (it caches the connection on `global.mongoose`).
  - JWT auth via `lib/auth.js`. JWT is stored in an httpOnly cookie named `auth_token`. The app is multi-tenant: JWT payload includes `companyId` and `role`.
  - API routes are wrapped with `lib/apiHandler.js` which:
    - ensures DB connection (calls `connectDB()`),
    - optionally validates request bodies using Zod validators passed in options,
    - normalizes responses to `{ ok: true, data }` or `{ ok: false, error }` using `lib/errors.js`.

- Key developer workflows / commands
  - Install: `npm install`
  - Dev server: `npm run dev` (uses Next dev with turbopack)
  - Build: `npm run build`
  - Start (prod): `npm start`
  - Seed DB (creates default company and admin): `npm run seed` (see `scripts/seed.js`).
  - Required env vars: `MONGODB_URI` and `JWT_SECRET` (see `README.md`).

- Patterns & conventions to follow
  - All API route handlers should use `apiHandler(handler, { validator })` for consistent DB connection, validation, and error handling. Example: `app/api/auth/login/route.js` exports `POST = apiHandler(handler, { validator: loginSchema })`.
  - Validators live in `lib/validators/*.js` and use Zod. When a validator is supplied, `apiHandler` attaches `request.validatedData` and overrides `request.json()` to return the parsed data.
  - Return shape: handlers should return raw data (object/array); `apiHandler` wraps it into `{ ok: true, data }`. If you need to return a custom Response, return a `Response` directly and `apiHandler` will pass it through.
  - Authentication: use `signJwt`, `verifyJwt`, and cookie helpers in `lib/auth.js`. Many routes expect `companyId` in the JWT payload — maintain this for multi-tenant checks.
  - Error handling: throw `ApiError` (from `lib/errors.js`) for controlled errors so the shape and status codes are preserved.

- File & code examples to reference
  - DB connect: `lib/db.js` (uses `global.mongoose` cache)
  - Auth helpers: `lib/auth.js` — cookie name `auth_token`, `getUserFromRequest()` supports both Next Request cookies and header parsing.
  - API wrapper: `lib/apiHandler.js` — call site pattern in `app/api/*/route.js`.
  - Login route example: `app/api/auth/login/route.js` — demonstrates `request.json()`, user lookup, `signJwt`, and setting cookie with `response.cookies.set(...)`.
  - Middleware: `middleware.js` contains route matcher and publicPaths; note current file temporarily allows all routes (dev convenience) — mind this when enabling auth enforcement.

- Integrations & cross-component notes
  - Multi-tenant identification flows via JWT -> `companyId` is used by models and controllers to filter queries.
  - Reports and export use `lib/reportService.js` and `lib/exportService.js` (look there for CSV/Excel patterns).
  - Notifications, email, and other services live under `lib/` and follow a simple module-export pattern; prefer re-using these helpers rather than adding new global side-effects.

- Quick do/don't checklist for edits
  - DO use `apiHandler` for new API routes to get DB and validation for free.
  - DO use Zod validators from `lib/validators` and attach them to `apiHandler` options.
  - DO set and clear `auth_token` cookie via NextResponse cookies APIs in route handlers (see login route).
  - DON'T assume middleware is enforcing auth (it's currently bypassed for dev). If your change requires real auth checks for testing, either enable middleware or use `lib/mockAuth.js` for mock users.
  - DO follow response shapes—clients expect `{ ok: true, data }`.

- If in doubt / where to look first
  - `README.md` (root) — project overview and run commands
  - `app/api` — canonical route patterns
  - `lib/apiHandler.js`, `lib/auth.js`, `lib/db.js`, `lib/errors.js`, `lib/validators` — core runtime primitives

If anything here is unclear or you want more examples (e.g., a newly scaffolded API route or a short test showing the validator pattern), tell me which area to expand and I will iterate.
