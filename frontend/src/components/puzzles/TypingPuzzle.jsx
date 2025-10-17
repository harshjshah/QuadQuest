import React, { useState } from 'react';

export default function TypingPuzzle({ puzzle, onSubmit }) {
  const [val, setVal] = useState('');
  return (
    <div className="space-y-3">
      <div className="bg-white p-3 rounded border italic">{puzzle.body}</div>
      <textarea value={val} onChange={e => setVal(e.target.value)} rows={4} className="w-full p-2 border rounded" />
      <div className="flex gap-2">
        <button onClick={() => onSubmit(val)} className="py-2 px-3 bg-sky-600 text-white rounded hover:bg-sky-700">Submit</button>
      </div>
    </div>
  );
}
