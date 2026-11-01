# Study Planner and Notes Manager — Project Report

> **Project name:** No formal product name is defined in the repository. “Study Planner and Notes Manager” is a descriptive working title.
>
> **Report basis:** This report describes the source code and configuration currently in the project. Planned Amazon RDS and EC2 deployment is clearly marked as a target, not as infrastructure already provisioned.

## 1. Project overview

This is a web application for organizing a student's study work in one place. Users can organize subjects and their learning materials, keep track of tasks and study sessions, and view a dashboard of study activity.

The application is a JavaScript full-stack project:

- A React single-page application provides the user interface.
- An Express REST API handles authentication and application data.
- PostgreSQL stores users, subjects, notes, tasks, folders, chapters, and study sessions.
- Drizzle ORM defines the PostgreSQL schema and applies database migrations.
- AWS S3 integration is implemented for uploaded note files, with local disk storage available as a development fallback.

## 2. Goals and intended users

### Goals

- Organize study subjects and related folders or chapters.
- Create, update, complete, and remove study tasks.
- Store text notes and uploaded study documents.
- Record study sessions and show related dashboard and session statistics.
- Keep each user's data associated with their account.

### Intended users

Students who want a personal workspace for subjects, study materials, assignments, and study-time tracking.

## 3. Implemented functionality

- **Accounts and onboarding:** Registration, login, logout, profile retrieval, and an onboarding-completed flag.
- **Dashboard:** A protected dashboard endpoint and dashboard page for study overview information.
- **Subjects:** Create, view, edit, and delete subjects. Subject data includes a name, description, color, icon, target hours, notes, and progress.
- **Folders and chapters:** Organize content under subjects using folders and chapters. The API supports listing and creating these under a subject and editing or deleting individual entries.
- **Notes and files:** Create, view, edit, and delete notes. Notes can be associated with a subject and optionally with a folder or chapter. A multipart upload endpoint stores file metadata and a storage reference.
- **Tasks:** Create, list, view, edit, toggle completion, and delete tasks. Tasks can include a due value, priority, description, and optional subject association.
- **Study sessions:** Create and list study-session records and retrieve session statistics. A session records a subject, optional goal, duration, phase, completion state, and creation time.
- **Frontend navigation:** Login, registration, onboarding, dashboard, tasks, completed tasks, subjects, subject editing, notes, study sessions, search results, error, and offline screens are represented in the React routes.
- **Client data fetching:** TanStack React Query hooks manage queries and mutations for dashboard, subjects, folders, notes, tasks, and sessions.

## 4. Technology stack

| Area | Technologies found in the project |
|---|---|
| Frontend | React 19, React Router 7, Vite 8, Axios, TanStack React Query |
| Styling and icons | Tailwind CSS 4, PostCSS, Lucide React |
| Backend | Node.js (the workflow selects Node 22), Express 5, JavaScript ES modules |
| Database | PostgreSQL, `pg`, Drizzle ORM, Drizzle Kit |
| Authentication | JSON Web Tokens (`jsonwebtoken`), bcrypt password hashing |
| File upload/storage | Multer in-memory upload, AWS SDK for S3, presigned download URL support |
| Automation | GitHub Actions workflow, PM2 restart command |

Dependency versions are recorded in the separate `backend/package.json` and `frontend/package.json` manifests and their lock files.

## 5. Architecture and source layout

```text
Browser
  └── React/Vite frontend
        └── Axios requests with JWT authorization
              └── Express REST API
                    ├── Authentication middleware/controllers
                    ├── Feature routes/controllers
                    ├── Drizzle ORM
                    │     └── PostgreSQL database
                    └── Note-file storage
                          ├── Amazon S3 when configured
                          └── Local public/uploads fallback
```

### Main directories

```text
backend/
  src/
    config/       Environment configuration
    controllers/  Request handling and application operations
    db/           Drizzle database connection and schema
    lib/          Authentication, password, upload, and S3 helpers
    routes/       Express API route definitions
    server.js     Express application and HTTP server
  drizzle/        Generated SQL migrations
  .github/
    workflows/    Backend GitHub Actions workflow

frontend/
  src/
    components/   Shared layout, navigation, and protected-route components
    context/      Authentication state
    hooks/        React Query data hooks
    lib/          Axios API client
    pages/        Application screens
    App.jsx       Client-side route definitions
```

## 6. Database design

The schema is defined in `backend/src/db/schema.js`. The database dialect is PostgreSQL. Primary keys are serial integer IDs, and the models use timestamps where appropriate.

