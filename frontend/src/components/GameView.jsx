import React, { useEffect, useState, useRef } from 'react';
import { db, validateAnswer } from '../firebase';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import ReactionButton from './puzzles/ReactionButton';
import MCQ from './puzzles/MCQ';
import EmojiPuzzle from './puzzles/EmojiPuzzle';
import TypingPuzzle from './puzzles/TypingPuzzle';

export default function GameView({ go, params, user }) {
  const roomId = params.roomId;
  const [room, setRoom] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [puzzleId, setPuzzleId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLastPuzzle, setIsLastPuzzle] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const timerRef = useRef();

  useEffect(() => {
    const rRef = doc(db, 'rooms', roomId);
    const unsub = onSnapshot(rRef, snap => {
      const d = snap.data();
      setRoom(d);
      const idx = d.currentPuzzleIndex || 0;
      const pid = (d.puzzleOrder || [])[idx];
      setPuzzleId(pid);
    });
    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    if (!puzzleId) return;
    const load = async () => {
      const pSnap = await getDoc(doc(db, 'rooms', roomId, 'puzzles', puzzleId));
      if (!pSnap.exists()) { setPuzzle(null); return; }
      const p = pSnap.data();
      setPuzzle({ id: puzzleId, ...p });
      setTimeLeft(p.maxTime || 30);
    };
    load();
  }, [puzzleId]);

  useEffect(() => {
    if (!puzzle) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [puzzle?.id]);

  useEffect(() => {
    if (!room || !puzzleId) return;
    const idx = room.currentPuzzleIndex || 0;
    const total = (room.puzzleOrder || []).length;
    setIsLastPuzzle(idx === total - 1);
  }, [room, puzzleId]);

  const onSubmit = async (attempt) => {
    if (!puzzle) return;
    try {
      const resp = await validateAnswer({ roomId, puzzleId: puzzle.id, attempt, timestamp: Date.now() });
      if (resp.data?.ok) {
        if (!isLastPuzzle) {
          const nextIdx = (room.currentPuzzleIndex || 0) + 1;
          await updateDoc(doc(db, 'rooms', roomId), { currentPuzzleIndex: nextIdx });
        } else {
          setFinalScore(resp.data.score);
        }
      } else {
        alert('Submission failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting');
    }
  };

  if (finalScore !== null) {
    return (
      <div className="p-6 bg-green-50 text-center rounded-lg shadow space-y-4">
      <h2 className="text-2xl font-bold text-green-700">Game Completed! 🎉</h2>
      <button onClick={() => go({ name: 'leaderboard', params: { roomId } })} className="py-2 px-4 text-white bg-emerald-600 rounded hover:bg-emerald-700">
        View Leaderboard
      </button>
      </div>
    );
  }

  if (!puzzle) return <div className="text-sm text-gray-500 mt-2 animate-pulse">Loading puzzle...</div>;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="font-semibold">{puzzle.title}</div>
        <div className="text-sm text-gray-500">Time: {timeLeft}s</div>
      </div>

      <div className="p-3 bg-slate-50 rounded">
        {puzzle.type === 'mcq' && <MCQ puzzle={puzzle} onSubmit={onSubmit} />}
        {puzzle.type === 'emoji' && <EmojiPuzzle puzzle={puzzle} onSubmit={onSubmit} />}
        {puzzle.type === 'reaction' && <ReactionButton onSubmit={onSubmit} />}
        {puzzle.type === 'typing' && <TypingPuzzle puzzle={puzzle} onSubmit={onSubmit} />}
      </div>

      <div className="flex gap-2">
        {/* <button onClick={() => go({ name: 'leaderboard', params: { roomId } })} className="py-2 px-3 border rounded hover:bg-gray-100">Leaderboard</button> */}
        <button onClick={() => go({ name: 'home' })} className="py-2 px-3 border rounded hover:bg-gray-100">Exit</button>
      </div>
    </div>
  );
}
