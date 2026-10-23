# Alumni Tracking System

A backend system to track Management Information Systems (MIS) graduates of Istanbul University, built for the Web Programming (YBSB3001) course.

## Tech Stack

- **Backend:** Express (Node.js)
- **Database:** PostgreSQL (container ready, integration in week 5)
- **Containerization:** Docker & Docker Compose

## Project decisions

- **Language: JavaScript (Node.js 22) with Express.** Why: one language from routes to views, small and easy to read in class. Bad at: no static typing, so a wrong field name only shows up at runtime.
- **Database: PostgreSQL.** Why: alumni data is relational (people, degrees, employers) and PostgreSQL has strong constraints. Bad at: heavier to set up and run than a file-based database like SQLite. The `db` container is already in `docker-compose.yml`, but the code does not use it yet (week 5); until then data lives in memory and is lost on restart.
- **Views: EJS** server-side templates.
- **Containerization: Docker & Docker Compose.**

## Running the Project

1. Get the project folder (clone the repository and `cd` into it).

2. Start the system:
   ```bash
   docker compose up
   ```

3. Open <http://localhost:3000>. API docs (Swagger UI):
   ```
   http://localhost:3000/api/swagger
   ```
   (`/docs` redirects there; the document in `src/docs/swagger.js` is updated with every new endpoint)

Without Docker: `npm install && npm start`.

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

User fields: `name`, `email`, `graduation_year`, `department`.

HTML forms can only send GET and POST, so the web pages use `POST /users/{id}/edit` and `POST /users/{id}/delete` instead of PUT/PATCH/DELETE.

> `/users` and `/api/users` both read/write the same in-memory `users` list in `src/models/User.js`, so a record created through one is visible through the other.

A Postman collection is in [postman/](postman/alumni.postman_collection.json).

## Project Architecture (MVC)

The project follows the **Model-View-Controller (MVC)** pattern, split into dedicated files/folders under `src/`:

```
alumni/
├── src/
│   ├── server.js                        # Starts the HTTP server
│   ├── app.js                           # Wires routers, Swagger and views into Express
│   ├── controllers/
│   │   ├── UserController.js            # UserController -> HTML pages under /users
│   │   └── ApiUserController.js         # ApiUserController -> JSON under /api/users
│   ├── models/
│   │   └── User.js                      # In-memory users list + CRUD + validation
│   ├── routes/
│   │   ├── basic.js                     # /, /about, /hello, /hello/:name, /sum/:a/:b
│   │   ├── web.js                       # /users/* -> UserController
│   │   └── api.js                       # /api/* -> ApiUserController
│   ├── docs/
│   │   └── swagger.js                   # OpenAPI document served at /api/swagger
│   └── views/                           # View layer (EJS)
│       ├── partials/                    # header, footer, user-form
│       ├── users/                       # index, show, edit
│       └── home, about, error
├── postman/                             # Postman collection + workspace globals
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

| Layer | Location | Responsibility |
| --- | --- | --- |
| **Model** | `src/models/User.js` — the in-memory `users` list and `create`/`all`/`find`/`update`/`partialUpdate`/`delete` | Defines the shape/validation of the data and holds + manipulates it (no database yet). |
| **View** | `src/views/` — `home`, `about`, `users/index`, `users/show`, `users/edit` | The HTML pages returned to the browser. For the JSON API routes, the JSON response itself acts as the "view" served to API clients (Postman, Swagger UI). |
| **Controller** | `src/controllers/UserController.js` (mounted at `/users`) and `src/controllers/ApiUserController.js` (mounted at `/api/users`) — two independent controllers, each with its own CRUD methods; neither inherits from the other | Receives the HTTP request, calls the Model, and returns HTML or JSON. `app.js` mounts both routers. |

## Status

Work in progress — built incrementally week by week.
