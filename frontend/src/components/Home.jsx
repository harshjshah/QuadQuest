import React from 'react';

export default function Home({ go, user }) {
  console.log(user);
  return (
    <div className="flex flex-col gap-4 items-stretch">
      {!user?.isAnonymous && (
        <button onClick={() => go({ name: 'host' })} className="py-3 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700">
          Host a Room
        </button>
      )}
      <button onClick={() => go({ name: 'join' })} className="py-3 bg-emerald-600 text-white rounded-md font-semibold hover:bg-emerald-700">
        Join a Room
      </button>
      {user?.isAnonymous && (
        <div className="mt-4 text-sm text-gray-500">
          Tip: Sign in with Google to host a room.
        </div>
      )}   
    </div>
  );
}
