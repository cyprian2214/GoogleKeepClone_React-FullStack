# Google Keep Clone Backend

Node.js + Express + Prisma (PostgreSQL) backend for the Google Keep clone.

## Requirements
- Node.js 18+ (or 20+)
- PostgreSQL (local) OR Docker Desktop

## Setup
1. Install dependencies
```bash
npm install
```

2. Create `.env` from `.env.example`
```bash
copy .env.example .env
```

3. Start PostgreSQL
- Option A: Docker
```bash
docker compose up -d
```
- Option B: Local Postgres
  - Create a database named `google_keep`
  - Update `DATABASE_URL` in `.env`

4. Run migrations
```bash
npx prisma migrate dev --name init
```

5. Start the API
```bash
npm run dev
```

API runs on `http://localhost:4000` by default.

## Frontend Wiring
The UI now calls the backend directly.
- API base URL is defined in `app.js` as `API_BASE`
- If your API runs on a different host/port, update `API_BASE`

To run the UI, open `login.html` using a local web server (for example VS Code Live Server), then register or log in.

## Authentication
All note endpoints require a valid JWT.
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Use header: `Authorization: Bearer <token>`

## Reminder Feature
This backend supports scheduled reminders for notes.

How it works:
- Create reminder records through API.
- Frontend polls reminders and shows in-app due notifications.
- Notes with reminders are shown in the `Reminders` sidebar section.
- Deleted notes move to `Trash`.

## API Documentation

### Health
- `GET /health`
- Response: `{ "status": "ok" }`

### Auth

#### Register
- `POST /api/auth/register`
- Body:
```json
{
  "email": "you@example.com",
  "password": "secret123"
}
```
- Response: `201 Created` `{ token, user }`

#### Login
- `POST /api/auth/login`
- Body:
```json
{
  "email": "you@example.com",
  "password": "secret123"
}
```
- Response: `200 OK` `{ token, user }`

### Notes

All notes endpoints require `Authorization: Bearer <token>`.

#### List notes
- `GET /api/notes`
- Query params (optional):
  - `archived=true|false`
  - `pinned=true|false`
  - `q=searchText`
- Response: `200 OK` array of notes

#### Get note by id
- `GET /api/notes/:id`
- Response: `200 OK` note or `404` if not found

#### Create note
- `POST /api/notes`
- Body:
```json
{
  "title": "Meeting",
  "content": "Discuss roadmap",
  "color": "#fff8e1",
  "pinned": true,
  "archived": false
}
```
- Response: `201 Created` note
- Validation:
  - `title` and `content` can be null/empty, but at least one must be provided
  - `color` must be a hex value like `#fff` or `#ffffff`
  - `pinned` and `archived` must be booleans

#### Update note
- `PUT /api/notes/:id`
- Body (all fields optional):
```json
{
  "title": "Updated title",
  "content": "Updated content",
  "color": "#e8f5e9",
  "pinned": false,
  "archived": false
}
```
- Response: `200 OK` note or `404` if not found
- Validation:
  - At least one field must be provided
  - Same field rules as create

#### Delete note
- `DELETE /api/notes/:id`
- Response: `204 No Content` or `404` if not found

### Reminders

All reminder endpoints require `Authorization: Bearer <token>`.

#### Create reminder
- `POST /api/reminders`
- Body:
```json
{
  "noteId": "note-uuid",
  "remindAt": "2026-02-28T10:00:00.000Z",
  "message": "Review this note"
}
```
- Response: `201 Created` reminder
- Validation:
  - `noteId` is required and must belong to authenticated user
  - `remindAt` must be a valid future ISO date

#### List reminders
- `GET /api/reminders`
- Optional query:
  - `status=PENDING|SENT|FAILED|CANCELED`
- Response: `200 OK` array of reminders with note details

#### Cancel reminder
- `DELETE /api/reminders/:id`
- Behavior:
  - Changes reminder status to `CANCELED` (for pending/failed reminders)
- Response: `204 No Content`

## Note Model
```json
{
  "id": "uuid",
  "title": "string | null",
  "content": "string | null",
  "color": "string",
  "pinned": "boolean",
  "archived": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Reminder Model
```json
{
  "id": "uuid",
  "noteId": "uuid",
  "userId": "uuid",
  "message": "string | null",
  "remindAt": "Date",
  "status": "PENDING | SENT | FAILED | CANCELED",
  "sentAt": "Date | null",
  "lastError": "string | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Postman Collection
Import the collection from:
- `postman/GoogleKeepClone.postman_collection.json`

## Deploy for Free (Render + Neon)
This repository now includes `render.yaml` for Render Blueprint deploys.

### 1. Create a Neon database (free)
1. Create a Neon project and database.
2. Copy the connection string and use it as `DATABASE_URL`.
3. Ensure the URL includes SSL mode, for example `?sslmode=require`.

### 2. Deploy to Render (free web service)
1. In Render, choose `New` -> `Blueprint`.
2. Connect this GitHub repository.
3. Render reads `render.yaml` and creates the web service.
4. In Render service environment variables, set:
   - `DATABASE_URL` (from Neon)
   - `JWT_SECRET` (long random string)

### 3. Automatic deploys
- `render.yaml` sets `autoDeploy: true`.
- Every push to `main` triggers a new deploy on Render.

Notes:
- Start command runs migrations automatically: `npm run prisma:deploy && npm start`.
- Render provides `PORT` automatically.

## Code Structure
- `src/routes`: API endpoints
- `src/controllers`: request/response handling
- `src/services`: business logic (auth, notes, reminders, email, worker)
- `src/utils`: helpers and validators
- `src/middleware`: auth and error handling
- `src/lib`: shared Prisma client
