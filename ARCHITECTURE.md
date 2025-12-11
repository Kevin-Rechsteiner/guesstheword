# Word Guesser - Architecture & Flow Diagrams

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (React)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   App.jsx (Router)                    │   │
│  │  - Screen Management (lobby/waiting/game)            │   │
│  │  - WebSocket Event Handler                           │   │
│  │  - Global State                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                  │
│           ┌────────────────┼────────────────┐               │
│           ▼                ▼                ▼               │
│    ┌────────────┐   ┌────────────┐   ┌──────────┐          │
│    │ LobbyScreen│   │WaitingScr..│   │GameScreen│          │
│    └────────────┘   └────────────┘   └──────────┘          │
│           │                │                │               │
│           └────────────────┼────────────────┘               │
│                            │                                │
│           ┌────────────────┴────────────────┐              │
│           ▼                                  ▼              │
│    ┌─────────────────────┐    ┌──────────────────────┐    │
│    │  UI Components      │    │  useWebSocket Hook   │    │
│    │ ・HintDisplay       │    │ ・Connection Mgmt    │    │
│    │ ・Timer            │    │ ・Message Handler    │    │
│    │ ・ScoreBoard       │    │ ・Auto-Reconnect     │    │
│    │ ・GuessInput       │    │ ・sendMessage()      │    │
│    └─────────────────────┘    └──────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                         ▲
                         │ WebSocket
                         │ (ws://localhost:3001)
                         │
┌─────────────────────────────────────────────────────────────┐
│                    SERVER LAYER (Node.js)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            index.js (Express + WebSocket)             │   │
│  │  - HTTP Server on port 3001                          │   │
│  │  - WebSocket upgrade handler                         │   │
│  │  - Message routing                                   │   │
│  │  - CORS enabled                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                  │
│           ┌────────────────┴────────────────┐               │
│           ▼                                  ▼               │
│  ┌──────────────────┐           ┌───────────────────┐       │
│  │  GameManager     │           │ WebSocket Handler │       │
│  │ ・createRoom()   │◄──────────│ ・onMessage()    │       │
│  │ ・addPlayer()    │           │ ・onClose()       │       │
│  │ ・removePlayer() │           │ ・onError()       │       │
│  │ ・getRoom()      │           └───────────────────┘       │
│  │ ・broadcastTo... │                                        │
│  └──────┬───────────┘                                        │
│         │                                                    │
│         │ manages                                           │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  GameRoom(s) - Map<roomId, GameRoom>                  │   │
│  │                                                       │   │
│  │  Each Room:                                          │   │
│  │  ・Players Map (id → {name, score, guessed})         │   │
│  │  ・Current Round                                     │   │
│  │  ・RoundManager instance                            │   │
│  │  ・hostId, gameStarted flag                         │   │
│  │                                                       │   │
│  │  Methods:                                            │   │
│  │  ・startGame()      → initializes round              │   │
│  │  ・startNextRound() → picks word, resets players     │   │
│  │  ・submitGuess()    → validates & scores             │   │
│  │  ・isRoundComplete()→ checks if done                 │   │
│  │  ・getPublicState() → sends to clients               │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                    │
│         │ contains                                         │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  RoundManager - Manages individual round              │   │
│  │                                                       │   │
│  │  Properties:                                         │   │
│  │  ・word (current answer)                            │   │
│  │  ・hints (array of 4)                               │   │
│  │  ・startTime, endTime (60s)                         │   │
│  │  ・currentHintIndex (0-3)                           │   │
│  │  ・revealedHints (progressive)                      │   │
│  │  ・hintIntervals (timers)                           │   │
│  │                                                       │   │
│  │  Methods:                                            │   │
│  │  ・scheduleHintReveals() → setTimeout @ 15s intervals │   │
│  │  ・checkGuess()          → compare with word         │   │
│  │  ・calculatePoints()     → based on hint level       │   │
│  │  ・getTimeRemaining()    → seconds left              │   │
│  │  ・isTimeExpired()       → check if 60s passed       │   │
│  │  ・stop()                → clear timers              │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WORD_LIST (wordList.js)                              │   │
│  │  Array of word objects:                              │   │
│  │  [{                                                   │   │
│  │    word: 'ELEPHANT',                                 │   │
│  │    hints: [                                          │   │
│  │      'Large gray animal',        // Hint 1 (4 pts)   │   │
│  │      'Has a long trunk',         // Hint 2 (3 pts)   │   │
│  │      'Weighs several tons',      // Hint 3 (2 pts)   │   │
│  │      'Lives in Africa and Asia'  // Hint 4 (1 pt)    │   │
│  │    ]                                                 │   │
│  │  }, ...]                                             │   │
│  │  Total: 20+ words                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 WebSocket Message Flow

```
CLIENT                              SERVER
  │                                   │
  │  ─────── CREATE_ROOM ────────>   │
  │  {playerName: "Alice"}            │
  │                                   │
  │  <────── ROOM_CREATED ─────────   │
  │  {roomId: "ABC1", playerId: "..."}│
  │                                   │
  │  (shares room code "ABC1")        │
  │                                   │
  │  ◄── [Player 2 joins via WS] ──► │
  │                                   │
  │  <──── PLAYER_JOINED ────────────  │
  │  {room: {...}, players: [A, B]}   │
  │                                   │
  │  ─────── START_GAME ────────────> │
  │                                   │ [GameRoom.startGame()]
  │                                   │ [RoundManager created]
  │  <───── NEW_ROUND ──────────────  │
  │  {                                │
  │    hints: ["Hint 1"],             │
  │    timeRemaining: 60              │
  │  }                                │
  │                                   │
  │  [Timer starts 60→59→58...]       │
  │                                   │
  │  [After 15s, server reveals Hint 2]
  │  <────── HINT_UPDATE ─────────── │
  │  {hints: ["Hint 1", "Hint 2"]}    │
  │                                   │
  │  ─ SUBMIT_GUESS: "ELEPHANT" ────> │
  │                                   │ [Validates guess]
  │  <──── CORRECT_GUESS ───────────  │
  │  {                                │
  │    points: 3,                     │
  │    pointsReason: "After hint 2!"  │
  │  }                                │
  │                                   │
  │  <─ PLAYER_GUESSED_CORRECT ───── │ (broadcast to all)
  │  {playerId: "...", room: {...}}   │
  │                                   │
  │  [If all guessed or time expired] │
  │  <───── ROUND_END ──────────────  │
  │  {room: {...with scores}}         │
  │                                   │
  │  ─────── NEXT_ROUND ────────────> │
  │                                   │ [New word selected]
  │  <───── NEW_ROUND ──────────────  │
  │  {hints: ["Hint 1"], ...}         │
  │                                   │
  │  [Repeat for rounds 2 & 3]        │
  │                                   │
  │  <───── GAME_OVER ──────────────  │
  │  {room: {finalScores}}            │
  │  🥇 Alice: 12 points              │
  │  🥈 Bob: 8 points                 │
  │                                   │
```

---

## ⏱️ Round Timeline (60 seconds)

```
Time │ Server Action          │ Client Display
─────┼────────────────────────┼──────────────────────────────
 0s  │ NEW_ROUND sent         │ Hint 1 appears: "Large gray..."
     │ Timer starts           │ Timer: 60 sec
 5s  │                        │ Timer: 55 sec
10s  │                        │ Timer: 50 sec
15s  │ Hint 2 revealed        │ Hint 2 appears: "Has a long..."
     │ HINT_UPDATE sent       │ Timer: 45 sec
20s  │                        │ Timer: 40 sec
30s  │ Hint 3 revealed        │ Hint 3 appears: "Weighs tons..."
     │ HINT_UPDATE sent       │ Timer: 30 sec
40s  │                        │ Timer: 20 sec
45s  │ Hint 4 revealed        │ Hint 4 appears: "Africa/Asia"
     │ HINT_UPDATE sent       │ Timer: 15 sec
50s  │                        │ Timer: 10 sec
55s  │                        │ Timer: 5 sec (pulse animation)
60s  │ isTimeExpired() = true │ Timer: 0 sec
     │ ROUND_END sent         │ Round complete message
```

---

## 🎯 Game State Transitions

```
┌─────────────┐
│  LOBBY      │  (Player creates/joins room)
└──────┬──────┘
       │
       │ host.startGame()
       │
       ▼
┌──────────────────────────────────────┐
│  WAITING_FOR_GAME_START              │  (All in room, waiting)
│  - Players visible                    │
│  - Only host sees START button        │
└──────┬───────────────────────────────┘
       │
       │ GameManager.createRoom() + getPublicState()
       │
       ▼
┌──────────────────────────────────────┐
│  GAME_IN_PROGRESS                    │  (Playing rounds)
│  - Screen: GameScreen                │
│  - Timer: 60s countdown              │
│  - Hints: Progressive reveal         │
│  - Current: ROUND 1/3                │
└──────┬───────────────────────────────┘
       │
       │ isRoundComplete()
       │ ├─ all players guessed OR
       │ └─ time expired (60s)
       │
       ▼
┌──────────────────────────────────────┐
│  ROUND_COMPLETE                      │  (Show results)
│  - Screen: WaitingScreen             │
│  - Display: Round scores             │
│  - Host sees: NEXT_ROUND button      │
│  - Waiting for host action           │
└──────┬───────────────────────────────┘
       │
       │ If currentRound < totalRounds
       │ host.nextRound()
       │
       ├─ Yes ─> back to GAME_IN_PROGRESS (ROUND 2)
       │
       └─ No (ROUND 3 complete)
              │
              ▼
         ┌──────────────────────────────────────┐
         │  GAME_OVER                           │  (Final results)
         │  - Screen: WaitingScreen             │
         │  - Display: Final scores + Winner   │
         │  - Host sees: NEW_GAME button        │
         └──────────────────────────────────────┘
```

---

## 💾 Data Models

### Room Data Structure
```javascript
{
  roomId: "ABC1",                    // 4-char unique code
  hostId: "client123",               // Player ID of host
  gameStarted: false,                // Game state
  currentRound: 0,                   // 1-3
  totalRounds: 3,                    // Configuration
  players: Map {
    "client123" -> {
      id: "client123",
      name: "Alice",
      score: 8,                      // Accumulated score
      guessed: false,                // This round?
      ws: WebSocket                  // Connection
    },
    "client456" -> {
      id: "client456",
      name: "Bob",
      score: 5,
      guessed: true,
      ws: WebSocket
    }
  },
  roundManager: RoundManager         // Current round data
}
```

### Round Data Structure
```javascript
{
  roundNumber: 1,
  word: "ELEPHANT",                  // Hidden from client
  hints: [
    "Large gray animal",             // Revealed immediately
    "Has a long trunk",              // Revealed at 15s
    "Weighs several tons",           // Revealed at 30s
    "Lives in Africa and Asia"       // Revealed at 45s
  ],
  duration: 60,                      // seconds
  startTime: 1699999999999,          // timestamp
  endTime: 1700000059999,            // timestamp
  currentHintIndex: 0,               // 0-3
  revealedHints: ["Large gray..."],  // What client sees
  hintIntervals: [123, 456, 789],    // Timer IDs
  revealSchedule: [15, 30, 45]       // Seconds
}
```

### Public State Sent to Client
```javascript
{
  roomId: "ABC1",
  hostId: "client123",
  gameStarted: true,
  currentRound: 1,
  totalRounds: 3,
  players: [
    { id: "...", name: "Alice", score: 8, guessed: false },
    { id: "...", name: "Bob", score: 5, guessed: true }
  ],
  hints: ["Large gray animal", "Has a long trunk"],  // Only revealed
  timeRemaining: 42  // seconds
}
```

---

## 🔄 Component Lifecycle

```
App.jsx
├─ useEffect: onMount
│  └─ useWebSocket Hook setup
│     ├─ Creates WebSocket connection
│     └─ Sets connected = true
│
├─ useEffect: WebSocket messages
│  └─ ws.addEventListener('message')
│     ├─ ROOM_CREATED → setState & setScreen('waiting')
│     ├─ GAME_STARTED → setState & setScreen('game')
│     ├─ NEW_ROUND → setState
│     ├─ PLAYER_GUESSED_CORRECT → setState
│     └─ GAME_OVER → setState & setScreen('waiting')
│
└─ Conditional Render
   ├─ if (!connected) → Connecting spinner
   ├─ if (screen === 'lobby') → LobbyScreen
   ├─ if (screen === 'waiting') → WaitingScreen
   └─ if (screen === 'game') → GameScreen
```

---

## 📡 Broadcast Pattern

```
ClientA submits guess
  │
  ▼
Server validates
  │
  ├─ Correct?
  │  │
  │  └─ Yes
  │     │
  │     ▼
  │  broadcastToRoom("PLAYER_GUESSED_CORRECT")
  │     │
  │     ├─> ClientA: CORRECT_GUESS (direct)
  │     ├─> ClientB: PLAYER_GUESSED_CORRECT (broadcast)
  │     ├─> ClientC: PLAYER_GUESSED_CORRECT (broadcast)
  │     └─> ClientD: PLAYER_GUESSED_CORRECT (broadcast)
  │
  └─ No
     │
     └─> ClientA: INCORRECT_GUESS (direct)
```

---

**Complete architecture documented! 🏗️**

