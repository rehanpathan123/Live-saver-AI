#!/bin/sh
set -e

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

if [ ! -x "$ROOT_DIR/backend/.venv/bin/uvicorn" ]; then
  echo "Backend virtualenv is missing. Run: $ROOT_DIR/backend/.venv/bin/pip install -r backend/requirements.txt"
  exit 1
fi

cleanup() {
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

cd "$ROOT_DIR/backend"
env DATABASE_URL=sqlite+aiosqlite:///./lifesaver.db .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd "$ROOT_DIR"
npm --prefix frontend run dev &
FRONTEND_PID=$!

wait
