const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { stringify } = require("csv-stringify/sync");

admin.initializeApp();
const db = admin.firestore();

// region (keep consistent when calling from frontend)
const REGION = 'us-central1';

// ---------- Helpers ----------
function normalize(s) {
  return (s || "").toString().trim().toLowerCase().replace(/\s+/g, ' ');
}

function scoreMCQ(isCorrect, base, elapsedSeconds, maxTime) {
  if (!isCorrect) return 0;
  const remaining = Math.max(0, maxTime - elapsedSeconds);
  const speedFactor = (remaining / maxTime) * 0.3;
  return Math.round(base * (1 + speedFactor));
}
function scoreReaction(reactionMs, maxBase = 200) {
  const seconds = reactionMs / 1000;
  const factor = Math.max(0, 1 - (seconds / 1.2));
  return Math.round(maxBase * factor);
}
function scoreTyping(typed, target, elapsedMs, maxTimeMs, base) {
  const t = normalize(typed);
  const targ = normalize(target);
  let matches = 0;
  const len = Math.max(targ.length, 1);
  for (let i = 0; i < Math.min(t.length, targ.length); i++) {
    if (t[i] === targ[i]) matches++;
  }
  const accuracy = matches / len;
  const remaining = Math.max(0, maxTimeMs - elapsedMs);
  const speedFactor = (remaining / maxTimeMs) * 0.2;
  return Math.round(base * accuracy * (1 + speedFactor));
}

// ---------- Callable: validateAnswer ----------
exports.validateAnswer = functions.region(REGION).https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Please sign in');

  const { roomId, puzzleId, attempt, timestamp } = data;
  if (!roomId || !puzzleId) throw new functions.https.HttpsError('invalid-argument', 'Missing roomId or puzzleId');

  const roomRef = db.collection('rooms').doc(roomId);
  const puzzleRef = roomRef.collection('puzzles').doc(puzzleId);
  const secretRef = roomRef.collection('secrets').doc(puzzleId);

  const puzzleSnap = await puzzleRef.get();
  if (!puzzleSnap.exists) throw new functions.https.HttpsError('not-found', 'Puzzle not found');

  const puzzle = puzzleSnap.data();
  const secretSnap = await secretRef.get();
  const trueAnswer = secretSnap.exists ? secretSnap.data().answer : null;

  const roomSnap = await roomRef.get();
  const room = roomSnap.exists ? roomSnap.data() : {};
  const puzzleStart = puzzle.startedAt || room.startedAt || Date.now();
  const elapsedMs = Math.max(0, (timestamp || Date.now()) - puzzleStart);

  let isCorrect = false;
  let score = 0;
  const base = puzzle.basePoints || 100;
  const maxTime = puzzle.maxTime || 30;

  switch (puzzle.type) {
    case 'mcq':
      isCorrect = (attempt === trueAnswer);
      score = scoreMCQ(isCorrect, base, elapsedMs / 1000, maxTime);
      break;
    case 'emoji':
      isCorrect = normalize(attempt) === normalize(trueAnswer);
      score = scoreMCQ(isCorrect, base, elapsedMs / 1000, maxTime);
      break;
    case 'reaction':
      const reactionMs = Number(attempt) || 9999;
      score = scoreReaction(reactionMs, base);
      isCorrect = reactionMs < 9999;
      break;
    case 'typing':
      score = scoreTyping(attempt, trueAnswer || puzzle.body, elapsedMs, maxTime * 1000, base);
      isCorrect = score > 0;
      break;
    default:
      throw new functions.https.HttpsError('invalid-argument', 'Unknown puzzle type');
  }

  const submissionRef = roomRef.collection('submissions').doc(context.auth.uid);

  await db.runTransaction(async (tx) => {
    const subSnap = await tx.get(submissionRef);
    let docData = subSnap.exists ? subSnap.data() : {
      uid: context.auth.uid,
      displayName: context.auth.token.name || context.auth.uid,
      joinedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    docData[puzzleId] = {
      attempt,
      score,
      isCorrect,
      at: admin.firestore.FieldValue.serverTimestamp()
    };

    let total = 0;
    for (const k of Object.keys(docData)) {
      if (k === 'uid' || k === 'displayName' || k === 'joinedAt') continue;
      const v = docData[k];
      if (v && typeof v.score === 'number') total += v.score;
    }
    docData.totalScore = total;

    tx.set(submissionRef, docData, { merge: true });
  });

  return { ok: true, score, isCorrect };
});

