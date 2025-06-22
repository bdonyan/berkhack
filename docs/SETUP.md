# 🚀 Eloquence.AI Setup Guide

This guide will help you set up the complete Eloquence.AI project with all three modules: Voice AI, Vision AI, and Game UI.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Webcam** and **microphone** for testing
- **API Keys** for OpenAI and Anthropic

## 🔑 Required API Keys

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### Anthropic API Key (Claude)
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

## 🏗️ Project Structure

```
eloquence-ai/
├── voice-ai/           # Person A: Voice + Speech AI
├── vision-ai/          # Person B: Facial Expression + Gesture Recognition  
├── game-ui/            # Person C: Game Loop, Elo Scoring, UI
├── shared/             # Shared utilities and schemas
└── docs/              # Documentation and integration guides
```

## 🎯 Module Setup

### 1. Voice AI Module (Person A)

```bash
# Navigate to voice-ai directory
cd voice-ai

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit .env file with your API keys
nano .env
```

**Required environment variables:**
```env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=3001
```

**Start the Voice AI module:**
```bash
npm run dev
```

The Voice AI module will be available at `http://localhost:3001`

### 2. Vision AI Module (Person B)

```bash
# Navigate to vision-ai directory
cd vision-ai

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit .env file
nano .env
```

**Required environment variables:**
```env
PORT=3002
NODE_ENV=development
```

**Start the Vision AI module:**
```bash
npm run dev
```

The Vision AI module will be available at `http://localhost:3002`

### 3. Game UI Module (Person C)

```bash
# Navigate to game-ui directory
cd game-ui

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit .env file
nano .env
```

**Required environment variables:**
```env
NEXT_PUBLIC_VOICE_AI_URL=http://localhost:3001
NEXT_PUBLIC_VISION_AI_URL=http://localhost:3002
```

**Start the Game UI module:**
```bash
npm run dev
```

The Game UI will be available at `http://localhost:3003`

## 🔄 Running All Modules

You'll need three terminal windows to run all modules simultaneously:

**Terminal 1 - Voice AI:**
```bash
cd voice-ai
npm run dev
```

**Terminal 2 - Vision AI:**
```bash
cd vision-ai
npm run dev
```

**Terminal 3 - Game UI:**
```bash
cd game-ui
npm run dev
```

## 🧪 Testing the Setup

### 1. Health Checks

Test that all modules are running correctly:

```bash
# Voice AI health check
curl http://localhost:3001/health

# Vision AI health check
curl http://localhost:3002/health

# Game UI (open in browser)
open http://localhost:3003
```

### 2. WebSocket Connections

The modules communicate via WebSocket. Check the browser console for connection status.

### 3. API Endpoints

**Voice AI Endpoints:**
- `POST /analyze-speech` - Analyze audio data
- `POST /stream-speech` - Real-time speech streaming
- `GET /health` - Health check

**Vision AI Endpoints:**
- `POST /analyze-frame` - Analyze video frame
- `POST /stream-video` - Real-time video streaming
- `GET /health` - Health check

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Find process using port
   lsof -i :3001
   # Kill process
   kill -9 <PID>
   ```

2. **API key errors:**
   - Verify API keys are correct
   - Check API key permissions
   - Ensure sufficient credits

3. **WebSocket connection issues:**
   - Check CORS settings
   - Verify ports are correct
   - Check firewall settings

4. **Module dependencies:**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Development Tips

1. **Enable debug logging:**
   ```env
   LOG_LEVEL=debug
   ```

2. **Use different ports for development:**
   ```env
   PORT=3001  # Voice AI
   PORT=3002  # Vision AI
   PORT=3003  # Game UI
   ```

3. **Monitor WebSocket connections:**
   - Check browser developer tools
   - Monitor server logs
   - Use WebSocket testing tools

## 📊 Performance Monitoring

### Voice AI Metrics
- Speech recognition accuracy
- Response time for feedback
- API call frequency

### Vision AI Metrics
- Frame processing time
- Gesture recognition accuracy
- Facial expression detection

### Game UI Metrics
- Real-time feedback latency
- Elo rating changes
- User engagement metrics

## 🔧 Development Workflow

1. **Feature Development:**
   - Work on your assigned module
   - Test locally with mock data
   - Coordinate integration points

2. **Integration Testing:**
   - Test all modules together
   - Verify data flow between modules
   - Check real-time feedback

3. **Performance Optimization:**
   - Monitor response times
   - Optimize API calls
   - Reduce WebSocket overhead

## 🚀 Deployment

### Production Setup

1. **Environment Variables:**
   - Use production API keys
   - Set appropriate ports
   - Configure CORS for production domains

2. **Build Commands:**
   ```bash
   # Voice AI
   cd voice-ai && npm run build

   # Vision AI
   cd vision-ai && npm run build

   # Game UI
   cd game-ui && npm run build
   ```

3. **Process Management:**
   - Use PM2 or similar for Node.js processes
   - Set up reverse proxy (nginx)
   - Configure SSL certificates

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review module-specific documentation
- Contact your team members

---

**Happy coding! 🎉** 