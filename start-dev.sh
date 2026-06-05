#!/usr/bin/env bash
# Usage: ./start-dev.sh
# Starts MongoDB (if not running) then launches the Node.js dev server.

MONGO_DATA="$HOME/.mongodb/gortt-lms-data"
MONGO_LOG="$HOME/.mongodb/mongod.log"

if ! pgrep -x mongod > /dev/null; then
  echo "▶  Starting MongoDB..."
  mkdir -p "$MONGO_DATA"
  mongod --dbpath "$MONGO_DATA" --logpath "$MONGO_LOG" --logappend \
         --port 27017 --bind_ip 127.0.0.1 --fork
  sleep 1
  echo "✅ MongoDB started  (data: $MONGO_DATA)"
else
  echo "✅ MongoDB already running"
fi

echo ""
echo "▶  Starting LMS API server on port 8000..."
echo "   Frontend should run on http://localhost:3000"
echo "   API available at  http://localhost:8000/api/v1"
echo ""
npm run dev
