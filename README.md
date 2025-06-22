# 🗣️ Eloquence.AI — Real-Time Public Speaking Feedback & Elo Trainer

## 🎯 Mission
Build a web application that helps users improve their public speaking through **real-time multimodal feedback**. It simulates audience reactions and uses **AI agents** to analyze **voice, facial expressions, and body language**, providing actionable critiques and performance scoring (ELO-style).

## 🏗️ Project Structure

```
eloquence-ai/
├── voice-ai/           # Person A: Voice + Speech AI
├── vision-ai/          # Person B: Facial Expression + Gesture Recognition  
├── game-ui/            # Person C: Game Loop, Elo Scoring, UI
├── shared/             # Shared utilities and schemas
└── docs/              # Documentation and integration guides
```

## 🧩 MVP Modules

### 🔊 Voice + Speech AI (Person A)
- Real-time transcription using OpenAI Whisper/Vapi API
- Tone analysis and filler word detection
- Speech pace and rhythm analysis
- AI-generated structured feedback using Claude/GPT-4
- **Output**: JSON with speech stats + feedback + emotion score

### 🎥 Facial Expression + Gesture Recognition (Person B)
- Webcam-based computer vision analysis
- Eye contact and gaze estimation
- Facial emotion detection (confidence, engagement)
- Body posture and hand gesture recognition
- **Output**: JSON with timestamps, gestures/emotions, posture score

### 🎮 Game Loop, Elo Scoring, UI (Person C)
- Interactive frontend with mock audience reactions
- Real-time feedback display panel
- Elo-style ranking system
- Performance history and progress tracking
- **Output**: Frontend MVP with UI integration and scoring logic

## 🛠️ Tech Stack

### AI & ML
- **Voice**: OpenAI Whisper, Vapi API
- **LLM**: Claude 3.5 Sonnet, GPT-4o
- **Computer Vision**: MediaPipe, TensorFlow.js, OpenCV
- **Vector DB**: Pinecone/Weaviate (optional)

### Frontend & Backend
- **Framework**: Next.js + Tailwind CSS
- **Real-time**: WebRTC, WebSocket
- **Agent Orchestration**: LangGraph (optional)
- **Fast Inference**: Groq (optional)

## 🚀 Quick Start

1. **Clone and setup modules:**
   ```bash
   git clone <repo-url>
   cd eloquence-ai
   ```

2. **Setup each module:**
   ```bash
   # Voice AI Module
   cd voice-ai && npm install
   
   # Vision AI Module  
   cd ../vision-ai && npm install
   
   # Game UI Module
   cd ../game-ui && npm install
   ```

3. **Environment Setup:**
   ```bash
   # Copy example env files
   cp voice-ai/env.example voice-ai/.env
   cp vision-ai/env.example vision-ai/.env
   cp game-ui/env.example game-ui/.env
   ```

4. **Start development:**
   ```bash
   # Terminal 1: Voice AI
   cd voice-ai && npm run dev
   
   # Terminal 2: Vision AI
   cd vision-ai && npm run dev
   
   # Terminal 3: Game UI
   cd game-ui && npm run dev
   ```

## 🎯 Prize Track Targets

- ✅ **Creativity**: Multimodal, Elo-style gamified public speaking
- ✅ **Productivity**: Makes users better communicators  
- ✅ **Voice AI (Vapi)**: Real-time voice transcription
- ✅ **Multimodal Agent (Unify)**: Vision + voice + LLM
- ✅ **Claude (Anthropic)**: Empathy-based feedback
- ✅ **LLM Agent (Nobel Era)**: Feedback + rebuttal generation

## 📋 Development Checklist

- [ ] Each teammate clones repo + sets up subfolder for their module
- [ ] Start local JSON schema for feedback format (voice + visual)
- [ ] Schedule mid-build integration checkpoint
- [ ] Implement real-time data flow between modules
- [ ] Create unified scoring system
- [ ] Add audience reaction simulation
- [ ] Implement Elo ranking algorithm
- [ ] Add performance analytics dashboard

## 🤝 Integration Points

### Data Flow
```
Voice AI → JSON Feedback → Game UI
Vision AI → JSON Feedback → Game UI
Game UI → Elo Score → Performance History
```

### Shared Schemas
- Speech feedback format
- Visual feedback format  
- Performance scoring metrics
- Elo ranking data structure

## 📞 Team Communication

- **Daily Standups**: 9 AM PST
- **Integration Checkpoints**: Every 2 days
- **Final Demo Prep**: Day before submission

## 🎯 Next Steps for Your Team

1. **Each person should clone the repo** and work on their assigned module
2. **Set up API keys** for OpenAI and Anthropic
3. **Test the basic functionality** using the provided scripts
4. **Implement missing components** (some service files need completion)
5. **Add real-time audio/video capture** in the Game UI
6. **Test the complete integration** between all modules

---

*Built with ❤️ for Cal Hacks 2024* 