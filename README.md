 HEAD
# Construction Cost Management System

A clean, professional **multi-tenant** construction cost management system using Next.js (App Router) with JavaScript. Each company manages its own isolated data including projects, users, budgets, and expenses.

## Features

- **Multi-Tenant Architecture**: Complete data isolation per company
- **JWT Authentication**: Secure cookie-based authentication with role-based access control
- **Company Management**: Create or join companies during registration
- **User Roles**: 
  - Admin: Create/manage projects and budgets
  - Manager: Log expenses and manage data
  - Viewer: Read-only access
- **Project Management**: Track multiple construction projects with budgets
- **Expense Tracking**: Record purchases with phases (Grey/Finishing), categories, items, and vendors
- **Analytics Dashboard**: Visualize spending by phase, items, vendors, and budget vs actual
- **AI Chatbot**: Natural language queries for instant data access (NEW!)
- **Reports**: Filter and export purchase data to CSV
- **Clean UI**: Minimal design with Tailwind CSS, mobile-friendly

## Tech Stack

- **Framework**: Next.js 15 (App Router, JavaScript)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with httpOnly cookies
- **Validation**: Zod
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ installed
- MongoDB instance running (local or cloud)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd cost-construction-managment
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.local` and update the values:

```env
MONGODB_URI=mongodb://localhost:27017/ccms
JWT_SECRET=your_strong_secret_key_at_least_32_characters_long
NODE_ENV=development
```

**Important**: Replace `JWT_SECRET` with a strong, random string for production.

### 4. Seed the admin user and default company

```bash
npm run seed
```

This creates:
- **Default Company**: Demo Construction Company
- **Admin User**:
  - Email: `admin@admin.com`
  - Password: `Admin@123`
  - Linked to the default company

**Note**: The seed script will display the Company ID. Save this for inviting other users to join your company.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── analytics/            # Analytics endpoints
│   │   ├── companies/            # Company management
│   │   ├── projects/             # Project CRUD
│   │   ├── phases/               # Phase CRUD
│   │   ├── categories/           # Category CRUD
│   │   ├── items/                # Item CRUD
│   │   ├── vendors/              # Vendor CRUD
│   │   └── purchases/            # Purchase CRUD
│   ├── projects/                 # Projects pages
│   ├── vendors/                  # Vendors page
│   ├── reports/                  # Reports page
│   ├── login/                    # Login page
│   ├── signup/                   # Signup page (NEW)
│   ├── layout.js                 # Root layout
│   ├── page.js                   # Dashboard
│   ├── error.js                  # Error boundary
│   └── global-error.js           # Global error boundary
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   ├── layout/                   # Layout components (Navbar, Sidebar)
│   └── charts/                   # Chart components
├── lib/                          # Utility libraries
│   ├── db.js                     # MongoDB connection
│   ├── auth.js                   # JWT utilities
│   ├── apiHandler.js             # API wrapper with error handling
│   ├── errors.js                 # Error classes
│   ├── roles.js                  # Role helpers
│   └── validators/               # Zod schemas
├── models/                       # Mongoose models
│   ├── User.js
│   ├── Project.js
│   ├── Phase.js
│   ├── Category.js
│   ├── Item.js
│   ├── Vendor.js
│   └── Purchase.js
├── scripts/                      # Utility scripts
│   └── seed.js                   # Database seeding
└── middleware.js                 # Route protection middleware
```

## Data Model

### Users
- name, email (unique), password (hashed), role (admin/manager/viewer)

### Projects
- name, client, location, startDate, endDate, totalBudget, createdBy

### Phases
- projectId (ref), name (Grey/Finishing), description

### Categories
- phaseId (ref), name, description

### Items
- categoryId (ref), name, unit, ratePerUnit, defaultVendor (ref)

### Vendors
- name, contact, address, rating (0-5)

