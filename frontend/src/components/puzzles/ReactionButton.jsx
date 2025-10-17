import React, { useEffect, useState } from 'react';

export default function ReactionButton({ onSubmit }) {
  const [state, setState] = useState('wait'); // wait -> ready (green)
  const [startMs, setStartMs] = useState(null);

  useEffect(() => {
    const delay = 1000 + Math.random() * 4000;
    const t = setTimeout(() => {
      setState('ready');
      setStartMs(Date.now());
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const click = () => {
    if (state !== 'ready') {
      onSubmit(9999);
      return;
    }
    const elapsed = Date.now() - startMs;
    onSubmit(elapsed);
  };

  return (
    <button onClick={click} className={`w-full py-6 rounded text-lg font-bold ${state === 'ready' ? 'bg-emerald-500 text-white' : 'bg-red-400 text-white'}`}>
      {state === 'ready' ? 'Click!' : 'Wait for Green...'}
    </button>
  );
}
