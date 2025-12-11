# Word Guesser - Documentation Index 📚

## 🎮 Quick Start (5 minutes)

Start here! Everything you need to get the game running.

**File:** [`QUICKSTART.md`](./QUICKSTART.md)

```bash
npm install                 # Install dependencies (done)
npm run client:build        # Build React app
npm start                   # Start server on http://localhost:3001
```

Then open **http://localhost:3001** in your browser! 🎉

---

## 📖 Main Documentation Files

### 1. **README.md** - Full Documentation
Complete guide with all details:
- Features overview
- Installation & setup
- Game rules & scoring
- WebSocket protocol
- API endpoints
- Configuration options
- Deployment guide
- Troubleshooting
- **Perfect for:** Complete understanding, reference

### 2. **QUICKSTART.md** - Quick Reference
Abbreviated guide for quick lookup:
- Installation (quick)
- Project structure
- Features overview
- Game flow
- WebSocket messages (summary)
- Configuration
- Quick troubleshooting
- **Perfect for:** Quick answers, copy-paste commands

### 3. **ARCHITECTURE.md** - Technical Deep Dive
Visual diagrams and data structures:
- System architecture diagram
- WebSocket message flow
- Round timeline
- Game state transitions
- Data models (Room, Round, PublicState)
- Component lifecycle
- Broadcast pattern
- **Perfect for:** Understanding how it works, debugging

### 4. **TESTING.md** - Testing & Debugging
How to test and troubleshoot:
- How to run (development vs production)
- 6 detailed testing scenarios
- Debugging guide (DevTools, console, logs)
- Server health checks
- Specific test cases
- Mobile testing
- Security notes
- Performance metrics
- **Perfect for:** Testing, debugging, optimization

### 5. **CHECKLIST.md** - Implementation Status
Complete checklist of all features:
- ✅ All backend components
- ✅ All frontend components
- ✅ Styling & responsive
- ✅ Build & configuration
- ✅ WebSocket protocol
- ✅ Game logic
- ✅ Documentation
- ✅ Deployment support
- Testing checklist
- **Perfect for:** Verifying all features are implemented

---

## 🏗️ Architecture & Code Structure

### Backend (`server/src/`)
```
index.js              WebSocket server entry point
GameManager.js        Manages all game rooms
GameRoom.js          Single game session logic
RoundManager.js      Timer, hints, scoring
utils/
  ├── wordList.js    20+ words with hints
  └── config.js      Game constants
```

**Key Files to Understand:**
1. Read: `GameManager.js` - Room lifecycle
2. Read: `GameRoom.js` - Game mechanics
3. Read: `RoundManager.js` - Timer & scoring

### Frontend (`src/`)
```
App.jsx              Main component & router
index.jsx            React entry point
pages/
  ├── LobbyScreen.jsx      Create/join room
  ├── WaitingScreen.jsx    Player list
  └── GameScreen.jsx       Gameplay UI
components/
  ├── HintDisplay.jsx      Hints
  ├── Timer.jsx           Countdown
  ├── ScoreBoard.jsx      Scores
  └── GuessInput.jsx      Input field
hooks/
  └── useWebSocket.js     WebSocket abstraction
styles/
  └── *.css              Styling
```

**Key Files to Understand:**
1. Read: `App.jsx` - Global state & routing
2. Read: `GameScreen.jsx` - Game UI
3. Read: `useWebSocket.js` - WebSocket management

---

## 🚀 Getting Started (Step-by-Step)

### Step 1: Run the Server
```bash
cd C:\Users\kevin\WebstormProjects\word_guesser
npm start
# Output: Server running on http://localhost:3001
```

### Step 2: Open in Browser
```
http://localhost:3001
```

### Step 3: Create Game
- Click "Neue Runde erstellen"
- Enter your name
- Get room code (e.g., "ABC1")

### Step 4: Invite Friends
- Share room code "ABC1"
- Friends click "Runde beitreten"
- Enter same code

### Step 5: Play!
- Host clicks "Spiel starten"
- Guess the word using hints
- Score points based on speed
- Play 3 rounds
- Celebrate winner! 🎉

---

## 🎮 Game Rules

### Objective
Guess the word faster than other players!

### Scoring
```
Guess after Hint 1 (0-15s)  → 4 points
Guess after Hint 2 (15-30s) → 3 points
Guess after Hint 3 (30-45s) → 2 points
Guess after Hint 4 (45-60s) → 1 point
```

### Rounds
- 3 rounds per game (configurable)
- Each round: 60 seconds
- New hints every 15 seconds
- Round ends early if all guess correctly

### Winner
Highest total score after 3 rounds!

---

## 📊 Development vs Production

### Development Mode
```bash
npm run dev
# Runs both server and client
# Server: http://localhost:3001
# Client: http://localhost:5173 (with HMR)
# Good for: Development, hot reload
```

### Production Mode
```bash
npm run client:build    # Build React
npm start              # Start server
# Browser: http://localhost:3001
# Good for: Real testing, deployment
```

---

## 🔗 WebSocket Events

### Client Sends
- `CREATE_ROOM` - Create game
- `JOIN_ROOM` - Join existing game
- `START_GAME` - Start game (host)
- `SUBMIT_GUESS` - Send answer
- `NEXT_ROUND` - Go to next round (host)