### Purchases
- projectId, phaseId, categoryId, itemId, vendorId (refs)
- quantity, pricePerUnit, totalCost (auto-calculated)
- purchaseDate, invoiceUrl, createdBy

## User Roles and Permissions

| Action | Admin | Manager | Viewer |
|--------|-------|---------|--------|
| View dashboard & reports | ✅ | ✅ | ✅ |
| Create/edit projects | ✅ | ❌ | ❌ |
| Manage phases/categories/items | ✅ | ✅ | ❌ |
| Record purchases | ✅ | ✅ | ❌ |
| Manage vendors | ✅ | ✅ | ❌ |
| Export reports | ✅ | ✅ | ✅ |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Resources (CRUD)
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project (Admin only)
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

Similar patterns for: `/api/phases`, `/api/categories`, `/api/items`, `/api/vendors`, `/api/purchases`

### Analytics
- `GET /api/analytics/phase-summary` - Costs by phase (Grey vs Finishing)
- `GET /api/analytics/item-breakdown` - Top items by cost
- `GET /api/analytics/vendor-spend` - Spending by vendor
- `GET /api/analytics/budget-vs-actual` - Budget comparison per project

## Usage Guide

### 1. Login
Navigate to `/login` and use the seeded admin credentials.

### 2. Create a Project
1. Go to **Projects**
2. Click **New Project**
3. Fill in project details (name, client, budget, dates)
4. Click **Create Project**

### 3. Set up Project Structure
1. Click **View** on a project
2. Add **Phases** (Grey, Finishing)
3. Add **Categories** per phase (e.g., Foundation, Walls)
4. Add **Items** per category (e.g., Cement, Paint)

### 4. Create Vendors
1. Go to **Vendors**
2. Click **New Vendor**
3. Enter vendor details
4. View total spend per vendor

### 5. Record Purchases
1. Go to **Projects** → Select project → **Purchases** tab
2. Click **Add Purchase**
3. Select phase, category, item, vendor
4. Enter quantity and price
5. Click **Create Purchase**

### 6. View Analytics
The **Dashboard** shows:
- Budget vs Actual per project
- Phase cost breakdown
- Top 5 items by cost
- Vendor spend distribution

### 7. Generate Reports
1. Go to **Reports**
2. Filter by project and date range
3. Click **Export CSV** to download

## Development

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Lint code
```bash
npm run lint
```

## Error Handling

- **API Errors**: Centralized error handling with `lib/apiHandler.js`
- **Validation**: Zod schemas validate all request payloads
- **Error Boundaries**: `error.js` and `global-error.js` catch UI errors
- **Consistent Responses**: All API routes return `{ ok: true, data }` or `{ ok: false, error }`

## Security

- JWT tokens stored in httpOnly, secure cookies
- Password hashing with bcryptjs
- Role-based access control enforced in middleware and API routes
- Request validation with Zod
- MongoDB injection prevention via Mongoose

## Troubleshooting

### MongoDB connection failed
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env.local`
- Verify network access if using cloud MongoDB

### JWT_SECRET error
- Ensure `JWT_SECRET` is set in `.env.local`
- Use a strong, random string (32+ characters)

### Login redirect loop
- Clear browser cookies
- Check middleware configuration
- Verify JWT token is valid

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check for syntax errors in JavaScript files
- Verify all imports use correct paths

## AI Chatbot Usage

The AI Chatbot is available on all authenticated pages (look for the blue button in bottom-right corner).

**Example Queries:**
- "What's the total spent on Phase 1?"
- "Show me cement purchases this month"
- "Compare Project A to Project B"
- "Show me vendor spending"
- "Give me project summary"

For detailed documentation, see:
- [AI Chatbot Documentation](./AI_CHATBOT_DOCS.md)
- [Quick Reference Guide](./AI_CHATBOT_QUICK_REFERENCE.md)

## License

MIT


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# cost-construction-system
>>>>>>> 2bfff042225f7df8a9c28c86957d61b6c052d00a
