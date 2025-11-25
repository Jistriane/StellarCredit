#!/bin/bash

# StellarCredit - Stop All Services Script

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🛑 Stopping all StellarCredit services..."
echo ""

# Stop frontend
if [ -f "logs/frontend.pid" ]; then
    PID=$(cat logs/frontend.pid)
    kill $PID 2>/dev/null && echo -e "${GREEN}✅ Frontend stopped${NC}" || echo -e "${YELLOW}⚠️  Frontend not running${NC}"
    rm -f logs/frontend.pid
fi

# Stop PIX service
if [ -f "logs/pix-service.pid" ]; then
    PID=$(cat logs/pix-service.pid)
    kill $PID 2>/dev/null && echo -e "${GREEN}✅ PIX Service stopped${NC}" || echo -e "${YELLOW}⚠️  PIX Service not running${NC}"
    rm -f logs/pix-service.pid
fi

# Stop ElisaOs
if [ -f "logs/elisa-service.pid" ]; then
    PID=$(cat logs/elisa-service.pid)
    kill $PID 2>/dev/null && echo -e "${GREEN}✅ ElisaOs AI stopped${NC}" || echo -e "${YELLOW}⚠️  ElisaOs not running${NC}"
    rm -f logs/elisa-service.pid
fi

# Stop Risk service
if [ -f "logs/risk-service.pid" ]; then
    PID=$(cat logs/risk-service.pid)
    kill $PID 2>/dev/null && echo -e "${GREEN}✅ Risk Service stopped${NC}" || echo -e "${YELLOW}⚠️  Risk Service not running${NC}"
    rm -f logs/risk-service.pid
fi

# Stop Score service
if [ -f "logs/score-service.pid" ]; then
    PID=$(cat logs/score-service.pid)
    kill $PID 2>/dev/null && echo -e "${GREEN}✅ Score Service stopped${NC}" || echo -e "${YELLOW}⚠️  Score Service not running${NC}"
    rm -f logs/score-service.pid
fi

# Stop Ingestion service
if [ -f "logs/ingestion-service.pid" ]; then
    PID=$(cat logs/ingestion-service.pid)
    kill $PID 2>/dev/null && echo -e "${GREEN}✅ Ingestion Service stopped${NC}" || echo -e "${YELLOW}⚠️  Ingestion Service not running${NC}"
    rm -f logs/ingestion-service.pid
fi

# Stop Docker containers
echo ""
echo "🐳 Stopping Docker containers..."
docker-compose down
echo -e "${GREEN}✅ Docker containers stopped${NC}"

echo ""
echo -e "${GREEN}✅ All services stopped successfully!${NC}"
