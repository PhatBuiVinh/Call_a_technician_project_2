# Final Demo Smoke Checklist

Use this checklist for a student capstone or product launch presentation.

## Local URLs

- Backend: http://localhost:5000
- Marketing site: http://localhost:5174
- Admin portal: http://localhost:5173

## Placeholder Demo Accounts

- Admin: admin@example.com / your-local-password
- Technician: technician@example.com / your-local-password

## Smoke Steps

1. Start the backend with `PORT=5000` and confirm it is running at http://localhost:5000.
2. Start the marketing site and confirm it is running at http://localhost:5174.
3. Start the admin portal and confirm it is running at http://localhost:5173.
4. Open the marketing site and submit a customer request through the contact flow.
5. Open the admin portal and confirm the incoming request appears in the Incoming Jobs view.
6. Create a job or assign the incoming request to a technician.
7. Sign in as the technician and confirm the assigned job is visible.
8. Progress the job through the normal workflow until it is marked complete.
9. Sign back in as admin and review the completion details, report, and invoice screen.

Before demo day, after the backend is running, you can also run `npm test --workspace packages/backend-api` to confirm the backend health endpoint responds without touching the database.

## Local reCAPTCHA Setup

- For a local demo without reCAPTCHA, leave both `RECAPTCHA_SECRET_KEY` and `VITE_RECAPTCHA_SITE_KEY` blank. The backend skips verification only when no secret is configured.
- If `RECAPTCHA_SECRET_KEY` is set, `VITE_RECAPTCHA_SITE_KEY` must also be set to the matching site key or customer request submissions will fail security verification.
- For production, configure both keys and keep rate limiting enabled.

## Disposable E2E Database

Use a disposable database for smoke testing. Do not run customer request E2E tests against production-like or shared external credentials.

Preferred local backend env:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/call_a_technician_e2e_test
JWT_SECRET=replace_me
RECAPTCHA_SECRET_KEY=
```

If Docker is available, start a temporary local MongoDB with:

```bash
docker run --rm --name cat-e2e-mongo -p 27017:27017 mongo:7
```

Then start the backend with the disposable `MONGODB_URI`, start both frontends, submit one customer request from the marketing site, and confirm it appears in Admin Portal > Incoming Jobs.

## Do Not Show During Demo

- Do not show .env secrets.
- Do not show database credentials.
- Do not use the unfinished /booking flow.
- Do not mention public customer login.

## Final Pre-Presentation Checklist

- Backend running.
- Backend running on `PORT=5000`.
- MongoDB connected.
- Both frontends running.
- Demo accounts tested.
- Admin `VITE_ENABLE_MOCKS` unset or `false`.
- Customer request flow tested.
- Technician flow tested.
- Invoice/report screen tested.
- Rate limiting left enabled for the demo.
