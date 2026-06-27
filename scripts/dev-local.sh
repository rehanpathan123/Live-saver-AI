#!/bin/sh
set -e

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

if [ ! -x "$ROOT_DIR/backend/.venv/bin/uvicorn" ]; then
  echo "Backend virtualenv is missing. Run: cd backend && pip install -r requirements.txt"
  exit 1
fi

cleanup() {
  if [ -n "$OLLAMA_PID" ]; then
    kill "$OLLAMA_PID" 2>/dev/null || true
  fi
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

# --- Start Ollama if not already running ---
if ! curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; then
  echo "Starting Ollama..."
  ollama serve &
  OLLAMA_PID=$!
  # Wait until Ollama is ready (up to 20s)
  for i in $(seq 1 20); do
    if curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; then
      echo "Ollama is ready."
      break
    fi
    sleep 1
  done
else
  echo "Ollama already running."
  OLLAMA_PID=""
fi

# --- Backend ---
cd "$ROOT_DIR/backend"
env DATABASE_URL=sqlite+aiosqlite:///./lifesaver.db .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# --- Frontend ---
cd "$ROOT_DIR"
npm --prefix frontend run dev &
FRONTEND_PID=$!

wait