### Server Sends
- `ROOM_CREATED` - Room created
- `ROOM_JOINED` - You joined
- `GAME_STARTED` - Game started
- `NEW_ROUND` - Round started with hints
- `CORRECT_GUESS` - You guessed right!
- `PLAYER_GUESSED_CORRECT` - Someone guessed
- `ROUND_END` - Round finished
- `GAME_OVER` - Game finished

**See:** `README.md` for full message examples

---

## 🐛 Common Issues & Solutions

### Issue: "WebSocket is not connected"
**Solution:** Start server with `npm start`

### Issue: Port 3001 already in use
**Solution:** Change PORT in `.env` or kill process

### Issue: Build fails
**Solution:** `npm install` then `npm run client:build`

### Issue: Hints don't appear
**Solution:** Wait 15 seconds, check browser console for errors

### Issue: Can't join room
**Solution:** Check room code is correct (4 chars, uppercase)

**See:** `TESTING.md` for full troubleshooting guide

---

## 📁 File Organization

```
word_guesser/
├── README.md               ← Full documentation
├── QUICKSTART.md           ← Quick start (read this first!)
├── ARCHITECTURE.md         ← Architecture diagrams
├── TESTING.md              ← Testing & debugging
├── CHECKLIST.md            ← Implementation status
│
├── server/
│   └── src/
│       ├── index.js        ← Server entry
│       ├── GameManager.js  ← Room management
│       ├── GameRoom.js     ← Game logic
│       ├── RoundManager.js ← Timer & scoring
│       └── utils/
│           ├── wordList.js ← 20+ words
│           └── config.js   ← Constants
│
├── src/
│   ├── App.jsx             ← Main component
│   ├── pages/              ← Screen components
│   ├── components/         ← UI components
│   ├── hooks/              ← Custom hooks
│   └── styles/             ← CSS files
│
├── dist/                   ← Built React app
├── package.json            ← Dependencies
├── vite.config.js          ← Build config
├── Dockerfile              ← Docker setup
└── .env                    ← Environment vars
```

---

## 🎓 Learning Path

### Beginner
1. Read: `QUICKSTART.md` (5 min)
2. Run: `npm start` (1 min)
3. Play: One full game (10 min)

### Intermediate
1. Read: `README.md` Game Ablauf section (5 min)
2. Read: `ARCHITECTURE.md` - Understand components (10 min)
3. Read: `server/src/GameRoom.js` - Game logic (5 min)

### Advanced
1. Read: `ARCHITECTURE.md` - Full diagrams (15 min)
2. Read: `src/App.jsx` - State management (10 min)
3. Read: `server/src/index.js` - WebSocket handling (10 min)
4. Run: `npm run dev` and use DevTools (15 min)

---

## 🚀 Deployment

### Quick Deploy (local)
```bash
npm run client:build
npm start
```

### Docker Deploy
```bash
docker build -t word-guesser .
docker run -p 3001:3001 word-guesser
```

### Cloud Deploy (Heroku, AWS, etc.)
See `README.md` - Deployment section

---

## 📞 Getting Help

### Check Console
```
Browser: F12 → Console (check for errors)
Terminal: Watch server logs
```

### Read Documentation
1. Check `TESTING.md` for specific issue
2. Check `README.md` for more context
3. Check `ARCHITECTURE.md` for how things work

### Debug with DevTools
```
F12 → Network → WS filter
Watch WebSocket messages sent/received
```

---

## 🌟 Highlights

### What's Implemented
✅ Real-time WebSocket multiplayer
✅ Lobby with room codes
✅ Progressive hint reveals
✅ Dynamic scoring system
✅ Live scoreboards
✅ Multi-round gameplay
✅ Responsive mobile design
✅ Production-ready build
✅ Complete documentation

### Tech Stack
- **Backend:** Node.js, Express, WebSocket (ws)
- **Frontend:** React, Vite
- **Styling:** CSS3 (gradients, animations)
- **Build:** Vite, npm scripts
- **Deployment:** Docker-ready, standalone executable

---

## 📈 Next Steps (Optional)

### Add Features
- [ ] Sound effects
- [ ] Difficulty levels
- [ ] Custom word categories
- [ ] Leaderboards
- [ ] Chat system
- [ ] Game statistics

### Improve Performance
- [ ] Redis for scalability
- [ ] Database for persistence
- [ ] Rate limiting
- [ ] Authentication

### Deploy
- [ ] Heroku deploy
- [ ] AWS/DigitalOcean VPS
- [ ] Docker containerization
- [ ] Domain setup

---

## 📋 File Guide

| File | Purpose | Read Time |
|------|---------|-----------|
| QUICKSTART.md | Get started fast | 5 min |
| README.md | Complete reference | 20 min |
| ARCHITECTURE.md | Technical details | 15 min |
| TESTING.md | Testing & debug | 10 min |
| CHECKLIST.md | Feature status | 5 min |
| server/src/GameRoom.js | Game logic | 10 min |
| src/App.jsx | State management | 10 min |

---

## ✨ You're All Set!

Everything is implemented and ready to go!

**Quick Start:**
```bash
npm start                           # Start server
# Open http://localhost:3001        # Play!
```

**Questions?** Check the relevant documentation file above.

**Happy gaming! 🎮✨**

---

**Last Updated:** 2025-12-11
**Status:** ✅ Complete & Production Ready

