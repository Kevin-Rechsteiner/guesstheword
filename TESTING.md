# Word Guesser - Testing & Troubleshooting Guide

## 🚀 How to Run

### Quick Start (Production)
```bash
cd C:\Users\kevin\WebstormProjects\word_guesser
npm run client:build    # Build React if not already done
npm start              # Start server on port 3001
```

Then open: **http://localhost:3001**

### Development Mode
```bash
npm run dev
# Opens both Server and Client
# Server: http://localhost:3001
# Client (HMR): http://localhost:5173
```

---

## 🧪 Testing Scenarios

### Test 1: Basic Game Flow
```
1. Open http://localhost:3001
2. Click "Neue Runde erstellen"
3. Enter name "Player 1"
4. Share room code with friend
5. Friend clicks "Runde beitreten"
6. Friend enters same room code
7. Friend can see Player 1 in list
8. Player 1 clicks "Spiel starten"
9. Both see hints and timer
10. Both can submit guesses
11. Correct guess shows points
12. After round: "Nächste Runde"
13. After 3 rounds: Final scores
```

### Test 2: Multiple Players
```
Open 3 tabs:
- Tab A: Create room
- Tab B: Join same room
- Tab C: Join same room

Check:
✓ All see each other in waiting screen
✓ Only host (Tab A) sees start button
✓ When host starts, all get new_round
✓ Hints appear for all at same time
✓ Scores update when someone guesses
```

### Test 3: Hint Timing
```
1. Start game
2. Watch timer countdown
3. At 0s: Hint 1 appears (4 pts)
4. At 15s: Hint 2 appears (3 pts)
5. At 30s: Hint 3 appears (2 pts)
6. At 45s: Hint 4 appears (1 pt)

Verify timestamps match!
```

### Test 4: Scoring
```
Player 1: Guess after 10s (Hint 1 visible) = 4 pts ✓
Player 2: Guess after 20s (Hint 2 visible) = 3 pts ✓
Player 3: Guess after 40s (Hint 3 visible) = 2 pts ✓
Player 4: Guess after 50s (Hint 4 visible) = 1 pt  ✓

Scores persist across rounds
```

### Test 5: Early Round End
```
1. Start game with 2 players
2. Both guess correctly
3. Round should end immediately
4. Even if timer hasn't expired
5. Both see round end message
```

### Test 6: Disconnect/Reconnect
```
1. Player 1 creates room
2. Player 2 joins
3. Player 2 browser crashes
4. Player 2 refreshes browser
5. Player 1 still sees game
6. Player 2 can rejoin after refresh (new session)

Note: Current implementation resets on refresh
```

---

## 🐛 Debugging

### Open Browser DevTools
```
F12 or Right-click → Inspect
```

### Check Console Logs
```javascript
// Server logs (Terminal)
[clientId] Client connected
[clientId] Joined room ABC1
[Round 1] Hint 2 revealed

// Browser logs (F12 → Console)
WebSocket connected
[Room Update] Player joined
CORRECT_GUESS received
```

### Monitor Network
```
F12 → Network tab
Filter: WS (WebSocket)
Click on websocket connection
Check "Frames" tab for sent/received messages
```

### Common Console Errors

**"WebSocket is not connected"**
```
→ Server nicht running (npm run server)
→ Port 3001 nicht frei
→ Firewall blockiert
```

**"Cannot read property 'hints' of undefined"**
```
→ Noch in Lobby Screen, nicht in Game
→ Wait für game to start message
```

**"RoundManager is not defined"**
```
→ Server ESM import error
→ Check server/src/*.js files
→ npm run server sollte "OK" geben
```

---

## 📊 Server Health Check

### Check Server Status
```bash
curl http://localhost:3001/api/health
# Output: {"status":"ok","timestamp":"..."}

curl http://localhost:3001/api/stats
# Output: {"activeRooms":2,"activePlayers":4}
```

### Server Logs
Watch terminal where `npm start` runs:
```
[clientId] Client connected
[clientId] Created room ABC1
[clientId] Joined room ABC1
[Round 1] Hint 1 revealed
[Round 1] Hint 2 revealed
```

---

## 🔍 Specific Tests

### Test Word Guessing
```
Words in wordList.js:
- ELEPHANT
- TELESCOPE
- BUTTERFLY
- MOUNTAIN
- CHOCOLATE
... (20+ total)

When testing, server logs show which word:
- Try to guess exact word (case-insensitive)
- Spaces don't matter
- Special characters must match
```

### Test Timer Accuracy
```
Should be exactly 60 seconds
Check browser timer vs actual time
Use server logs: "Hint X revealed" timestamps

Timeline:
0s - Hint 1
15s - Hint 2 (server logs)
30s - Hint 3 (server logs)
45s - Hint 4 (server logs)
60s - Round ends (server logs)
```

