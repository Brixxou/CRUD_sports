import { useState } from 'react';
import { updateSession, softDeleteSession, restoreSession } from './api';
import { toInputDateTimeLocal, toISOFromLocal } from './utils';

export default function SessionRow({ s, onUpdated, onDeleted, onRestored }) {
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState({
    sport: s.sport,
    date: toInputDateTimeLocal(s.date),
    duree: s.duree,
    description: s.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  function onChange(field, val) { setDraft((d)=>({ ...d, [field]: val })); }

  async function save() {
    setLoading(true); setMsg('');
    try {
      const payload = {
        sport: draft.sport,
        date: toISOFromLocal(draft.date),
        duree: Number(draft.duree),
        description: draft.description,
        updatedAt: s.updatedAt
      };
      const updated = await updateSession(s.id, payload);
      onUpdated(updated);
      setEdit(false);
    } catch (e) { setMsg(e.message); }
    finally { setLoading(false); }
  }

  async function del() {
    setLoading(true); setMsg('');
    try {
      await softDeleteSession(s.id);
      onDeleted(s.id);
      setMsg('Supprimé. Annuler ?');
    } catch (e) { setMsg(e.message); }
    finally { setLoading(false); }
  }

  async function undo() {
    try { const restored = await restoreSession(s.id); onRestored(restored); setMsg(''); }
    catch (e) { setMsg(e.message); }
  }

  if (edit) {
    return (
      <tr style={{ opacity: loading ? 0.6 : 1 }}>
        <td><input className="input" value={draft.sport} onChange={(e)=>onChange('sport', e.target.value)} /></td>
        <td><input className="input" type="datetime-local" value={draft.date} onChange={(e)=>onChange('date', e.target.value)} /></td>
        <td><input className="input" type="number" min="1" value={draft.duree} onChange={(e)=>onChange('duree', e.target.value)} /></td>
        <td><input className="input" value={draft.description} onChange={(e)=>onChange('description', e.target.value)} /></td>
        <td className="actions">
          <button className="btn btn-primary" onClick={save} disabled={loading}>Enregistrer</button>
          <button className="btn btn-ghost" onClick={()=>{
            setEdit(false);
            setDraft({ sport:s.sport, date:toInputDateTimeLocal(s.date), duree:s.duree, description:s.description||'' });
          }}>Annuler</button>
          {msg && <span className="note">{msg}</span>}
        </td>
      </tr>
    );
  }

  return (
    <tr style={{ opacity: loading ? 0.6 : 1 }}>
      <td>{s.sport}</td>
      <td>{new Date(s.date).toLocaleString()}</td>
      <td>{s.duree} min</td>
      <td style={{ maxWidth:260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.description}</td>
      <td className="actions">
        <button className="btn btn-ghost" onClick={()=>setEdit(true)}>Modifier</button>
        <button className="btn btn-danger" onClick={del} disabled={!!s.deletedAt}>Supprimer</button>
        {s.deletedAt && <button className="btn btn-warning" onClick={undo}>Annuler suppression</button>}
        {msg && <span className="note">{msg}</span>}
      </td>
    </tr>
  );
}
