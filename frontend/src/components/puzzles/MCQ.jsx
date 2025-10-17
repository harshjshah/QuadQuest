import React, { useState } from 'react';

export default function MCQ({ puzzle, onSubmit }) {
  const [selected, setSelected] = useState(null);
  const [checking, setChecking] = useState(false);

  if (!puzzle) return null;

  const handleClick = async (opt) => {
    if (checking) return; // prevent multiple submissions
    setSelected(opt);
    setChecking(true);

    // Fire the validation asynchronously
    await onSubmit(opt);

    // Optionally reset after some delay (if next puzzle loads fast)
    setTimeout(() => {
      setSelected(null);
      setChecking(false);
    }, 400);
  };

  const options = puzzle.options || [];

  return (
    <div className="grid gap-2">
      <div className="text-lg font-medium">{puzzle.body}</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleClick(opt)}
            disabled={checking}
            className={`py-3 px-3 rounded border transition-all duration-150 
              ${selected === opt ? 'bg-sky-100 border-sky-400' : 'bg-white hover:shadow'} 
              ${checking ? 'opacity-75 cursor-wait' : ''}`}
          >
            {opt}
          </button>
        ))}
      </div>

      {checking && (
        <div className="text-sm text-gray-500 mt-2 animate-pulse">
          Checking answer...
        </div>
      )}
    </div>
  );
}


// export default function MCQ({ puzzle, onSubmit }) {
//   if (!puzzle) return null;
//   const options = puzzle.options || [];
//   return (
//     <div className="grid gap-2">
//       <div className="text-lg font-medium">{puzzle.body}</div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
//         {options.map(opt => (
//           <button key={opt} onClick={() => onSubmit(opt)} className="py-3 px-3 bg-white rounded border hover:shadow">
//             {opt}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }
