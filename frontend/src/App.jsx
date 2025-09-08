import React, { useEffect, useState } from 'react';
import { listSessions } from './api';
import SessionForm from './SessionForm';
import SessionRow from './SessionRow';
import Splash from './splash';
import DashboardView from './DashboardView';
import Modal from './Modal';
import './App.css';
import './DashboardView.css';

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
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

  useEffect(() => { 
    if (!showSplash) load(); 
  }, [includeDeleted, showSplash]);

  function onEnter() {
    setShowSplash(false);
    // localStorage.setItem('sporty-entered', '1');
  }

  function onCreated(newS) { 
    setSessions((s)=>[newS, ...s]); 
  }
  
  function onUpdated(upd) { 
    setSessions((arr)=>arr.map((x)=> x.id === upd.id ? upd : x)); 
  }
  
  function onDeleted(id) { 
    setSessions((arr)=>arr.map((x)=> x.id === id ? { ...x, deletedAt: new Date().toISOString() } : x)); 
  }
  
  function onRestored(restored) { 
    setSessions((arr)=>arr.map((x)=> x.id === restored.id ? restored : x)); 
  }

  if (showSplash) {
    return <Splash onEnter={onEnter} />;
  }

  return (
    <div className="App">
      <div className="topbar">
        <h1 className="brand">sporty</h1>
      </div>
      
      <DashboardView sessions={sessions} onAddClick={() => setIsModalOpen(true)} />
      
      <div className="sessions-container">
        <div className="sessions-list">
          <div className="list-header">
            <h2>Historique des séances</h2>
            <div className="list-actions">
              <button className="btn btn-primary" onClick={load} disabled={loading}>
                {loading ? 'Chargement…' : 'Rafraîchir'}
              </button>
            </div>
          </div>

          {loading ? (
            <p>Chargement...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <div className="table-wrap scroll-area">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sport</th>
                    <th>Date</th>
                    <th>Durée</th>
                    <th>Description</th>
                    <th style={{width: 320}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
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
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Ajouter une séance</h2>
        <SessionForm onCreated={(newS) => {
          onCreated(newS);
          setIsModalOpen(false);
        }} />
      </Modal>
    </div>
  );
}