### Test Broadcasting
```
Player A guesses → All see "Player A guessed correctly!"
Player B's score updates in real-time
Player C sees updated leaderboard

Use Network DevTools to watch WebSocket messages
```

---

## 🚨 Troubleshooting Guide

### Problem: Server crashes on startup
```
ReferenceError: require is not defined
→ Solution: Check ESM imports (import X from 'Y')
→ Run: npm run server (should see startup message)
```

### Problem: Can't see other players
```
→ Check both on same room code
→ Check WebSocket connected (F12 → Console)
→ Server should show "Player joined"
→ Reload page to refresh
```

### Problem: Hints don't appear
```
→ Check timer is running
→ Wait 15 seconds for Hint 2
→ Check server logs for "Hint revealed"
→ Check browser console for errors
```

### Problem: Points not awarded
```
→ Guess must be exact word match
→ Case-insensitive but spelling matters
→ Try uppercase: "ELEPHANT"
→ Check server logs for guess validation
```

### Problem: Cannot connect to server
```
→ Is npm run server running?
→ Is port 3001 available? (netstat -ano | findstr :3001)
→ Firewall blocking? Try localhost not IP
→ Browser console errors? F12 → Console
```

### Problem: React build won't complete
```
→ Delete node_modules: rm -r node_modules
→ Reinstall: npm install
→ Rebuild: npm run client:build
```

---

## 📱 Mobile Testing

### Test on Mobile Device
```bash
# Get your computer IP
ipconfig (Windows)
ifconfig (Mac/Linux)

# On mobile, visit:
http://[YOUR_IP]:3001
```

### Check Responsive
```
F12 → Toggle device toolbar (Ctrl+Shift+M)
Test on:
- iPhone SE (375px)
- iPad (768px)
- Desktop (1920px)
```

---

## 🔐 Security Notes

### Current Implementation
- ✓ No SQL injection (no database)
- ✓ WebSocket messages validated
- ✓ No sensitive data in room code
- ✓ Input sanitization on guesses

### For Production
- [ ] Add rate limiting
- [ ] Add authentication
- [ ] Encrypt WebSocket (WSS)
- [ ] HTTPS for client
- [ ] Validate all inputs on server
- [ ] Add CSRF protection

---

## 📈 Performance Metrics

### Expected Performance
```
WebSocket latency: < 50ms
Hint reveal timing: ±1s (acceptable)
UI render: 60 FPS
Memory: < 50MB per room
Max rooms: 100+
Max players total: 800+
```

### Monitor Performance
```
F12 → Performance tab
1. Record
2. Play game
3. Stop
4. Analyze frame rate & memory
```

---

## 🎮 Test Data

### Test Words (from wordList.js)
```javascript
ELEPHANT - Large gray animal
TELESCOPE - Instrument for viewing stars
BUTTERFLY - Colorful insect with wings
MOUNTAIN - Very tall landform
CHOCOLATE - Brown sweet treat
LIGHTHOUSE - Structure by the sea
VOLCANO - Mountain with hot lava
LIBRARY - Building with many books
PENGUIN - Black and white bird
PUZZLE - Brain teaser game
PIANO - Musical instrument
FOREST - Area with many trees
CASTLE - Medieval structure
COMPASS - Navigation tool
DIAMOND - Precious gemstone
ANCHOR - Heavy metal object
CANDLE - Provides light
DRAGON - Mythical creature
ECLIPSE - Moon blocks sun
```

---

## ✅ Pre-Launch Checklist

- [ ] npm run client:build completes successfully
- [ ] npm start starts without errors
- [ ] Can create room from http://localhost:3001
- [ ] Can join room with code
- [ ] Can start game as host
- [ ] Hints appear on schedule
- [ ] Can submit guess
- [ ] Points awarded correctly
- [ ] Multiple rounds work
- [ ] Final scores display
- [ ] No console errors
- [ ] Timer counts down
- [ ] Responsive on mobile

---

## 📞 Support Commands

```bash
# If server crashes
npm run server:dev          # With nodemon for auto-restart

# If build fails
npm install                 # Reinstall deps
npm run client:build        # Rebuild

# If WebSocket fails
# Check: http://localhost:3001/api/health
# Should return: {"status":"ok"}

# View server stats
# Check: http://localhost:3001/api/stats
# Shows active rooms and players
```

---

## 🎓 Learning Resources

### WebSocket Debugging
- Browser DevTools → Network → WS filter
- Look at individual frames
- Compare sent vs received messages

### React Debugging
- React DevTools browser extension
- F12 → Components tab
- Inspect component props/state

### Node.js Debugging
- VS Code debugger (if using VS Code)
- Server console logs
- `console.log()` statements in code

---

**Ready to test! Happy gaming! 🎮✨**

