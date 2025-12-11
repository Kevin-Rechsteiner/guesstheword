# Word Guesser - Real-time Multiplayer Game

Ein React + WebSocket multiplayer Wort-Ratespiel mit Node.js Backend. Spieler treten Lobbies bei, der Host startet Runden mit progressiven Hinweisen und Scoring basierend auf Antwortgeschwindigkeit.

## Features

✅ **Real-time WebSocket Communication** - Echtzeit-Multiplayer-Gameplay
✅ **Lobby System** - Räume erstellen/beitreten mit eindeutigen Codes
✅ **Host Controls** - Der Host steuert Spielstart und Rundenablauf
✅ **Progressive Hints** - 4 Hinweise alle 15 Sekunden revealed (60s Round)
✅ **Dynamic Scoring** - 4/3/2/1 Punkte je nach Hint-Level
✅ **Live Scoreboard** - Echtzeit-Scores mit Ranking
✅ **Multi-Round Gameplay** - 3 Runden pro Spiel (konfigurierbar)
✅ **Responsive UI** - Mobile-freundliche Oberfläche
✅ **Production Ready** - Modularer Code, Error Handling, Config Management

## Architecture

```
Frontend (React/Vite)
├── LobbyScreen (Raum erstellen/beitreten)
├── WaitingScreen (Spieler-Liste, Host-Controls)
└── GameScreen (Hinten, Timer, Input, Scores)

Backend (Node.js/WebSocket)
├── GameManager (Raum-Verwaltung)
├── GameRoom (Spieler, Runden-Orchestrierung)
├── RoundManager (Timer, Hints, Scoring)
└── Word Database (20+ Wörter mit Hints)
```

## Installation & Setup

### 1. Repository klonen & Dependencies installieren
```bash
cd word_guesser
npm install
```

### 2. Environment konfigurieren
```bash
cp .env.example .env
# .env bearbeiten (optional):
# PORT=3001
# NODE_ENV=development
```

### 3. Development starten (Server + Client parallel)
```bash
npm run dev
```

Dies startet:
- **Server**: `http://localhost:3001` (WebSocket)
- **Client**: `http://localhost:5173` (React Dev Server)

### 4. Production bauen & starten
```bash
npm run build       # Baut React zu /dist
npm start          # Startet Server auf Port 3001
```

Der Server wird statische Assets von `/dist` servieren.

## Spielablauf

### 1. **Lobby-Phase**
```
Spieler A: "Neue Runde erstellen" 
  ➜ Erhält eindeutigen Room-Code (z.B. "ABC1")
  ➜ Wird Host

Spieler B: "Beitreten" + "ABC1"
  ➜ Tritt Raum bei, sieht Spieler-Liste
  ➜ Wartet auf Host
```

### 2. **Spiel-Start**
```
Host: "Spiel starten" Button
  ➜ Server startet Runde 1
  ➜ Wählt zufälliges Wort aus Wort-DB
  ➜ Sendet ersten Hinweis an alle Spieler
  ➜ Timer 60s startet
```

### 3. **Rund-Ablauf (60 Sekunden)**
```
Zeit  | Event
------|--------
0s    | Hint 1: "Large gray animal" (4 pts möglich)
15s   | Hint 2: "Has a long trunk" (3 pts möglich)
30s   | Hint 3: "Weighs several tons" (2 pts möglich)
45s   | Hint 4: "Lives in Africa and Asia" (1 pt möglich)
60s   | Runde endet automatisch
```

Wenn ein Spieler "ELEPHANT" errät:
- Bei Hint 1 (0-15s): **4 Punkte**
- Bei Hint 2 (15-30s): **3 Punkte**
- Bei Hint 3 (30-45s): **2 Punkte**
- Bei Hint 4 (45-60s): **1 Punkt**

Runde endet sofort wenn **alle** Spieler richtig geraten haben!

### 4. **Rundenende & Nächste Runde**
```
Host: "Nächste Runde" Button
  ➜ Scores persistieren
  ➜ Neue Word selection
  ➜ Spieler-Status resettet (guessed flag)
  ➜ Runde 2 startet
```

### 5. **Spiel-Ende**
```
Nach 3 Runden (konfigurierbar):
  ➜ Finale Scores angezeigt
  ➜ Gewinner 🥇🥈🥉
  ➜ "Neue Runde" führt zurück zu Lobby
```

## WebSocket Message Format

Alle Messages sind JSON mit folgendem Schema:
```json
{
  "type": "MESSAGE_TYPE",
  "payload": { /* data */ }
}
```

### Client → Server Messages

**CREATE_ROOM**
```json
{
  "type": "CREATE_ROOM",
  "payload": { "playerName": "Alice" }
}
```

**JOIN_ROOM**
```json
{
  "type": "JOIN_ROOM",
  "payload": { "roomId": "ABC1", "playerName": "Bob" }
}
```

**START_GAME** (Host only)
```json
{
  "type": "START_GAME",
  "payload": {}
}
```

**SUBMIT_GUESS**
```json
{
  "type": "SUBMIT_GUESS",
  "payload": { "guess": "ELEPHANT" }
}
```

**NEXT_ROUND** (Host only)
```json
{
  "type": "NEXT_ROUND",
  "payload": {}
}
```

### Server → Client Messages

**ROOM_CREATED**
```json
{
  "type": "ROOM_CREATED",
  "payload": {
    "roomId": "ABC1",
    "playerId": "client123",
    "playerName": "Alice"
  }
}
```

