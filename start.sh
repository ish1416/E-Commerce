#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────
# ShopSmart — Local Dev Server Starter
# Starts both frontend (port 3000) and backend (port 4000)
# Usage: bash start.sh
# Stop:  Ctrl+C (kills both servers)
# ─────────────────────────────────────────

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ShopSmart Dev Server          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""

# ─────────────────────────────────────────
# Check Node.js is installed
# ─────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js not found. Please install Node.js 20+${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version) found${NC}"

# ─────────────────────────────────────────
# Check MySQL is running
# ─────────────────────────────────────────
if ! mysql -u root -pDps@220068 -h localhost -P 3306 -e "SELECT 1;" &>/dev/null 2>&1; then
  echo -e "${YELLOW}⚠ MySQL not reachable — backend may fail to start${NC}"
else
  echo -e "${GREEN}✓ MySQL is running${NC}"
fi

# ─────────────────────────────────────────
# Kill anything already on ports 3000 / 4000
# ─────────────────────────────────────────
for PORT in 3000 4000; do
  PID=$(lsof -ti ":$PORT" 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo -e "${YELLOW}⚠ Port $PORT in use (PID $PID) — killing it${NC}"
    kill -9 "$PID" 2>/dev/null || true
    sleep 1
  fi
done

# ─────────────────────────────────────────
# Install dependencies if node_modules missing
# ─────────────────────────────────────────
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo -e "${YELLOW}⚠ Frontend node_modules missing — running npm install${NC}"
  cd "$FRONTEND_DIR" && npm install
fi

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo -e "${YELLOW}⚠ Root node_modules missing — running npm install${NC}"
  cd "$ROOT_DIR" && npm install
fi

# ─────────────────────────────────────────
# Start Backend (port 4000)
# ─────────────────────────────────────────
echo ""
echo -e "${GREEN}▶ Starting backend on http://localhost:4000/graphql${NC}"
cd "$BACKEND_DIR"
npm run dev > /tmp/shopsmart-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "  Backend PID: ${BACKEND_PID}"

# Wait for backend to be ready
echo -n "  Waiting for backend"
for i in $(seq 1 20); do
  if curl -s http://localhost:4000/health &>/dev/null; then
    echo -e " ${GREEN}✓ Ready!${NC}"
    break
  fi
  echo -n "."
  sleep 1
done

# ─────────────────────────────────────────
# Start Frontend (port 3000)
# ─────────────────────────────────────────
echo ""
echo -e "${GREEN}▶ Starting frontend on http://localhost:3000${NC}"
cd "$FRONTEND_DIR"
npm run dev > /tmp/shopsmart-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "  Frontend PID: ${FRONTEND_PID}"

# Wait for frontend to be ready
echo -n "  Waiting for frontend"
for i in $(seq 1 30); do
  if curl -s http://localhost:3000 &>/dev/null; then
    echo -e " ${GREEN}✓ Ready!${NC}"
    break
  fi
  echo -n "."
  sleep 1
done

# ─────────────────────────────────────────
# All running — show summary
# ─────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Both servers running!        ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Frontend  →  http://localhost:3000  ║${NC}"
echo -e "${GREEN}║  Backend   →  http://localhost:4000  ║${NC}"
echo -e "${GREEN}║  GraphQL   →  /graphql               ║${NC}"
echo -e "${GREEN}║  Health    →  /health                ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Logs:                               ║${NC}"
echo -e "${GREEN}║  Backend  → /tmp/shopsmart-backend.log  ║${NC}"
echo -e "${GREEN}║  Frontend → /tmp/shopsmart-frontend.log ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Press Ctrl+C to stop both servers   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""

# ─────────────────────────────────────────
# Trap Ctrl+C — kill both servers cleanly
# ─────────────────────────────────────────
cleanup() {
  echo ""
  echo -e "${YELLOW}Stopping servers...${NC}"
  kill "$BACKEND_PID"  2>/dev/null || true
  kill "$FRONTEND_PID" 2>/dev/null || true
  echo -e "${GREEN}✓ Both servers stopped. Goodbye!${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# Keep script alive until Ctrl+C
wait
