# Birthday Shanu Crossword

A playful browser-based crossword that hides a "Happy Birthday Shanu" message behind a short phone-call intro and a burst of confetti when everything is solved.

## How to try the game

### Fastest way (recommended)
1. Make sure you have Node.js installed (any recent LTS is fine).
2. From the project folder, install dependencies and start the preview server:
   ```bash
   npm install
   npm start
   ```
3. Open <http://localhost:4173> in your browser. Keep the terminal running while you play.

### Alternative (no server)
You can also double-click `index.html` to open it directly in your browser. If you see missing assets or sound, use the server method above instead.

## How to play

1. Wait for the seven-second intro: a monkey holding a phone complains in a speech bubble, then leaves the screen.
2. Fill in the crossword. Cells turn green when a word is correct and red when the filled word is wrong.
3. Once every word is solved, the hidden message lights up in yellow, the page dims, and a confetti celebration with popping letters appears.
