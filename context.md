# Generic HRIS Frontend Context

## Project Overview

A modern React frontend application built with Vite, TypeScript, and TanStack Router. The frontend integrates with a Laravel backend API for enterprise resource planning (ERP) management, including employee management, payroll, attendance tracking, leave management, and reporting.

**UI Theme**: The project uses the [Square UI](https://square.lndev.me/) theme by lndev-ui, which provides beautifully crafted layouts built with shadcn/ui components. While the project uses shadcn/ui component dependencies, the visual theme and styling are from Square UI, not the default shadcn/ui theme.

## Related Applications

### ESS (Employee Self-Service)

The system includes a separate **ESS (Employee Self-Service)** frontend application that provides employees with self-service capabilities for managing their attendance, leaves, payroll, and documents.

**Key Characteristics:**

- **Separate Application**: Runs on port 3000 (this frontend runs on port 3090)
- **React Application**: Built with Vite, TypeScript, and TanStack Router
- **No Auth Logic**: ESS does NOT implement its own authentication logic - it relies entirely on `rz_auth`
- **Permission-Based Access**: All routes and features are protected by RBAC permissions
- **Session-Based Auth**: Uses cookie-based sessions (not Bearer tokens)
- **Employee-Focused**: Designed for employees to manage their own data

**ESS Modules:**

- Dashboard (`/ess`) - Overview and quick actions
- Attendance (`/ess/attendance`) - View attendance records
- Leave Calendar (`/ess/leaves/calendar`) - View approved/pending leaves and holidays
- Apply Leave (`/ess/leaves/apply`) - Submit leave requests
- Payroll (`/ess/payroll`) - View payslips and payroll information
- Documents (`/ess/documents`) - Access documents and files

**Authentication Flow:**

1. User submits login form (`/login`)
2. ESS calls `POST /auth/login` (proxied to `rz_auth` via Vite proxy)
3. `rz_auth` validates credentials and issues session cookie
4. ESS fetches user data via `GET /api/user`
5. User data (with roles/permissions) is stored in Zustand stores
6. User is redirected to `/ess` dashboard

**ESS Access Rules:**

- User may access ESS if ANY of: has role "user", "manager", or "admin"
- ESS is NOT accessible to unauthenticated users
- ESS is NOT accessible to users without HRIS-related permissions

**Minimum Required Permissions:**

- `attendance.view`
- `leaves.view`, `leaves.create`
- `holidays.view`
- `payroll.view`
- `employees.view`

**Work Schedule Rules:**

- Working days: Monday – Saturday
- Rest day: Sunday (always disabled in calendar)

For detailed ESS implementation details, see [`ess/context.md`](../ess/context.md).

## Project Structure

```
frontend/
├── src/
│   ├── routes/                # TanStack Router file-based routes
│   │   ├── __root.tsx          # Root route with providers
│   │   ├── index.tsx           # Home/redirect route
│   │   ├── login.tsx           # Login page
│   │   ├── register.tsx        # Registration page
│   │   ├── dashboard.tsx       # Dashboard route
│   │   ├── dashboard.$module.tsx # Module dashboard route
│   │   ├── 404.tsx             # 404 error page
│   │   ├── hris.tsx            # HRIS layout route
│   │   ├── hris/               # HRIS module routes
│   │   │   ├── dashboard.tsx   # HRIS dashboard
│   │   │   ├── employees.tsx   # Employees list
│   │   │   ├── employees.$id.tsx # Employee detail
│   │   │   ├── attendance.tsx  # Attendance tracking
│   │   │   ├── leaves.tsx      # Leave management
│   │   │   ├── holidays.tsx    # Holiday management
│   │   │   ├── overtime-logs.tsx # Overtime logs
│   │   │   ├── timesheets.tsx  # Timesheet management
│   │   │   ├── time-management.tsx # Time management (unified tabbed interface)
│   │   │   ├── reimbursements.tsx # Reimbursement management
│   │   │   ├── reports.tsx     # Reports
│   │   │   └── payroll/        # Payroll routes
│   │   │       ├── index.tsx   # Payroll overview
│   │   │       ├── periods.tsx # Payroll periods
│   │   │       ├── runs.$id.tsx # Payroll run detail
│   │   │       ├── entries.$id.tsx # Payroll entry detail
│   │   │       ├── deductions.tsx # Deductions
│   │   │       └── salary-components.tsx # Salary components
│   │   ├── settings.tsx        # Settings route
│   │   └── user-management/    # User management routes
│   │       ├── users.tsx       # Users list
│   │       ├── roles.tsx       # Roles management
│   │       └── account.tsx     # Account settings
│   ├── components/             # React components (161+ files)
│   │   ├── ui/                 # shadcn/ui components with Square UI theme (25 components)
│   │   │   ├── alert-dialog.tsx, avatar.tsx, badge.tsx, breadcrumb.tsx
│   │   │   ├── button.tsx, card.tsx, chart.tsx, checkbox.tsx
│   │   │   ├── collapsible.tsx, combobox.tsx, dialog.tsx, dropdown-menu.tsx
│   │   │   ├── field.tsx, input-group.tsx, input.tsx, label.tsx
│   │   │   ├── select.tsx, separator.tsx, sheet.tsx, sidebar.tsx
│   │   │   ├── skeleton.tsx, table.tsx, tabs.tsx, textarea.tsx, tooltip.tsx
│   │   ├── layout/             # Layout components (8 files)
│   │   │   ├── dashboard-layout.tsx, footer.tsx, full-page-header.tsx
│   │   │   ├── global-header.tsx, header.tsx, navigation.tsx
│   │   │   ├── page-header.tsx, sidebar.tsx
│   │   ├── hris/               # HRIS module components (87+ files)
│   │   │   ├── dashboard/      # Dashboard components (9 files)
│   │   │   ├── employees/      # Employee management components (13 files)
│   │   │   ├── attendance/     # Attendance components (4 files)
│   │   │   ├── leaves/         # Leave management components (10 files)
│   │   │   ├── holidays/       # Holiday management components (7 files)
│   │   │   ├── overtime/       # Overtime components (3 files)
│   │   │   ├── timesheets/     # Timesheet components (3 files)
│   │   │   ├── time-management/ # Time management tab components (5 files)
│   │   │   ├── reimbursements/ # Reimbursement components (4 files)
│   │   │   ├── payroll/        # Payroll components (23+ files)
│   │   │   ├── reports/        # Report components (6 files)
│   │   │   └── shared/         # Shared HRIS components (page-header.tsx)
│   │   ├── settings/           # Settings components (12 files)
│   │   ├── roles/              # Role management components (4 files)
│   │   ├── user-management/    # User management components (5 files)
│   │   ├── account/            # Account management components (3 files)
│   │   ├── notifications/      # Notification components (2 files)
│   │   ├── payroll/            # Payroll shared components (4 files)
│   │   ├── procurement/       # Procurement components (3 files: currency-formatter, status-badge)
│   │   ├── user/               # User components (1 file: user-card)
│   │   ├── shared/             # Shared components (7 files: data-table, modal, stats-card, stats-grid, company-switcher, etc.)
│   │   ├── theme-provider.tsx  # Theme provider component
│   │   └── theme-toggle.tsx    # Theme toggle component
│   ├── services/               # API service layer (see src/services/*.service.ts)
│   ├── stores/                 # Zustand state management (see src/stores/*.ts)
│   ├── types/                  # TypeScript type definitions (see src/types/*.ts)
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-debounce.ts     # Debounce hook
│   │   ├── use-local-storage.ts # Local storage hook
│   │   ├── use-media-query.ts  # Media query hook
│   │   ├── use-mobile.ts       # Mobile detection hook
│   │   └── use-permissions.ts  # Permissions hook
│   ├── lib/                    # Utilities and configurations
│   │   ├── api/                # API client
│   │   │   ├── client.ts       # Base API client with Axios
│   │   │   ├── endpoints.ts    # API endpoints configuration
│   │   │   └── utils.ts        # API utility functions
│   │   ├── auth/               # Authentication utilities
│   │   │   └── route-guards.ts # Route guard utilities
│   │   ├── utils/              # Utility functions
│   │   │   ├── cn.ts           # Class name utility
│   │   │   ├── format.ts       # Formatting utilities
│   │   │   ├── validation.ts   # Validation utilities
│   │   │   ├── status-badge.tsx # Status badge component
│   │   │   └── index.ts        # Utility exports
│   │   ├── auth-guard.ts       # Authentication guard
│   │   ├── constants.ts        # Application constants
│   │   ├── fonts.ts            # Font configuration
│   │   ├── permissions.ts      # Permission utilities
│   │   └── permissions-from-roles.ts # Role-based permissions
│   ├── providers/              # React context providers
│   │   ├── auth-provider.tsx   # Authentication provider
│   │   ├── query-provider.tsx  # TanStack Query provider
│   │   └── theme-provider.tsx  # Theme provider
│   ├── features/               # Feature-based modules
│   │   ├── auth/               # Authentication feature
│   │   └── users/              # User feature
│   ├── config/                 # Configuration files
│   │   ├── env.ts              # Environment variable validation
│   │   ├── navigation.ts       # Navigation configuration
│   │   └── site.ts             # Site configuration
│   ├── globals.css             # Global styles
│   ├── main.tsx                # Application entry point
│   └── vite-env.d.ts           # Vite type definitions
├── public/                     # Static assets
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.mjs          # PostCSS configuration
├── eslint.config.mjs           # ESLint configuration
└── components.json             # shadcn/ui configuration
```

## UI Theme

The project uses the **Square UI** theme from [square.lndev.me](https://square.lndev.me/), a collection of beautifully crafted open-source layouts built with shadcn/ui. While the project uses shadcn/ui component dependencies for functionality, the visual theme, styling, and design system are from Square UI.

**Key Points:**

- Uses shadcn/ui component dependencies (functionality)
- Uses Square UI theme for visual styling and design
- Base UI primitives for component foundations
- Custom theme configuration in `components.json` with `base-vega` style

## Technology Stack

### Frontend Stack

| Technology          | Version | Purpose                          |
| ------------------- | ------- | -------------------------------- |
| React               | 18.3.1  | UI Framework                     |
| Vite                | 5.4.2   | Build Tool                       |
| TypeScript          | 5.x     | Type Safety                      |
| TanStack Router     | 1.87.0  | File-based Routing               |
| TanStack Table      | 8.21.3  | Data Tables                      |
| TanStack Query      | 5.62.0  | Data Fetching & Caching          |
| Tailwind CSS        | 4.0.0   | Styling Framework                |
| shadcn/ui           | Latest  | Component Library (dependencies) |
| Square UI           | -       | UI Theme (square.lndev.me)       |
| Base UI             | 1.0.0   | UI Primitives                    |
| Zustand             | 5.0.9   | State Management                 |
| Zod                 | 3.24.1  | Schema Validation                |
| React Hook Form     | 7.54.0  | Form Management                  |
| @hookform/resolvers | 3.9.1   | Form Validation Integration      |
| @mui/icons-material | 7.3.7   | Icon Library                     |
| @mui/material       | 7.3.7   | UI Components (for icons)        |
| @hugeicons/react    | 1.1.1   | Additional icon library          |
| Recharts            | 2.15.4  | Charts & Graphs                  |
| Sonner              | 2.0.7   | Toast Notifications              |
| FullCalendar        | 6.1.20  | Calendar Component               |
| date-fns            | 4.1.0   | Date Utilities                   |
| next-themes         | 0.4.6   | Theme Management                 |
| react-helmet-async  | 2.0.5   | Document Head Management         |

## API Client Configuration

### Base API Client

The frontend uses an Axios-based API client located in `src/lib/api/client.ts`.

**Key Features:**

- Session-based authentication with cookies (withCredentials: true)
- CSRF token management (XSRF-TOKEN cookie)
- Automatic session refresh on 401 errors
- Request/response interceptors
- Error handling with custom `ApiError` class
- Support for JSON and Blob responses
- FormData support for file uploads
- Query parameter handling
- Environment-based configuration (local/staging)

**Configuration:**

- Base URL:
  - Development: Empty string (uses Vite proxy)
  - Production: Configured via `VITE_API_URL` or `VITE_API_HOST` environment variable
  - Staging: Update with your staging/production API URL (when `VITE_ENVIRONMENT=staging`)
- Authentication: Session-based with cookies (not Bearer tokens)
- CSRF Protection: Automatic CSRF token fetching and attachment
- Content-Type: Automatically set to `application/json` for JSON requests
- Credentials: `withCredentials: true` for cookie handling

**Vite Proxy Configuration:**

The development server proxies API requests:

- `/api/*` -> `http://localhost:8000/*` (ERP Business API; `/api` path is preserved by the proxy)
- `/auth/*` -> `http://localhost:8001/*` (Auth Service - Session Owner)

Development server runs on port 3090 (configurable via `vite.config.ts`).

This ensures cookies are properly forwarded between frontend and backend.

**Usage Example:**

```typescript
import { api } from "@/services/api";

// GET request
const employees = await api.get<Employee[]>("/api/employees");

// POST request
const newEmployee = await api.post<Employee>("/api/employees", employeeData);

// PUT request
const updated = await api.put<Employee>(`/api/employees/${id}`, updateData);

// DELETE request
await api.delete(`/api/employees/${id}`);

// With query parameters
const filtered = await api.get<Employee[]>("/api/employees", {
  params: { department: "IT", status: "active" },
});
```

**Session Refresh:**

The API client automatically handles session refresh:

- On 401 errors, attempts to refresh the session via `/auth/refresh`
- If refresh succeeds, retries the original request
- If refresh fails, logs out the user and redirects to login
- Prevents infinite refresh loops with retry tracking

## Authentication System

### Frontend Authentication

**Zustand Store** - Centralized auth state management (`src/stores/auth-store.ts`)

- User state: `user: User | null`
- Authentication status: `isAuthenticated: boolean`
- Loading state: `isLoading: boolean`
- Actions: `setUser`, `logout`, `setLoading`
- Persistence: Uses Zustand persist middleware with localStorage

**Auth Provider** - React context provider (`src/providers/auth-provider.tsx`)

- Wraps application with authentication context
- Handles route protection
- Manages authentication state

**Session Management:**

- Session-based authentication using cookies
- CSRF token stored in cookies (XSRF-TOKEN)
- Session automatically refreshed on 401 errors
- Session cleared on logout
- Automatic redirect to login on authentication failure

**Route Guards:**

- Protected routes require authentication via `requireAuth()` helper
- Unauthenticated users redirected to login
- Implemented via `beforeLoad` hook in route definitions
- Route guard utility: `src/lib/auth/route-guards.ts`

### Authentication Architecture

**Shared Authentication Service:**

Both this frontend application and ESS share the same authentication backend (`rz_auth`):

- **Authoritative Endpoints:**
  - `GET /auth/csrf-cookie` -> Proxied to `rz_auth` via Vite proxy
  - `POST /auth/login` -> Proxied to `rz_auth` via Vite proxy
  - `POST /auth/logout` -> Proxied to `rz_auth` via Vite proxy
  - `POST /auth/refresh` -> Proxied to `rz_auth` via Vite proxy
  - `GET /api/user` -> Proxied to ERP backend; protected by `rz_auth` middleware

- **Session Sharing:**
  - Both applications use session-based authentication with cookies
  - Sessions are shared across applications via `withCredentials: true`
  - CSRF tokens are managed automatically by the API client

- **RBAC Integration:**
  - Both applications use the same RBAC system from `rz_auth`
  - User roles and permissions are fetched from `rz_auth`
  - Frontend RBAC checks are UX only - backend still enforces permissions

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

- **Frontend (HRIS Admin)**: http://localhost:3090 (React with Vite hot reload)
- **ESS (Employee Self-Service)**: http://localhost:3000 (separate application, see `ess/` directory)
- **API**: Configured via `VITE_API_URL` environment variable or uses Vite proxy in development
- **Hot Reloading**: Vite HMR (Hot Module Replacement)
- **File Watching**: Automatic reload on file changes

**Note**: ESS is a separate frontend application that runs on port 3000. To run ESS, navigate to the `ess/` directory and run `npm run dev`.

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Environment Variables

### Required Variables

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:8000/api
VITE_AUTH_URL=http://localhost:8001
VITE_APP_URL=http://localhost:3090
VITE_ENVIRONMENT=local
```

**Validation:**

- Environment variables validated with Zod schema
- Type-safe access via `src/config/env.ts`
- Runtime validation on startup

## Current Features

### Implemented

- **Frontend Routing**: TanStack Router with file-based routing (30 routes including HRIS module)
- **UI Components**: Square UI theme with shadcn/ui component dependencies and Base UI primitives (25 UI components, 161+ total component files). Uses Material Icons (`@mui/icons-material`) for all iconography.
- **API Client**: Axios-based client with session management, CSRF protection, and automatic session refresh
- **State Management**: Zustand stores with persistence (7 stores: auth, dashboard, ui, rbac, userManagement, company-store, index)
- **Data Fetching**: TanStack Query for server state
- **TypeScript**: Full type safety with strict configuration
- **Form Management**: React Hook Form with Zod validation
- **Theme Support**: Dark mode with next-themes
- **Authentication**: Auth store and provider
- **Employee Management**: Full CRUD operations with face registration
- **Payroll Management**: Payroll periods, runs, entries, deductions, salary components
- **Attendance Tracking**: Attendance management with face recognition
- **Leave Management**: Leave requests and approvals
- **Holiday Management**: Holiday calendar and management with import functionality
- **Overtime Management**: Overtime log tracking and request management
- **Timesheet Management**: Timesheet tracking and management
- **Time Management**: Unified tabbed interface for attendance, leaves, holidays, overtime, and timesheets
- **Reimbursement Management**: Reimbursement request and approval workflow
- **Reports**: Attendance, employee, leave, payroll, and custom reports with tabbed interface
- **Settings**: Company, system, attendance, leave, and payroll settings
- **Company Management**: Company CRUD operations with company switching
- **Role Management**: Role CRUD operations with RBAC
- **User Management**: User management with role assignment
- **Account Management**: Profile and password management
- **RBAC**: Role-based access control with permission management
- **Employee Documents**: Document management with versioning support
- **Time Clock**: Time in/out functionality with biometric verification
- **Biometric Integration**: Face recognition for attendance and employee registration

### Next Steps

- **Testing**: Unit and integration tests
- **Documentation**: Component documentation and API docs
- **Performance Optimization**: Code splitting and lazy loading
- **Accessibility Audit**: WCAG compliance review
- **Error Boundaries**: React error boundaries for error handling
- **Loading States**: Skeleton loaders and loading indicators
- **Optimistic Updates**: Optimistic UI updates for better UX

## Key Files Reference

### Configuration

- `vite.config.ts` - Vite build configuration with path aliases
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `eslint.config.mjs` - ESLint configuration
- `components.json` - shadcn/ui configuration (uses Square UI theme styling)

### Core Application

- `src/main.tsx` - Application entry point
- `src/routes/__root.tsx` - Root route with providers
- `src/lib/api/client.ts` - Axios API client implementation with session management
- `src/config/env.ts` - Environment variable validation

### State Management

- `src/stores/auth-store.ts` - Authentication state
- `src/stores/dashboard-store.ts` - Dashboard state
- `src/stores/ui-store.ts` - UI state
- `src/stores/rbac.ts` - Role-based access control state
- `src/stores/userManagement.ts` - User management state
- `src/stores/company-store.ts` - Company state management

### Providers

- `src/providers/auth-provider.tsx` - Authentication provider
- `src/providers/query-provider.tsx` - TanStack Query provider
- `src/providers/theme-provider.tsx` - Theme provider

### Services

- `src/services/api.ts` - Base API service
- `src/services/*.service.ts` - Feature-specific services (18 services: auth, employee, attendance, leave, holiday, payroll, report, role, user, settings, notification, profile, overtime, overtime-request, timesheet, reimbursement, dashboard, company)

### Types

- `src/types/index.ts` - Type exports
- `src/types/*.ts` - Feature-specific types (18 type files: api, auth, common, employee, attendance, leave, holiday, payroll, report, role, settings, notification, overtime, overtime-request, timesheet, reimbursement, company)

---

## Recent Updates

### Supplemental Features Implementation (January 2025)

- **Attendance Module Enhancements**:
  - Added tabbed interface to `/hris/attendance` route (Attendance Records, Abuse Detection)
  - New `AttendanceAbuseDetectionTable` component for detecting attendance abuse patterns
  - Abuse detection includes severity levels (low, medium, high, critical) and status tracking

- **Leave Management Enhancements**:
  - Added tabbed interface to `/hris/leaves` route (Leave Requests, Abuse Detection, Blackout Periods)
  - New `LeaveAbuseDetectionTable` component for detecting leave abuse patterns
  - New `LeaveBlackoutPeriodsTable` component for managing restricted leave periods
  - Support for scope-based blackout periods (all, department, position, employee)

- **Recruitment Module Enhancements**:
  - Added tabbed interface to `/hris/recruitment` route (Recruitment Pipeline, Manpower Requests)
  - New `ManpowerRequestsTable` component with budget approval workflow
  - Priority levels (low, medium, high, urgent) and comprehensive status tracking

- **Compliance Module**:
  - New `/hris/compliance` route for compliance management
  - New `HrPoliciesTable` component for HR policy management with versioning
  - Support for 12 policy categories (leave, attendance, discipline, compensation, benefits, etc.)
  - Policy approval workflow and review scheduling

- **Navigation Updates**:
  - Deductions added as separate top-level menu item in sidebar (not submenu)
  - Menu order: Payroll -> Reimbursements -> Deductions -> Reports
  - Full-width tabs implemented across all tabbed routes for better UX

- **Search Functionality**:
  - Added search to Deductions table (filters by employee name, code, deduction name/type)
  - Real-time filtering with Material Icons search icon

- **Form UX Improvements**:
  - Fixed SelectValue display issue across 24+ forms in all modules
  - Select dropdowns now show human-readable names instead of IDs in edit mode
  - Applied fix pattern: useMemo to find selected item + display name in SelectValue children
  - Affected modules: Employees, Core-HR, Recruitment, Training, Events/Meetings, Reimbursements, Payroll

### New Services (January 2025)

- **abuse-detection.service.ts**: Service for attendance/leave abuse detection with CRUD operations
- **leave-blackout.service.ts**: Service for managing leave blackout periods
- **manpower-request.service.ts**: Service for manpower request management with budget approval
- **hr-policy.service.ts**: Service for HR policy management with versioning support

### New Components (January 2025)

- **hris/attendance/attendance-abuse-detection-table.tsx**: Full CRUD table for attendance abuse detection
- **hris/leaves/leave-abuse-detection-table.tsx**: Full CRUD table for leave abuse detection
- **hris/leaves/leave-blackout-periods-table.tsx**: Management interface for leave blackout periods
- **hris/recruitment/manpower-requests-table.tsx**: Manpower request management with budget workflow
- **hris/compliance/hr-policies-table.tsx**: HR policy management with versioning and approval

### Time Management Module

- **Unified Time Management Interface**: New `/hris/time-management` route with tabbed interface consolidating attendance, leaves, holidays, overtime, and timesheets
- **Time Management Tab Components**:
  - `attendance-tab.tsx` - Attendance management tab
  - `leaves-tab.tsx` - Leave management tab
  - `holidays-tab.tsx` - Holiday management tab
  - `overtime-tab.tsx` - Overtime management tab
  - `timesheets-tab.tsx` - Timesheet management tab

### Reports Module

- **Custom Reports Tab**: New `custom-reports-tab.tsx` component for custom report generation
- **Report Tabs**: Tabbed interface for different report types (attendance, employee, leave, payroll, custom)

### Shared Components

- **Page Header Component**: New `hris/shared/page-header.tsx` component for consistent page headers across HRIS module

### Company Management

- **Company Service**: New `company.service.ts` for company CRUD operations
- **Company Store**: New `company-store.ts` for company state management with localStorage persistence
- **Company Types**: New `company.ts` type definitions for company data
- **Company Settings**: Company settings component in settings module
- **Company Switcher**: Shared component for switching between companies

### API Endpoints

- **Employee Documents**: Document management endpoints with download support
- **Time Clock**: Time in/out endpoints with employee-specific routes
- **Biometric**: Face verification and registration endpoints
- **Companies**: Full CRUD endpoints for company management
- **Abuse Detection**: Endpoints for attendance/leave abuse detection and management
- **Leave Blackout**: Endpoints for blackout period management
- **Manpower Requests**: Endpoints for manpower request workflow
- **HR Policies**: Endpoints for policy management with versioning

### Components

- **Procurement Components**: New procurement module components (currency-formatter, status-badge)
- **Shared Components**: Added company-switcher and stats-grid components
- **User Components**: New user-card component

---

**Last Updated**: January 22, 2025
**Version**: 1.2.0