// ---------- Callable: seedRoom ----------
exports.seedRoom = functions.region(REGION).https.onCall(async (data, context) => {
    try {

      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to seed a room.');
      }

      const roomRef = db.collection('rooms').doc();
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const roomId = roomRef.id;
      const puzzles = [
        {
          id: 'p1',
          type: 'mcq',
          title: 'MCQ Trivia',
          body: 'Which planet is known as the Red Planet?',
          options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
          answer: 'Mars',
          basePoints: 100,
          maxTime: 30
        },
        {
          id: 'p2',
          type: 'emoji',
          title: 'Emoji Puzzle',
          body: 'Guess the country - 🔔🏋️‍♂️',
          options: null,
          answer: 'belgium',
          basePoints: 120,
          maxTime: 35
        },
        {
          id: 'p3',
          type: 'reaction',
          title: 'Reaction Test',
          body: 'Wait for green and click!',
          options: null,
          answer: null,
          basePoints: 200
        },
        {
          id: 'p4',
          type: 'typing',
          title: 'Typing Sprint',
          body: 'Sphinx of black quartz, judge my vow.',
          options: null,
          answer: 'Sphinx of black quartz, judge my vow.',
          basePoints: 150,
          maxTime: 30
        }
      ];

      await roomRef.set({
        code,
        hostId: context.auth.uid,
        status: 'Waiting',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        startedAt: null,
        currentPuzzleIndex: 0,
        puzzleOrder: puzzles.map(p => p.id)
      });

      const batch = db.batch();
      puzzles.forEach(p => {
        const pRef = roomRef.collection('puzzles').doc(p.id);
        batch.set(pRef, {
          type: p.type,
          title: p.title,
          body: p.body,
          options: p.options,
          basePoints: p.basePoints,
          maxTime: p.maxTime || 30
        });

        if (p.answer !== null) {
          const sRef = roomRef.collection('secrets').doc(p.id);
          batch.set(sRef, { answer: p.answer });
        }
      });
      await batch.commit();

      return { roomId, code };
    } catch (err) {
      console.error(err);
      throw new functions.https.HttpsError('internal', 'Failed to seed room.');
    }
  });

// ---------- Callable: exportCSV ----------
exports.exportCSV = functions.region(REGION).https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in');
  const { roomId } = data;
  if (!roomId) throw new functions.https.HttpsError('invalid-argument', 'Missing roomId');

  const roomRef = db.collection('rooms').doc(roomId);
  const roomSnap = await roomRef.get();
  if (!roomSnap.exists) throw new functions.https.HttpsError('not-found', 'Room not found');

  const subsSnap = await roomRef.collection('submissions').get();
  const rows = [];
  for (const doc of subsSnap.docs) {
    const d = doc.data();
    const row = {
      uid: d.uid || doc.id,
      displayName: d.displayName || '',
      totalScore: d.totalScore || 0,
      joinedAt: d.joinedAt ? d.joinedAt.toDate().toISOString() : ''
    };
    const order = roomSnap.data().puzzleOrder || ['p1', 'p2', 'p3', 'p4'];
    order.forEach(pid => {
      const val = d[pid] || {};
      row[`${pid}_attempt`] = val.attempt || '';
      row[`${pid}_score`] = val.score || 0;
      row[`${pid}_isCorrect`] = val.isCorrect || false;
    });
    rows.push(row);
  }

  const header = Object.keys(rows[0] || { uid: 'uid', displayName: 'displayName', totalScore: 'totalScore' });
  const csv = stringify(rows, { header: true, columns: header });
  return { csv };
});

// ---------- Optional API proxy function placeholder (to use with hosting rewrites) ----------
exports.apiProxy = functions.region(REGION).https.onRequest((req, res) => {
  res.json({ ok: true, message: "api proxy placeholder" });
});
