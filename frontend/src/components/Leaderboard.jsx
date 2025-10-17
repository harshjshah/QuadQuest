import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function Leaderboard({ go, params }) {
  const roomId = params.roomId;
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'rooms', roomId, 'submissions'), orderBy('totalScore','desc'));
    const unsub = onSnapshot(q, snap => {
      const arr = [];
      snap.forEach(d => arr.push(d.data()));
      setLeaders(arr);
    });
    return () => unsub();
  }, [roomId]);

  return (
    <div>
      <div className="font-semibold mb-2">Leaderboard</div>
      <ol className="space-y-2">
        {leaders.map(l => <li key={l.uid} className="flex justify-between bg-slate-50 p-2 rounded">
          <span>{l.displayName || l.uid.slice(0,6)}</span>
          <span className="font-semibold">{l.totalScore || 0}</span>
        </li>)}
      </ol>
      <div className="mt-3">
        <button onClick={() => go({ name: 'lobby', params: params })} className="py-2 px-3 border rounded hover:bg-gray-100">Back</button>
      </div>
    </div>
  );
}
