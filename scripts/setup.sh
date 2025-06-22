#!/bin/bash

# Eloquence.AI Setup Script
# This script sets up the complete project structure and installs dependencies

set -e

echo "🚀 Setting up Eloquence.AI project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Create environment files
print_status "Creating environment files..."

# Voice AI environment
if [ ! -f "voice-ai/.env" ]; then
    cp voice-ai/env.example voice-ai/.env
    print_success "Created voice-ai/.env"
else
    print_warning "voice-ai/.env already exists"
fi

# Vision AI environment
if [ ! -f "vision-ai/.env" ]; then
    cp vision-ai/env.example vision-ai/.env
    print_success "Created vision-ai/.env"
else
    print_warning "vision-ai/.env already exists"
fi

# Game UI environment
if [ ! -f "game-ui/.env" ]; then
    cp game-ui/env.example game-ui/.env
    print_success "Created game-ui/.env"
else
    print_warning "game-ui/.env already exists"
fi

# Install dependencies for Voice AI
print_status "Installing Voice AI dependencies..."
cd voice-ai
npm install
cd ..

# Install dependencies for Vision AI
print_status "Installing Vision AI dependencies..."
cd vision-ai
npm install
cd ..

# Install dependencies for Game UI
print_status "Installing Game UI dependencies..."
cd game-ui
npm install
cd ..

print_success "All dependencies installed successfully!"

# Create a start script
print_status "Creating start script..."
cat > start-all.sh << 'EOF'
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
EOF

chmod +x start-all.sh
print_success "Created start-all.sh script"

# Create a stop script
cat > stop-all.sh << 'EOF'
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
EOF

chmod +x stop-all.sh
print_success "Created stop-all.sh script"

# Create a health check script
cat > health-check.sh << 'EOF'
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
EOF

chmod +x health-check.sh
print_success "Created health-check.sh script"

print_success "Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit the .env files with your API keys:"
echo "   - voice-ai/.env (OpenAI and Anthropic API keys)"
echo "   - vision-ai/.env (optional configuration)"
echo "   - game-ui/.env (service URLs)"
echo ""
echo "2. Start all modules:"
echo "   ./start-all.sh"
echo ""
echo "3. Check module health:"
echo "   ./health-check.sh"
echo ""
echo "4. Open the application:"
echo "   http://localhost:3003"
echo ""
echo "📚 For more information, see docs/SETUP.md and docs/INTEGRATION.md"
echo ""
print_success "Happy coding! 🎉" 