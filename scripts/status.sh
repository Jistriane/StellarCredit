#!/bin/bash

# StellarCredit - Service Status Check Script

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_service() {
    local name=$1
    local pid_file=$2
    local port=$3
    
    if [ -f "$pid_file" ]; then
        PID=$(cat $pid_file)
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $name${NC} (PID: $PID, Port: $port)"
        else
            echo -e "${RED}❌ $name${NC} (PID file exists but process not running)"
        fi
    else
        echo -e "${RED}❌ $name${NC} (Not started)"
    fi
}

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           StellarCredit - Service Status                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "🚀 Backend Services:"
check_service "Score Service  " "logs/score-service.pid" "8080"
check_service "Risk Service   " "logs/risk-service.pid" "8000"
check_service "PIX Service    " "logs/pix-service.pid" "3001"
check_service "ElisaOs AI     " "logs/elisa-service.pid" "8001"
check_service "Ingestion      " "logs/ingestion-service.pid" "N/A"

echo ""
echo "💻 Frontend:"
check_service "Next.js App    " "logs/frontend.pid" "3000"

echo ""
echo "🐳 Docker Containers:"
docker-compose ps

echo ""
echo "📝 View logs with: tail -f logs/<service>.log"
