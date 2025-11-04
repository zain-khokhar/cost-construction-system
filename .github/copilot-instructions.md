<!-- .github/copilot-instructions.md for cost-construction-system-duo- -->
# Quick instructions for AI coding agents

These notes are targeted and concrete so an AI can be productive immediately in this Next.js (App Router) codebase.

- Big picture
  - Next.js App Router app/ directory. Server-first API routes live under `app/api/**/route.js`.
  - MongoDB + Mongoose for persistence; connection helper is `lib/db.js` (it caches the connection on `global.mongoose`).
  - JWT auth via `lib/auth.js`. JWT is stored in an httpOnly cookie named `auth_token`. The app is multi-tenant: JWT payload includes `companyId` and `role`.
  - Role-based access control (RBAC): Admin (full access), Manager (log expenses), Viewer (read-only). Use `lib/roles.js` and `lib/roleMiddleware.js` for permissions.
  - API routes are wrapped with `lib/apiHandler.js` which:
    - ensures DB connection (calls `connectDB()`),
    - optionally validates request bodies using Zod validators passed in options,
    - normalizes responses to `{ ok: true, data }` or `{ ok: false, error }` using `lib/errors.js`.
  - Pagination: All list endpoints support `?page=1&limit=10` query params and return `{ data, pagination: { currentPage, totalPages, totalItems, itemsPerPage } }`.
  - Project Status: Projects have status field (starting_soon, ongoing, paused, completed) that admins can update.
  - Checkbox Selection: All tables include checkboxes for selecting multiple items for batch operations (export, delete, etc).

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
  - Reports and export use `lib/reportService.js` and `lib/exportService.js` (look there for CSV/Excel/PDF patterns).
    - Export service supports PDF (via jsPDF + jspdf-autotable) and CSV/Excel (via ExcelJS).
    - PDF exports: Use `exportToPDF()` with table data, columns definition, and title.
    - CSV exports: Use `exportToCSV()` with array of objects and filename.
    - Excel exports: Use existing functions like `exportPurchasesToExcel()` which return ExcelJS workbook.
  - Notifications, email, and other services live under `lib/` and follow a simple module-export pattern; prefer re-using these helpers rather than adding new global side-effects.

- Quick do/don't checklist for edits
  - DO use `apiHandler` for new API routes to get DB and validation for free.
  - DO use Zod validators from `lib/validators` and attach them to `apiHandler` options.
  - DO set and clear `auth_token` cookie via NextResponse cookies APIs in route handlers (see login route).
  - DO ensure middleware is enforcing auth - all routes require valid JWT tokens except public paths.
  - DO use `requirePermission()` from `lib/roleMiddleware.js` to enforce role-based access in API routes.
  - DO use `usePermissions()` hook in client components to conditionally render UI based on user role (hide create/add buttons from viewers).
  - DO implement pagination for all list endpoints: accept `page` and `limit` query params, return pagination metadata.
  - DO use `<Pagination />` component from `components/ui/Pagination.js` for all tables.
  - DO add checkbox selection to all tables: include select-all checkbox in header, individual checkboxes per row, track selected IDs in state.
  - DO implement project status badges and allow admins to update status via dropdown (starting_soon, ongoing, paused, completed).
  - DO provide edit/delete functionality for admin-only resources (projects, vendors, categories, etc) with proper permission checks.
  - DO add project filtering to dashboard - allow users to filter analytics by specific project.
  - DO add edit mode to forms - use editingId state to track which item is being edited, change form title and button text.
  - DO add delete confirmation modals for destructive actions - use deleteConfirm state with modal overlay.
  - DO follow response shapes—clients expect `{ ok: true, data }`.
  - DO use standardized export patterns: ExportModal component for UI, lib/exportService.js for generation logic, API routes under /api/export/* for server-side exports.
  - DO ensure all exports filter by companyId for multi-tenant data isolation.
  - DO format exported data with proper headers, styling, and readable date/number formats.
  - DON'T show create/add/edit/delete buttons to viewers—only export buttons are allowed for viewers.
  - DON'T forget to add delete confirmation modals for destructive actions.
  - DON'T allow viewers or managers to edit projects - only admins can update/delete projects.
  - `README.md` (root) — project overview and run commands
  - `app/api` — canonical route patterns
  - `lib/apiHandler.js`, `lib/auth.js`, `lib/db.js`, `lib/errors.js`, `lib/validators` — core runtime primitives
  - `lib/hooks/usePermissions.js` — client-side permission checking hook
  - `components/ui/Pagination.js` — reusable pagination component
  - `components/ui/Button.js` — supports size prop (sm, md, lg) and variant prop (primary, outline, danger)
  - `models/Project.js` — includes status field (enum)

If anything here is unclear or you want more examples (e.g., a newly scaffolded API route or a short test showing the validator pattern), tell me which area to expand and I will iterate.