**ROOM_JOINED**
```json
{
  "type": "ROOM_JOINED",
  "payload": {
    "roomId": "ABC1",
    "playerId": "client456",
    "playerName": "Bob",
    "room": { /* full room state */ }
  }
}
```

**GAME_STARTED**
```json
{
  "type": "GAME_STARTED",
  "payload": { "room": { /* state */ } }
}
```

**NEW_ROUND**
```json
{
  "type": "NEW_ROUND",
  "payload": {
    "round": {
      "roundNumber": 1,
      "totalRounds": 3,
      "hints": ["Large gray animal"],
      "timeRemaining": 60
    },
    "room": { /* state */ }
  }
}
```

**CORRECT_GUESS**
```json
{
  "type": "CORRECT_GUESS",
  "payload": {
    "points": 4,
    "pointsReason": "Correct after hint 1!"
  }
}
```

**PLAYER_GUESSED_CORRECT** (Broadcast an alle)
```json
{
  "type": "PLAYER_GUESSED_CORRECT",
  "payload": {
    "playerId": "client456",
    "room": { /* updated state */ }
  }
}
```

**ROUND_END**
```json
{
  "type": "ROUND_END",
  "payload": { "room": { /* state */ } }
}
```

**GAME_OVER**
```json
{
  "type": "GAME_OVER",
  "payload": { "room": { /* final state */ } }
}
```

## Projekt-Struktur

```
word_guesser/
├── server/                          # Backend (Node.js)
│   └── src/
│       ├── index.js                # Server entry, WebSocket setup
│       ├── GameManager.js          # Room management
│       ├── GameRoom.js             # Single game room logic
│       ├── RoundManager.js         # Round timing & scoring
│       └── utils/
│           ├── wordList.js         # 20+ Wörter mit 4 Hints
│           └── config.js           # Konstanten
│
├── src/                             # Frontend (React)
│   ├── App.jsx                     # Main component
│   ├── index.jsx                   # React entry point
│   ├── hooks/
│   │   └── useWebSocket.js         # WebSocket abstraction
│   ├── pages/
│   │   ├── LobbyScreen.jsx         # Create/Join room
│   │   ├── WaitingScreen.jsx       # Player list, start game
│   │   └── GameScreen.jsx          # Main gameplay
│   ├── components/
│   │   ├── HintDisplay.jsx         # Shows hints
│   │   ├── Timer.jsx               # Countdown timer
│   │   ├── ScoreBoard.jsx          # Live scores
│   │   └── GuessInput.jsx          # Answer input
│   └── styles/
│       ├── global.css              # Global styles
│       ├── LobbyScreen.css
│       ├── WaitingScreen.css
│       ├── GameScreen.css
│       ├── HintDisplay.css
│       ├── Timer.css
│       ├── ScoreBoard.css
│       └── GuessInput.css
│
├── index.html                       # HTML shell
├── vite.config.js                  # Vite build config
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
└── README.md                       # This file
```

## Konfiguration

Bearbeite `server/src/utils/config.js` um Spieleinstellungen anzupassen:

```javascript
ROUND_DURATION: 60,        // Sekunden pro Runde
HINT_INTERVAL: 15,         // Sekunden zwischen Hinten
TOTAL_HINTS: 4,            // Anzahl Hinten
TOTAL_ROUNDS: 3,           // Runden pro Spiel
MAX_PLAYERS: 8,            // Max Spieler pro Raum
```

## API Endpoints (optional)

Der Server exponiert auch HTTP Endpoints für Debugging:

```bash
GET /api/health          # Health check
GET /api/stats          # Active rooms & players count
```

## Deployment

### Heroku Deploy
```bash
# Dockerfile erstellen
# Heroku config für PORT
git push heroku main
```

### DigitalOcean / AWS EC2
```bash
# SSH connection
npm install
npm run build
npm start

# Mit PM2 für production:
npm install -g pm2
pm2 start server/src/index.js --name "word-guesser"
pm2 save
pm2 startup
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## Troubleshooting

### WebSocket Verbindung schlägt fehl
```
✗ "WebSocket ist nicht verbunden"
→ Server läuft nicht auf :3001
→ Firewall blockiert WS-Port
→ Proxy-Probleme (CORS muss eingestellt sein)
```

### Spieler sehen Hinten nicht
```
→ Check RoundManager.scheduleHintReveals()
→ Browser Console auf Fehler prüfen
→ Server Logs anschauen (console.log)
```

### Runden starten nicht
```
→ Host ist nicht der Initator
→ Game ist bereits gestartet
→ Server-Status überprüfen
```

## Erweiterungsideen

- [ ] **Kategorien** - Wort-Kategorien (Animals, Sports, etc.)
- [ ] **Difficulty Levels** - Easy/Medium/Hard Hints
- [ ] **Statistics** - Win rates, Average scores
- [ ] **Chat** - In-Game Messaging
- [ ] **Custom Words** - Host kann eigene Wörter eingeben
- [ ] **Time Modes** - 30s / 90s Runden
- [ ] **Achievements** - Badges für Schnelligkeit
- [ ] **Leaderboards** - Globale Top Scores
- [ ] **Audio Hints** - Voice hints option
- [ ] **Social Sharing** - Scores teilen

## License

MIT

## Support

Bei Fragen oder Bugs:
1. Prüfe die Logs: `console.log` im Browser & Terminal
2. Prüfe WebSocket Verbindung: `ws://localhost:3001`
3. Starte Server & Client neu
4. Löschen Sie Browser-Cache (Strg+Shift+Del)

---

**Viel Spaß beim Spielen! 🎮**

