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

## Postman Collection
Import the collection from:
- `postman/GoogleKeepClone.postman_collection.json`

## Deploy to Heroku
1. Create Heroku app and add Postgres:
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
```

2. Set required env vars:
```bash
heroku config:set JWT_SECRET=your_long_random_secret
```

3. Deploy:
```bash
git push heroku main
```

Notes:
- `Procfile` runs migrations automatically during release (`npm run prisma:deploy`).
- Heroku provides `DATABASE_URL` and `PORT` automatically.

### GitHub Actions Auto Deploy
This repo includes `.github/workflows/deploy-heroku.yml` to deploy on every push to `main`.

Add these GitHub repository secrets:
- `HEROKU_API_KEY`
- `HEROKU_APP_NAME`
- `HEROKU_EMAIL`