| Table | Purpose and notable fields |
|---|---|
| `users` | Account identity, unique email, password hash, and onboarding state. |
| `subjects` | User-owned subject details, including name, description, color, icon, target hours, notes, progress, and timestamps. |
| `folders` | User- and subject-associated folders, with name, description, color, and timestamps. |
| `chapters` | User- and subject-associated chapter records, with title, description, ordering, and timestamps. |
| `notes` | User- and subject-associated note content and optional folder/chapter links; stores file URL, S3 key, original filename, MIME type, and size for uploaded material. |
| `tasks` | User-owned tasks with title, description, due value, priority, completion state, and optional subject link. |
| `study_sessions` | User-owned records of study or break phases, duration, subject, goal, completion state, and creation time. |

### Relationships and deletion behavior

- User-owned records reference `users`.
- Folders and chapters reference their user and subject.
- Notes reference their user and subject, with optional folder and chapter references.
- Tasks may reference a subject; deleting that subject sets the task's `subject_id` to null.
- Foreign keys for user-owned records generally cascade when the parent is deleted; subject deletion cascades to its folders, chapters, and notes.

The migration files currently in the backend are `0000_third_lady_ursula.sql` and `0001_rapid_the_anarchist.sql`. They create the initial tables and add folders plus note-folder association.

## 7. API overview

The API is mounted on the backend server, which defaults to port `8000`. Except for public authentication routes and the root health response, feature endpoints use JWT authentication.

| Area | Main routes and operations |
|---|---|
| Health | `GET /` returns a simple server-running response. |
| Authentication | `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/profile`, and `GET /api/auth/me`. Authentication routes are also mounted under `/api/user`, `/auth`, and `/user`. |
| Dashboard | `GET /api/dashboard/` |
| Tasks | `/api/tasks/` supports list and create; `/api/tasks/:id` supports get, update (`PUT`/`PATCH`), and delete; `/api/tasks/:id/toggle` toggles completion. |
| Subjects | `/api/subjects/` supports list and create; `/api/subjects/:id` supports get, update (`PUT`/`PATCH`), and delete; `POST /api/subjects/onboard` handles subject onboarding. |
| Subject folders | `/api/subjects/:subjectId/folders` supports listing and creating folders. `/api/folders/` lists folders; `/api/folders/:id` supports update and delete. |
| Subject chapters | `/api/subjects/:subjectId/chapters` supports listing and creating chapters. `/api/chapters/:id` supports update and delete. |
| Notes | `/api/notes/` supports list and create; `/api/notes/:id` supports get, update (`PUT`/`PATCH`), and delete; `POST /api/notes/upload` accepts a multipart file field named `file`. |
| Notes by folder/chapter | `GET /api/folders/:folderId/notes` and `GET /api/chapters/:chapterId/notes`. |
| Study sessions | `/api/sessions/` supports list and create; `GET /api/sessions/stats` returns session statistics. |

## 8. Authentication and file storage

### Authentication

- Passwords are hashed using bcrypt with 10 salt rounds.
- The backend signs and verifies JWTs using `JWT_SECRET`; the token helper defaults to a seven-day expiry.
- Protected API requests read the bearer token from the `Authorization` header.
- The frontend stores the JWT in browser `localStorage` and attaches it to API requests.
- The frontend clears its stored token after an unauthorized response.

### Note-file storage

- Multer receives uploads in memory, with a configured maximum size of 25 MB per file.
- When S3 configuration is present, files are written to an S3 key organized by user, subject, folder/topic, and filename.
- The S3 helper can generate a presigned download URL with a default one-hour expiry.
- When S3 credentials or bucket configuration are absent, the helper writes files under `backend/public/uploads` and returns a local URL. This is a development fallback, not a durable production-storage strategy.

## 9. Environment configuration and local development

The backend reads environment variables with `dotenv`. Use `backend/.env.example` as the variable-name reference and create a private `backend/.env` for local values. Do not commit credentials or production secrets.

| Variable | Purpose | Current code default/behavior |
|---|---|---|
| `PORT` | Backend listening port | `8000` |
| `DATABASE_URL` | PostgreSQL connection string | Empty if unset; used by `pg` and Drizzle |
| `DATABASE_URL_POOLED` | Optional pooled database URL variable | Read by configuration, but the current connection pool uses `DATABASE_URL` |
| `JWT_SECRET` | JWT signing and verification secret | Development fallback exists; set a unique secure value outside local development |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `NODE_ENV` | Runtime environment | `development` |
| `AWS_REGION` | S3 region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | S3 credentials | Empty if unset |
| `AWS_BUCKET_NAME` | S3 bucket name | Falls back to `AWS_S3_BUCKET` if unset |
| `VITE_BACKEND_URL` | Frontend API base URL | Defaults to `http://localhost:8000` |

