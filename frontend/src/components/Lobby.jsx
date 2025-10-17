import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Lobby({ go, params, user }) {
  const roomId = params.roomId;
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => onAuthStateChanged(auth, u => setCurrentUser(u)), []);

  useEffect(() => {
    const rRef = doc(db, 'rooms', roomId);
    const unsubRoom = onSnapshot(rRef, snap => setRoom(snap.data()));
    const subsRef = collection(rRef, 'submissions');
    const unsubSubs = onSnapshot(subsRef, snap => {
      const arr = [];
      snap.forEach(d => arr.push(d.data()));
      setPlayers(arr);
    });

    if (currentUser) {
      setDoc(doc(db, 'rooms', roomId, 'submissions', currentUser.uid),
        { uid: currentUser.uid, displayName: currentUser.displayName || currentUser.uid.slice(0, 6), joinedAt: serverTimestamp() }, { merge: true });
    }

    return () => { unsubRoom(); unsubSubs(); };
  }, [roomId, currentUser]);

  const start = async () => {
    if (!currentUser || room?.status !== 'Running') return;
    await setDoc(doc(db, 'rooms', roomId), { status: 'Running', startedAt: serverTimestamp(), currentPuzzleIndex: 0 }, { merge: true });
    go({ name: 'game', params: { roomId } });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="text-sm text-gray-500">Room code</div>
          <div className="text-2xl font-bold tracking-widest">{room?.code || '—'}</div>
        </div>
        <div className="text-right">
          <div className="text-sm">Status</div>
          <div className="font-medium">{room?.status || 'Waiting'}</div>
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded mb-3">
        <div className="font-medium">Players</div>
        <ul className="mt-2 space-y-1">
          {players.map(p => (
            <li key={p.uid} className="flex justify-between">
              <span>{p.displayName}</span>
              <span className="text-sm text-gray-500">{p.totalScore || 0}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={start} disabled={room?.status !== 'Running'} className={`py-2 px-3 rounded text-white ${room?.status === 'Running' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400 cursor-not-allowed'}`}>Start Game</button>

        {room?.status !== 'Running' && (
          currentUser?.uid === room?.hostId ? (
            <div className="text-sm p-2 rounded bg-blue-100 text-blue-700">
              Please activate the game to start.
            </div>
          ) : (
            <div className="text-sm p-2 rounded bg-blue-100 text-blue-700">
              Admin needs to activate the game before you can start.
            </div>
          )
        )}

        <div className="flex gap-2 mt-2">
          <button  onClick={() => go({ name: 'home' })} className="py-2 px-3 border rounded hover:bg-gray-100">Back</button>
          {currentUser?.uid === room?.hostId && (
            <button onClick={() => go({ name: 'admin', params: { roomId } })} className="py-2 px-3 bg-sky-600 text-white border rounded hover:bg-sky-700">Admin</button>
          )}
        </div>
      </div>
    </div>
  );
}
