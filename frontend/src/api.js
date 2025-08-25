const BASE = process.env.REACT_APP_API_URL || '/api';

export async function listSessions({ includeDeleted = false, sport, from, to } = {}) {
  const params = new URLSearchParams();
  if (includeDeleted) params.set('includeDeleted', 'true');
  if (sport) params.set('sport', sport);
  if (from) params.set('from', from);
  if (to) params.set('to', to);

  const res = await fetch(`${BASE}/sessions?${params.toString()}`);
  if (!res.ok) throw new Error('Erreur chargement');
  return res.json();
}

export async function createSession(payload) {
  const res = await fetch(`${BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Erreur création');
  return res.json();
}

export async function updateSession(id, payload) {
  const res = await fetch(`${BASE}/sessions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (res.status === 409) throw new Error('Conflit: la séance a été modifiée ailleurs. Recharge les données.');
  if (!res.ok) throw new Error((await res.json()).error || 'Erreur mise à jour');
  return res.json();
}

export async function softDeleteSession(id) {
  const res = await fetch(`${BASE}/sessions/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error('Erreur suppression');
  return true;
}

export async function restoreSession(id) {
  const res = await fetch(`${BASE}/sessions/${id}/restore`, { method: 'POST' });
  if (!res.ok) throw new Error('Erreur restauration');
  return res.json();
}
