# Alumni Engagement and Mentorship Network

## Overview
A Spring Boot and React application connecting students with alumni for mentorship, career referrals, sessions, events, and notifications. MySQL stores application records; browser storage is used only for JWT and current session user.

## Main Features
- Student and alumni registration and JWT login
- Role-protected student, alumni, and admin routes
- Profile viewing and editing
- Real alumni mentor listing
- Mentorship and referral decision workflows
- Persisted mentorship sessions
- Events, notifications, and admin statistics

## User Roles
- STUDENT: finds alumni and manages mentorships, referrals, sessions, events, and notifications.
- ALUMNI: responds to student requests and views sessions, events, and notifications.
- ADMIN: views statistics and application records and manages events. Admin accounts are provisioned privately.

## Technology Stack
Java 21, Spring Boot, Spring Security, Spring Data JPA, BCrypt, JWT, MySQL 8, React, Vite, React Router, Axios, and Bootstrap Icons.

## Requirements
Java 21, MySQL 8, Node.js, and npm.

## MySQL / Database Setup
Create the database with `CREATE DATABASE alumni_mentorship_db;`. Hibernate uses `ddl-auto=update` and preserves existing records.

## Environment Variables
Never commit real values.

```powershell
$env:JAVA_HOME="C:\Program Files\Java\jdk-21"
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
$env:JWT_SECRET="YOUR_LONG_RANDOM_JWT_SECRET"
```

The optional frontend variable `VITE_API_URL` defaults to `http://localhost:8080/api`.

## Backend Run Instructions
```powershell
cd alumni-mentorship-backend
.\mvnw.cmd clean compile
.\mvnw.cmd spring-boot:run
```

## Frontend Run Instructions
```powershell
cd Dansigah\alumni-mentorship-frontend
npm install
npm run dev
npm run build
```

## Swagger / OpenAPI
Start the backend, then open:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

To test protected endpoints:

1. Call `POST /api/users/login`.
2. Copy the returned JWT token.
3. Select **Authorize** in Swagger UI.
4. Enter the JWT token in the `bearerAuth` field.
5. Call protected endpoints. Public ADMIN registration remains disabled.

## Main API Modules
- `/api/users`: registration, login, profiles, mentors
- `/api/mentorships`: mentorship workflow
- `/api/sessions`: mentorship sessions
- `/api/referrals`: referral workflow
- `/api/events`: events
- `/api/notifications`: user notifications
- `/api/admin`: protected statistics and record lists

## Authentication Flow
Public registration accepts STUDENT and ALUMNI only. BCrypt hashes passwords. Login returns safe user fields and a signed JWT. Axios attaches `Authorization: Bearer <token>`, and React redirects to the correct role dashboard.

## Known Limitations
No WebSockets, video calling, Zoom, or Google Meet integration. Notifications use normal API refresh. Sessions store scheduling data only. Admin accounts must be provisioned privately.