### Local startup

Use separate terminals from the project root:

```powershell
cd backend
npm ci
npm run db:migrate
npm run dev
```

```powershell
cd frontend
npm ci
npm run dev
```

The frontend development server defaults to Vite's local URL (normally `http://localhost:5173`). The backend defaults to `http://localhost:8000`. Set a reachable PostgreSQL `DATABASE_URL` before running database migrations or using data-backed routes.

### Available package scripts

**Backend:** `npm run dev`, `npm start`, `npm run db:generate`, `npm run db:migrate`. The backend manifest currently has no build script, and its `test` script reports that no test is specified.

**Frontend:** `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`. No frontend test script is defined in its manifest.

## 10. Deployment: current automation and intended AWS target

### Current repository state

The existing workflow is `backend/.github/workflows/backend-ci-cd.yml`. It triggers on pushes to `main`, uses a **self-hosted** GitHub Actions runner, selects Node 22, runs `npm ci` in `backend`, invokes `npm run build --if-present`, and runs `sudo pm2 restart backend`.

This is backend-focused automation. The checked-in workflow does **not** build or deploy the frontend, provision EC2 or RDS, apply database migrations, or run a test suite. A self-hosted runner may be hosted on an EC2 instance, but the workflow itself does not establish that fact. Treat the Amazon RDS and EC2 setup below as the intended deployment plan until the AWS resources and pipeline are configured and verified.

### Intended deployment architecture

```text
Users
  └── Frontend served from the EC2 deployment (for example, through a web server)
        └── HTTPS/API requests
              └── Node.js + Express backend on EC2, managed by PM2
                    ├── PostgreSQL connection over a private network
                    │     └── Amazon RDS for PostgreSQL
                    └── Uploaded study files
                          └── Amazon S3
```

The database schema and drivers are PostgreSQL-based, so Amazon RDS for PostgreSQL is the direct fit. The backend should receive the RDS connection string through `DATABASE_URL`. Configure `FRONTEND_URL` and `VITE_BACKEND_URL` for the deployed origins and API URL.

### Suggested CI/CD stages for the target

1. **Validate:** Install locked dependencies; run frontend lint and production build; add and run meaningful backend tests before treating the backend as validated.
2. **Prepare artifacts:** Build the frontend and package the backend for deployment.
3. **Deploy:** Deliver the frontend and backend to the EC2 deployment target and restart/reload the backend through PM2.
4. **Database change control:** Apply Drizzle migrations as an explicit, controlled deployment step after backup/review practices are in place; do not silently couple unreviewed schema changes to every restart.
5. **Verify:** Check the API health response and confirm that the deployed frontend can reach the backend and RDS.

For production, keep RDS inaccessible from the public internet where possible and allow database ingress only from the backend/EC2 security group. Store deployment and database secrets in an appropriate secret store or protected GitHub Actions secrets, not in the repository. Prefer an EC2 IAM role for access to S3 rather than long-lived AWS access keys on the instance. Use HTTPS and configure the frontend CORS origin to the actual deployed origin.

## 11. Current gaps and items to confirm

- Confirm the formal project name and the final production frontend hosting arrangement.
- Provision and document the intended AWS region, EC2 instance, RDS PostgreSQL instance, VPC/security groups, S3 bucket, DNS, and HTTPS setup.
- Update CI/CD so it builds/deploys the frontend as well as the backend and has an explicit, safe migration strategy.
- Add backend automated tests; the existing backend `test` script is only a placeholder.
- Review production configuration before deployment: replace the development JWT fallback, restrict CORS to the deployed frontend, and avoid permanent public file URLs if private access is required.
- Verify whether the deployed backend should rely on environment-injected AWS credentials/IAM roles; the current helper is written to read static access-key environment variables.
- Confirm backup, restore, monitoring, logging, and database migration rollback procedures for the production environment.

## 12. Short presentation summary

“This project is a full-stack study planner and notes manager. The React frontend communicates with an Express API. The API uses JWT authentication and bcrypt password hashing, while Drizzle ORM stores user, subject, folder, chapter, note, task, and study-session data in PostgreSQL. Uploaded study files can be stored in Amazon S3. The deployment target is an EC2-hosted application using Amazon RDS for PostgreSQL, with CI/CD to validate and deploy changes. The repository currently contains a basic backend GitHub Actions/PM2 workflow; the frontend deployment, RDS/EC2 provisioning, migrations in CI/CD, and backend tests still need to be completed and verified.”
