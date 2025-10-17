# Quad Quest (Kube Puzzle Race) — Monorepo (Firebase + React + Tailwind)

This archive contains a production-ready monorepo for the "Quad Quest" mini-game:
- Frontend: React + Vite + Tailwind
- Backend: Firebase Functions (Node 18), Firestore, Auth
- Hosting: Firebase Hosting (single deploy)

IMPORTANT: Replace the placeholder Firebase config in `frontend/src/firebase.js` with your project's web app config.

Quick steps:
1. Install Firebase CLI: `npm i -g firebase-tools`
2. Login: `firebase login`
3. Set function seed secret:
   `firebase functions:config:set seed.secret="SOME_SECRET"`
4. Deploy functions: `cd functions && npm install && firebase deploy --only functions`
5. Configure frontend firebase config, then build and deploy hosting:
   `cd frontend && npm install && npm run build && firebase deploy --only hosting`
6. Seed a demo room:
   `curl "https://REGION-quad-quest.cloudfunctions.net/seedRoom?secret=SOME_SECRET"`

Enjoy!
