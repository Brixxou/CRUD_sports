import { useState } from 'react';
import { toISOFromLocal } from './utils';
import { createSession } from './api';

export default function SessionForm({ onCreated }) {
  const [sport, setSport] = useState('');
  const [date, setDate] = useState('');
  const [duree, setDuree] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const payload = {
        sport,
        date: toISOFromLocal(date),
        duree: Number(duree),
        description: description || null
      };
      const created = await createSession(payload);
      onCreated(created);
      setSport(''); setDate(''); setDuree(''); setDescription('');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{marginTop:0}}>Nouvelle séance</h3>

      <div className="form-row">
        <input className="input" placeholder="Sport" value={sport} onChange={(e)=>setSport(e.target.value)} required />
        <input className="input" type="datetime-local" value={date} onChange={(e)=>setDate(e.target.value)} required />
        <input className="input" type="number" min="1" placeholder="Durée (min)" value={duree} onChange={(e)=>setDuree(e.target.value)} required />
      </div>

      <div style={{marginTop:10}}>
        <textarea className="textarea" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
      </div>

      <div className="hstack" style={{marginTop:10}}>
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Ajout…' : 'Ajouter'}
        </button>
        {err && <span className="err">{err}</span>}
      </div>
    </form>
  );
}
