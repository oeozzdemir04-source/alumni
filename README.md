# Alumni Tracking System

A backend system to track Management Information Systems (MIS) graduates of Istanbul University, built for the Web Programming (YBSB3001) course.

## Tech Stack

- **Backend:** Express (Node.js 22)
- **Database:** PostgreSQL 16 (integrated via `pg` connection pool)
- **Containerization:** Docker & Docker Compose
- **Data Documentation:** [dld.md](dld.md) (Data Design Documentation)
- **Middlewares & Guardians:** Logger, 404 Guardian, 5xx Guardian (Week 06)

## Project Decisions

- **Language: JavaScript (Node.js 22) with Express.** Why: unified stack from routes to views, lightweight and readable.
- **Database: PostgreSQL.** Why: relational schema with strong constraints (graduates, announcements, job postings). Data is persisted in the named volume `pgdata`, passing the *Forgetting Test*.
- **Middlewares (The Processing Line):**
  - **Logger Middleware:** Logs every incoming request to the terminal in the exact format: `time method route status duration` (e.g. `10:20:30 POST /users 201 18ms`).
  - **404 Guardian Middleware:** Catches unmapped routes and returns structured 404 responses with reasons. For web clients, renders a generic 404 page with an automatic countdown redirect.
  - **5xx Guardian Middleware:** Central error-handling middleware that catches server exceptions, writes errors and stack traces into `logs/error.logs`, and returns a safe 500 JSON/HTML response with the reason.
  - **Error Logging:** Persists unhandled errors to `logs/error.logs`.
- **Views: EJS** server-side templates with responsive layouts and partials.
- **Containerization: Docker & Docker Compose.**

## Running the Project

1. Get the project folder (clone the repository and `cd` into it).

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start the system (App + PostgreSQL):
   ```bash
   docker compose up --build
   ```

4. Database Migrations & Seeding:
   ```bash
   npm run migrate
   npm run seed
   ```

5. Open <http://localhost:3000>. API docs (Swagger UI):
   ```
   http://localhost:3000/api/swagger
   ```
   (`/docs` redirects there; the document in `src/docs/swagger.js` is updated with every new endpoint)

Without Docker: `npm install && npm start`.

## Middlewares & Error Guardians (Week 06)

The application follows an ordered request pipeline:
`Request -> Logger Middleware -> Body Parser -> App Routes -> 404 Guardian -> 5xx Guardian`

### 1. Logger Middleware (`src/middlewares/logger.js`)
Prints every completed request to stdout:
```text
10:20:30 POST /users 201 18ms
10:20:35 GET /api/users 200 4ms
10:20:40 POST /api/jobs 400 6ms
```

### 2. 404 Guardian Middleware (`src/middlewares/notFoundGuardian.js`)
- **API requests:** Returns JSON with status, path, timestamp, and a human-readable reason:
  ```json
  {
    "error": "Not Found",
    "reason": "The requested resource 'GET /api/unknown' was not found on this server.",
    "status": 404
  }
  ```
- **Web requests:** Renders `src/views/404.ejs` with a 5-second automatic countdown redirect to `/users`.

### 3. 5xx Guardian Middleware (`src/middlewares/serverErrorGuardian.js`)
- Catches errors passed via `next(err)`.
- Appends full stack traces with timestamps to `logs/error.logs`.
- Returns a structured 500 response with reason to prevent leaking internals while keeping errors debuggable.
- Test endpoint: `GET /api/test-error`.

---

## Database Design & The Forgetting Test

Full database schemas, tables, relationships, and migration details are documented in **[dld.md](dld.md)**.

### Job Posting Rules:
- `title`: Required, max 120 characters.
- `company`: Required.
- `city`, `description`: Optional.
- `user_id`: Optional foreign key to `users(id)`.

### The Forgetting Test
Data persistence is tested across container restarts:
1. Create a record via `POST /api/users`.
2. Run `docker compose down`.
3. Run `docker compose up -d`.
4. Verify record exists via `GET /api/users`. Data is preserved by the `pgdata` volume.

