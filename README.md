# Quad Quest

Quad Quest is a realtime, multiplayer puzzle game built with Firebase (Firestore, Authentication, Cloud Functions) and a lightweight React + Vite frontend with Tailwind CSS. The app supports hosting rooms, seeding puzzles, live puzzle play with timers, submissions, and a final leaderboard.

---

## Game Flow
- As a Host
  - SignIn with Google -> Host a Room -> Create a Room (Room code generated and Puzzle is seeded)-> Open Admin -> Activate Game -> Open Lobby
  - If at the Home Page -> Join room with code -> Play the Game / Manage Controls in Admin Panel
  - Track realtime scores of players by viewing the Leaderboard from the Admin Panel.
  - Export Submissions as CSV

- As a Player 
  - Login as Guest/Login with Google -> Join room with a code -> Enter Lobby and wait if Admin hasn't activated the game -> Once activated, Play the Game -> View scores in the Leaderboard after completing the Game.

---  

## Key Features

- Realtime Rooms
  - Host creates a room and shares the room id with players.
  - Only Google authenticated players are allowed to Host a Room.
  - Room state is synced in realtime via Firestore snapshots.

- Puzzle Types
  - Multiple choice (MCQ)
  - Emoji puzzle
  - Reaction / single-button puzzle
  - Typing challenge
  - Puzzles contain public content (body, options, type, basePoints, maxTime) stored under `rooms/{roomId}/puzzles`.

- Secret Answers & Server-side Scoring
  - Secret answers and scoring logic live on the server side (Cloud Functions) and/or under `rooms/{roomId}/secrets` to prevent client tampering.
  - Players submit attempts; the server validates answers and returns scoring and success status.

- Authentication
  - Anonymous sign-in fallback for instant play.
  - Google sign-in flow for identity (display name) when available.

- Progression & Leaderboard
  - Puzzles are played in a seeded order. After a correct submission the room advances to the next puzzle (host-controlled index stored in Firestore).
  - After completing the last puzzle the client navigates to the leaderboard showing final scores.
  - A player can play the game multiple times, and the latest attempt would be considered.

- Admin Tools
  - Admin panel for hosts to seed puzzles or manage a room (seed endpoint / cloud function is used to create puzzles programmatically).
  - A Google authenticated user hosting a room would be the Admin for that particular room.
  - Only the Admin can Activate and Terminate the game in a room.
  - An Admin would have special features to export submissions as CSV and View Leaderboards directly.

- Security Rules
  - Firestore rules are configured to allow public reads of puzzle content while restricting recipe/secret writes and ensuring only host can create/update puzzles.

---

## Project Structure (important files/folders)

- `frontend/` - React + Vite frontend
  - `src/` - application source files
    - `App.jsx` - main app and routing-like view management
    - `firebase.js` - firebase client helpers (auth helpers, callable function wrappers)
    - `components/` - UI screens and puzzle components
      - `GameView.jsx` - puzzle player UI and progression logic
      - `Home.jsx`, `HostRoom.jsx`, `JoinRoom.jsx`, `Lobby.jsx`, `Leaderboard.jsx`, `AdminPanel.jsx`
      - `components/puzzles/` - `MCQ.jsx`, `EmojiPuzzle.jsx`, `ReactionButton.jsx`, `TypingPuzzle.jsx`
  - `index.html`, `vite.config.js`, Tailwind config files

- `functions/` - Firebase Cloud Functions
  - `index.js` - function entry point (seed puzzles, validate answers, scoring logic, any admin endpoints)

- `firestore.rules` - Firestore security rules used by the project

- `firebase.json` - Firebase project configuration (hosting, functions, rewrites)

---

## Setup & Configuration (overview)

1. Firebase project: create a Firebase project in the Firebase Console. Enable Firestore (native mode), Authentication (Anonymous + Google sign-in), and Cloud Functions.

2. Local environment: you will need Node.js and npm installed. Open project root and install dependencies for both `frontend` and `functions` with your usual commands.

3. Firebase SDK config: put your Firebase config (apiKey, authDomain, projectId, etc.) in `frontend/src/firebase.js` where the SDK is initialized. The project expects helper functions like:
   - `loginAnon()` — sign in anonymously
   - `loginGoogle()` — sign in with Google (popup)
   - `signOutUser()` — sign out
   - `seedPuzzles(roomId)` — calls Cloud Function / endpoint to seed puzzles for a room
   - `validateAnswer(payload)` — calls server-side validation (callable function or HTTP endpoint)

4. Firestore Rules: the repo includes `firestore.rules`. Review and deploy them to protect secrets and ensure only hosts can write secrets/puzzles.

5. Cloud Functions: implement server-side endpoints in the `functions/` folder. Typical functions:
   - `seedPuzzles` — generate a puzzleOrder array, create docs in `rooms/{roomId}/puzzles` and associated secrets under `rooms/{roomId}/secrets` (if desired).
   - `validateAnswer` — accept attempt payload, check secret answers, calculate score, write score fields to `rooms/{roomId}/submissions/{uid}` (only via secure server-side writes), and return success + score to the client.

6. Hosting & Deployment: configure firebase hosting in `firebase.json`. Deploy with your usual Firebase CLI workflow.

---

## AI Assistance Log

This project was built independently, with selective use of AI (ChatGPT) for guidance and code suggestions.
Specific areas where AI was used:
- Cloud Functions setup: Helped with structuring the base functions and deployment flow.
- Firebase setup and integration: Guidance on initializing Firestore, authentication, and Firestore rules.
- Deployment setup: Suggestions for deploying the frontend using Vercel and managing environment configurations.
- Code review and debugging: Assistance in identifying logic issues, improving performance, and resolving Firebase-related errors.

---
