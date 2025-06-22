#!/bin/bash

# Eloquence.AI Start Script
# This script starts all three modules

echo "🎤 Starting Eloquence.AI modules..."

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use"
        return 1
    fi
    return 0
}

# Check ports
echo "Checking ports..."
check_port 3001 || exit 1
check_port 3002 || exit 1
check_port 3003 || exit 1

# Start Voice AI
echo "Starting Voice AI module..."
cd voice-ai && npm run dev &
VOICE_PID=$!

# Start Vision AI
echo "Starting Vision AI module..."
cd ../vision-ai && npm run dev &
VISION_PID=$!

# Start Game UI
echo "Starting Game UI module..."
cd ../game-ui && npm run dev &
UI_PID=$!

echo "All modules started!"
echo "Voice AI: http://localhost:3001"
echo "Vision AI: http://localhost:3002"
echo "Game UI: http://localhost:3003"
echo ""
echo "Press Ctrl+C to stop all modules"

# Wait for interrupt
trap "echo 'Stopping all modules...'; kill $VOICE_PID $VISION_PID $UI_PID; exit" INT
wait 