---

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Home page with dynamic record counters |
| GET | `/about` | About page |
| GET | `/hello` | `Hello, World!` |
| GET | `/hello/{name}` | `Hello {name}` |
| GET | `/sum/{number1}/{number2}` | Sum of two integers |
| GET | `/api/health` | Health check (JSON) |
| GET | `/api/swagger` | Swagger UI documentation |
| GET | `/api/test-error` | Triggers 5xx Guardian & writes to `logs/error.logs` |
| GET | `/404` | Generic 404 page with auto-redirect |
| GET | `/users` | List users + "Add User" form (`User` tag) |
| POST | `/users` | Create a user from the form |
| GET | `/users/{id}` | User detail page |
| GET | `/users/{id}/edit` | Pre-filled edit form |
| POST | `/users/{id}/edit` | Update a user from the form |
| POST | `/users/{id}/delete` | Delete a user from the form |
| GET | `/api/users` | List all users (`ApiUser` tag) |
| GET | `/api/users/{id}` | Get a single user |
| POST | `/api/users` | Create a new user |
| PUT | `/api/users/{id}` | Replace a user (all fields required) |
| PATCH | `/api/users/{id}` | Partially update a user |
| DELETE | `/api/users/{id}` | Delete a user |
| GET | `/announcements` | List announcements + "New Announcement" form |
| POST | `/announcements` | Create an announcement from the form |
| GET | `/announcements/{id}` | Announcement detail page |
| GET | `/announcements/{id}/edit` | Pre-filled announcement edit form |
| POST | `/announcements/{id}/edit` | Update an announcement from the form |
| POST | `/announcements/{id}/delete` | Delete an announcement from the form |
| GET | `/api/announcements` | List all announcements |
| GET | `/api/announcements/{id}` | Get a single announcement |
| POST | `/api/announcements` | Create a new announcement |
| PUT | `/api/announcements/{id}` | Replace an announcement |
| PATCH | `/api/announcements/{id}` | Partially update an announcement |
| DELETE | `/api/announcements/{id}` | Delete an announcement |
| GET | `/jobs` | List job postings + "Post a Job" form |
| POST | `/jobs` | Create a job posting from the form |
| GET | `/jobs/{id}` | Job posting detail page |
| GET | `/jobs/{id}/edit` | Pre-filled job edit form |
| POST | `/jobs/{id}/edit` | Update a job posting from the form |
| POST | `/jobs/{id}/delete` | Delete a job posting from the form |
| GET | `/api/jobs` | List all job postings |
| GET | `/api/jobs/{id}` | Get a single job posting |
| POST | `/api/jobs` | Create a new job posting (validation: title max 120, company) |
| PUT | `/api/jobs/{id}` | Replace a job posting |
| PATCH | `/api/jobs/{id}` | Partially update a job posting |
| DELETE | `/api/jobs/{id}` | Delete a job posting |
| GET | `/api/users/{userId}/jobs` | List job postings for a specific alumnus |
| POST | `/api/users/{userId}/jobs` | Create a job posting for a specific alumnus |

A comprehensive Postman collection (including invalid request test cases) is located at [postman/alumni.postman_collection.json](postman/alumni.postman_collection.json).

---

## Project Architecture (MVC & Middlewares)

```
alumni/
├── src/
│   ├── server.js                        # Starts the HTTP server
│   ├── app.js                           # Wires middlewares, routers, Swagger and views
│   ├── middlewares/                     # Middlewares & Guardians (Week 06)
│   │   ├── logger.js                    # Terminal logger: time method route status duration
│   │   ├── notFoundGuardian.js          # 404 Guardian with descriptive reasons / redirect
│   │   └── serverErrorGuardian.js       # 5xx Guardian with file logging to logs/error.logs
│   ├── db/                              # Database layer
│   │   ├── pool.js                      # PostgreSQL connection pool (pg)
│   │   ├── migrate.js                   # Schema migration runner (DDL: users, announcements, jobs)
│   │   └── seed.js                      # Factories and initial data seeders
│   ├── controllers/
│   │   ├── UserController.js            # HTML pages under /users
│   │   ├── ApiUserController.js         # JSON API under /api/users
│   │   ├── AnnouncementController.js    # HTML pages under /announcements
│   │   ├── ApiAnnouncementController.js # JSON API under /api/announcements
│   │   ├── JobPostingController.js      # HTML pages under /jobs
│   │   └── ApiJobPostingController.js   # JSON API under /api/jobs & /api/users/:userId/jobs
│   ├── models/
│   │   ├── User.js                      # User model + validation + DB queries
│   │   ├── Announcement.js              # Announcement model + validation + DB queries
│   │   └── JobPosting.js                # JobPosting model + length rules + DB queries
│   ├── routes/
│   │   ├── basic.js                     # /, /about, /hello, /hello/:name, /sum/:a/:b, /404
│   │   ├── web.js                       # /users/* -> UserController
│   │   ├── announcements.js             # /announcements/* -> AnnouncementController
│   │   ├── jobs.js                      # /jobs/* -> JobPostingController
│   │   └── api.js                       # /api/* -> All REST API controllers
│   ├── docs/
│   │   └── swagger.js                   # OpenAPI 3.0 document served at /api/swagger
│   └── views/                           # View layer (EJS)
│       ├── partials/                    # header, footer, user-form
│       ├── users/                       # index, show, edit
│       ├── announcements/               # index, show, edit
│       ├── jobs/                        # index, show, edit
│       ├── 404.ejs                      # Generic 404 page with auto-redirect
│       └── home, about, error
├── logs/                                # Error logs directory
│   ├── .gitkeep
│   └── error.logs                       # Runtime error log destination
├── postman/                             # Postman collection (valid + invalid test suites)
├── dld.md                               # Data Design Documentation & Rules
├── .env.example                         # Environment variable definitions
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

| Layer | Location | Responsibility |
| --- | --- | --- |
| **Middlewares** | `src/middlewares/` (`logger`, `notFoundGuardian`, `serverErrorGuardian`) | Cross-cutting concerns: terminal logging, 404 error interceptor, and 5xx exception catchers with file logging. |
| **Model** | `src/models/` (`User`, `Announcement`, `JobPosting`) | Relational persistence with PostgreSQL connection pool (`src/db/pool.js`), DLD validation rules, and CRUD queries. |
| **View** | `src/views/` (`home`, `about`, `users/*`, `announcements/*`, `jobs/*`, `404`) | User-facing HTML templates rendered with EJS, including the generic 404 redirect page. |
| **Controller** | `src/controllers/` | Handles HTTP requests, enforces validation errors, queries models, and serves responses. |

## Status

Work in progress — built incrementally week by week.
