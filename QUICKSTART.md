# Word Guesser - Quick Start Guide 🎮

## Installation & Starten

### 1. Dependencies installieren (bereits geschehen)
```bash
npm install
```

### 2. React Client bauen
```bash
npm run client:build
```

### 3. Server starten
```bash
npm run server
```
Server läuft auf: `http://localhost:3001`

### 4. Im Browser öffnen
Öffne `http://localhost:3001` in deinem Browser

---

## Development Modus (Server + Client parallel)
```bash
npm run dev
```

Dies startet:
- **Server** (WebSocket): `http://localhost:3001`
- **Client** (Vite Dev Server): `http://localhost:5173`

---

## Projektstruktur

```
word_guesser/
├── server/src/               # Node.js WebSocket Server
│   ├── index.js             # Server Entry Point
│   ├── GameManager.js       # Raum-Verwaltung
│   ├── GameRoom.js          # Game Session Logic
│   ├── RoundManager.js      # Timer, Hints, Scoring
│   └── utils/
│       ├── wordList.js      # 20+ Wörter mit Hints
│       └── config.js        # Konstanten
│
├── src/                     # React Frontend
│   ├── App.jsx             # Main Component
│   ├── pages/              # Page Components
│   │   ├── LobbyScreen.jsx     # Create/Join Room
│   │   ├── WaitingScreen.jsx   # Player List
│   │   └── GameScreen.jsx      # Gameplay
│   ├── components/         # UI Components
│   │   ├── HintDisplay.jsx
│   │   ├── Timer.jsx
│   │   ├── ScoreBoard.jsx
│   │   └── GuessInput.jsx
│   ├── hooks/
│   │   └── useWebSocket.js
│   └── styles/
│       └── *.css
│
├── dist/                   # Built React App (Production)
├── .env                    # Environment Variables
├── package.json            # Dependencies
└── README.md              # Full Documentation
```

---

## Features Übersicht

✅ **Real-time WebSocket** - Echtzeit-Multiplayer  
✅ **Lobby System** - Räume mit 4-stelligen Codes  
✅ **Progressive Hints** - 4 Hints à 15 Sekunden  
✅ **Dynamic Scoring** - 4/3/2/1 Punkte je Hint-Level  
✅ **Live Scoreboard** - Ranking Updates in Echtzeit  
✅ **Multi-Round** - 3 Runden pro Spiel  
✅ **Responsive UI** - Mobile-friendly  

---

## Gameplay-Ablauf

### Phase 1: Lobby
```
Spieler A: "Neue Runde erstellen"
  → Erhält Code (z.B. "ABC1")
  → Wird Host

Spieler B: "Beitreten" + "ABC1"
  → Sieht Spieler-Liste
```

### Phase 2: Game Start
```
Host: "Spiel starten"
  → Server wählt Wort
  → Hint 1 wird angezeigt
  → 60s Timer startet
```

### Phase 3: Hints Reveal (60s)
```
0s   → Hint 1 (4 Punkte möglich)
15s  → Hint 2 (3 Punkte möglich)
30s  → Hint 3 (2 Punkte möglich)
45s  → Hint 4 (1 Punkt möglich)
60s  → Runde endet
```

### Phase 4: Scoring
```
Spieler errät "ELEPHANT"
- Bei Hint 1: 4 Punkte ✓
- Bei Hint 2: 3 Punkte ✓
- Bei Hint 3: 2 Punkte ✓
- Bei Hint 4: 1 Punkt ✓

Runde endet sofort wenn alle erraten haben!
```

### Phase 5: Nächste Runde oder Game Over
```
Nach Runde 1, 2: Host klickt "Nächste Runde"
Nach Runde 3: Finale Scores mit Gewinner 🥇
```

---

## WebSocket Messages

Alle Messages sind JSON-Format mit `type` und `payload`.

### Client → Server

**CREATE_ROOM**
```json
{ "type": "CREATE_ROOM", "payload": { "playerName": "Alice" } }
```

**JOIN_ROOM**
```json
{ "type": "JOIN_ROOM", "payload": { "roomId": "ABC1", "playerName": "Bob" } }
```

**START_GAME** (Host only)
```json
{ "type": "START_GAME", "payload": {} }
```

**SUBMIT_GUESS**
```json
{ "type": "SUBMIT_GUESS", "payload": { "guess": "ELEPHANT" } }
```

**NEXT_ROUND** (Host only)
```json
{ "type": "NEXT_ROUND", "payload": {} }
```

### Server → Client

**ROOM_CREATED**
```json
{
  "type": "ROOM_CREATED",
  "payload": { "roomId": "ABC1", "playerId": "...", "playerName": "Alice" }
}
```

**GAME_STARTED**
```json
{
  "type": "GAME_STARTED",
  "payload": { "room": { /* room state */ } }
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

**GAME_OVER**
```json
{
  "type": "GAME_OVER",
  "payload": { "room": { /* final scores */ } }
}
```

---

## Konfiguration

Bearbeite `server/src/utils/config.js`:

```javascript
ROUND_DURATION: 60,      // Sekunden pro Runde
HINT_INTERVAL: 15,       // Sekunden zwischen Hints
TOTAL_ROUNDS: 3,         // Runden pro Spiel
MAX_PLAYERS: 8,          // Max Spieler pro Raum
```

---

## Wörter hinzufügen

Bearbeite `server/src/utils/wordList.js`:

```javascript
{
  word: 'ELEPHANT',
  hints: [
    'Large gray animal',      // Hint 1 (schwierig)
    'Has a long trunk',       // Hint 2
    'Weighs several tons',    // Hint 3
    'Lives in Africa/Asia'    // Hint 4 (leicht)
  ]
}
```

---

## Troubleshooting

### Server startet nicht
```
Error: Cannot find module 'express'
→ npm install
→ npm run server
```

### Client-Build schlägt fehl
```
Error: Could not resolve './...'
→ Überprüfe Import-Pfade in .jsx Dateien
→ npm run client:build
```

### WebSocket Verbindung fehlgeschlagen
```
✗ WebSocket is not connected
→ Server läuft nicht (npm run server)
→ Port 3001 ist blockiert
→ Firewall/Proxy-Probleme
```

### Browser zeigt blank page
```
→ Öffne Developer Console (F12)
→ Überprüfe auf JavaScript Errors
→ Starte Browser neu, Cache leeren
```

---

## Nächste Schritte (Optional)

- [ ] **Difficulty Levels** - Easy/Medium/Hard Hints
- [ ] **Custom Words** - Host kann Wörter eingeben
- [ ] **Leaderboards** - Globale Top Scores
- [ ] **Chat** - In-game messaging
- [ ] **Audio** - Sound Effects & Hint Voice
- [ ] **Statistics** - Win rates, Analytics
- [ ] **Categories** - Wort-Kategorien filtern

---

## Production Deploy

### Mit npm start
```bash
npm run client:build  # Baue React
npm start            # Starte Server auf Port 3001
```

### Mit Docker
```bash
docker build -t word-guesser .
docker run -p 3001:3001 word-guesser
```

### Mit PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start server/src/index.js --name "word-guesser"
pm2 save
pm2 startup
```

### Mit Heroku
```bash
heroku create word-guesser-app
git push heroku main
```

---

**Viel Spaß beim Spielen! 🎮✨**

