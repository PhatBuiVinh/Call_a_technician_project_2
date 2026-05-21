# Call-a-Technician Unified Project

This is a unified project containing both the marketing website and admin portal for Call-a-Technician, with a shared backend API.

For a presentation-ready walkthrough, see [docs/DEMO-SMOKE-CHECKLIST.md](docs/DEMO-SMOKE-CHECKLIST.md).

## Project Structure

```
├── apps/
│   ├── marketing-site/          # Marketing website (React + Vite)
│   └── admin-portal/            # Admin portal (React + Vite)
├── packages/
│   └── backend-api/             # Shared backend API (Node.js + Express + MongoDB)
└── package.json                 # Root package.json with workspaces
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Install dependencies for all projects:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   
   Copy the `.env.example` files and fill in local-only values. Do not commit real `.env` or `.env.development` files.
   
   **packages/backend-api/.env:**
   ```env
   PORT=5000
   MONGODB_URI=replace_me
   JWT_SECRET=replace_me
   CLIENT_ORIGIN=http://localhost:5173
   MARKETING_ORIGIN=http://localhost:5174
   ```
   
   **apps/marketing-site/.env:**
   ```env
   VITE_API_BASE=/api
   VITE_PORTAL_URL=http://localhost:5173
   ```
   
   **apps/admin-portal/.env:**
   ```env
   VITE_API_BASE=/api
   ```

3. **Start MongoDB** (if running locally)

4. **Run all applications:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API on http://localhost:5000
   - Marketing site on http://localhost:5174
   - Admin portal on http://localhost:5173

   The Vite dev servers proxy `/api` to `http://localhost:5000`, so the frontends call the backend through the same `/api` path in local development.

## Individual Commands

### Backend API
```bash
npm run dev:backend
```

After the backend is running, use `npm test --workspace packages/backend-api` to run the read-only smoke test. It checks `GET /api/health` and does not create, update, or delete any records.

### Marketing Site
```bash
npm run dev:marketing
```

### Admin Portal
```bash
npm run dev:portal
```

## Features

### Marketing Website
- Customer-facing website
- Request a Call form that submits to backend
- Login button redirects to admin portal

### Admin Portal
- Authentication system
- Dashboard with analytics
- Incoming Jobs management (from marketing site)
- Job scheduling and management
- Technician management
- Invoice management
- Calendar view

### Backend API
- Unified API for both applications
- MongoDB database
- JWT authentication
- CORS enabled for both frontends
- Incoming job request endpoints

## API Endpoints

### Marketing Site
- `POST /api/marketing/job-request` - Submit job request (no auth required)

### Admin Portal (requires authentication)
- `GET /api/incoming-jobs` - List incoming job requests
- `PUT /api/incoming-jobs/:id` - Update job request
- `DELETE /api/incoming-jobs/:id` - Delete job request
- All existing admin endpoints (jobs, technicians, invoices, etc.)

## Development

### Adding New Features
1. Backend changes go in `packages/backend-api/`
2. Marketing site changes go in `apps/marketing-site/`
3. Admin portal changes go in `apps/admin-portal/`

### Database Models
- `IncomingJobRequest` - Job requests from marketing site
- `Job` - Scheduled jobs in admin portal
- `User` - Admin users
- `Tech` - Technicians
- `Invoice` - Invoices

## Deployment

1. Build all applications:
   ```bash
   npm run build
   ```

2. Deploy backend API to your server
3. Deploy marketing site to your hosting provider
4. Deploy admin portal to your hosting provider
5. Update environment variables for production URLs

## Environment Variables

### Backend
- `PORT` - Server port. Use `5000` for local development so the marketing site and admin portal Vite proxies can reach `/api`.
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `CLIENT_ORIGIN` - Admin portal URL
- `MARKETING_ORIGIN` - Marketing site URL
- `RATE_LIMIT_ENABLED` - Keep enabled for demos and normal local testing; only set `false` temporarily in your own local `.env` for controlled testing
- `RECAPTCHA_SECRET_KEY` - Leave blank for local demos without reCAPTCHA. In production, set this together with the matching frontend site key.

### Marketing Site
- `VITE_API_BASE` - API base path, use `/api` in local development
- `VITE_PORTAL_URL` - Admin portal URL
- `VITE_RECAPTCHA_SITE_KEY` - Leave blank for local demos without reCAPTCHA. In production, set this together with the matching backend secret.

### Admin Portal
- `VITE_API_BASE` - API base path, use `/api` in local development
- `VITE_ENABLE_MOCKS` - Optional local development flag. Keep `false` or unset for demos so API failures are visible.

`VITE_API_URL` is legacy and not used by the current frontend API clients.

## License

ISC

