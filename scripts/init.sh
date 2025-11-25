#!/usr/bin/env bash
set -e

# Ensure .env exists (copy from example if missing)
if [ ! -f .env ]; then
  echo "Creating .env from .env.example"
  cp .env.example .env
fi

# Start Docker containers (PostgreSQL, Redis, etc.)
echo "Starting Docker containers..."
# Use docker-compose if available, otherwise fallback to docker compose
if command -v docker-compose >/dev/null 2>&1; then
  docker-compose up -d
else
  docker compose up -d
fi

# Simple wait for services to become healthy (adjust as needed)
echo "Waiting for services to become healthy..."
sleep 10

echo "Docker services are up."
