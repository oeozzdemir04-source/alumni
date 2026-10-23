# Alumni Tracking System

A backend system to track Management Information Systems (MIS) graduates of Istanbul University, built for the Web Programming (YBSB3001) course.

## Tech Stack

- **Backend:** Express (Node.js 22)
- **Database:** PostgreSQL 16 (integrated in Week 5 via `pg` connection pool)
- **Containerization:** Docker & Docker Compose
- **Data Documentation:** [dld.md](dld.md) (Data Design Documentation)

## Project Decisions

- **Language: JavaScript (Node.js 22) with Express.** Why: one language from routes to views, small and easy to read in class.
- **Database: PostgreSQL.** Why: alumni data is relational (people, degrees, employers) with strong constraints. Data is persisted to a named volume (`pgdata`), passing the *Forgetting Test*. See [dld.md](dld.md) for detailed schemas and migration strategy.
- **Views: EJS** server-side templates.
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

4. Database Migrations & Seeding (if running locally or inside container):
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

## Database Design & The Forgetting Test

Full database schemas, tables, relationships, and migration details are documented in **[dld.md](dld.md)**.

### The Forgetting Test
Data persistence is tested across container restarts:
1. Create a record via `POST /api/users`.
2. Run `docker compose down`.
3. Run `docker compose up -d`.
4. Verify record exists via `GET /api/users`. Data is preserved by the `pgdata` volume.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Home page |
| GET | `/about` | About page |
| GET | `/hello` | `Hello, World!` |
| GET | `/hello/{name}` | `Hello {name}` |
| GET | `/sum/{number1}/{number2}` | Sum of two integers |
| GET | `/api/health` | Health check (JSON) |
| GET | `/api/swagger` | Swagger UI |
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
| GET | `/announcements` | List announcements + "New Announcement" form (`Announcement` tag) |
| POST | `/announcements` | Create an announcement from the form |
| GET | `/announcements/{id}` | Announcement detail page |
| GET | `/announcements/{id}/edit` | Pre-filled announcement edit form |
| POST | `/announcements/{id}/edit` | Update an announcement from the form |
| POST | `/announcements/{id}/delete` | Delete an announcement from the form |
| GET | `/api/announcements` | List all announcements (`ApiAnnouncement` tag) |
| GET | `/api/announcements/{id}` | Get a single announcement |
| POST | `/api/announcements` | Create a new announcement |
| PUT | `/api/announcements/{id}` | Replace an announcement |
| PATCH | `/api/announcements/{id}` | Partially update an announcement |
| DELETE | `/api/announcements/{id}` | Delete an announcement |

User fields: `name`, `email`, `graduation_year`, `department`.  
Announcement fields: `title`, `content`, `author`, `category`, `created_at`.

HTML forms can only send GET and POST, so the web pages use `POST /.../{id}/edit` and `POST /.../{id}/delete` instead of PUT/PATCH/DELETE.

A Postman collection is in [postman/](postman/alumni.postman_collection.json).

## Project Architecture (MVC)

The project follows the **Model-View-Controller (MVC)** pattern, split into dedicated files/folders under `src/`:

```
alumni/
├── src/
│   ├── server.js                        # Starts the HTTP server
│   ├── app.js                           # Wires routers, Swagger and views into Express
│   ├── db/                              # Database layer (Week 5)
│   │   ├── pool.js                      # PostgreSQL connection pool (pg)
│   │   ├── migrate.js                   # Schema migration runner (DDL)
│   │   └── seed.js                      # Factories and initial data seeders
│   ├── controllers/
│   │   ├── UserController.js            # UserController -> HTML pages under /users
│   │   ├── ApiUserController.js         # ApiUserController -> JSON under /api/users
│   │   ├── AnnouncementController.js    # AnnouncementController -> HTML pages under /announcements
│   │   └── ApiAnnouncementController.js # ApiAnnouncementController -> JSON under /api/announcements
│   ├── models/
│   │   ├── User.js                      # PostgreSQL User model + validation + CRUD
│   │   └── Announcement.js              # PostgreSQL Announcement model + validation + CRUD
│   ├── routes/
│   │   ├── basic.js                     # /, /about, /hello, /hello/:name, /sum/:a/:b
│   │   ├── web.js                       # /users/* -> UserController
│   │   ├── announcements.js             # /announcements/* -> AnnouncementController
│   │   └── api.js                       # /api/* -> ApiUserController & ApiAnnouncementController
│   ├── docs/
│   │   └── swagger.js                   # OpenAPI document served at /api/swagger
│   └── views/                           # View layer (EJS)
│       ├── partials/                    # header, footer, user-form
│       ├── users/                       # index, show, edit
│       ├── announcements/               # index, show, edit
│       └── home, about, error
├── postman/                             # Postman collection + workspace globals
├── dld.md                               # Data Layer / Design Documentation
├── .env.example                         # Example environment variables
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

| Layer | Location | Responsibility |
| --- | --- | --- |
| **Model** | `src/models/User.js`, `src/models/Announcement.js` | Relational data persistence with PostgreSQL connection pool (`src/db/pool.js`) and CRUD queries. |
| **View** | `src/views/` (`home`, `about`, `users/*`, `announcements/*`) | HTML pages returned to the browser via EJS. For API routes, JSON responses act as the view. |
| **Controller** | `src/controllers/` (`UserController`, `ApiUserController`, `AnnouncementController`, `ApiAnnouncementController`) | Handles HTTP requests, invokes Models asynchronously, and returns HTML renders or JSON responses. |

## Status

Work in progress — built incrementally week by week.
