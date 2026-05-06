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

1. Start the backend and confirm it is running at http://localhost:5000.
2. Start the marketing site and confirm it is running at http://localhost:5174.
3. Start the admin portal and confirm it is running at http://localhost:5173.
4. Open the marketing site and submit a customer request through the contact flow.
5. Open the admin portal and confirm the incoming request appears in the Incoming Jobs view.
6. Create a job or assign the incoming request to a technician.
7. Sign in as the technician and confirm the assigned job is visible.
8. Progress the job through the normal workflow until it is marked complete.
9. Sign back in as admin and review the completion details, report, and invoice screen.

## Do Not Show During Demo

- Do not show .env secrets.
- Do not show database credentials.
- Do not use the unfinished /booking flow.
- Do not mention public customer login.

## Final Pre-Presentation Checklist

- Backend running.
- MongoDB connected.
- Both frontends running.
- Demo accounts tested.
- Customer request flow tested.
- Technician flow tested.
- Invoice/report screen tested.