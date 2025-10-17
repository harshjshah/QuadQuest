import React, { useState } from 'react';
import { seedRoom } from '../firebase';

export default function HostRoom({ go, user }) {
  const [creating, setCreating] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [error, setError] = useState(null);

  const createRoom = async () => {
    try {
      setCreating(true);
      setError(null);
      const result = await seedRoom({
        hostId: user ? user.uid : 'host-guest',
      });
      setRoomInfo(result);
    } catch (err) {
      console.error(err);
      setError('Failed to create room. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {!roomInfo && !creating && (
        <button
          onClick={createRoom}
          className="py-3 bg-sky-600 text-white rounded-md"
        >
          Create Room
        </button>
      )}

      {creating && <div className="text-sm text-gray-500 mt-2 animate-pulse">Creating...</div>}

      {error && (
        <div className="text-red-500 text-sm bg-red-50 border p-2 rounded">
          {error}
        </div>
      )}

      {roomInfo && (
        <div className="p-4 bg-slate-50 rounded">
          <div className="font-medium">Room created</div>
          <div className="text-lg mt-2 tracking-widest text-center">
            {roomInfo.code}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => go({ name: 'admin', params: { roomId: roomInfo.roomId } })}
              className="py-2 px-3 bg-sky-600 text-white rounded hover:bg-sky-700"
            >
              Open Admin
            </button>
            <button
              onClick={() => go({ name: 'lobby', params: { roomId: roomInfo.roomId } })}
              className="py-2 px-3 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Open Lobby
            </button>
            <button
              onClick={() => go({ name: 'home' })}
              className="py-2 px-3 border rounded hover:bg-gray-100"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}