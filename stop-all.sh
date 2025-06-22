#!/bin/bash

# Eloquence.AI Stop Script
# This script stops all running modules

echo "🛑 Stopping Eloquence.AI modules..."

# Kill processes on ports 3001, 3002, 3003
for port in 3001 3002 3003; do
    PID=$(lsof -ti:$port)
    if [ ! -z "$PID" ]; then
        echo "Stopping process on port $port (PID: $PID)"
        kill -9 $PID
    else
        echo "No process running on port $port"
    fi
done

echo "All modules stopped!" 