import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, logout } from './firebase';
import Home from './components/Home';
import HostRoom from './components/HostRoom';
import JoinRoom from './components/JoinRoom';
import Lobby from './components/Lobby';
import GameView from './components/GameView';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';

export default function App() {
  const [user, setUser] = useState(null);
  const [route, setRoute] = useState({ name: 'home' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if(!u) {
        setRoute({ name: 'home'});
      }
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-3"></div>
    </div>
  );

  if(!user) return <Login />;

  const render = () => {
    switch(route.name) {
      case 'home': return <Home go={setRoute} user={user} />;
      case 'host': return <HostRoom go={setRoute} user={user} />;
      case 'join': return <JoinRoom go={setRoute} user={user} />;
      case 'lobby': return <Lobby go={setRoute} params={route.params} user={user} />;
      case 'game': return <GameView go={setRoute} params={route.params} user={user} />;
      case 'leaderboard': return <Leaderboard go={setRoute} params={route.params} />;
      case 'admin': return <AdminPanel go={setRoute} params={route.params} user={user} />;
      default: return <Home go={setRoute} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b bg-no-repeat bg-right from-slate-50 to-white p-4 flex items-center justify-center" style={{ backgroundImage: "url('images/bg2.jpg')"}}>
      <div className="w-full max-w-xl">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sky-600">Quad Quest</h1>
            <p className="text-sm text-gray-500">Connect, Compete, and Conquer</p>
          </div>
          {user && (
            <div className="text-sm text-right">
              <div>{user ? (user.displayName || user.uid.slice(0,6)) : 'Guest'}</div>
              <button onClick={logout} className='text-base text-white bg-red-500 py-2 px-3 rounded hover:bg-red-700 mt-2'>
                Logout
              </button>
            </div>
          )}
        </header>

        <main className="bg-white rounded-xl shadow p-4">
          {render()}
        </main>

        <footer className="mt-4 text-xs text-center text-gray-400">
          Built with ♥ 
        </footer>
      </div>
    </div>
  );
}
