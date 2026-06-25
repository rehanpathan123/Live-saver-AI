# Life Saver AI

Life Saver AI is a full-stack AI productivity companion that turns messy commitments into tasks, schedules, warm starts, dependency follow-ups, and panic-button recovery plans.

## Stack

- Frontend: Next.js 15, React, TypeScript, TailwindCSS, shadcn-style local components, Framer Motion, React Query, Zustand
- Backend: FastAPI, PostgreSQL, SQLAlchemy, Alembic, Redis, JWT authentication
- AI: OpenAI-compatible LangChain service layer, pgvector-ready recommendations table
- Integrations: Google Calendar, Outlook Calendar, and Gmail integration boundaries
- Deployment: Docker Compose

## Run Locally

With Docker:

```bash
cp .env.example .env
docker-compose up --build
```

Without Docker, after dependencies are installed:

```bash
npm run dev
```

Open:

- Frontend: `http://localhost:3000`
- Backend API docs: `http://localhost:8000/docs`

The frontend proxies API calls through `/api/*`, so the app can be used from one URL: `http://localhost:3000`.

The app runs without an OpenAI key by returning demo-safe AI fallbacks. Add `OPENAI_API_KEY` in `.env` for live GPT responses.

## Demo Flow

1. Register with the prefilled demo account.
2. Open Assistant and parse a chaos dump.
3. Generate a schedule, warm start, or panic recovery response.
4. Sync demo calendar events from Calendar.
5. Create demo tasks from Tasks.

## Folder Structure

```text
.
├── backend
│   ├── alembic
│   ├── app
│   │   ├── api/routes
│   │   ├── core
│   │   ├── db
│   │   ├── models
│   │   ├── schemas
│   │   └── services
│   ├── Dockerfile
│   └── requirements.txt
├── frontend
│   ├── app
│   ├── components
│   ├── lib
│   ├── store
│   └── Dockerfile
├── docs
│   └── API.md
├── docker-compose.yml
└── .env.example
```

## Production Notes

- Replace `JWT_SECRET` with a long random value.
- Move calendar token exchange and Gmail send permissions behind OAuth consent.
- Add background workers for proactive notifications and rescheduling.
- Use managed PostgreSQL with the `vector` extension enabled.
- Configure HTTPS, secure cookies, and observability before public launch.
