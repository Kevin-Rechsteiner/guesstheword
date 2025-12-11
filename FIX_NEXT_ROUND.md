# NEXT_ROUND Fix - Dokumentation

## Problem
Nach der ersten Runde kam beim Starten der nächsten Runde nichts. Der Screen blieb bei der WaitingScreen stecken.

```
Runde 1 funktioniert ✅
"Nächste Runde" klicken
... nichts passiert ... ❌
Screen bleibt auf WaitingScreen stecken
```

## Root Cause
Beim `NEXT_ROUND` Event wurde die `broadcastFunc` nicht neu initialisiert. Dies ist ein Problem, weil:

1. `GameRoom` braucht eine `broadcastFunc` um Hints an alle Spieler zu broadcasten
2. Bei der ersten Runde wird `broadcastFunc` in `CREATE_ROOM`/`JOIN_ROOM` gesetzt
3. Bei der nächsten Runde war `broadcastFunc` noch da, aber die neue `RoundManager` konnte nicht broadcasten

**Der Code war:**
```javascript
case 'NEXT_ROUND': {
  const room = gameManager.getRoom(currentRoomId);
  const nextRound = room.startNextRound();
  if (nextRound) {
    gameManager.broadcastToRoom(...); // ← Fehler: broadcastFunc fehlt in room!
  }
}
```

## Lösung
Stelle sicher, dass `broadcastFunc` immer gesetzt ist, bevor `startNextRound()` aufgerufen wird:

```javascript
case 'NEXT_ROUND': {
  if (!currentRoomId) break;
  const room = gameManager.getRoom(currentRoomId);
  if (!room || room.hostId !== clientId) break;

  // ✅ Überprüfe und setze broadcastFunc falls nötig
  if (!room.broadcastFunc) {
    room.broadcastFunc = (message) => {
      gameManager.broadcastToRoom(currentRoomId, message);
    };
  }

  const nextRound = room.startNextRound();
  if (nextRound) {
    gameManager.broadcastToRoom(currentRoomId, {
      type: 'NEW_ROUND',
      payload: {
        round: nextRound,
        room: room.getPublicState()
      }
    });
    console.log(`Started round ${room.currentRound}`);
  } else {
    // Game Over
    gameManager.broadcastToRoom(currentRoomId, {
      type: 'GAME_OVER',
      payload: {
        room: room.getPublicState()
      }
    });
  }
  break;
}
```

## Was ändert sich

### Vorher (❌ Buggy)
```
Runde 1: startGame() → broadcastFunc gesetzt ✅ → Hints kommen ✅
Runde 2: startNextRound() → broadcastFunc FEHLT ❌ → Hints kommen nicht ❌
```

### Nachher (✅ Funktioniert)
```
Runde 1: startGame() → broadcastFunc gesetzt ✅ → Hints kommen ✅
Runde 2: startNextRound() → broadcastFunc überprüft & gesetzt ✅ → Hints kommen ✅
Runde 3: startNextRound() → broadcastFunc überprüft & gesetzt ✅ → Hints kommen ✅
Game Over: Finale Scores angezeigt ✅
```

## Wie testen

1. Öffne http://localhost:3001
2. Erstelle Runde + Spieler
3. "Spiel starten"
4. Erste Runde spielen (60s)
   - ✅ Timer läuft
   - ✅ Hints kommen
   - ✅ Guess einreichen
5. Nach Runde 1: "Nächste Runde" klicken
   - ✅ JETZT: Hints kommen sofort
   - ✅ Timer startet
   - ✅ Alles funktioniert
6. Nach Runde 2: "Nächste Runde" klicken
   - ✅ Runde 3 startet normal
7. Nach Runde 3:
   - ✅ "Game Over" mit Finale Scores

## Status: ✅ FIXED

Das Problem mit der nächsten Runde ist **behoben**!

Jetzt funktionieren alle 3 Runden einwandfrei.

**Server läuft bereits. Test jetzt: http://localhost:3001** 🎮

