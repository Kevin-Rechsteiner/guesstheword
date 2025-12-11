/**
 * RoundManager handles hint timing, reveal schedule, and scoring
 * Manages 60-second rounds with hints revealed at 0s, 15s, 30s, 45s
 */
class RoundManager {
  constructor(roundNumber, word, hints, duration, onHintRevealed = null) {
    this.roundNumber = roundNumber;
    this.originalWord = word;
    this.word = word.toLowerCase();
    this.hints = hints; // Array of 4 hints
    this.duration = duration; // 60 seconds
    this.startTime = Date.now();
    this.endTime = this.startTime + duration * 1000;
    this.currentHintIndex = 0;
    this.revealedHints = [hints[0]]; // First hint revealed immediately
    this.hintIntervals = []; // Store interval IDs for cleanup
    this.revealSchedule = [15, 30, 45]; // Seconds when to reveal next hints
    this.onHintRevealed = onHintRevealed; // Callback when new hint revealed

    this.scheduleHintReveals();
  }

  scheduleHintReveals() {
    this.revealSchedule.forEach((seconds, index) => {
      const intervalId = setTimeout(() => {
        if (this.currentHintIndex < this.hints.length - 1) {
          this.currentHintIndex++;
          this.revealedHints.push(this.hints[this.currentHintIndex]);
          console.log(`[Round ${this.roundNumber}] Hint ${this.currentHintIndex + 1} revealed`);

          // Callback für Broadcasting an Clients
          if (this.onHintRevealed) {
            this.onHintRevealed(this.getRevealedHints());
          }
        }
      }, seconds * 1000);

      this.hintIntervals.push(intervalId);
    });
  }

  checkGuess(guess) {
    const normalizedGuess = guess.toLowerCase().trim();
    const isCorrect = normalizedGuess === this.word;
    return { correct: isCorrect };
  }

  calculatePoints() {
    // Points based on which hint level was available when guessed
    const pointsTable = [4, 3, 2, 1];
    return pointsTable[this.currentHintIndex] || 1;
  }

  revealNextHint() {
    if (this.currentHintIndex < this.hints.length - 1) {
      this.currentHintIndex++;
      this.revealedHints.push(this.hints[this.currentHintIndex]);
      return this.hints[this.currentHintIndex];
    }
    return null;
  }

  getCurrentHint() {
    return this.hints[this.currentHintIndex];
  }

  getRevealedHints() {
    return this.revealedHints;
  }

  getOriginalWord() {
    return this.originalWord;
  }

  getTimeRemaining() {
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((this.endTime - now) / 1000));
    return remaining;
  }

  isTimeExpired() {
    return Date.now() >= this.endTime;
  }

  stop() {
    // Clear all scheduled hint reveals
    this.hintIntervals.forEach((id) => clearTimeout(id));
    this.hintIntervals = [];
  }
}

export default RoundManager;
