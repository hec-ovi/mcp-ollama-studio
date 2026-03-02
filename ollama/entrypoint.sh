#!/bin/bash
set -euo pipefail

MODEL_NAME="${OLLAMA_MODEL:-gpt-oss:20b}"
OLLAMA_PID=""

log() {
  echo "[ollama] $1"
}

cleanup() {
  log "Shutting down..."
  if [ -n "$OLLAMA_PID" ]; then
    kill "$OLLAMA_PID" 2>/dev/null || true
    wait "$OLLAMA_PID" 2>/dev/null || true
  fi
}
trap cleanup SIGTERM SIGINT

log "========================================"
log "Model: $MODEL_NAME"
log "========================================"

log "Starting Ollama server..."
/bin/ollama serve &
OLLAMA_PID=$!

log "Waiting for server readiness..."
for i in {1..60}; do
  if timeout 2 bash -c 'cat < /dev/null > /dev/tcp/localhost/11434' 2>/dev/null; then
    log "Server ready"
    break
  fi
  sleep 1
  if [ "$i" -eq 60 ]; then
    log "Timeout waiting for Ollama server"
    exit 1
  fi
done

sleep 2

log "Checking model $MODEL_NAME"
if /bin/ollama list 2>/dev/null | grep -q "$MODEL_NAME"; then
  log "Model already present"
else
  log "Model not present, downloading..."
  /bin/ollama pull "$MODEL_NAME"
  log "Download complete"
fi

if ! /bin/ollama list 2>/dev/null | grep -q "$MODEL_NAME"; then
  log "Model verification failed"
  exit 1
fi

log "Ollama is ready"
wait "$OLLAMA_PID"
