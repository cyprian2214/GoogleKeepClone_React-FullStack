# Google Keep Clone Backend

This is the backend service for the Google Keep Clone application, built with Node.js, Express, and Prisma with PostgreSQL.

## Prerequisites

- Node.js (v14 or later)
- Docker and Docker Compose
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start PostgreSQL using Docker:
```bash
docker-compose up -d
```

3. Set up the database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3000

## API Documentation

### Get all notes for a user
```
GET /api/notes/:userId
```
- Returns all notes for the specified user ID
- Response: Array of note objects

### Create a new note
```
POST /api/notes
```
- Request body:
  ```json
  {
    "userId": "string",
    "title": "string (optional)",
    "content": "string"
  }
  ```
- Response: Created note object

### Update a note
```
PUT /api/notes/:id
```
- Request body:
  ```json
  {
    "title": "string (optional)",
    "content": "string"
  }
  ```
- Response: Updated note object

### Delete a note
```
DELETE /api/notes/:id
```
- Response: 204 No Content

## Environment Variables

Create a `.env` file with the following variables:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/keepclone"
PORT=3000
```
