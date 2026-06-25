# Life Saver AI API

Base URL: `http://localhost:8000`

## Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`

Authenticated endpoints require:

```http
Authorization: Bearer <token>
```

## Tasks

- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/{id}`
- `DELETE /tasks/{id}`

## AI

- `POST /ai/parse-task`
- `POST /ai/generate-schedule`
- `POST /ai/warm-start`
- `POST /ai/panic-button`
- `POST /ai/follow-up`

If `OPENAI_API_KEY` is empty, AI endpoints return deterministic local fallbacks so the app still runs during demos.

## Calendar

- `GET /calendar/events`
- `POST /calendar/sync`

Calendar sync currently exposes a production integration boundary and demo events. Add Google Calendar and Microsoft Graph token exchange in `backend/app/services/calendar_service.py`.

## Analytics

- `GET /analytics/productivity`
- `GET /analytics/insights`
