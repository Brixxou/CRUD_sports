import { useEffect, useState } from 'react';
import { listSessions } from './api';
import SessionForm from './SessionForm';
import SessionRow from './SessionRow';
import Splash from './splash';
import './App.css';

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [error, setError] = useState('');
  const [showSplash, setShowSplash] = useState(() => {
    // si tu veux l’afficher à chaque fois, laisse true
    // sinon, dé-commente pour ne l’afficher qu’une fois :
    // return !localStorage.getItem('sporty-entered');
    return true;
  });

  async function load() {
    try {
      setLoading(true);
      const data = await listSessions({ includeDeleted });
      setSessions(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (!showSplash) load(); }, [includeDeleted, showSplash]);

  function onEnter() {
    setShowSplash(false);
    // localStorage.setItem('sporty-entered', '1');
  }

  function onCreated(newS) { setSessions((s)=>[newS, ...s]); }
  function onUpdated(upd) { setSessions((arr)=>arr.map((x)=> x.id === upd.id ? upd : x)); }
  function onDeleted(id) { setSessions((arr)=>arr.map((x)=> x.id === id ? { ...x, deletedAt: new Date().toISOString() } : x)); }
  function onRestored(restored) { setSessions((arr)=>arr.map((x)=> x.id === restored.id ? restored : x)); }

  if (showSplash) return <Splash onEnter={onEnter} />;

  return (
    <div className="app-shell">
      {/* topbar : titre centré permanent */}
      <div className="topbar">
        <h1 className="brand">sporty</h1>
      </div>

      {/* barre d’actions */}
      <div className="toolbar container">
        <label className={`toggle-deleted ${includeDeleted ? 'active' : ''}`}>
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e)=>setIncludeDeleted(e.target.checked)}
          />
          <span>Afficher les supprimées</span>
        </label>
        <button className="btn btn-primary" onClick={load} disabled={loading}>
          {loading ? 'Chargement…' : 'Rafraîchir'}
        </button>
      </div>

      {/* contenu principal scrollable (évite que la page entière déborde) */}
      <main className="main container">
        <div className="card" style={{marginBottom:14}}>
          <SessionForm onCreated={onCreated} />
        </div>

        {error && <div className="card err" style={{marginBottom:14}}>{error}</div>}

        <div className="table-wrap scroll-area">
          <table className="table">
            <thead>
              <tr>
                <th>Sport</th>
                <th>Date</th>
                <th>Durée</th>
                <th>Description</th>
                <th style={{width:320}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s)=>(
                <SessionRow
                  key={s.id}
                  s={s}
                  onUpdated={onUpdated}
                  onDeleted={onDeleted}
                  onRestored={onRestored}
                />
              ))}
              {sessions.length === 0 && !loading && (
                <tr><td colSpan="5" className="empty">Aucune séance pour le moment.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
