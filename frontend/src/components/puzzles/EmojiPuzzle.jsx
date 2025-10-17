import React, { useState } from 'react';

export default function EmojiPuzzle({ puzzle, onSubmit }) {
  const [val, setVal] = useState('');
  return (
    <div className="space-y-3">
      <div className="text-2xl">{puzzle.body}</div>
      <input value={val} onChange={e => setVal(e.target.value)} placeholder="Type the answer" className="w-full p-2 border rounded" />
      <button onClick={() => onSubmit(val)} className="py-2 px-3 bg-sky-600 text-white rounded hover:bg-sky-700">Submit</button>
    </div>
  );
}
