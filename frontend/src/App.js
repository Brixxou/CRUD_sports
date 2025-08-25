// frontend/src/App.js (extrait)
import React, { useEffect, useState } from 'react';

function App() {
  const [sessions, setSessions] = useState([]);
  const [nouvelleSeance, setNouvelleSeance] = useState({
    sport: '',
    date: '',
    duree: '',
    description: ''
  });

  useEffect(() => {
    // Appel API pour récupérer les séances
    fetch('/api/sessions')
      .then(response => response.json())
      .then(data => {
        setSessions(data);
      })
      .catch(err => console.error("Erreur lors du fetch des sessions :", err));
  }, []);  // le tableau vide [] signifie qu'on exécute ce useEffect une seule fois au montage du composant

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNouvelleSeance(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Appel API POST pour créer une séance
    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nouvelleSeance)
    })
      .then(response => response.json())
      .then(data => {
        // On ajoute la nouvelle séance à la liste locale
        setSessions(prev => [...prev, data]);
        // On réinitialise le formulaire
        setNouvelleSeance({ sport:'', date:'', duree:'', description:'' });
      })
      .catch(err => console.error("Erreur lors de l'ajout :", err));
  };

  return (
    <div>
      <h1>Mes séances de sport</h1>
      <ul>
        {sessions.map(session => (
          <li key={session.id}>
            <strong>{session.sport}</strong> le {session.date} – {session.duree} min 
            ({session.description})
          </li>
        ))}
      </ul>
      <h2>Ajouter une séance</h2>
      <form onSubmit={handleSubmit}>
        <input name="sport" value={nouvelleSeance.sport} onChange={handleChange} placeholder="Sport" required />
        <input name="date" type="date" value={nouvelleSeance.date} onChange={handleChange} required />
        <input name="duree" type="number" value={nouvelleSeance.duree} onChange={handleChange} placeholder="Durée (min)" required />
        <input name="description" value={nouvelleSeance.description} onChange={handleChange} placeholder="Description" />
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}

export default App;

