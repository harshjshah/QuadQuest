import React, { useState } from 'react';
import { db } from '../firebase';
import { query, collection, where, getDocs } from 'firebase/firestore';

export default function JoinRoom({ go }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');

  const handleJoin = async () => {
    setErr('');
    if (code.trim().length !== 6) return setErr('Code must be 6 characters');
    const q = query(collection(db, 'rooms'), where('code','==', code.toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) return setErr('Room not found');
    const room = snap.docs[0];
    go({ name: 'lobby', params: { roomId: room.id } });
  };

  return (
    <div className="flex flex-col gap-3">
      <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
        placeholder="Enter room code (6 chars)" className="p-2 border rounded text-center uppercase tracking-widest"/>
      {err && <div className="text-sm text-red-500">{err}</div>}
      <div className="flex gap-2">
        <button onClick={handleJoin} className="py-2 px-4 bg-emerald-600 text-white rounded hover:bg-emerald-700">Join</button>
        <button onClick={() => go({name:'home'})} className="py-2 px-4 border rounded hover:bg-gray-100">Cancel</button>
      </div>
    </div>
  );
}
