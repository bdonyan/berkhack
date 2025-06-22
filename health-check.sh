#!/bin/bash

# Eloquence.AI Health Check Script
# This script checks if all modules are running properly

echo "🏥 Checking Eloquence.AI module health..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Check Voice AI
echo "Checking Voice AI (port 3001)..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}✓ Voice AI is healthy${NC}"
else
    echo -e "${RED}✗ Voice AI is not responding${NC}"
fi

# Check Vision AI
echo "Checking Vision AI (port 3002)..."
if curl -s http://localhost:3002/health > /dev/null; then
    echo -e "${GREEN}✓ Vision AI is healthy${NC}"
else
    echo -e "${RED}✗ Vision AI is not responding${NC}"
fi

# Check Game UI
echo "Checking Game UI (port 3003)..."
if curl -s http://localhost:3003 > /dev/null; then
    echo -e "${GREEN}✓ Game UI is healthy${NC}"
else
    echo -e "${RED}✗ Game UI is not responding${NC}"
fi

echo "Health check complete!"
