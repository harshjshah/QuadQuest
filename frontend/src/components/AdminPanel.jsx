import React, { useEffect, useState } from 'react';
import { db, exportCSV } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function AdminPanel({ go, params, user }) {
  const roomId = params.roomId;
  const [room, setRoom] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!roomId) return;
    getDoc(doc(db, 'rooms', roomId)).then(s => setRoom(s.data()));
  }, [roomId]);

  const start = async () => {
    await updateDoc(doc(db,'rooms',roomId), { status: 'Running', startedAt: serverTimestamp(), currentPuzzleIndex: 0 });
    setMessage("Game has been activated.");
    // go({ name: 'game', params: { roomId } });
  };
  const stop = async () => {
    await updateDoc(doc(db,'rooms', roomId), { status: 'Finished' });
    setMessage("Game has been terminated.");
  };
  const handleExport = async () => {
    try {
      const resp = await exportCSV({ roomId });
      const csv = resp.data.csv;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `room-${roomId}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); alert('Export failed'); }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-500">Admin Panel — Room: {room?.code || roomId}</div>
      {message && (
        <div className="p-2 rounded text-sm bg-green-100 text-green-700">
          {message}
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={start} className="py-2 px-3 bg-emerald-600 text-white rounded hover:bg-emerald-700">Activate</button>
        <button onClick={stop} className="py-2 px-3 bg-red-600 text-white border rounded hover:bg-red-700">Terminate</button>
        <button onClick={handleExport} className="py-2 px-3 border rounded hover:bg-gray-100">Export CSV</button>
        <button onClick={() => go({ name: 'leaderboard', params: { roomId } })} className="py-2 px-3 border rounded hover:bg-gray-100">Leaderboard</button>
      </div>
      <div className="mt-2">
        <button onClick={() => go({ name: 'lobby', params: { roomId } })} className="text-sm text-gray-500 underline">Open Lobby</button>
      </div>
    </div>
  );
}
