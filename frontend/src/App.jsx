import { useEffect, useState } from 'react';
import { listSessions } from './api';
import SessionForm from './SessionForm';
import SessionRow from './SessionRow';
import './App.css';

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => { load(); }, [includeDeleted]);

  function onCreated(newS) { setSessions((s)=>[newS, ...s]); }
  function onUpdated(upd) { setSessions((arr)=>arr.map((x)=> x.id === upd.id ? upd : x)); }
  function onDeleted(id) { setSessions((arr)=>arr.map((x)=> x.id === id ? { ...x, deletedAt: new Date().toISOString() } : x)); }
  function onRestored(restored) { setSessions((arr)=>arr.map((x)=> x.id === restored.id ? restored : x)); }

  return (
    <div className="container">
      <header className="header">
        <div className="hstack">
          <h2 style={{margin:0}}>Sporty — Mes Séances</h2>
          <span className="badge">Prisma + Express + React</span>
        </div>
        <div className="hstack gap-8">
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

      </header>

      <div className="card" style={{marginBottom:14}}>
        <SessionForm onCreated={onCreated} />
      </div>

      {error && <div className="card err" style={{marginBottom:14}}>{error}</div>}

      <div className="table-wrap">
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
    </div>
  );
}
