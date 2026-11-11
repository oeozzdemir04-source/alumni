# Data Design Documentation (DLD)

This document describes the database design, schema specifications, migration strategy, validation rules, and data persistence verification for the **Alumni Tracking System**.

Refer to [README.md](README.md) for general project setup, middleware architecture, and API endpoint documentation.

---

## 1. Relational Database Management System

- **Database Engine:** PostgreSQL 16
- **Driver:** `pg` (node-postgres) connection pool
- **Configuration:** Managed via `.env` / `DATABASE_URL`

---

## 2. Table Schemas & Validation Rules

### 2.1. `users` Table

Stores graduate records for the Istanbul University MIS Alumni register.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing unique identifier |
| `name` | `VARCHAR(255)` | `NOT NULL` | Full name of the graduate |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` | Contact email address |
| `graduation_year` | `INTEGER` | `NOT NULL` | Year of graduation (e.g. 2022) |
| `department` | `VARCHAR(255)` | `NOT NULL` | Faculty / Department name |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  graduation_year INTEGER NOT NULL,
  department VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2.2. `announcements` Table

Stores bulletins, news, and career notices for alumni.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing unique identifier |
| `title` | `VARCHAR(255)` | `NOT NULL` | Subject / title of the announcement |
| `content` | `TEXT` | `NOT NULL` | Full announcement text |
| `author` | `VARCHAR(255)` | `NOT NULL` | Creator / department posting notice |
| `category` | `VARCHAR(100)` | `DEFAULT 'General'` | Category (e.g. Event, Job, General) |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |

```sql
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2.3. `job_postings` Table (Week 06)

Stores career and job opportunities posted by or for graduates.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing unique identifier |
| `title` | `VARCHAR(120)` | `NOT NULL` | Job title (Max 120 characters) |
| `company` | `VARCHAR(255)` | `NOT NULL` | Hiring company or organization |
| `city` | `VARCHAR(100)` | `NULL` | Office location or Remote (Optional) |
| `description` | `TEXT` | `NULL` | Detailed job requirements (Optional) |
| `user_id` | `INTEGER` | `FOREIGN KEY (users.id)` | Optional link to posting alumnus |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Posting creation timestamp |

```sql
CREATE TABLE IF NOT EXISTS job_postings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  company VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  description TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Validation Rules for `JobPosting`:
- `title`: **Required**. Must not be empty. **Maximum 120 characters**.
  - Violations return `400 Bad Request` with `"title is required"` or `"title must not exceed 120 characters"`.
- `company`: **Required**. Must not be empty.
  - Violations return `400 Bad Request` with `"company is required"`.
- `city`: **Optional** (nullable string).
- `description`: **Optional** (nullable string/text).
- `user_id`: **Optional** (nullable integer referencing `users.id`).

---

## 3. Migrations & Seeding

### 3.1. Migration Runner
- Location: `src/db/migrate.js`
- Command: `npm run migrate`
- Creates all relational tables (`users`, `announcements`, `job_postings`) if they do not already exist (`CREATE TABLE IF NOT EXISTS`).

### 3.2. Factory & Seed
- Location: `src/db/seed.js`
- Command: `npm run seed`
- Includes:
  - `userFactory`: Generates mock graduate objects.
  - `announcementFactory`: Generates bulletin announcements.
  - `jobPostingFactory`: Generates valid job postings adhering to length and field rules.
- Inserts initial records safely (`ON CONFLICT (email) DO NOTHING` for users).

---

## 4. The Forgetting Test (Persistence Verification)

The **Forgetting Test** verifies that data is permanently stored in the PostgreSQL volume rather than lost in ephemeral memory:

1. **Step 1 - Create a Record:**
   ```bash
   curl -X POST http://localhost:3000/api/users \
     -H "Content-Type: application/json" \
     -d '{"name":"Persistence Test","email":"test@persist.com","graduation_year":2024,"department":"MIS"}'
   ```
2. **Step 2 - Tear Down Containers:**
   ```bash
   docker compose down
   ```
3. **Step 3 - Re-launch System:**
   ```bash
   docker compose up -d
   ```
4. **Step 4 - Verify Persistence:**
   ```bash
   curl -s http://localhost:3000/api/users
   ```
   *Expected Result:* The record `test@persist.com` is retained because the named volume `pgdata` maps to `/var/lib/postgresql/data`.
